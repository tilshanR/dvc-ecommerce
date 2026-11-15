import api from "./api";

export const getPaymentHash = async (orderId) => {
  const response = await api.get(`/payments/hash/${orderId}`);
  return response.data;
};