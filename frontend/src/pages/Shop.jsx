import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useShopData from "../hooks/useShopData";
import { PackageSearch } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import useShopFilters from "../hooks/useShopFilters";
import useShopProducts from "../hooks/useShopProducts";
import ShopSearch from "../components/shop/ShopSearch";
import ShopHeader from "../components/shop/ShopHeader";
import CategoryNavigation from "../components/shop/CategoryNavigation";
import FilterSection from "../components/shop/FilterSection";
import FilterSidebar from "../components/shop/FilterSidebar";
import ShopToolbar from "../components/shop/ShopToolbar";

/* ---------- page ---------- */
export default function Shop() {
  const { addToCart } = useCart();
  const productsSectionRef = useRef(null);
  // Data
  const { products, categories, loading, error, categoriesError } =
    useShopData();
  // Filters:
  const {
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
  } = useShopFilters();

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

  useEffect(() => {
    requestAnimationFrame(scrollToProducts);
  }, [category]);
  //derived data
  const {
    selectedCategory,
    selectedCategoryAttributes,
    visibleProducts,
    categoryBrands,
    activeFilterCount,
  } = useShopProducts({
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
  });
  /* ---------- render ---------- */
  return (
    <main className="min-h-screen bg-gray-50">
      <ShopHeader selectedCategory={selectedCategory} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Sticky category + search controls */}
        <div
          data-shop-sticky-controls="true"
          className="sticky top-20 z-30 mb-6 border-b border-gray-200 bg-gray-50 py-3 lg:top-30"
        >
          <CategoryNavigation
            categories={categories}
            category={category}
            changeCategory={changeCategory}
            categoriesError={categoriesError}
          />

          <ShopSearch search={search} handleSearchChange={handleSearchChange} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[245px_minmax(0,1fr)]">
          {/* Filters sidebar */}
          <FilterSidebar
            clearFilters={clearFilters}
            activeFilterCount={activeFilterCount}
            category={category}
            sort={sort}
            inStockOnly={inStockOnly}
            updateQuery={updateQuery}
            minPrice={minPrice}
            maxPrice={maxPrice}
            brand={brand}
            categoryBrands={categoryBrands}
            selectedCategoryAttributes={selectedCategoryAttributes}
            attributeFilters={attributeFilters}
            setAttribute={setAttribute}
          />

          {/* Product grid */}
          <section ref={productsSectionRef} id="shop-products">
            <ShopToolbar
              selectedCategory={selectedCategory}
              loading={loading}
              visibleProducts={visibleProducts}
              activeFilterCount={activeFilterCount}
              sort={sort}
              updateQuery={updateQuery}
            />

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
