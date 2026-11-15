import express from "express";
import { createOrder, getOrderById } from "./orderController.js";


const router = express.Router();

/**
 * @route   POST /api/orders/checkout
 * @desc    Create a new guest order
 * @access  Public
 */
router.post("/checkout", createOrder);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order details by ID (used for the success page)
 * @access  Public
 */
router.get("/:id", getOrderById);

export default router;