
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  getCategoryBySlugService,
  getSubcategoriesService,
  updateCategoryService,
  archiveCategoryService,
} from "./categoryService.js";

import {
  createCategorySchema,
  updateCategorySchema,
} from "./categoryValidation.js";

import {
  categoryDTO,
  categoryDTOs,
} from "./categorySerializer.js";

// CREATE CATEGORY
export const createCategoryController = async (req, res, next) => {
  try {
    const validation = createCategorySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validation.error.flatten(),
      });
    }

    const category = await createCategoryService(validation.data);

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category: categoryDTO(category),
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL CATEGORIES
export const getAllCategoriesController = async (req, res, next) => {
  try {
    const filters = {
      ...(req.query.status && { status: req.query.status }),
    };

    if (req.query.parent !== undefined) {
      filters.parent =
        req.query.parent === "null" ? null : req.query.parent;
    }

    const categories = await getAllCategoriesService(filters);

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories: categoryDTOs(categories),
    });
  } catch (error) {
    next(error);
  }
};

// GET CATEGORY BY ID
export const getCategoryByIdController = async (req, res, next) => {
  try {
    const category = await getCategoryByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      category: categoryDTO(category),
    });
  } catch (error) {
    next(error);
  }
};

// GET CATEGORY BY SLUG
export const getCategoryBySlugController = async (req, res, next) => {
  try {
    const category = await getCategoryBySlugService(req.params.slug);

    return res.status(200).json({
      success: true,
      category: categoryDTO(category),
    });
  } catch (error) {
    next(error);
  }
};

// GET SUBCATEGORIES
export const getSubcategoriesController = async (req, res, next) => {
  try {
    const categories = await getSubcategoriesService(
      req.params.parentId
    );

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories: categoryDTOs(categories),
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE CATEGORY
export const updateCategoryController = async (req, res, next) => {
  try {
    const validation = updateCategorySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validation.error.flatten(),
      });
    }

    const category = await updateCategoryService(
      req.params.id,
      validation.data
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category: categoryDTO(category),
    });
  } catch (error) {
    next(error);
  }
};

// ARCHIVE CATEGORY
export const archiveCategoryController = async (req, res, next) => {
  try {
    const category = await archiveCategoryService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Category archived successfully.",
      category: categoryDTO(category),
    });
  } catch (error) {
    next(error);
  }
};
