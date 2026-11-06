import { useMemo, useState } from "react";
import {
  Search,
  Tags,
  FolderTree,
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
} from "lucide-react";

import CategoryForm from "../features/categories/CategoryForm";

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
    attributes: [],
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
    attributes: [],
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
    attributes: [],
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
    attributes: [],
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
    attributes: [],
  },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState(initialCategories);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [expandedCategories, setExpandedCategories] = useState(
    () => new Set(["1", "4"])
  );

  // Sort categories by their display order.
  const sortCategories = (items) =>
    [...items].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
    );

  // Build the main-category groups from the flat category collection.
  const categoryGroups = useMemo(() => {
    const mainCategories = sortCategories(
      categories.filter((category) => !category.parent)
    );

    const matchesSearch = (category) => {
      const search = searchTerm.toLowerCase();

      return (
        category.name.toLowerCase().includes(search) ||
        category.slug.toLowerCase().includes(search)
      );
    };

    const matchesStatus = (category) =>
      statusFilter === "all" || category.status === statusFilter;

    return mainCategories
      .map((mainCategory) => {
        const children = sortCategories(
          categories.filter(
            (category) => category.parent === mainCategory.id
          )
        );

        const matchingChildren = children.filter(
          (child) => matchesStatus(child) && matchesSearch(child)
        );

        const mainMatches =
          matchesStatus(mainCategory) && matchesSearch(mainCategory);

        if (!mainMatches && matchingChildren.length === 0) {
          return null;
        }

        return {
          category: mainCategory,
          children: mainMatches
            ? children.filter(matchesStatus)
            : matchingChildren,
        };
      })
      .filter(Boolean);
  }, [categories, searchTerm, statusFilter]);

  const activeCount = categories.filter(
    (category) => category.status === "active"
  ).length;

  const archivedCount = categories.filter(
    (category) => category.status === "archived"
  ).length;

  const toggleExpanded = (categoryId) => {
    setExpandedCategories((previous) => {
      const next = new Set(previous);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  };

  const openCreateForm = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  // Create or update a category using mock data.
  const handleSaveCategory = (categoryData) => {
    const editingId = editingCategory?.id;

    const slugExists = categories.some(
      (category) =>
        category.id !== editingId &&
        category.slug.toLowerCase() === categoryData.slug.toLowerCase()
    );

    if (slugExists) {
      window.alert("A category with this slug already exists.");
      return;
    }

    if (editingCategory) {
      setCategories((previous) =>
        previous.map((category) =>
          category.id === editingId
            ? { ...category, ...categoryData }
            : category
        )
      );
    } else {
      const newCategory = {
        ...categoryData,
        id: Date.now().toString(),
        status: "active",
      };

      setCategories((previous) => [...previous, newCategory]);
    }

    closeForm();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const totalVisible = categoryGroups.reduce(
    (total, group) => total + 1 + group.children.length,
    0
  );

  return (
    <div>
      {/* Page heading */}
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
          onClick={showForm ? closeForm : openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#183D3D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245252]"
        >
          {showForm ? (
            <>
              <RotateCcw size={18} />
              Back to Categories
            </>
          ) : (
            <>
              <Plus size={18} />
              Add Category
            </>
          )}
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="mb-6">
          <CategoryForm
            categories={categories}
            initialCategory={editingCategory}
            hasChildren={
              editingCategory
                ? categories.some(
                    (category) =>
                      category.parent === editingCategory.id
                  )
                : false
            }
            onSubmit={handleSaveCategory}
            onCancel={closeForm}
          />
        </div>
      )}

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

      {/* Hierarchical category table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h3 className="font-semibold text-gray-900">
              Category Hierarchy
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Showing {totalVisible} of {categories.length} categories
            </p>
          </div>
        </div>

        {categoryGroups.length === 0 ? (
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
                  <th className="px-5 py-3 font-semibold">Sort Order</th>
                  <th className="px-5 py-3 font-semibold">Condition</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {categoryGroups.map(({ category, children }) => {
                  const expanded =
                    searchTerm.trim() !== "" ||
                    expandedCategories.has(category.id);

                  return (
                    <>
                      {/* Main category */}
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {children.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => toggleExpanded(category.id)}
                                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                                aria-label={
                                  expanded
                                    ? "Collapse subcategories"
                                    : "Expand subcategories"
                                }
                              >
                                {expanded ? (
                                  <ChevronDown size={17} />
                                ) : (
                                  <ChevronRight size={17} />
                                )}
                              </button>
                            ) : (
                              <span className="w-[25px]" />
                            )}

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F0EF] text-[#183D3D]">
                              <FolderTree size={17} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {category.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                Main category
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-500">
                          {category.slug}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {category.sortOrder}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {category.allowCondition ? "Allowed" : "Not allowed"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              category.status === "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {category.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openEditForm(category)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                        </td>
                      </tr>

                      {/* Subcategories */}
                      {expanded &&
                        children.map((child) => (
                          <tr
                            key={child.id}
                            className="bg-gray-50/60 hover:bg-gray-100/70"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3 pl-10">
                                <span className="text-gray-400">↳</span>

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                  <Tags size={16} />
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    {child.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Subcategory
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-500">
                              {child.slug}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {child.sortOrder}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {child.allowCondition ? "Allowed" : "Not allowed"}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  child.status === "active"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-orange-50 text-orange-700"
                                }`}
                              >
                                {child.status}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => openEditForm(child)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-white"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                    </>
                  );
                })}
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
