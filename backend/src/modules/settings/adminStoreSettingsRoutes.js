import express from "express";
import { requireAdminRole } from "../../middleware/adminAuthMiddleware.js";
import {
  getAdminStoreSettings,
  updateAdminStoreSettings,
} from "./storeSettingsController.js";

const router = express.Router();

// Any authenticated admin can view settings; only super_admin can edit
router.get("/", getAdminStoreSettings);
router.patch("/", requireAdminRole("super_admin"), updateAdminStoreSettings);

export default router;