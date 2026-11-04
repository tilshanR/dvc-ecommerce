
import api from "./api";

// GET /api/categories/shop
export async function getShopCategories({ signal } = {}) {
  const { data } = await api.get("/categories/shop", {
    signal,
  });

  if (!data?.success || !Array.isArray(data.categories)) {
    throw new Error(
      "Invalid category response from server."
    );
  }

  return data.categories;
}
