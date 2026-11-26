import api from "./api";

export const getShippingQuote = async (payload) => {
  const response = await api.post("/shipping/quote", payload);
  return response.data;
};