/**
 * Format a single order item for the admin dashboard.
 */
const serializeAdminOrderItem = (item) => {
  return {
    productId: item.product.toString(),
    name: item.name,
    sku: item.sku || null,
    price: item.price,
    quantity: item.quantity,
    image: item.image || null,
  };
};

/**
 * Format a single order document for admin views.
 */
export const serializeAdminOrder = (order) => {
  if (!order) return null;

  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    
    customer: {
      firstName: order.customer.firstName,
      lastName: order.customer.lastName,
      email: order.customer.email,
      phone: order.customer.phone,
    },
    
    shippingAddress: order.shippingAddress || null,
    
    items: order.items.map(serializeAdminOrderItem),
    
    financials: {
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
    },
    
    methods: {
      checkoutMethod: order.checkoutMethod,
      paymentMethod: order.paymentMethod,
    },
    
    status: {
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    },

    fulfillment: {
      courierProvider: order.fulfillment?.courierProvider || null,
      trackingNumber: order.fulfillment?.trackingNumber || null,
      dispatchedAt: order.fulfillment?.dispatchedAt || null,
      deliveredAt: order.fulfillment?.deliveredAt || null,
    },

    inventoryState: order.inventoryState || "reserved",
    expiresAt: order.expiresAt || null,
    notes: order.notes || "",
    
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

/**
 * Format an array of orders and include pagination metadata.
 */
export const serializeAdminOrderList = (ordersData) => {
  return {
    orders: ordersData.orders.map(serializeAdminOrder),
    pagination: ordersData.pagination,
  };
};