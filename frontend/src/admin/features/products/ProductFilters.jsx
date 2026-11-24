import { Search, X } from "lucide-react";

export default function ProductFilters({
  search,
  setSearch,
  status,
  setStatus,
  onClear,
}) {
  const hasActiveFilters = Boolean(search.trim() || status);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-(--admin-border) bg-(--admin-surface) p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {/* Compact Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--admin-muted)"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            aria-label="Search products by name or SKU"
            className="admin-input w-full rounded-lg py-2 pl-9 pr-8 text-sm outline-none transition focus:border-(--admin-brand) focus:ring-2 focus:ring-(--admin-brand)/20"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search text"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-(--admin-muted) transition hover:text-(--admin-text)"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by product status"
          className="admin-input w-full rounded-lg px-3 py-2 text-sm outline-none transition focus:border-(--admin-brand) focus:ring-2 focus:ring-(--admin-brand)/20 sm:w-44"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Reset Filters */}
      <button
        type="button"
        onClick={onClear}
        disabled={!hasActiveFilters}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-(--admin-border) bg-(--admin-surface) px-3.5 py-2 text-sm font-medium text-(--admin-text) transition hover:bg-(--admin-hover) disabled:cursor-not-allowed disabled:opacity-45"
      >
        <X size={15} />
        Reset
      </button>
    </div>
  );
}
