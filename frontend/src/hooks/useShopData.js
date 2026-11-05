
import { useEffect, useState } from "react";
import { getProducts } from "../services/productApi";
import { getShopCategories } from "../services/categoryApi";
import { normalizeProduct } from "../utils/shopHelpers";

// fetch products and normalize the response data
async function loadProducts(signal) {
  const response = await getProducts(
    { page: 1, limit: 100 },
    { signal },
  );

  return response.products.map(normalizeProduct);
}
// custom hook to manage product and category state
export default function useShopData() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");
// fetch products on mount and handle abort signals
  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    loadProducts(controller.signal)
      .then(setProducts)
      .catch((err) => {
        if (!controller.signal.aborted && err.code !== "ERR_CANCELED") {
          setError(err.message || "We couldn't load products.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  // Fetch categories
  useEffect(() => {
    const controller = new AbortController();

    setCategoriesError("");

    getShopCategories({ signal: controller.signal })
      .then(setCategories)
      .catch((err) => {
        if (!controller.signal.aborted && err.code !== "ERR_CANCELED") {
          setCategoriesError(err.message || "We couldn't load categories.");
        }
      });

    return () => controller.abort();
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    categoriesError,
  };
}
