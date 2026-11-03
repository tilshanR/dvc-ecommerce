import express from "express";

import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  getCategoryBySlugController,
  getSubcategoriesController,
  updateCategoryController,
  archiveCategoryController,
  restoreCategoryController,
  getShopCategoriesController,
} from "./categoryController.js";

const router = express.Router();

// Create a new category
router.post("/", createCategoryController);

// Get all categories (supports query filters)
router.get("/", getAllCategoriesController);

// Get active category hierarchy for public Shop
router.get("/shop", getShopCategoriesController);

// Get category by slug
router.get("/slug/:slug", getCategoryBySlugController);

// Get category by ID
router.get("/id/:id", getCategoryByIdController);

// Get subcategories of a main category
router.get("/:parentId/subcategories", getSubcategoriesController);

// Update an existing category
router.patch("/:id", updateCategoryController);

// Archive a category
router.patch("/:id/archive", archiveCategoryController);

// Restore a category
router.patch("/:id/restore", restoreCategoryController);

export default router;
