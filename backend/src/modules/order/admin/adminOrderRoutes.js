import express from "express";
import {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrder,
} from "./adminOrderController.js";

// TODO: Import  future authentication and authorization middleware
// import { protect, authorize } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// Apply RBAC middleware to all routes 
// router.use(protect, authorize("admin", "superadmin"));

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with pagination and filtering
 * @access  Private/Admin
 */
router.get("/", getAdminOrders);

/**
 * @route   GET /api/admin/orders/:id
 * @desc    Get a single order by ID
 * @access  Private/Admin
 */
router.get("/:id", getAdminOrderById);

/**
 * @route   PATCH /api/admin/orders/:id
 * @desc    Update order status, payment status, or courier info
 * @access  Private/Admin
 */
router.patch("/:id", updateAdminOrder);

export default router;