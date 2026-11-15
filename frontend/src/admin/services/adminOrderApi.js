import api from "../../services/api";

export const getAdminOrders = async (params = {}) => {
  const response = await api.get("/admin/orders", { params });
  return response.data;
};

export const getAdminOrderById = async (orderId) => {
  const response = await api.get(`/admin/orders/${orderId}`);
  return response.data;
};

export const updateAdminOrder = async (orderId, updateData) => {
  const response = await api.patch(`/admin/orders/${orderId}`, updateData);
  return response.data;
};