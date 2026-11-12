import { Fragment, useEffect, useMemo, useState } from "react";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  archiveCategory,
  restoreCategory,
} from "../services/adminCategoryApi";

import {
  Search,
  Tags,
  FolderTree,
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
  X,
  FolderPlus,
  Trash2,
} from "lucide-react";

import CategoryForm from "../features/categories/CategoryForm";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError("");

        const result = await getAdminCategories();

        setCategories(result);
      } catch (err) {
        setError(err.message || "Failed to load categories.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const [showCreationChooser, setShowCreationChooser] = useState(false);
  const [creationMode, setCreationMode] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState([]);

  const [initialSubcategories, setInitialSubcategories] = useState([""]);

  const [childNamesError, setChildNamesError] = useState("");

  const isFormOpen = Boolean(creationMode || editingCategory);

  // Build the main-category and subcategory hierarchy.
  const categoryGroups = useMemo(() => {
    const mainCategories = categories
      .filter((category) => category.parent === null)
      .sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
      );

    const search = searchTerm.trim().toLowerCase();

    return mainCategories
      .map((mainCategory) => {
        const children = categories
          .filter((category) => category.parent === mainCategory.id)
          .sort(
            (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
          );

        const mainMatches =
          !search ||
          mainCategory.name.toLowerCase().includes(search) ||
          mainCategory.slug.toLowerCase().includes(search);

        const visibleChildren = children.filter((child) => {
          const matchesSearch =
            !search ||
            child.name.toLowerCase().includes(search) ||
            child.slug.toLowerCase().includes(search);

          const matchesStatus =
            statusFilter === "all" || child.status === statusFilter;

          return matchesSearch && matchesStatus;
        });

        const mainMatchesStatus =
          statusFilter === "all" || mainCategory.status === statusFilter;

        if (mainMatches && mainMatchesStatus) {
          return {
            ...mainCategory,
            children: children.filter(
              (child) =>
                statusFilter === "all" || child.status === statusFilter,
            ),
          };
        }

        if (visibleChildren.length > 0) {
          return {
            ...mainCategory,
            children: visibleChildren,
          };
        }

        return null;
      })
      .filter(Boolean)
      .filter((group) => {
        const mainMatches =
          !search ||
          group.name.toLowerCase().includes(search) ||
          group.slug.toLowerCase().includes(search);

        return mainMatches || group.children.length > 0;
      });
  }, [categories, searchTerm, statusFilter]);

  const activeCount = categories.filter(
    (category) => category.status === "active",
  ).length;

  const archivedCount = categories.filter(
    (category) => category.status === "archived",
  ).length;

  const mainCategoryCount = categories.filter(
    (category) => category.parent === null,
  ).length;

  const subcategoryCount = categories.filter(
    (category) => category.parent !== null,
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

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const openCreateChooser = () => {
    setEditingCategory(null);
    setCreationMode(null);
    setInitialSubcategories([""]);
    setChildNamesError("");
    setShowCreationChooser(true);
  };

  const chooseCreationMode = (mode) => {
    setCreationMode(mode);
    setShowCreationChooser(false);
    setEditingCategory(null);
    setInitialSubcategories([""]);
    setChildNamesError("");
  };

  const openEditForm = (category) => {
    setShowCreationChooser(false);
    setCreationMode(null);
    setEditingCategory(category);
    setChildNamesError("");
  };

  const closeForm = () => {
    setShowCreationChooser(false);
    setCreationMode(null);
    setEditingCategory(null);
    setInitialSubcategories([""]);
    setChildNamesError("");
  };

  const addSubcategoryInput = () => {
    setInitialSubcategories((previous) => [...previous, ""]);
  };

  const updateSubcategoryInput = (index, value) => {
    setInitialSubcategories((previous) =>
      previous.map((name, currentIndex) =>
        currentIndex === index ? value : name,
      ),
    );
  };

  const removeSubcategoryInput = (index) => {
    setInitialSubcategories((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const handleSaveCategory = async (categoryData) => {
    const cleanName = categoryData.name.trim();
    const cleanSlug = slugify(categoryData.slug);

    if (!cleanName || !cleanSlug) {
      window.alert("Please provide a valid category name and slug.");
      return;
    }

    // UPDATE EXISTING CATEGORY.
    if (editingCategory) {
      const duplicateSlug = categories.some(
        (category) =>
          category.id !== editingCategory.id &&
          category.slug.toLowerCase() === cleanSlug.toLowerCase(),
      );

      if (duplicateSlug) {
        window.alert("Another category already uses this slug.");
        return;
      }

      try {
        await updateCategory(editingCategory.id, {
          ...categoryData,
          name: cleanName,
          slug: cleanSlug,
        });

        const refreshedCategories = await getAdminCategories();
        setCategories(refreshedCategories);

        closeForm();
        window.alert("Category updated successfully.");
      } catch (err) {
        window.alert(err.message || "Failed to update category.");
      }

      return;
    }

    // Validate optional initial subcategories.
    const childNames =
      creationMode === "main"
        ? initialSubcategories.map((name) => name.trim()).filter(Boolean)
        : [];

    if (childNames.some((name) => name.length < 2 || name.length > 100)) {
      setChildNamesError(
        "Each subcategory name must contain between 2 and 100 characters.",
      );
      return;
    }

    const childSlugs = childNames.map(slugify);

    if (childSlugs.some((slug) => !slug)) {
      setChildNamesError("Please enter valid subcategory names.");
      return;
    }

    const slugsToCheck = [cleanSlug, ...childSlugs];
    const uniqueSlugs = new Set(slugsToCheck.map((slug) => slug.toLowerCase()));

    if (uniqueSlugs.size !== slugsToCheck.length) {
      setChildNamesError(
        "The main category and its subcategories must have unique slugs.",
      );
      return;
    }

    const existingSlugs = new Set(
      categories.map((category) => category.slug.toLowerCase()),
    );

    if (slugsToCheck.some((slug) => existingSlugs.has(slug.toLowerCase()))) {
      setChildNamesError(
        "A category with one of these names or slugs already exists.",
      );
      return;
    }

    let createdMainId = null;

    try {
      // CREATE MAIN CATEGORY AND INITIAL SUBCATEGORIES.
      if (creationMode === "main") {
        const mainResponse = await createCategory({
          ...categoryData,
          name: cleanName,
          slug: cleanSlug,
          parent: null,
          attributes: categoryData.attributes ?? [],
        });

        createdMainId = mainResponse.category?.id;

        if (!createdMainId) {
          throw new Error(
            "Main category was created, but its ID was not returned.",
          );
        }

        // Save each initial subcategory using the real MongoDB parent ID.
        for (let index = 0; index < childNames.length; index++) {
          await createCategory({
            name: childNames[index],
            slug: childSlugs[index],
            description: "",
            parent: createdMainId,
            sortOrder: index + 1,
            attributes: [],
            allowCondition: false,
            status: "active",
          });
        }

        const refreshedCategories = await getAdminCategories();
        setCategories(refreshedCategories);

        setExpandedCategories(
          (previous) => new Set([...previous, createdMainId]),
        );

        closeForm();
        window.alert("Main category created successfully.");
        return;
      }

      // CREATE INDIVIDUAL SUBCATEGORY.
      if (creationMode === "subcategory") {
        const parentCategory = categories.find(
          (category) => category.id === categoryData.parent,
        );

        if (
          !parentCategory ||
          parentCategory.parent !== null ||
          parentCategory.status !== "active"
        ) {
          window.alert("Please select an active main category.");
          return;
        }

        await createCategory({
          ...categoryData,
          name: cleanName,
          slug: cleanSlug,
          parent: parentCategory.id,
          attributes: categoryData.attributes ?? [],
        });

        const refreshedCategories = await getAdminCategories();
        setCategories(refreshedCategories);

        setExpandedCategories(
          (previous) => new Set([...previous, parentCategory.id]),
        );

        closeForm();
        window.alert("Subcategory created successfully.");
      }
    } catch (err) {
      // Refresh in case the main category was saved before a child failed.
      try {
        const refreshedCategories = await getAdminCategories();
        setCategories(refreshedCategories);

        if (createdMainId) {
          setExpandedCategories(
            (previous) => new Set([...previous, createdMainId]),
          );
          closeForm();
        }
      } catch {
        // Keep the original API error.
      }

      window.alert(err.message || "Failed to save category.");
    }
  };

  const handleArchive = async (category) => {
    if (category.parent === null) {
      const hasActiveChildren = categories.some(
        (child) => child.parent === category.id && child.status === "active",
      );

      if (hasActiveChildren) {
        window.alert(
          "Archive the active subcategories first before archiving this main category.",
        );
        return;
      }
    }

    const confirmed = window.confirm(
      `Are you sure you want to archive "${category.name}"?`,
    );

    if (!confirmed) return;

    try {
      await archiveCategory(category.id);

      const refreshedCategories = await getAdminCategories();
      setCategories(refreshedCategories);

      window.alert("Category archived successfully.");
    } catch (err) {
      window.alert(err.message || "Failed to archive category.");
    }
  };

  const performRestore = async (category, subcategoryIds = []) => {
    try {
      await restoreCategory(category.id, subcategoryIds);

      const refreshedCategories = await getAdminCategories();
      setCategories(refreshedCategories);

      setRestoreTarget(null);
      setSelectedSubcategoryIds([]);

      window.alert("Category restored successfully.");
    } catch (err) {
      window.alert(err.message || "Failed to restore category.");
    }
  };

  const handleRestore = async (category) => {
    // Individual subcategory restoration.
    if (category.parent !== null) {
      const parent = categories.find((item) => item.id === category.parent);

      if (!parent || parent.status !== "active") {
        window.alert(
          "Restore the main category before restoring this subcategory.",
        );
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to restore "${category.name}"?`,
      );

      if (!confirmed) return;

      await performRestore(category, []);
      return;
    }

    // Main category restoration.
    const archivedChildren = categories.filter(
      (item) => item.parent === category.id && item.status === "archived",
    );

    // If archived subcategories exist, let the admin choose.
    if (archivedChildren.length > 0) {
      setRestoreTarget(category);
      setSelectedSubcategoryIds([]);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to restore "${category.name}"?`,
    );

    if (!confirmed) return;

    await performRestore(category, []);
  };
  const archivedSubcategories = restoreTarget
    ? categories.filter(
        (category) =>
          category.parent === restoreTarget.id &&
          category.status === "archived",
      )
    : [];

  const handleConfirmRestore = async () => {
    if (!restoreTarget) return;

    await performRestore(restoreTarget, selectedSubcategoryIds);
  };

  const renderCategoryRow = (category, isSubcategory = false) => (
    <tr key={category.id} className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {isSubcategory ? (
            <span className="ml-8 text-gray-400">↳</span>
          ) : (
            <span className="text-[#183D3D]">
              <FolderTree size={18} />
            </span>
          )}

          <div>
            <p className="font-medium text-gray-800">{category.name}</p>
            <p className="text-xs text-gray-400">{category.slug}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-gray-600">
        {isSubcategory
          ? categories.find((item) => item.id === category.parent)?.name || "—"
          : "Main category"}
      </td>

      <td className="px-5 py-4 text-sm text-gray-600">{category.sortOrder}</td>

      <td className="px-5 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            category.status === "active"
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {category.status === "active" ? "Active" : "Archived"}
        </span>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => openEditForm(category)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-[#183D3D]"
            title="Edit category"
          >
            <Pencil size={16} />
          </button>

          {category.status === "active" ? (
            <button
              type="button"
              onClick={() => handleArchive(category)}
              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
              title="Archive category"
            >
              <X size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleRestore(category)}
              className="rounded-lg p-2 text-gray-500 hover:bg-green-50 hover:text-green-600"
              title="Restore category"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize your store products into categories and subcategories.
          </p>
        </div>

        {!isFormOpen && !showCreationChooser && (
          <button
            type="button"
            onClick={openCreateChooser}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#183D3D] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#245252]"
          >
            <Plus size={18} />
            Add Category
          </button>
        )}
      </div>

      {/* Restore category dialog */}
      {restoreTarget && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Restore {restoreTarget.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select any archived subcategories you also want to restore.
                Leave them unchecked to restore only the main category.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setRestoreTarget(null);
                setSelectedSubcategoryIds([]);
              }}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              aria-label="Close restore dialog"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {archivedSubcategories.map((subcategory) => (
              <label
                key={subcategory.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedSubcategoryIds.includes(subcategory.id)}
                  onChange={(event) => {
                    const isChecked = event.target.checked;

                    setSelectedSubcategoryIds((previous) =>
                      isChecked
                        ? [...previous, subcategory.id]
                        : previous.filter((id) => id !== subcategory.id),
                    );
                  }}
                  className="h-4 w-4 accent-[#183D3D]"
                />

                <span className="text-sm font-medium text-gray-700">
                  {subcategory.name}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-5 flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setRestoreTarget(null);
                setSelectedSubcategoryIds([]);
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmRestore}
              className="rounded-lg bg-[#183D3D] px-4 py-2 text-sm font-medium text-white hover:bg-[#245252]"
            >
              Restore Category
              {selectedSubcategoryIds.length > 0
                ? ` + ${selectedSubcategoryIds.length} Subcategories`
                : ""}
            </button>
          </div>
        </section>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Categories",
            value: categories.length,
            icon: Tags,
          },
          {
            label: "Main Categories",
            value: mainCategoryCount,
            icon: FolderTree,
          },
          {
            label: "Subcategories",
            value: subcategoryCount,
            icon: FolderPlus,
          },
          {
            label: "Active / Archived",
            value: `${activeCount} / ${archivedCount}`,
            icon: RotateCcw,
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <Icon size={19} className="text-[#183D3D]" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Creation mode chooser */}
      {showCreationChooser && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                What would you like to create?
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose how this category should fit into your store hierarchy.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => chooseCreationMode("main")}
              className="rounded-xl border border-gray-200 p-5 text-left transition hover:border-[#183D3D] hover:bg-[#E8F0EF]"
            >
              <FolderTree size={24} className="text-[#183D3D]" />
              <h3 className="mt-3 font-semibold text-gray-900">
                Create Main Category
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Create a top-level category, such as Stationery. You can also
                add its initial subcategories now.
              </p>
            </button>

            <button
              type="button"
              onClick={() => chooseCreationMode("subcategory")}
              className="rounded-xl border border-gray-200 p-5 text-left transition hover:border-[#183D3D] hover:bg-[#E8F0EF]"
            >
              <FolderPlus size={24} className="text-[#183D3D]" />
              <h3 className="mt-3 font-semibold text-gray-900">
                Create Subcategory
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add a more specific category under an existing active main
                category, such as Books under Stationery.
              </p>
            </button>
          </div>
        </section>
      )}

      {/* Category form */}
      {isFormOpen && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingCategory
                ? "Edit Category"
                : creationMode === "main"
                  ? "Create Main Category"
                  : "Create Subcategory"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {creationMode === "main"
                ? "Create a main category and optionally add its subcategories."
                : creationMode === "subcategory"
                  ? "Choose an active main category for this subcategory."
                  : "Update the category details below."}
            </p>
          </div>

          <CategoryForm
            categories={categories}
            initialCategory={editingCategory}
            hasChildren={
              editingCategory
                ? categories.some(
                    (category) => category.parent === editingCategory.id,
                  )
                : false
            }
            forceMainCategory={creationMode === "main"}
            requireParent={creationMode === "subcategory"}
            onSubmit={handleSaveCategory}
            onCancel={closeForm}
          />

          {/* Optional initial subcategories */}
          {creationMode === "main" && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Initial Subcategories
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      Optional
                    </span>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add subcategories now, or create them later.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addSubcategoryInput}
                  className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Plus size={16} />
                  Add Subcategory
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {initialSubcategories.map((name, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        updateSubcategoryInput(index, event.target.value)
                      }
                      placeholder={`Subcategory name ${index + 1}`}
                      maxLength={100}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#183D3D] focus:ring-2 focus:ring-[#183D3D]/10"
                    />

                    <button
                      type="button"
                      onClick={() => removeSubcategoryInput(index)}
                      disabled={initialSubcategories.length === 1}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                      title="Remove subcategory"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>

              {childNamesError && (
                <p className="mt-3 text-sm text-red-600">{childNamesError}</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Filters and category table */}
      {!isFormOpen && !showCreationChooser && (
        <>
          {isLoading ? (
            <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
              Loading categories...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          ) : (
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <h2 className="font-semibold text-gray-900">Category List</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Main categories and their subcategories
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  {categoryGroups.length} main categories
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-187.5 text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium">Parent</th>
                      <th className="px-5 py-3 font-medium">Sort Order</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {categoryGroups.map((mainCategory) => (
                      <Fragment key={mainCategory.id}>
                        <tr className="border-t border-gray-100 bg-gray-50/60">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleExpanded(mainCategory.id)}
                                className="rounded p-1 text-gray-500 hover:bg-gray-200"
                                aria-label="Toggle subcategories"
                              >
                                {expandedCategories.has(mainCategory.id) ? (
                                  <ChevronDown size={17} />
                                ) : (
                                  <ChevronRight size={17} />
                                )}
                              </button>

                              <div>
                                <p className="font-semibold text-gray-800">
                                  {mainCategory.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {mainCategory.slug}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-500">
                            Main category
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {mainCategory.sortOrder}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                mainCategory.status === "active"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {mainCategory.status === "active"
                                ? "Active"
                                : "Archived"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => openEditForm(mainCategory)}
                              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-[#183D3D]"
                              title="Edit category"
                            >
                              <Pencil size={16} />
                            </button>

                            {mainCategory.status === "active" ? (
                              <button
                                type="button"
                                onClick={() => handleArchive(mainCategory)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                title="Archive category"
                              >
                                <X size={16} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRestore(mainCategory)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-green-50 hover:text-green-600"
                                title="Restore category"
                              >
                                <RotateCcw size={16} />
                              </button>
                            )}
                          </td>
                        </tr>

                        {expandedCategories.has(mainCategory.id) &&
                          mainCategory.children.map((child) =>
                            renderCategoryRow(child, true),
                          )}
                      </Fragment>
                    ))}

                    {categoryGroups.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-12 text-center text-sm text-gray-500"
                        >
                          No categories found. Try changing your search or
                          filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default AdminCategories;
