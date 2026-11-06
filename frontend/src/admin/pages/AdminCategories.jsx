
import { useMemo, useState } from "react";
import { Search, Tags, FolderTree, RotateCcw } from "lucide-react";

const initialCategories = [
  {
    id: "1",
    name: "Mobile Phones",
    slug: "mobile-phones",
    description: "Mobile phones and smartphones",
    parent: null,
    sortOrder: 1,
    allowCondition: true,
    status: "active",
  },
  {
    id: "2",
    name: "Android Phones",
    slug: "android-phones",
    description: "Android smartphones",
    parent: "1",
    sortOrder: 1,
    allowCondition: true,
    status: "active",
  },
  {
    id: "3",
    name: "iPhones",
    slug: "iphones",
    description: "Apple iPhones",
    parent: "1",
    sortOrder: 2,
    allowCondition: true,
    status: "active",
  },
  {
    id: "4",
    name: "Computer Parts",
    slug: "computer-parts",
    description: "Computer components",
    parent: null,
    sortOrder: 2,
    allowCondition: false,
    status: "active",
  },
  {
    id: "5",
    name: "RAM",
    slug: "ram",
    description: "Desktop and laptop memory",
    parent: "4",
    sortOrder: 1,
    allowCondition: false,
    status: "archived",
  },
];

export default function AdminCategories() {
  const [categories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCategories = useMemo(() => {
    return categories
      .filter((category) => {
        const matchesSearch =
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.slug.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || category.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, searchTerm, statusFilter]);

  const activeCount = categories.filter(
    (category) => category.status === "active"
  ).length;

  const archivedCount = categories.filter(
    (category) => category.status === "archived"
  ).length;

  const getParentName = (parentId) => {
    if (!parentId) return "—";

    return categories.find((category) => category.id === parentId)?.name || "—";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Category Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Organize your store categories and subcategories.
          </p>
        </div>

        <button
          type="button"
          disabled
          title="Category creation will be added in Section 2B"
          className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#183D3D] px-4 py-2.5 text-sm font-semibold text-white opacity-60"
        >
          <Tags size={18} />
          Add Category
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F0EF] text-[#183D3D]">
              <FolderTree size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Active Categories</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {activeCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Archived Categories</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {archivedCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by category name or slug..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#183D3D] focus:ring-2 focus:ring-[#183D3D]/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#183D3D]"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Clear
          </button>
        </div>
      </div>

      {/* Category table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h3 className="font-semibold text-gray-900">All Categories</h3>
            <p className="mt-1 text-xs text-gray-500">
              Showing {filteredCategories.length} of {categories.length} categories
            </p>
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Tags size={30} className="mx-auto text-gray-300" />
            <p className="mt-3 font-medium text-gray-700">
              No categories found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Slug</th>
                  <th className="px-5 py-3 font-semibold">Parent</th>
                  <th className="px-5 py-3 font-semibold">Sort Order</th>
                  <th className="px-5 py-3 font-semibold">Condition</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            category.parent
                              ? "bg-gray-100 text-gray-500"
                              : "bg-[#E8F0EF] text-[#183D3D]"
                          }`}
                        >
                          <Tags size={17} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {category.parent ? "↳ " : ""}
                            {category.name}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {category.parent ? "Subcategory" : "Main category"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {category.slug}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {getParentName(category.parent)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {category.sortOrder}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          category.allowCondition
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {category.allowCondition ? "Allowed" : "Not allowed"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          category.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {category.status === "active" ? "Active" : "Archived"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Preview data only. Categories are not connected to the backend yet.
      </p>
    </div>
  );
}
