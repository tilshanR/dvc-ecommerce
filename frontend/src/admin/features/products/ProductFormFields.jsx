import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
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
  // Setup local state to handle the image preview (handles both existing Cloudinary URLs and new uploads)
  const [imagePreview, setImagePreview] = useState(formData.images?.[0]?.url || "");
  // Cleanup temporary object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  //  Handle physical file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      setFormData((prev) => ({
        ...prev,
        imageFile: file, // Store the physical file for FormData submission
        images: [{ url: previewUrl, alt: prev.name, isPrimary: true, sortOrder: 0 }], // Keeps existing validation happy
      }));
    }
  };
  // Clear selected image
  const clearImage = () => {
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      images: [],
    }));
  };
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
  const updateWarranty = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      warranty: {
        ...prev.warranty,
        [field]: value,
      },
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
            <label className={labelClass}>Condition *</label>
            <select
              className={inputClass}
              value={formData.condition || ""}
              onChange={(e) => {
                const condition = e.target.value;

                setFormData((prev) => ({
                  ...prev,
                  condition,
                  warranty: {
                    ...prev.warranty,
                    type:
                      condition === "new"
                        ? "manufacturer"
                        : condition === "used"
                          ? "checking"
                          : "none",
                  },
                }));
              }}
              required
            >
              <option value="">Select condition</option>
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
        <h3 className="font-semibold text-gray-800">Product Image *</h3>

        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-colors hover:bg-gray-100">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Product Preview"
                className="h-40 w-40 rounded-lg object-contain shadow-sm border border-gray-200 bg-white"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -right-3 -top-3 rounded-full bg-red-500 p-1.5 text-white shadow-md transition hover:bg-red-600 hover:scale-105"
                aria-label="Remove image"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center p-4">
              <Upload className="mb-3 text-gray-400" size={32} />
              <span className="text-sm font-medium text-[#183D3D]">Click to upload product image</span>
              <span className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP (Max 5MB)</span>
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </section>


      {/* Additional Information */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800">Additional Information</h3>

        {selectedCategory && selectedCategory.warrantyPolicy !== "none" && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Warranty Configuration
            </h4>

            <div>
              <label className={labelClass}>Warranty Type *</label>
              <select
                className={inputClass}
                value={formData.warranty?.type || "none"}
                onChange={(e) => {
                  const type = e.target.value;

                  onChange("warranty", {
                    type,
                    duration:
                      type === "none"
                        ? null
                        : formData.warranty?.duration || null,
                    unit:
                      type === "none" ? null : formData.warranty?.unit || null,
                  });
                }}
                required={selectedCategory.warrantyPolicy === "required"}
              >
                {selectedCategory.warrantyPolicy === "optional" && (
                  <option value="none">No Warranty</option>
                )}
                <option value="manufacturer">Manufacturer Warranty</option>
                <option value="checking">Checking Warranty</option>
              </select>
            </div>

            {formData.warranty?.type !== "none" && (
              <>
                <div>
                  <AdminInput
                    label="Warranty Duration *"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.warranty?.duration ?? ""}
                    onChange={(e) =>
                      updateWarranty(
                        "duration",
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Duration Unit *</label>
                  <select
                    className={inputClass}
                    value={formData.warranty?.unit || ""}
                    onChange={(e) =>
                      updateWarranty("unit", e.target.value || null)
                    }
                    required
                  >
                    <option value="">Select unit</option>
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}

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
