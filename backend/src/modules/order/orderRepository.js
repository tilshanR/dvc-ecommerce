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

export const findOrderById = async (orderId, session = null) => {
  const query = Order.findById(orderId);
  return session ? await query.session(session) : await query;
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

export const updateOrderById = async (orderId, updateData, session = null) => {
  const { fulfillment, ...rest } = updateData;
  const setFields = { ...rest };

  // Flatten fulfillment fields so updating courier/tracking never wipes dispatchedAt/deliveredAt
  if (fulfillment && typeof fulfillment === "object") {
    for (const [key, value] of Object.entries(fulfillment)) {
      if (value !== undefined) {
        setFields[`fulfillment.${key}`] = value;
      }
    }
  }

  const options = {
    returnDocument: "after",
    runValidators: true,
    ...(session ? { session } : {}),
  };

  return await Order.findByIdAndUpdate(orderId, { $set: setFields }, options);
};

/**
 * Find all orders using filters, search, sorting, and pagination.
 * Used exclusively by the Admin dashboard.
 */

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const findAllOrders = async (filters = {}) => {
  const { search, orderStatus, paymentStatus, page = 1, limit = 10 } = filters;

  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(
    100,
    Math.max(1, Number.parseInt(limit, 10) || 10),
  );

  const query = {};

  // Text search across order number, customer email, and customer phone
  if (search?.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
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
  const skip = (safePage - 1) * safeLimit;

  // Execute query and count simultaneously
  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};
