import Order from "./orderModel.js";

/**
 * Create a new order.
 * Accepts an optional session parameter to execute within a MongoDB transaction.
 */
export const createOrder = async (orderData, session = null) => {
  const options = session ? { session } : {};
  // When using a session, Mongoose expects an array for .create()
  const result = await Order.create([orderData], options);
  return result[0];
};

/**
 * Find an order by its MongoDB ObjectId.
 */
export const findOrderById = async (orderId) => {
  return await Order.findById(orderId);
};

/**
 * Find an order by its public Order Number (e.g., ORD-1698754).
 * Useful for PayHere webhook lookups.
 */
export const findOrderByOrderNumber = async (orderNumber) => {
  return await Order.findOne({ orderNumber });
};

/**
 * Update an order by its MongoDB ObjectId.
 */

export const updateOrderById = async (orderId, updateData) => {
  return await Order.findByIdAndUpdate(orderId, updateData, {
    returnDocument: "after",
    runValidators: true,
  });
};
/**
 * Find all orders using filters, search, sorting, and pagination.
 * Used exclusively by the Admin dashboard.
 */
export const findAllOrders = async (filters = {}) => {
  const {
    search,
    orderStatus,
    paymentStatus,
    page = 1,
    limit = 10,
  } = filters;

  const query = {};

  // Text search across order number, customer email, and customer phone
  if (search?.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { orderNumber: searchRegex },
      { "customer.email": searchRegex },
      { "customer.phone": searchRegex },
    ];
  }

  // Exact match filters
  if (orderStatus) {
    query.orderStatus = orderStatus;
  }

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query and count simultaneously
  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};