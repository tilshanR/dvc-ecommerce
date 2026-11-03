export const getShopCategories = async ({ signal } = {}) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/categories/shop`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal,
    },
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Unable to load categories.",
    );
  }

  return data.categories;
};