import Category from "./categoryModel.js";

/* CREATE CATEGORY */

export const createCategory = async (categoryData) => {
  return await Category.create(categoryData);
};

/* GET ALL CATEGORIES */

export const findAllCategories = async (filters = {}) => {
  const query = {};

  // Filter by category status.
  if (filters.status) {
    query.status = filters.status;
  }

  // Filter by parent category.
  // null means retrieve main categories.
  if (Object.hasOwn(filters, "parent")) {
    query.parent = filters.parent;
  }

  return await Category.find(query)
    .populate("parent", "name slug")
    .sort({ sortOrder: 1, name: 1 });
};

/* GET CATEGORY BY ID */

export const findCategoryById = async (categoryId) => {
  return await Category.findById(categoryId).populate("parent", "name slug");
};

/* GET CATEGORY BY SLUG */

export const findCategoryBySlug = async (slug) => {
  return await Category.findOne({ slug }).populate("parent", "name slug");
};

/* GET SUBCATEGORIES */

export const findSubcategories = async (parentId) => {
  return await Category.find({ parent: parentId }).sort({ name: 1 });
};

/* UPDATE CATEGORY */

export const updateCategoryById = async (categoryId, updateData) => {
  return await Category.findByIdAndUpdate(
    categoryId,
    { $set: updateData },
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).populate("parent", "name slug");
};

/* ARCHIVE CATEGORY */

export const archiveCategoryById = async (categoryId) => {
  return await Category.findByIdAndUpdate(
    categoryId,
    { $set: { status: "archived" } },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
};

/* RESTORE CATEGORY AND SELECTED SUBCATEGORIES */

export const restoreCategoryWithSubcategories = async (
  categoryId,
  subcategoryIds = [],
) => {
  const session = await Category.startSession();

  try {
    let restoredCategory;

    await session.withTransaction(async () => {
      // Restore the main category.
      restoredCategory = await Category.findByIdAndUpdate(
        categoryId,
        { $set: { status: "active" } },
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      // Restore only the selected direct subcategories.
      if (subcategoryIds.length > 0) {
        await Category.updateMany(
          {
            _id: { $in: subcategoryIds },
            parent: categoryId,
            status: "archived",
          },
          {
            $set: { status: "active" },
          },
          {
            runValidators: true,
            session,
          },
        );
      }
    });

    return restoredCategory;
  } finally {
    await session.endSession();
  }
};
