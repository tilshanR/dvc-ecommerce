import express from "express";
import { createOrder } from "./orderController.js";

const router = express.Router();

/**
 * @route   POST /api/orders/checkout
 * @desc    Create a new guest order
 * @access  Public
 */
router.post("/checkout", createOrder);

export default router;