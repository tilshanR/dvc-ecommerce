
export default function ShopToolbar({
  selectedCategory,
  loading,
  visibleProducts,
  activeFilterCount,
  sort,
  updateQuery,
}) {
  return (
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
  );
}
