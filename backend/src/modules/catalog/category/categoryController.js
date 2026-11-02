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

// --------------------------------------------------
// CREATE CATEGORY
// POST /api/categories
// --------------------------------------------------
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
      category,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// GET ALL CATEGORIES
// GET /api/categories
// --------------------------------------------------
export const getAllCategoriesController = async (req, res, next) => {
  try {
    const filters = {
      ...(req.query.status && { status: req.query.status }),
    };

    // Support main categories and subcategories
    if (req.query.parent !== undefined) {
      if (req.query.parent === "null") {
        filters.parent = null;
      } else {
        filters.parent = req.query.parent;
      }
    }

    const categories = await getAllCategoriesService(filters);

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// GET CATEGORY BY ID
// GET /api/categories/id/:id
// --------------------------------------------------
export const getCategoryByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await getCategoryByIdService(id);

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// GET CATEGORY BY SLUG
// GET /api/categories/slug/:slug
// --------------------------------------------------
export const getCategoryBySlugController = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await getCategoryBySlugService(slug);

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// GET SUBCATEGORIES
// GET /api/categories/:parentId/subcategories
// --------------------------------------------------
export const getSubcategoriesController = async (req, res, next) => {
  try {
    const { parentId } = req.params;

    const categories = await getSubcategoriesService(parentId);

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// UPDATE CATEGORY
// PATCH /api/categories/:id
// --------------------------------------------------
export const updateCategoryController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const validation = updateCategorySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validation.error.flatten(),
      });
    }

    const category = await updateCategoryService(id, validation.data);

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// ARCHIVE CATEGORY
// PATCH /api/categories/:id/archive
// --------------------------------------------------
export const archiveCategoryController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await archiveCategoryService(id);

    return res.status(200).json({
      success: true,
      message: "Category archived successfully.",
      category,
    });
  } catch (error) {
    next(error);
  }
};
