import api from "./api";

// GET /api/products
export async function getProducts(params = {}, { signal } = {}) {
  const { data } = await api.get("/products", {
    params: {
      search: params.search || undefined,
      category: params.category || undefined,
      brand: params.brand || undefined,
      condition: params.condition || undefined,
      page: params.page || 1,
      limit: params.limit || 12,
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "desc",
    },
    signal,
  });

  if (!data?.success || !Array.isArray(data.products)) {
    throw new Error("The server returned an invalid product response.");
  }

  return {
    products: data.products,
    pagination: data.pagination,
  };
}


// GET /api/products/:productId
export async function getProduct(productId, { signal } = {}) {
  if (!productId) {
    throw new Error("A product ID or slug is required.");
  }

  const { data } = await api.get(
    `/products/${encodeURIComponent(productId)}`,
    { signal },
  );

  const product = data?.product ?? data?.data ?? data;

  if (!product || typeof product !== "object" || !product.name) {
    throw new Error("The server returned an invalid product response.");
  }

  return product;
}
