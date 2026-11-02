
import {
  createCategory,
  findAllCategories,
  findCategoryById,
  findCategoryBySlug,
  findSubcategories,
  updateCategoryById,
  archiveCategoryById,
} from "./categoryRepository.js";

// --------------------------------------------------
// Helper: Create a consistent error with HTTP status
// --------------------------------------------------
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// --------------------------------------------------
// Helper: Convert a category name into a URL slug
// Example: "Mobile Phones" -> "mobile-phones"
// --------------------------------------------------
const slugify = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

// --------------------------------------------------
// Helper: Generate a unique slug
// Example: mobile-phones, mobile-phones-2
// --------------------------------------------------
const generateUniqueSlug = async (name, currentCategoryId = null) => {
  const baseSlug = slugify(name);

  if (!baseSlug) {
    throw createError("A valid category name is required.");
  }

  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existingCategory = await findCategoryBySlug(slug);

    if (
      !existingCategory ||
      existingCategory._id.toString() === currentCategoryId?.toString()
    ) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// --------------------------------------------------
// Helper: Validate a parent category
// Only active main categories can be parents.
// --------------------------------------------------
const validateParentCategory = async (parentId) => {
  if (!parentId) {
    return null;
  }

  const parentCategory = await findCategoryById(parentId);

  if (!parentCategory) {
    throw createError("Parent category not found.", 404);
  }

  if (parentCategory.status !== "active") {
    throw createError("Cannot use an archived category as a parent.");
  }

  if (parentCategory.parent) {
    throw createError(
      "Subcategories cannot have their own subcategories."
    );
  }

  return parentCategory;
};

// --------------------------------------------------
// CREATE CATEGORY
// --------------------------------------------------
export const createCategoryService = async (categoryData) => {
  const { name, parent, ...otherData } = categoryData;

  // Validate parent if creating a subcategory
  await validateParentCategory(parent);

  // Generate a unique slug
  const slug = await generateUniqueSlug(name);

  const newCategory = await createCategory({
    name,
    parent: parent || null,
    slug,
    ...otherData,
  });

  return newCategory;
};

// --------------------------------------------------
// GET ALL CATEGORIES
// --------------------------------------------------
export const getAllCategoriesService = async (filters = {}) => {
  return await findAllCategories(filters);
};

// --------------------------------------------------
// GET CATEGORY BY ID
// --------------------------------------------------
export const getCategoryByIdService = async (categoryId) => {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw createError("Category not found.", 404);
  }

  return category;
};

// --------------------------------------------------
// GET CATEGORY BY SLUG
// --------------------------------------------------
export const getCategoryBySlugService = async (slug) => {
  const category = await findCategoryBySlug(slug);

  if (!category) {
    throw createError("Category not found.", 404);
  }

  return category;
};

// --------------------------------------------------
// GET SUBCATEGORIES
// --------------------------------------------------
export const getSubcategoriesService = async (parentId) => {
  const parentCategory = await findCategoryById(parentId);

  if (!parentCategory) {
    throw createError("Parent category not found.", 404);
  }

  return await findSubcategories(parentId);
};

// --------------------------------------------------
// UPDATE CATEGORY
// --------------------------------------------------
export const updateCategoryService = async (
  categoryId,
  updateData
) => {
  const existingCategory = await findCategoryById(categoryId);

  if (!existingCategory) {
    throw createError("Category not found.", 404);
  }

  const { name, parent, slug, ...otherData } = updateData;

  const finalName = name ?? existingCategory.name;

  // Validate parent only when the parent field is being updated
  if (Object.hasOwn(updateData, "parent")) {
    if (parent?.toString() === categoryId.toString()) {
      throw createError("A category cannot be its own parent.");
    }

    await validateParentCategory(parent);

    // A main category with subcategories cannot become a subcategory.
    if (parent && !existingCategory.parent) {
      const children = await findSubcategories(categoryId);

      if (children.length > 0) {
        throw createError(
          "A category with subcategories cannot become a subcategory."
        );
      }
    }
  }

  // Generate a new unique slug if the name or slug changes
  let finalSlug = existingCategory.slug;

  if (name || slug) {
    finalSlug = await generateUniqueSlug(
      slug || finalName,
      categoryId
    );
  }

  const dataToUpdate = {
    ...otherData,
    ...(name !== undefined && { name }),
    ...(Object.hasOwn(updateData, "parent") && {
      parent: parent || null,
    }),
    ...(name !== undefined || slug !== undefined
      ? { slug: finalSlug }
      : {}),
  };

  return await updateCategoryById(categoryId, dataToUpdate);
};

// --------------------------------------------------
// ARCHIVE CATEGORY
// --------------------------------------------------
export const archiveCategoryService = async (categoryId) => {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw createError("Category not found.", 404);
  }

  if (category.status === "archived") {
    throw createError("Category is already archived.");
  }

  // Prevent archiving a main category while it has
  // active subcategories.
  if (!category.parent) {
    const children = await findSubcategories(categoryId);

    const hasActiveChildren = children.some(
      (child) => child.status === "active"
    );

    if (hasActiveChildren) {
      throw createError(
        "Archive the active subcategories before archiving this category."
      );
    }
  }

  return await archiveCategoryById(categoryId);
};
