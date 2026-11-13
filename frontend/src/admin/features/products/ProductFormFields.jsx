import DynamicAttributeFields from "./DynamicAttributeFields";
import AdminInput from "../../components/ui/AdminInput";
import AdminTextarea from "../../components/ui/AdminTextarea";
import AdminSelect from "../../components/ui/AdminSelect";
export default function ProductFormFields({
  formData,
  onChange,
  setFormData,
  categories = [],
  brands = [],
}) {
  const updateInventory = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [field]: value,
      },
    }));
  };

  const updateImage = (value) => {
    setFormData((prev) => ({
      ...prev,
      images: value
        ? [{ url: value, alt: prev.name, isPrimary: true, sortOrder: 0 }]
        : [],
    }));
  };
  const selectedCategory = categories.find(
    (category) => (category._id || category.id) === formData.category,
  );

  const inputClass =
    "w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#183D3D]";

  const labelClass = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800">Basic Information</h3>

        <div>
          <AdminInput
            label="Product Name *"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            required
            maxLength={200}
          />
        </div>

        <div>
          <AdminInput
            label="SKU"
            value={formData.sku}
            onChange={(e) => onChange("sku", e.target.value)}
          />
        </div>

        <div>
          <AdminTextarea
            label="Description"
            rows={3}
            placeholder="e.g. This product is .."
            value={formData.description}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </div>
      </section>

      {/* Classification */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800">Classification</h3>

        <div>
          <AdminSelect
            label="Category *"
            value={formData.category}
            onChange={(e) => {
              onChange("category", e.target.value);

              // Clear specifications from the previous category.
              setFormData((prev) => ({
                ...prev,
                attributes: {},
                condition: null,
              }));
            }}
            required
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option
                key={category._id || category.id}
                value={category._id || category.id}
              >
                {category.name}
              </option>
            ))}
          </AdminSelect>
        </div>

        <div>
          <label className={labelClass}>Brand</label>
          <select
            className={inputClass}
            value={formData.brand || ""}
            onChange={(e) => onChange("brand", e.target.value || null)}
          >
            <option value="">No brand</option>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCategory?.allowCondition && (
          <div>
            <label className={labelClass}>Condition</label>
            <select
              className={inputClass}
              value={formData.condition || ""}
              onChange={(e) => onChange("condition", e.target.value || null)}
            >
              <option value="">Not specified</option>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>
        )}
      </section>
      {/* Dynamic Specifications */}
      {selectedCategory && (
        <DynamicAttributeFields
          category={selectedCategory}
          attributes={formData.attributes}
          setFormData={setFormData}
        />
      )}

      {/* Pricing */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800">Pricing</h3>

        <div>
          <AdminInput
            label="Selling Price (Rs.) *"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 3000"
            value={formData.price}
            onChange={(e) => onChange("price", e.target.value)}
            required
          />
        </div>

        <div>
          <AdminInput
            label="Original Price (Rs.)"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 2000"
            value={formData.originalPrice}
            onChange={(e) => onChange("originalPrice", e.target.value)}
          />
        </div>
      </section>

      {/* Inventory */}
      {/* Inventory */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800">Inventory</h3>

        <div>
          <AdminInput
            label="On-hand Quantity *"
            type="number"
            min="0"
            step="1"
            value={formData.inventory.onHand}
            onChange={(e) => updateInventory("onHand", e.target.value)}
            required
            helperText="Leave empty to use 0."
          />
          <p className="mt-1 text-xs text-gray-500">Leave empty to use 0.</p>
        </div>

        <div>
          <AdminInput
            label="Reserved Quantity"
            type="number"
            min="0"
            max={formData.inventory.onHand}
            step="1"
            value={formData.inventory.reserved}
            onChange={(e) => updateInventory("reserved", e.target.value)}
            helperText="Leave empty to use 0. Reserved stock cannot exceed the on-hand quantity."
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave empty to use 0. Reserved stock cannot exceed the on-hand
            quantity.
          </p>
        </div>

        <div className="rounded-lg bg-[#E8F0EF] p-3">
          <p className="text-sm text-gray-600">Available Stock</p>
          <p className="text-lg font-semibold text-[#183D3D]">
            {Number(formData.inventory.onHand || 0) -
              Number(formData.inventory.reserved || 0)}
          </p>
        </div>
      </section>

      {/* Image */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800">Product Image</h3>

        <div>
          <AdminInput
            label="Image URL"
            type="url"
            value={formData.images[0]?.url || ""}
            onChange={(e) => updateImage(e.target.value.trim())}
            placeholder="https://example.com/product.jpg"
            helperText="MVP uses an image URL. Image uploads can be added later."
          />
          <p className="mt-1 text-xs text-gray-500">
            MVP uses an image URL. Image uploads can be added later.
          </p>
        </div>
      </section>

      {/* Additional Information */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800">Additional Information</h3>

        <div>
          <AdminInput
            label="Warranty"
            value={formData.warranty}
            onChange={(e) => onChange("warranty", e.target.value)}
            maxLength={300}
          />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            className={inputClass}
            value={formData.status}
            onChange={(e) => onChange("status", e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
        </div>
      </section>
    </div>
  );
}
