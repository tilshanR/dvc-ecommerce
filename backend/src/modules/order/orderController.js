import mongoose from "mongoose";
import { createOrderService } from "./orderService.js";
import { serializeOrder } from "./orderSerializer.js";
import catchAsync from "../../middleware/catchAsync.js";
import Order from "./orderModel.js";
/**
 * @desc    Create a new guest order
 * @route   POST /api/orders/checkout
 * @access  Public
 */
export const createOrder = catchAsync(async (req, res) => {
  // Pass the raw payload to the service layer for validation and execution
  const order = await createOrderService(req.body);

  // Return a clean receipt via the storefront serializer
  res.status(201).json({
    success: true,
    message: "Order placed successfully.",
    data: serializeOrder(order),
  });
});


export const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid order ID.");
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findById(id);

  if (!order) {
    const error = new Error("Order not found.");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: serializeOrder(order),
  });
});