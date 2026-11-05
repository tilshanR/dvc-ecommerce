
import { useMemo } from "react";
import {
  toOption,
  getProductAttributeValue,
} from "../utils/shopHelpers";

export default function useShopProducts({
  products,
  categories,
  search,
  category,
  sort,
  inStockOnly,
  minPrice,
  maxPrice,
  brand,
  attributeFilters,
}) {
  // Get main categories and subcategories
  const allCategories = useMemo(
    () => categories.flatMap((main) => [
      main,
      ...(main.subcategories || []),
    ]),
    [categories],
  );

  // Find the selected category
  const selectedCategory = useMemo(
    () =>
      category === "all"
        ? null
        : allCategories.find((item) => item.slug === category) || null,
    [allCategories, category],
  );

  // Get category slugs, including subcategories
  const selectedCategorySlugs = useMemo(() => {
    if (category === "all") return [];

    const mainCategory = categories.find(
      (item) => item.slug === category,
    );

    if (mainCategory) {
      return [
        mainCategory.slug,
        ...(mainCategory.subcategories || []).map((sub) => sub.slug),
      ];
    }

    return [category];
  }, [categories, category]);

  // Get filterable attributes for the selected category
  const selectedCategoryAttributes = useMemo(() => {
    if (!selectedCategory) return [];

    let attributes = selectedCategory.attributes || [];

    if (attributes.length === 0) {
      const parent = categories.find((main) =>
        (main.subcategories || []).some(
          (sub) => sub.slug === selectedCategory.slug,
        ),
      );

      attributes = parent?.attributes || [];
    }

    return attributes
      .filter(
        (attribute) =>
          attribute.isFilterable && attribute.key !== "brand",
      )
      .map((attribute) => ({
        ...attribute,
        options: (attribute.options || []).map(toOption),
      }))
      .sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );
  }, [categories, selectedCategory]);

  // Get active attribute filters for the selected category
  const activeAttributeFilters = useMemo(
    () =>
      selectedCategoryAttributes
        .filter((attribute) => attributeFilters[attribute.key])
        .map((attribute) => [
          attribute.key,
          attributeFilters[attribute.key],
        ]),
    [selectedCategoryAttributes, attributeFilters],
  );

  // Filter and sort products
  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      if (
        category !== "all" &&
        !selectedCategorySlugs.includes(product.categorySlug)
      ) {
        return false;
      }

      if (query) {
        const text = [
          product.name,
          product.brand,
          product.description,
          product.category,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!text.includes(query)) return false;
      }

      if (
        inStockOnly &&
        Number(product.stock ?? product.availableStock ?? 0) <= 0
      ) {
        return false;
      }

      const price = Number(product.price);

      if (minPrice !== "" && price < Number(minPrice)) return false;
      if (maxPrice !== "" && price > Number(maxPrice)) return false;

      if (
        brand &&
        String(product.brand || "").toLowerCase() !== brand.toLowerCase()
      ) {
        return false;
      }

      return activeAttributeFilters.every(([key, value]) =>
        getProductAttributeValue(product, key).includes(
          String(value).toLowerCase(),
        ),
      );
    });

    return result.sort((a, b) => {
      if (sort === "price-low") {
        return Number(a.price) - Number(b.price);
      }

      if (sort === "price-high") {
        return Number(b.price) - Number(a.price);
      }

      if (sort === "name") {
        return String(a.name).localeCompare(String(b.name));
      }

      return new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0);
    });
  }, [
    products,
    category,
    selectedCategorySlugs,
    search,
    inStockOnly,
    minPrice,
    maxPrice,
    brand,
    activeAttributeFilters,
    sort,
  ]);

  // Get brands available in the selected category
  const categoryBrands = useMemo(
    () => [
      ...new Set(
        products
          .filter(
            (product) =>
              category === "all" ||
              selectedCategorySlugs.includes(product.categorySlug),
          )
          .map((product) => product.brand)
          .filter(Boolean),
      ),
    ],
    [products, category, selectedCategorySlugs],
  );

  // Count active filters
  const activeFilterCount =
    [search, inStockOnly, minPrice, maxPrice, brand].filter(Boolean)
      .length + activeAttributeFilters.length;

  return {
    selectedCategory,
    selectedCategoryAttributes,
    activeAttributeFilters,
    visibleProducts,
    categoryBrands,
    activeFilterCount,
  };
}
