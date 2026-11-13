import { Search, X } from "lucide-react";

export default function ProductFilters({
  search,
  setSearch,
  status,
  setStatus,
  onClear,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name or SKU..."
          className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm outline-none focus:border-[#183D3D]"
        />
      </div>

      {/* Status filter */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#183D3D]"
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived</option>
      </select>

      {/* Clear filters */}
      <button
        type="button"
        onClick={onClear}
        className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
      >
        <X size={16} />
        Clear
      </button>
    </div>
  );
}
