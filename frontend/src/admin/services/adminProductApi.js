import api from "../../services/api";

// GET /api/admin/products
export async function getAdminProducts(params = {}) {
  const { data } = await api.get("/admin/products", {
    params: {
      search: params.search || undefined,
      status: params.status || undefined,
      page: params.page || 1,
      limit: params.limit || 10,
    },
  });

  if (!data?.success || !Array.isArray(data.products)) {
    throw new Error("Invalid products response.");
  }

  return {
    products: data.products,
    pagination: data.pagination,
  };
}




// POST /api/admin/products
export async function createProduct(productData) {
  const { data } = await api.post("/admin/products", productData, {
    transformRequest: [(data, headers) => {
      // Safely strips the global JSON header so Axios can auto-build the boundary
      delete headers["Content-Type"];
      return data;
    }],
  });
  return data;
}


export async function updateProduct(id, productData) {
  // No custom headers or transformers needed. 
  const { data } = await api.patch(`/admin/products/${id}`, productData);
  return data;
}

// PATCH /api/admin/products/:id/archive
export async function archiveProduct(id) {
  const { data } = await api.patch(`/admin/products/${id}/archive`);
  return data;
}

// PATCH /api/admin/products/:id/restore
export async function restoreProduct(id) {
  const { data } = await api.patch(`/admin/products/${id}/restore`);
  return data;
}
