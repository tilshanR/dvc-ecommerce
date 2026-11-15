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


export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error fetching order details" });
  }
};