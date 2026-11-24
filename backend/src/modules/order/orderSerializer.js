/**
 * Format a single order item for the storefront receipt.
 */
const serializeOrderItem = (item) => {
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
 * Format the order document for the public storefront response.
 */
export const serializeOrder = (order) => {
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
    
    shippingAddress: order.shippingAddress ? {
      streetAddress: order.shippingAddress.streetAddress,
      city: order.shippingAddress.city,
      postcode: order.shippingAddress.postcode,
    } : null,
    
    items: order.items.map(serializeOrderItem),
    
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
      payment: order.paymentStatus,
      order: order.orderStatus,
    },
    expiresAt: order.expiresAt || null,
    createdAt: order.createdAt,
  };
};