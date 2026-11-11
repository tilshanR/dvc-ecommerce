
import { Router } from "express";

import {
  getAdminProductsHandler,
  getAdminProductHandler,
  createAdminProductHandler,
  updateAdminProductHandler,
  archiveAdminProductHandler,
  restoreAdminProductHandler,
} from "./adminProductController.js";

const router = Router();

// Admin product routes
router.get("/", getAdminProductsHandler);
router.get("/:productId", getAdminProductHandler);
router.post("/", createAdminProductHandler);
router.patch("/:productId", updateAdminProductHandler);
router.patch("/:productId/archive", archiveAdminProductHandler);
router.patch("/:productId/restore", restoreAdminProductHandler);

export default router;
