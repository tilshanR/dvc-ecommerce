import { useState } from "react";
import { X } from "lucide-react";
import ProductFormFields from "./ProductFormFields";

const initialFormData = {
  name: "",
  sku: "",
  description: "",
  category: "",
  brand: null,
  price: "",
  originalPrice: "",
  inventory: {
    onHand: "",
    reserved: "",
  },
  condition: null,
  attributes: {},
  warranty: {
    type: "none",
    duration: null,
    unit: null,
  },
  images: [],
  status: "draft",
};

export default function ProductForm({
  product = null,
  onSubmit,
  onClose,
  categories = [],
  brands = [],
}) {
  const [formData, setFormData] = useState(() => ({
    ...initialFormData,
    ...product,
    category: product?.category?._id || "",
    brand: product?.brand?._id || null,
    inventory: {
      ...initialFormData.inventory,
      ...product?.inventory,
    },
    images: product?.images || [],
    attributes: product?.attributes || {},
    warranty: product?.warranty || initialFormData.warranty,
  }));

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Product name is required.";
    }

    if (!formData.category) {
      return "Please select a category.";
    }

    if (
      formData.price === "" ||
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) < 0
    ) {
      return "Please enter a valid selling price.";
    }

    if (
      (!product && formData.originalPrice === "") ||
      (formData.originalPrice !== "" &&
        (!Number.isFinite(Number(formData.originalPrice)) ||
          Number(formData.originalPrice) < 0))
    ) {
      return "Please enter a valid original price.";
    }

    const quantity = Number(formData.inventory.onHand);

    if (
      formData.inventory.onHand === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      return "On-hand quantity must be a non-negative whole number.";
    }

    const selectedCategory = categories.find(
      (category) => (category._id || category.id) === formData.category,
    );

    if (!selectedCategory) {
      return "Please select a valid category.";
    }

    // Validate product condition.
    if (!selectedCategory.allowCondition && formData.condition) {
      return "Condition is not allowed for this category.";
    }

    if (
      selectedCategory.allowCondition &&
      !["new", "used"].includes(formData.condition)
    ) {
      return "Please select a product condition.";
    }

    // Validate warranty according to category policy.
    const warranty = formData.warranty;

    if (selectedCategory.warrantyPolicy === "none") {
      // No warranty configuration is allowed for this category.
    } else {
      if (
        !warranty ||
        !["manufacturer", "checking", "none"].includes(warranty.type)
      ) {
        return "Please select a valid warranty type.";
      }

      if (
        selectedCategory.warrantyPolicy === "required" &&
        warranty.type === "none"
      ) {
        return "A warranty is required for this category.";
      }

      if (warranty.type !== "none") {
        if (!Number.isInteger(warranty.duration) || warranty.duration < 1) {
          return "Please enter a valid warranty duration.";
        }

        if (!["days", "months", "years"].includes(warranty.unit)) {
          return "Please select a warranty duration unit.";
        }
      }
    }

    for (const field of selectedCategory.attributes || []) {
      const value = formData.attributes[field.key];

      if (!field.isRequired) continue;

      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        return `${field.label} is required.`;
      }
    }

    return "";
  };
  const validateImageAndInventory = () => {
    const { onHand, reserved } = formData.inventory;

    // Validate on-hand quantity
    if (
      reserved !== "" &&
      (!Number.isInteger(Number(reserved)) || Number(reserved) < 0)
    ) {
      return "On-hand quantity must be a non-negative whole number.";
    }

    // Validate reserved quantity
    if (
      reserved === "" ||
      !Number.isInteger(Number(reserved)) ||
      Number(reserved) < 0
    ) {
      return "Reserved quantity must be a non-negative whole number.";
    }

    if (Number(reserved) > Number(onHand)) {
      return "Reserved quantity cannot exceed on-hand quantity.";
    }

    // Validate images
    const images = formData.images || [];

    if (images.length > 0) {
      if (images.length !== 1) {
        return "Only one product image is supported currently.";
      }

      const imageUrl = images[0]?.url?.trim();

      if (!imageUrl) {
        return "Please enter a valid image URL.";
      }

      try {
        const url = new URL(imageUrl);

        if (!["http:", "https:"].includes(url.protocol)) {
          return "Image URL must use HTTP or HTTPS.";
        }
      } catch {
        return "Please enter a valid image URL.";
      }

      if (!images[0].isPrimary) {
        return "The product image must be marked as primary.";
      }
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const imageInventoryError = validateImageAndInventory();

    if (imageInventoryError) {
      setError(imageInventoryError);
      return;
    }
    const selectedCategory = categories.find(
      (category) => (category._id || category.id) === formData.category,
    );

    const payload = {
      ...formData,
      name: formData.name.trim(),
      sku: formData.sku.trim() || undefined,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice),
      inventory: {
        onHand: Number(formData.inventory.onHand),
        reserved: Number(formData.inventory.reserved || 0),
      },
      condition: selectedCategory.allowCondition ? formData.condition : null,
      warranty:
        selectedCategory.warrantyPolicy === "none"
          ? {
              type: "none",
              duration: null,
              unit: null,
            }
          : formData.warranty,
    };

    try {
      setSaving(true);
      await onSubmit(payload);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to save product.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
          <h2 className="text-lg font-semibold text-[#183D3D]">
            {product ? "Edit Product" : "Add Product"}
          </h2>

          <button type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <ProductFormFields
            formData={formData}
            onChange={handleChange}
            setFormData={setFormData}
            categories={categories}
            brands={brands}
          />

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#183D3D] px-5 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : product
                  ? "Update Product"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
