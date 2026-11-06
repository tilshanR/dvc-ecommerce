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
    onHand: 0,
    reserved: 0,
  },
  condition: null,
  attributes: {},
  warranty: "",
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
      formData.originalPrice !== "" &&
      (!Number.isFinite(Number(formData.originalPrice)) ||
        Number(formData.originalPrice) < 0)
    ) {
      return "Original price must be a valid non-negative number.";
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

    if (!selectedCategory.allowCondition && formData.condition) {
      return "Condition is not allowed for this category.";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      sku: formData.sku.trim() || undefined,
      price: Number(formData.price),
      originalPrice:
        formData.originalPrice === "" ? null : Number(formData.originalPrice),
      inventory: {
        onHand: Number(formData.inventory.onHand),
        reserved: Number(formData.inventory.reserved),
      },
      warranty: formData.warranty || null,
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
