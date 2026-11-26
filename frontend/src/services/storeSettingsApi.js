import api from "./api";

export const getPublicStoreSettings = async () => {
  const response = await api.get("/settings/public");
  return response.data;
};