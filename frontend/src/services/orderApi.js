import api from "./api";

/* --------------------------------
   PUBLIC STOREFRONT
--------------------------------- */

/**
 * Submit a new guest checkout order
 * @param {Object} orderPayload
 */
export const createOrder = async (orderPayload) => {
  const response = await api.post("/orders/checkout", orderPayload);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};
