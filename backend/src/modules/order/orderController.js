import { createOrderService } from "./orderService.js";
import { serializeOrder } from "./orderSerializer.js";
import catchAsync from "../../middleware/catchAsync.js";

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