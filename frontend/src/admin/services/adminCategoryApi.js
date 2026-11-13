import api from "../../services/api";

// GET /api/categories
export async function getAdminCategories(params = {}) {
  const { data } = await api.get("/categories", {
    params: {
      status: params.status || undefined,
      parent: params.parent,
    },
  });

  if (!data?.success || !Array.isArray(data.categories)) {
    throw new Error("Invalid category response from server.");
  }

  return data.categories;
}

// POST /api/categories
export async function createCategory(categoryData) {
  const { data } = await api.post("/categories", categoryData);
  return data;
}

// PATCH /api/categories/:id
export async function updateCategory(id, categoryData) {
  const { data } = await api.patch(`/categories/${id}`, categoryData);
  return data;
}

// PATCH /api/categories/:id/archive
export async function archiveCategory(id) {
  const { data } = await api.patch(`/categories/${id}/archive`);
  return data;
}

// PATCH /api/categories/:id/restore
export async function restoreCategory(id, subcategoryIds = []) {
  const { data } = await api.patch(`/categories/${id}/restore`, {
    subcategoryIds,
  });
  return data;
}
