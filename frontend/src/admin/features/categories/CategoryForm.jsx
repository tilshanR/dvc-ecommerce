import { useState } from "react";
import { X, Save, Plus, Trash2 } from "lucide-react";
import AdminInput from "../../components/ui/AdminInput";
import AdminSelect from "../../components/ui/AdminSelect";
import AdminTextarea from "../../components/ui/AdminTextarea";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const getCategoryId = (category) => category?._id ?? category?.id ?? "";

export default function CategoryForm({
  categories = [],
  initialCategory = null,
  hasChildren = false,
  requireParent = false,
  isDark = false,
  forceMainCategory = false,

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
        : (initialCategory?.parent ?? ""),
    sortOrder: initialCategory?.sortOrder ?? 0,
    allowCondition: initialCategory?.allowCondition ?? false,
    warrantyPolicy: initialCategory?.warrantyPolicy ?? "optional",
  }));
  //attributes state
  const [attributes, setAttributes] = useState(
  (initialCategory?.attributes || []).map((attr) => ({
    ...attr,
    optionsText: attr.options?.join(", ") || "", 
  }))
);


  const handleAddAttribute = () => {
    setAttributes((prev) => [
      ...prev,
      {
        key: "",
        label: "",
        type: "text",
        isRequired: false,
        options: [],
        optionsText: "",
        unit: "",
        sortOrder: prev.length,
      },
    ]);
  };

  const handleUpdateAttribute = (index, field, value) => {
    setAttributes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-generate key from label
      if (field === "label" && !updated[index].key) {
        updated[index].key = value.toLowerCase().replace(/[^a-z0-9]/g, "_");
      }
      return updated;
    });
  };

  const handleRemoveAttribute = (index) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const [slugEdited, setSlugEdited] = useState(Boolean(initialCategory?.slug));

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
    if (requireParent && !formData.parent) {
      setError("Please select a main category for this subcategory.");
      return;
    }

    if (!formData.slug.trim()) {
      setError("Category slug is required.");
      return;
    }
    const sortOrder = Number(formData.sortOrder);

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setError("Sort order must be a whole number greater than or equal to 0.");
      return;
    }
    // Transform optionsText back into an array before saving
    const formattedAttributes = attributes.map((attr) => ({
      ...attr,
      options: attr.optionsText
        ? attr.optionsText.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    }));

    const payload = {
      ...formData,
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim(),
      parent: forceMainCategory ? null : formData.parent || null,
      sortOrder,
      attributes: formattedAttributes,
    };

    onSubmit(payload);
  };

  const availableParents = categories.filter((category) => {
    const categoryId = String(getCategoryId(category));
    const currentId = String(getCategoryId(initialCategory));

    const isMainCategory =
      category.parent === null || category.parent === undefined;

    return (
      category.status === "active" && isMainCategory && categoryId !== currentId
    );
  });

  const inputClass = `mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10 ${
    isDark
      ? "border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 disabled:bg-gray-800"
      : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
  }`;

  const labelClass = `text-sm font-medium ${
    isDark ? "text-gray-200" : "text-gray-700"
  }`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-xl border ${
        isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
      }`}
    >
      {/* Form heading */}
      <div
        className={`flex items-center justify-between border-b px-5 py-4 ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div>
          <h2
            className={`text-lg font-semibold ${
              isDark ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {initialCategory ? "Edit Category" : "Create Category"}
          </h2>
          <p
            className={`mt-1 text-sm ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Enter the category information below.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className={`rounded-lg p-2 transition ${
            isDark
              ? "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          }`}
          aria-label="Close category form"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form fields */}
      <div className="space-y-5 p-5">
        {error && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              isDark
                ? "border-red-900 bg-red-950 text-red-300"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Category name */}
          <div>
            <AdminInput
              id="name"
              name="name"
              label="Category Name *"
              type="text"
              value={formData.name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="e.g. Mobile Phones"
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

            <p
              className={`mt-1 text-xs ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Automatically generated from the category name.
            </p>
          </div>

          {/* Parent category */}
          <div>
            <AdminSelect
              id="parent"
              name="parent"
              label="Parent Category"
              value={forceMainCategory ? "" : formData.parent}
              onChange={handleChange}
              disabled={hasChildren || forceMainCategory}
              required={requireParent}
              className="disabled:cursor-not-allowed"
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
            </AdminSelect>

            {hasChildren && (
              <p
                className={`mt-1 text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                This category has subcategories and cannot become a subcategory.
              </p>
            )}

            <p
              className={`mt-1 text-xs ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
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
              step="1"
              value={formData.sortOrder}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <AdminTextarea
            id="description"
            name="description"
            label="Description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe this category..."
          />
        </div>

        {/* Condition setting */}
        <div
          className={`rounded-lg border p-4 ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="allowCondition"
              checked={formData.allowCondition}
              onChange={handleChange}
              className={`mt-1 h-4 w-4 rounded accent-teal-800 ${
                isDark ? "border-gray-600 bg-gray-800" : "border-gray-300"
              }`}
            />

            <span>
              <span
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Allow product condition
              </span>
              <span
                className={`mt-1 block text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Enable condition options such as New and Used for products in
                this category.
              </span>
            </span>
          </label>
        </div>
        {/* Warranty policy setting */}
        <div>
          <label htmlFor="warrantyPolicy" className={labelClass}>
            Warranty Policy *
          </label>

          <select
            id="warrantyPolicy"
            name="warrantyPolicy"
            value={formData.warrantyPolicy}
            onChange={handleChange}
            className={inputClass}
            required
          >
            <option value="none">No Warranty</option>
            <option value="optional">Optional</option>
            <option value="required">Required</option>
          </select>

          <p
            className={`mt-1 text-xs ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Determines whether products in this category can or must have a
            warranty.
          </p>
        </div>
        {/* ... [keep your existing Condition and Warranty policy divs] ... */}
        
        {/* ADD THIS ENTIRE SECTION BELOW WARRANTY POLICY */}
        <div className={`mt-8 border-t pt-6 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>Category Specifications</h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Define dynamic attributes for products in this category (e.g., RAM, Storage).</p>
            </div>
            <button
              type="button"
              onClick={handleAddAttribute}
              className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                isDark ? "border-gray-600 text-gray-200 hover:bg-gray-800" : "border-gray-300 text-teal-800 hover:bg-gray-50"
              }`}
            >
              <Plus size={16} /> Add Specification
            </button>
          </div>

          <div className="space-y-4">
            {attributes.map((attr, index) => (
              <div key={index} className={`relative rounded-lg border p-4 ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(index)}
                  className="absolute right-3 top-3 text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mr-6">
                  <div>
                    <label className={labelClass}>Label *</label>
                    <input
                      type="text"
                      placeholder="e.g. Screen Size"
                      value={attr.label}
                      onChange={(e) => handleUpdateAttribute(index, "label", e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Database Key *</label>
                    <input
                      type="text"
                      placeholder="e.g. screen_size"
                      value={attr.key}
                      onChange={(e) => handleUpdateAttribute(index, "key", e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Input Type *</label>
                    <select
                      value={attr.type}
                      onChange={(e) => handleUpdateAttribute(index, "type", e.target.value)}
                      className={inputClass}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Dropdown (Select)</option>
                      <option value="multiselect">Multi-select</option>
                      <option value="boolean">Yes/No (Boolean)</option>
                    </select>
                  </div>

                  {["select", "multiselect"].includes(attr.type) && (
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Options (Comma separated) *</label>
                      <input
                        type="text"
                        placeholder="e.g. 128GB, 256GB, 512GB"
                       value={attr.optionsText ?? ""}
                        onChange={(e) => handleUpdateAttribute(index, "optionsText", e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>Unit (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. inches, GB"
                      value={attr.unit || ""}
                      onChange={(e) => handleUpdateAttribute(index, "unit", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="flex items-end pb-2">
                    <label className={`flex items-center gap-2 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      <input
                        type="checkbox"
                        checked={attr.isRequired}
                        onChange={(e) => handleUpdateAttribute(index, "isRequired", e.target.checked)}
                        className="rounded accent-teal-800"
                      />
                      Required Field
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
    

    
      </div>

      {/* Form actions */}
      <div
        className={`flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <button
          type="button"
          onClick={onCancel}
          className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
            isDark
              ? "border-gray-600 text-gray-200 hover:bg-gray-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
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
