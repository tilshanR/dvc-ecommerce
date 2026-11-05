import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

// constant prefix used to identify dynamic attribute filters in url search parameters
const ATTR_PREFIX = "attr_";

export default function useShopFilters() {
  // hook from react router to read and write url query parameters (e.g., ?search=shoes&category=men)
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filter values from the URL
  // read the current search query string from the url, defaulting to an empty string if not present
  const search = searchParams.get("search") || "";
  // read the current product category from the url, defaulting to "all" if not present
  const category = searchParams.get("category") || "all";
  // read the current sorting option from the url, defaulting to "newest" if not present
  const sort = searchParams.get("sort") || "newest";
  // check if the availability filter is explicitly set to "in-stock"
  const inStockOnly = searchParams.get("availability") === "in-stock";
  // read the minimum price filter value from the url, defaulting to an empty string
  const minPrice = searchParams.get("minPrice") || "";
  // read the maximum price filter value from the url, defaulting to an empty string
  const maxPrice = searchParams.get("maxPrice") || "";
  // read the selected brand filter from the url, defaulting to an empty string
  const brand = searchParams.get("brand") || "";

  // memoized object containing all dynamic attribute filters extracted from the url
  const attributeFilters = useMemo(
    () =>
      Object.fromEntries(
        // convert the searchparams iterator into an array of [key, value] entries
        [...searchParams.entries()]
          // keep only the parameters whose keys start with the "attr_" prefix
          .filter(([key]) => key.startsWith(ATTR_PREFIX))
          // clean up keys by removing the "attr_" prefix and keeping their corresponding values
          .map(([key, value]) => [key.slice(ATTR_PREFIX.length), value]),
      ),
    // recalculate attribute filters only when the searchparams object changes
    [searchParams],
  );

  // Update URL parameters
  function updateQuery(values) {
    const next = new URLSearchParams(searchParams);

    Object.entries(values).forEach(([key, value]) => {
      if (value === "" || value === "all" || value == null || value === false) {
        next.delete(key);
      } else if (value === true) {
        next.set(key, key === "availability" ? "in-stock" : "true");
      } else {
        next.set(key, String(value));
      }
    });

    setSearchParams(next, { replace: true });
  }
  // Handle search input and clear category-specific filters
  function handleSearchChange(value) {
    const next = new URLSearchParams(searchParams);

    if (value.trim() === "") {
      next.delete("search");
    } else {
      next.set("search", value);
    }

    // Clear filters that could restrict search results
    next.delete("category");
    next.delete("brand");

    [...next.keys()].forEach((key) => {
      if (key.startsWith(ATTR_PREFIX)) {
        next.delete(key);
      }
    });

    setSearchParams(next, { replace: true });
  }

  // Change category and clear category-specific filters
  function changeCategory(value) {
    const next = new URLSearchParams(searchParams);

    [...next.keys()].forEach((key) => {
      if (key.startsWith(ATTR_PREFIX)) {
        next.delete(key);
      }
    });

    next.delete("brand");

    if (value === "all") {
      next.delete("category");
    } else {
      next.set("category", value);
    }

    setSearchParams(next, { replace: true });
  }

  function setAttribute(key, value) {
    updateQuery({ [`${ATTR_PREFIX}${key}`]: value });
  }

  function clearFilters() {
    setSearchParams({});
  }

  return {
    search,
    category,
    sort,
    inStockOnly,
    minPrice,
    maxPrice,
    brand,
    attributeFilters,
    updateQuery,
    changeCategory,
    setAttribute,
    clearFilters,
    handleSearchChange,
  };
}
