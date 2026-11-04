import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  PackageSearch,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { getProducts } from "../services/productApi";
import { getShopCategories } from "../services/categoryApi";

const ATTR_PREFIX = "attr_";

/* ---------- helpers ---------- */

function normalizeProduct(product) {
  const mainImage = product.mainImage;
  const image =
    (typeof mainImage === "string" ? mainImage : mainImage?.url) ||
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    product.image ||
    "/images/product-placeholder.png";

  const availableStock =
    product.availableStock ??
    Math.max(
      0,
      Number(product.inventory?.onHand ?? 0) -
        Number(product.inventory?.reserved ?? 0),
    );

  return {
    ...product,
    _id: String(product._id ?? product.id ?? ""),
    brand:
      typeof product.brand === "object"
        ? (product.brand?.name ?? "")
        : (product.brand ?? ""),
    category:
      typeof product.category === "object"
        ? (product.category?.name ?? "")
        : (product.category ?? ""),
    categorySlug:
      typeof product.category === "object"
        ? (product.category?.slug ?? "")
        : (product.categorySlug ?? ""),
    image,
    availableStock: Number(availableStock),
    stock: Number(availableStock),
  };
}

async function loadProducts(signal) {
  const response = await getProducts({ page: 1, limit: 30 }, { signal });
  return response.products.map(normalizeProduct);
}

// An attribute option can be a plain string or { value, label }.
function toOption(option) {
  if (option && typeof option === "object") {
    const value = option.value ?? option.label ?? "";
    return { value: String(value), label: String(option.label ?? value) };
  }
  return { value: String(option), label: String(option) };
}

// Reads a product's value for an attribute key.
// ADJUST THIS if your backend stores attribute values somewhere else.
function getProductAttributeValue(product, key) {
  const raw = product.attributes?.[key] ?? product.specs?.[key] ?? product[key];

  if (raw == null) return [];
  return (Array.isArray(raw) ? raw : [raw]).map((v) => String(v).toLowerCase());
}

/* ---------- small components ---------- */

function FilterSection({ title, defaultOpen = false, children }) {
  return (
    <details open={defaultOpen} className="border-b border-gray-200 py-3">
      <summary className="cursor-pointer list-none font-medium text-gray-800">
        {title} <ChevronDown className="float-right" size={16} />
      </summary>
      {children}
    </details>
  );
}

function CategoryButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-[#183D3D] bg-[#183D3D] text-white"
          : "border-gray-200 bg-white text-gray-700 hover:border-[#183D3D] hover:text-[#183D3D]"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- page ---------- */

export default function Shop() {
  const { addToCart } = useCart();
  const productsSectionRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");

  // Filters: the URL is the single source of truth (no duplicated state).
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";
  const inStockOnly = searchParams.get("availability") === "in-stock";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const brand = searchParams.get("brand") || "";

  const attributeFilters = useMemo(
    () =>
      Object.fromEntries(
        [...searchParams.entries()]
          .filter(([key]) => key.startsWith(ATTR_PREFIX))
          .map(([key, value]) => [key.slice(ATTR_PREFIX.length), value]),
      ),
    [searchParams],
  );

  /* ---------- effects ---------- */

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
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

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

  useEffect(() => {
    if (!productsSectionRef.current) return;
    const frameId = requestAnimationFrame(scrollToProducts);
    return () => cancelAnimationFrame(frameId);
  }, [category]);

  /* ---------- URL helpers ---------- */

  function updateQuery(values) {
    const next = new URLSearchParams(searchParams);
    Object.entries(values).forEach(([key, value]) => {
      if (value === "" || value === "all" || value == null || value === false)
        next.delete(key);
      else if (value === true)
        next.set(key, key === "availability" ? "in-stock" : "true");
      else next.set(key, String(value));
    });
    setSearchParams(next, { replace: true });
  }

  function changeCategory(value) {
    const next = new URLSearchParams(searchParams);
    [...next.keys()].forEach((key) => {
      if (key.startsWith(ATTR_PREFIX)) next.delete(key);
    });
    next.delete("brand");
    if (value === "all") next.delete("category");
    else next.set("category", value);
    setSearchParams(next, { replace: true });
  }

  function setAttribute(key, value) {
    updateQuery({ [`${ATTR_PREFIX}${key}`]: value });
  }

  function clearFilters() {
    setSearchParams({});
  }

  function scrollToProducts() {
    if (!productsSectionRef.current) return;
    const stickyControls = document.querySelector(
      '[data-shop-sticky-controls="true"]',
    );
    const stickyBottom = stickyControls
      ? stickyControls.getBoundingClientRect().bottom
      : 0;
    const top =
      window.scrollY +
      productsSectionRef.current.getBoundingClientRect().top -
      stickyBottom -
      40;
    window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
  }

  /* ---------- derived data ---------- */

  const allCategories = useMemo(
    () => categories.flatMap((main) => [main, ...(main.subcategories || [])]),
    [categories],
  );

  const selectedCategory = useMemo(
    () =>
      category === "all"
        ? null
        : allCategories.find((item) => item.slug === category) || null,
    [allCategories, category],
  );

  const selectedCategorySlugs = useMemo(() => {
    if (category === "all") return [];
    const mainCategory = categories.find((item) => item.slug === category);
    if (mainCategory) {
      return [
        mainCategory.slug,
        ...(mainCategory.subcategories || []).map((s) => s.slug),
      ];
    }
    return [category];
  }, [categories, category]);

  // Filterable attributes for the selected category.
  // A subcategory with no attributes of its own inherits its parent's.
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
        (attribute) => attribute.isFilterable && attribute.key !== "brand",
      )
      .map((attribute) => ({
        ...attribute,
        options: (attribute.options || []).map(toOption),
      }))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [categories, selectedCategory]);
  console.log("Selected category:", selectedCategory?.name);
  console.log("Selected attributes:", selectedCategory?.attributes);
  console.log("Filterable attributes:", selectedCategoryAttributes);

  // Only count attribute filters that belong to the current category.
  const activeAttributeFilters = useMemo(
    () =>
      selectedCategoryAttributes
        .filter((attribute) => attributeFilters[attribute.key])
        .map((attribute) => [attribute.key, attributeFilters[attribute.key]]),
    [selectedCategoryAttributes, attributeFilters],
  );

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((p) => {
      if (category !== "all" && !selectedCategorySlugs.includes(p.categorySlug))
        return false;

      if (query) {
        const text = [p.name, p.brand, p.description, p.category]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!text.includes(query)) return false;
      }

      if (inStockOnly && Number(p.stock ?? p.availableStock ?? 0) <= 0)
        return false;

      const price = Number(p.price);
      if (minPrice !== "" && price < Number(minPrice)) return false;
      if (maxPrice !== "" && price > Number(maxPrice)) return false;

      if (brand && String(p.brand || "").toLowerCase() !== brand.toLowerCase())
        return false;

      return activeAttributeFilters.every(([key, value]) =>
        getProductAttributeValue(p, key).includes(String(value).toLowerCase()),
      );
    });

    return result.sort((a, b) => {
      if (sort === "price-low") return Number(a.price) - Number(b.price);
      if (sort === "price-high") return Number(b.price) - Number(a.price);
      if (sort === "name") return String(a.name).localeCompare(String(b.name));
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
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

  const categoryBrands = useMemo(
    () => [
      ...new Set(
        products
          .filter(
            (p) =>
              category === "all" ||
              selectedCategorySlugs.includes(p.categorySlug),
          )
          .map((p) => p.brand)
          .filter(Boolean),
      ),
    ],
    [products, category, selectedCategorySlugs],
  );

  const activeFilterCount =
    [search, inStockOnly, minPrice, maxPrice, brand].filter(Boolean).length +
    activeAttributeFilters.length;

  /* ---------- render ---------- */

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-[#183D3D] text-white">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
            DVC Store
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {selectedCategory
              ? `Shop ${selectedCategory.name}`
              : "Shop all products"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-200 sm:text-base">
            {selectedCategory?.description ||
              "Explore our collection of products available at DVC Store."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Sticky category + search controls */}
        <div
          data-shop-sticky-controls="true"
          className="sticky top-20 z-30 mb-6 border-b border-gray-200 bg-gray-50 py-3 lg:top-30"
        >
          <div className="mb-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              <CategoryButton
                active={category === "all"}
                onClick={() => changeCategory("all")}
              >
                All
              </CategoryButton>
            </div>

            {categories.map((mainCategory) => {
              const hasSubs = mainCategory.subcategories?.length > 0;
              const buttons = hasSubs
                ? [
                    {
                      ...mainCategory,
                      buttonLabel: `All ${mainCategory.name}`,
                    },
                    ...mainCategory.subcategories.map((sub) => ({
                      ...sub,
                      buttonLabel: sub.name,
                    })),
                  ]
                : [{ ...mainCategory, buttonLabel: mainCategory.name }];

              return (
                <div key={mainCategory.id} className="flex flex-wrap gap-2">
                  {buttons.map((item) => (
                    <CategoryButton
                      key={item.id}
                      active={category === item.slug}
                      onClick={() => changeCategory(item.slug)}
                    >
                      {item.buttonLabel}
                    </CategoryButton>
                  ))}
                </div>
              );
            })}

            {categoriesError && (
              <p className="text-sm text-red-600">{categoriesError}</p>
            )}
          </div>

          <label className="relative block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={19}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                // Searching resets category and attribute filters.
                const next = new URLSearchParams(searchParams);
                [...next.keys()].forEach((key) => {
                  if (key.startsWith(ATTR_PREFIX)) next.delete(key);
                });
                next.delete("category");
                next.delete("brand");
                if (e.target.value) next.set("search", e.target.value);
                else next.delete("search");
                setSearchParams(next, { replace: true });
              }}
              placeholder="Search products or brands..."
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#183D3D] focus:ring-2 focus:ring-[#183D3D]/15"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[245px_minmax(0,1fr)]">
          {/* Filters sidebar */}
          <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4 lg:sticky lg:top-64 lg:max-h-[calc(100vh-270px)] lg:overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                <SlidersHorizontal size={17} /> Filters
              </h2>
              <button
                type="button"
                onClick={clearFilters}
                disabled={
                  activeFilterCount === 0 &&
                  category === "all" &&
                  sort === "newest"
                }
                className="text-xs font-semibold text-dvcGreen hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
              >
                Reset filters
              </button>
            </div>

            <FilterSection title="Availability" defaultOpen>
              <label className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) =>
                    updateQuery({ availability: e.target.checked })
                  }
                  className="accent-dvcGreen"
                />
                In stock only
              </label>
            </FilterSection>

            <FilterSection title="Price (LKR)" defaultOpen>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <input
                  aria-label="Minimum price"
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateQuery({ minPrice: e.target.value })}
                  className="min-w-0 rounded-md border border-gray-300 px-2 py-2 text-sm"
                />
                <input
                  aria-label="Maximum price"
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateQuery({ maxPrice: e.target.value })}
                  className="min-w-0 rounded-md border border-gray-300 px-2 py-2 text-sm"
                />
              </div>
            </FilterSection>

            <FilterSection title="Brand" defaultOpen>
              <select
                value={brand}
                onChange={(e) => updateQuery({ brand: e.target.value })}
                className="mt-3 w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm"
              >
                <option value="">All brands</option>
                {categoryBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </FilterSection>
            {selectedCategoryAttributes.map((attribute) => (
              <div
                key={attribute.key}
                className="border-b border-gray-200 py-3"
              >
                <label className="font-medium text-gray-800">
                  {attribute.label}
                </label>

                <select
                  aria-label={attribute.label}
                  value={attributeFilters[attribute.key] || ""}
                  onChange={(e) => setAttribute(attribute.key, e.target.value)}
                  className="mt-3 w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm"
                >
                  <option value="">All</option>

                  {attribute.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </aside>

          {/* Product grid */}
          <section ref={productsSectionRef} id="shop-products">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedCategory?.name || "All products"}
                </h2>
                <p className="mt-1 text-sm text-gray-500" aria-live="polite">
                  {loading
                    ? "Loading products..."
                    : `${visibleProducts.length} products found`}
                  {activeFilterCount > 0
                    ? ` · ${activeFilterCount} active filters`
                    : ""}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Sort by
                <select
                  value={sort}
                  onChange={(e) =>
                    updateQuery({
                      sort: e.target.value === "newest" ? "" : e.target.value,
                    })
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </label>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl bg-white p-4"
                  >
                    <div className="aspect-square rounded-lg bg-gray-200" />
                    <div className="mt-3 h-4 rounded bg-gray-200" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-white p-10 text-center text-red-700">
                {error}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white px-6 py-14 text-center">
                <PackageSearch className="mx-auto text-gray-400" size={42} />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No products found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try changing your search or filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-lg bg-[#183D3D] px-4 py-2 text-sm font-semibold text-white"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((product, index) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    index={index}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="mt-10 rounded-xl border border-gray-200 bg-white p-5 sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Need help finding something?
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Contact the DVC team for product information and availability.
            </p>
          </div>
          <Link
            to="/contact-us"
            className="mt-3 inline-flex rounded-lg border border-[#183D3D] px-4 py-2 text-sm font-semibold text-[#183D3D] hover:bg-[#183D3D] hover:text-white sm:mt-0"
          >
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
