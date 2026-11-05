import api from "./api";

// POST /api/cart/items
export async function addProductToCart(productId, quantity) {
  if (!productId) {
    throw new Error("A product ID is required.");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive integer.");
  }

  const { data } = await api.post("/cart/items", {
    productId,
    quantity,
  });

  return data;
}
