
import api from "./api";

// GET /api/categories/shop
export async function getShopCategories({ signal } = {}) {
  const { data } = await api.get("/categories/shop", {
    signal,
  });

  if (!data?.success || !Array.isArray(data.categories)) {
    throw new Error(
      "The server returned an invalid category response."
    );
  }

  return data.categories;
}
