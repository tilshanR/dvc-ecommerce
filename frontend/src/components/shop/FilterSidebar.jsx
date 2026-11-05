
import { SlidersHorizontal } from "lucide-react";
import FilterSection from "./FilterSection";

export default function FilterSidebar({
  clearFilters,
  activeFilterCount,
  category,
  sort,
  inStockOnly,
  updateQuery,
  minPrice,
  maxPrice,
  brand,
  categoryBrands,
  selectedCategoryAttributes,
  attributeFilters,
  setAttribute,
}) {
  return (
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
  );
}
