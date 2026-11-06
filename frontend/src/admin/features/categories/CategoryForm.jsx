import { useState } from "react";
import { X, Save } from "lucide-react";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const getCategoryId = (category) =>
  category?._id ?? category?.id ?? "";

export default function CategoryForm({
  categories = [],
  initialCategory = null,
  onSubmit = () => {},
  onCancel = () => {},
}) {
  const [formData, setFormData] = useState(() => ({
    name: initialCategory?.name ?? "",
    slug: initialCategory?.slug ?? "",
    description: initialCategory?.description ?? "",
    parent:
      typeof initialCategory?.parent === "object"
        ? getCategoryId(initialCategory.parent)
        : initialCategory?.parent ?? "",
    sortOrder: initialCategory?.sortOrder ?? 0,
    allowCondition: initialCategory?.allowCondition ?? false,
    status: initialCategory?.status ?? "active",
  }));

  const [slugEdited, setSlugEdited] = useState(
    Boolean(initialCategory?.slug)
  );

  const [error, setError] = useState("");

  const handleNameChange = (value) => {
    setFormData((previous) => ({
      ...previous,
      name: value,
      slug: slugEdited ? previous.slug : slugify(value),
    }));
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Category name is required.");
      return;
    }

    if (!formData.slug.trim()) {
      setError("Category slug is required.");
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim(),
      parent: formData.parent || null,
      sortOrder: Number(formData.sortOrder),
      attributes: initialCategory?.attributes ?? [],
    };

    onSubmit(payload);
  };

  const availableParents = categories.filter((category) => {
    const categoryId = String(getCategoryId(category));
    const currentId = String(getCategoryId(initialCategory));

    return (
      category.status !== "archived" &&
      categoryId !== currentId
    );
  });

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10";

  const labelClass = "text-sm font-medium text-gray-700";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white"
    >
      {/* Form heading */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {initialCategory ? "Edit Category" : "Create Category"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter the category information below.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close category form"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form fields */}
      <div className="space-y-5 p-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Category name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Category Name <span className="text-red-500">*</span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(event) =>
                handleNameChange(event.target.value)
              }
              placeholder="e.g. Mobile Phones"
              className={inputClass}
              required
            />
          </div>

          {/* Category slug */}
          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug <span className="text-red-500">*</span>
            </label>

            <input
              id="slug"
              name="slug"
              type="text"
              value={formData.slug}
              onChange={(event) => {
                setSlugEdited(true);
                handleChange(event);
              }}
              placeholder="e.g. mobile-phones"
              className={inputClass}
              required
            />

            <p className="mt-1 text-xs text-gray-400">
              Automatically generated from the category name.
            </p>
          </div>

          {/* Parent category */}
          <div>
            <label htmlFor="parent" className={labelClass}>
              Parent Category
            </label>

            <select
              id="parent"
              name="parent"
              value={formData.parent}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">None (Main Category)</option>

              {availableParents.map((category) => (
                <option
                  key={getCategoryId(category)}
                  value={getCategoryId(category)}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-gray-400">
              Select a parent to create a subcategory.
            </p>
          </div>

          {/* Sort order */}
          <div>
            <label htmlFor="sortOrder" className={labelClass}>
              Sort Order
            </label>

            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min="0"
              value={formData.sortOrder}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>

          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe this category..."
            className={inputClass}
          />
        </div>

        {/* Condition setting */}
        <div className="rounded-lg border border-gray-200 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="allowCondition"
              checked={formData.allowCondition}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 accent-teal-800"
            />

            <span>
              <span className="block text-sm font-medium text-gray-800">
                Allow product condition
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                Enable condition options such as New and Used for
                products in this category.
              </span>
            </span>
          </label>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>

          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#183D3D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#245252]"
        >
          <Save className="h-4 w-4" />
          {initialCategory ? "Save Changes" : "Create Category"}
        </button>
      </div>
    </form>
  );
}
