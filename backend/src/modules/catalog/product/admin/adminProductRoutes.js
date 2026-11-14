import { Router } from "express";
import { upload } from "../../../../middleware/uploadMiddleware.js";
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

// INJECT MULTIPART FILE UPLOAD MIDDLEWARE HERE:
// upload.single("image") intercepts the file named "image" from FormData
router.post("/", upload.single("image"), createAdminProductHandler);
router.patch("/:productId", upload.single("image"), updateAdminProductHandler);

router.patch("/:productId/archive", archiveAdminProductHandler);
router.patch("/:productId/restore", restoreAdminProductHandler);

export default router;
