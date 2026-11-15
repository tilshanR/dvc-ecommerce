import { updateAdminOrderService } from "../orderService.js";
import { findAllOrders, findOrderById } from "../orderRepository.js";
import { serializeAdminOrder, serializeAdminOrderList } from "./adminOrderSerializer.js";
import catchAsync from "../../../middleware/catchAsync.js";

// Helper to throw a 404 if an order isn't found
const createNotFoundError = () => {
  const error = new Error("Order not found.");
  error.statusCode = 404;
  return error;
};

/**
 * @desc    Get all orders with filtering and pagination
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
export const getAdminOrders = catchAsync(async (req, res) => {
  // req.query contains filters like ?orderStatus=Pending&page=1
  const ordersData = await findAllOrders(req.query);

  res.status(200).json({
    success: true,
    data: serializeAdminOrderList(ordersData),
  });
});

/**
 * @desc    Get a single order by ID for the admin details page
 * @route   GET /api/admin/orders/:id
 * @access  Private/Admin
 */
export const getAdminOrderById = catchAsync(async (req, res) => {
  const order = await findOrderById(req.params.id);

  if (!order) {
    throw createNotFoundError();
  }

  res.status(200).json({
    success: true,
    data: serializeAdminOrder(order),
  });
});

/**
 * @desc    Update order status, payment status, or courier tracking
 * @route   PATCH /api/admin/orders/:id
 * @access  Private/Admin
 */
export const updateAdminOrder = catchAsync(async (req, res) => {
  const updatedOrder = await updateAdminOrderService(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Order updated successfully.",
    data: serializeAdminOrder(updatedOrder),
  });
});