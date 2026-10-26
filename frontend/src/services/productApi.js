
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL 
).replace(/\/$/, "");

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Please check your connection."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}.`
    );
  }

  return data;
}

// Expected endpoint: GET /api/products/:productId
export async function getProduct(productId, { signal } = {}) {
  if (!productId) {
    throw new Error("A product ID or slug is required.");
  }

  const data = await apiRequest(
    `/products/${encodeURIComponent(productId)}`,
    { signal }
  );

  // Supports common response shapes:
  // { product: {...} }, { data: {...} }, or a product object directly.
  const product = data?.product ?? data?.data ?? data;

  if (!product || typeof product !== "object" || !product.name) {
    throw new Error("The server returned an invalid product response.");
  }

  return product;
}

// Expected endpoint: POST /api/cart/items
// This will work only after your backend implements this route.
export async function addProductToCart(productId, quantity) {
  return apiRequest("/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
}
