import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Upload,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Pencil,
  Loader2,
} from "lucide-react";
import DynamicAttributeFields from "./DynamicAttributeFields";
import AdminInput from "../../components/ui/AdminInput";
import AdminTextarea from "../../components/ui/AdminTextarea";
import AdminSelect from "../../components/ui/AdminSelect";

/* ------------------------------------------------------------------ */
/* Constants & small helpers                                           */
/* ------------------------------------------------------------------ */

const MAX_IMAGE_MB = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const STEP_META = {
  basics: {
    label: "Basics",
    title: "Basic information",
    hint: "What is this product and where does it belong?",
  },
  specs: {
    label: "Specs",
    title: "Specifications",
    hint: "Details specific to this category.",
  },
  pricing: {
    label: "Price & stock",
    title: "Pricing and stock",
    hint: "How much it costs and how many you have.",
  },
  warranty: {
    label: "Warranty",
    title: "Warranty",
    hint: "What cover do customers get?",
  },
  review: {
    label: "Review",
    title: "Review and save",
    hint: "Check everything, then choose whether it goes live.",
  },
};

const inputClass =
  "w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#183D3D]";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";

const idOf = (obj) => (obj?._id || obj?.id || "").toString();
const formatLKR = (value) =>
  Number(value || 0).toLocaleString("en-LK", { maximumFractionDigits: 0 });

/** Wraps a field, highlights the control inside it and shows the error beneath. */
function Field({ id, error, hint, children }) {
  return (
    <div
      id={`field-${id}`}
      className={
        error
          ? "[&_input]:!border-red-400 [&_select]:!border-red-400 [&_textarea]:!border-red-400"
          : ""
      }
    >
      {children}
      {error ? (
        <p
          role="alert"
          className="mt-1 flex items-start gap-1 text-xs text-red-600"
        >
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function ProductFormFields({
  formData,
  onChange,
  setFormData,
  categories = [],
  brands = [],
  // Wizard-level props (all optional)
  onSubmit, // called when the user confirms on the Review step
  onCancel, // called when the user clicks Cancel
  isSubmitting = false,
  submitLabel = "Save product",
}) {
  /* ---------- image preview ---------- */
  const [imagePreview, setImagePreview] = useState(
    formData.images?.[0]?.url || "",
  );

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /* ---------- category structure (leaf-only select) ---------- */
  const { groupedCategories, standaloneCategories } = useMemo(() => {
    const active = categories.filter((cat) => cat.status !== "archived");
    const childrenByParent = new Map();
    const mains = [];

    for (const cat of active) {
      const parentId =
        typeof cat.parent === "object" ? cat.parent?._id : cat.parent;
      if (parentId) {
        const key = parentId.toString();
        if (!childrenByParent.has(key)) childrenByParent.set(key, []);
        childrenByParent.get(key).push(cat);
      } else {
        mains.push(cat);
      }
    }

    const grouped = [];
    const standalone = [];
    for (const main of mains) {
      const children = childrenByParent.get(idOf(main)) || [];
      if (children.length > 0) grouped.push({ parent: main, children });
      else standalone.push(main);
    }
    return { groupedCategories: grouped, standaloneCategories: standalone };
  }, [categories]);

  const selectedCategory = categories.find(
    (c) => idOf(c) === (formData.category || "").toString(),
  );
  const selectedBrand = brands.find(
    (b) => idOf(b) === (formData.brand || "").toString(),
  );

  /* ---------- which steps exist for this category ---------- */
  // ASSUMPTION: adjust `hasSpecs` to match how your category stores its
  // attribute definitions. If it is unknown we keep the step visible.
  const hasSpecs = useMemo(() => {
    if (!selectedCategory) return true;
    const defs =
      selectedCategory.attributes ?? selectedCategory.attributeDefinitions;
    return Array.isArray(defs) ? defs.length > 0 : true;
  }, [selectedCategory]);

  const needsWarranty = selectedCategory
    ? selectedCategory.warrantyPolicy !== "none"
    : true;

  const steps = useMemo(() => {
    const list = ["basics"];
    if (hasSpecs) list.push("specs");
    list.push("pricing");
    if (needsWarranty) list.push("warranty");
    list.push("review");
    return list;
  }, [hasSpecs, needsWarranty]);

  /* ---------- wizard state ---------- */
  const [currentId, setCurrentId] = useState("basics");
  const [reached, setReached] = useState(() => new Set(["basics"]));
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const topRef = useRef(null);

  const currentIndex = Math.max(0, steps.indexOf(currentId));
  const isLast = currentIndex === steps.length - 1;

  /* ---------- derived values ---------- */
  const onHand = Number(formData.inventory?.onHand || 0);
  const reservedQty = Number(formData.inventory?.reserved || 0);
  const availableStock = Math.max(0, onHand - reservedQty);

  const price = Number(formData.price || 0);
  const originalPrice = Number(formData.originalPrice || 0);
  const discountPct =
    originalPrice > price && price > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const filledAttributes = Object.entries(formData.attributes || {}).filter(
    ([, v]) => v !== "" && v !== null && v !== undefined,
  );

  /* ---------- validation ---------- */
  const validateStep = useCallback(
    (stepId) => {
      const e = {};

      if (stepId === "basics") {
        if (!formData.name?.trim()) e.name = "Enter a product name.";
        if (!formData.category) e.category = "Choose a category.";
        if (selectedCategory?.allowCondition && !formData.condition)
          e.condition = "Select New or Used.";
        if (!formData.images?.length) e.image = "Upload a product image.";
      }

      if (stepId === "pricing") {
        if (formData.price === "" || formData.price == null)
          e.price = "Enter the selling price.";
        else if (price <= 0) e.price = "Price must be greater than 0.";

        if (formData.originalPrice !== "" && formData.originalPrice != null) {
          if (originalPrice <= price)
            e.originalPrice =
              "Compare-at price must be higher than the selling price. Leave it empty if there is no discount.";
        }

        const rawOnHand = formData.inventory?.onHand;
        if (rawOnHand === "" || rawOnHand == null)
          e.onHand = "Enter the quantity in stock (0 if none).";
        else if (onHand < 0 || !Number.isInteger(onHand))
          e.onHand = "Use a whole number, 0 or more.";

        if (reservedQty < 0 || !Number.isInteger(reservedQty))
          e.reserved = "Use a whole number, 0 or more.";
        else if (reservedQty > onHand)
          e.reserved = `Reserved can't be more than on-hand (${onHand}).`;
      }

      if (stepId === "warranty" && needsWarranty) {
        const w = formData.warranty || {};
        if (
          selectedCategory?.warrantyPolicy === "required" &&
          w.type === "none"
        )
          e.warrantyType = "This category requires a warranty.";
        if (w.type && w.type !== "none") {
          if (!w.duration || Number(w.duration) < 1)
            e.duration = "Enter a duration of 1 or more.";
          if (!w.unit) e.unit = "Choose days, months or years.";
        }
      }

      return e;
    },
    [
      formData,
      selectedCategory,
      price,
      originalPrice,
      onHand,
      reservedQty,
      needsWarranty,
    ],
  );

  const focusFirstError = (errs) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(`field-${first}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.querySelector("input, select, textarea, button")?.focus({
        preventScroll: true,
      });
    });
  };

  /* ---------- navigation ---------- */
  const goTo = (id) => {
    setCurrentId(id);
    setReached((prev) => new Set(prev).add(id));
    setErrors({});
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNext = () => {
    const errs = validateStep(currentId);
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    goTo(steps[currentIndex + 1]);
  };

  const handleBack = () => {
    if (currentIndex > 0) goTo(steps[currentIndex - 1]);
  };

  // Free navigation: the user can open any step at any time.
  // Validation still runs on "Next" and again for every step on save.
  const handleStepClick = (id) => {
    if (id !== currentId) goTo(id);
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);
    // Validate every step before saving and jump to the first broken one.
    for (const id of steps) {
      const errs = validateStep(id);
      if (Object.keys(errs).length) {
        goTo(id);
        setErrors(errs);
        focusFirstError(errs);
        return;
      }
    }
    onSubmit?.();
  };

  // Enter in a text input moves forward instead of submitting a parent <form>.
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT") {
      e.preventDefault();
      if (!isLast) handleNext();
    }
  };

  /* ---------- field handlers ---------- */
  const clearError = (key) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });

  const handleField = (field, value) => {
    onChange(field, value);
    clearError(field);
  };

  const handleCategoryChange = (newCategoryId) => {
    if (newCategoryId === formData.category) return;

    // Error prevention: changing category wipes specs, condition and warranty.
    const hasData =
      filledAttributes.length > 0 ||
      formData.condition ||
      formData.warranty?.duration;
    if (
      hasData &&
      !window.confirm(
        "Changing the category clears specifications, condition and warranty. Continue?",
      )
    ) {
      return;
    }

    const nextCategory = categories.find((c) => idOf(c) === newCategoryId);
    let nextWarranty = { type: "none", duration: null, unit: null };
    if (nextCategory?.warrantyPolicy === "required") {
      nextWarranty = { type: "manufacturer", duration: null, unit: null };
    }

    setFormData((prev) => ({
      ...prev,
      category: newCategoryId,
      attributes: {},
      condition: null,
      warranty: nextWarranty,
    }));
    clearError("category");
  };

  const handleConditionChange = (condition) => {
    setFormData((prev) => ({
      ...prev,
      condition,
      warranty:
        selectedCategory?.warrantyPolicy === "none"
          ? { type: "none", duration: null, unit: null }
          : {
              ...prev.warranty,
              type:
                condition === "new"
                  ? "manufacturer"
                  : condition === "used"
                    ? "checking"
                    : "none",
            },
    }));
    clearError("condition");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((p) => ({ ...p, image: "Use a JPG, PNG or WEBP image." }));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((p) => ({
        ...p,
        image: `Image is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum is ${MAX_IMAGE_MB}MB.`,
      }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      images: [
        { url: previewUrl, alt: prev.name, isPrimary: true, sortOrder: 0 },
      ],
    }));
    clearError("image");
  };

  const clearImage = () => {
    setImagePreview("");
    setFormData((prev) => ({ ...prev, imageFile: null, images: [] }));
  };

  const updateInventory = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      inventory: { ...prev.inventory, [field]: value },
    }));
    clearError(field);
  };

  const updateWarranty = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      warranty: { ...prev.warranty, [field]: value },
    }));
    clearError(field === "duration" ? "duration" : "unit");
  };

  const errorCount = Object.keys(errors).length;

  /* ------------------------------------------------------------------ */
  /* Step renderers                                                      */
  /* ------------------------------------------------------------------ */

  const renderBasics = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Field id="name" error={errors.name}>
            <AdminInput
              label="Product name *"
              placeholder="e.g. Samsung Galaxy A55 5G"
              value={formData.name}
              onChange={(e) => handleField("name", e.target.value)}
              maxLength={200}
              autoFocus
            />
          </Field>
        </div>
        <Field id="sku" hint="Leave empty to auto-generate.">
          <AdminInput
            label="SKU (optional)"
            placeholder="e.g. SAM-A55-BLK"
            value={formData.sku}
            onChange={(e) => onChange("sku", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="category" error={errors.category}>
          <AdminSelect
            label="Category *"
            value={formData.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">Select category</option>
            {groupedCategories.map(({ parent, children }) => (
              <optgroup key={idOf(parent)} label={parent.name}>
                {children.map((sub) => (
                  <option key={idOf(sub)} value={idOf(sub)}>
                    {sub.name}
                  </option>
                ))}
              </optgroup>
            ))}
            {standaloneCategories.length > 0 && (
              <optgroup label="General Categories">
                {standaloneCategories.map((cat) => (
                  <option key={idOf(cat)} value={idOf(cat)}>
                    {cat.name}
                  </option>
                ))}
              </optgroup>
            )}
          </AdminSelect>
        </Field>

        {brands.length > 0 && (
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
        )}

        {selectedCategory?.allowCondition && (
          <Field
            id="condition"
            error={errors.condition}
            hint="Sets the default warranty type on a later step."
          >
            <label className={labelClass}>Condition *</label>
            <select
              className={inputClass}
              value={formData.condition || ""}
              onChange={(e) => handleConditionChange(e.target.value)}
            >
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </Field>
        )}
      </div>

      <Field id="description">
        <AdminTextarea
          label="Description"
          rows={3}
          placeholder="Key features, what's in the box, etc."
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
        />
      </Field>

      {/* Image */}
      <Field
        id="image"
        error={errors.image}
        hint={`JPG, PNG or WEBP, up to ${MAX_IMAGE_MB}MB.`}
      >
        <label className={labelClass}>Product image *</label>
        <div
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 p-5 text-center transition-colors hover:bg-gray-100 ${
            errors.image ? "border-red-300" : "border-gray-300"
          }`}
        >
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Product preview"
                className="h-36 w-36 rounded-lg border border-gray-200 bg-white object-contain shadow-sm"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -right-3 -top-3 rounded-full bg-red-500 p-1.5 text-white shadow-md transition hover:bg-red-600"
                aria-label="Remove image"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center p-3">
              <Upload className="mb-2 text-gray-400" size={28} />
              <span className="text-sm font-medium text-[#183D3D]">
                Click to upload
              </span>
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </Field>
    </div>
  );

  const renderSpecs = () =>
    selectedCategory ? (
      <DynamicAttributeFields
        category={selectedCategory}
        attributes={formData.attributes}
        setFormData={setFormData}
      />
    ) : (
      <p className="text-sm text-gray-500">
        Choose a category in the previous step to see its specifications.
      </p>
    );

  const renderPricing = () => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-800">Pricing</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="costPrice"
            error={errors.costPrice}
            hint="What you paid for it. Private, never shown to customers."
          >
            <AdminInput
              label="Cost price (LKR)"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={formData.costPrice ?? ""}
              onChange={(e) => handleField("costPrice", e.target.value)}
            />
          </Field>
          <Field id="price" error={errors.price}>
            <AdminInput
              label="Selling price (LKR) *"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="e.g. 120000"
              value={formData.price}
              onChange={(e) => handleField("price", e.target.value)}
              autoFocus
            />
          </Field>

          <Field
            id="originalPrice"
            error={errors.originalPrice}
            hint="Optional. Shown crossed out next to the selling price."
          >
            <AdminInput
              label="Compare-at price (LKR)"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="e.g. 135000"
              value={formData.originalPrice}
              onChange={(e) => handleField("originalPrice", e.target.value)}
            />
          </Field>
        </div>

        {price > 0 && (
          <p className="mt-3 text-sm text-gray-600">
            Customers will see{" "}
            <span className="font-semibold text-[#183D3D]">
              LKR {formatLKR(price)}
            </span>
            {discountPct > 0 && (
              <>
                {" "}
                <span className="text-gray-400 line-through">
                  LKR {formatLKR(originalPrice)}
                </span>{" "}
                <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                  {discountPct}% off
                </span>
              </>
            )}
          </p>
        )}
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-800">Stock</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id="onHand" error={errors.onHand}>
            <AdminInput
              label="On-hand quantity *"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="0"
              value={formData.inventory?.onHand}
              onChange={(e) => updateInventory("onHand", e.target.value)}
            />
          </Field>

          <Field
            id="reserved"
            error={errors.reserved}
            hint="Held for pending orders. Defaults to 0."
          >
            <AdminInput
              label="Reserved quantity"
              type="number"
              inputMode="numeric"
              min="0"
              max={formData.inventory?.onHand || 0}
              step="1"
              placeholder="0"
              value={formData.inventory?.reserved}
              onChange={(e) => updateInventory("reserved", e.target.value)}
            />
          </Field>

          <div className="flex flex-col justify-center rounded-lg bg-[#E8F0EF] px-4 py-2.5">
            <p className="text-xs text-gray-600">Available to sell</p>
            <p className="text-lg font-semibold text-[#183D3D]">
              {availableStock}
            </p>
            <p className="text-xs text-gray-500">on-hand minus reserved</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWarranty = () => {
    const w = formData.warranty || {};
    const policy = selectedCategory?.warrantyPolicy;
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-[#E8F0EF] px-3 py-2 text-sm text-gray-700">
          {policy === "required"
            ? "A warranty is required for this category."
            : "A warranty is optional for this category."}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id="warrantyType" error={errors.warrantyType}>
            <label className={labelClass}>Warranty type *</label>
            <select
              className={inputClass}
              value={w.type || "none"}
              onChange={(e) => {
                const type = e.target.value;
                onChange("warranty", {
                  type,
                  duration: type === "none" ? null : w.duration || null,
                  unit: type === "none" ? null : w.unit || null,
                });
                clearError("warrantyType");
              }}
            >
              {policy === "optional" && (
                <option value="none">No warranty</option>
              )}
              <option value="manufacturer">Manufacturer warranty</option>
              <option value="checking">Checking warranty</option>
            </select>
          </Field>

          {w.type && w.type !== "none" && (
            <>
              <Field id="duration" error={errors.duration}>
                <AdminInput
                  label="Duration *"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  placeholder="e.g. 12"
                  value={w.duration ?? ""}
                  onChange={(e) =>
                    updateWarranty(
                      "duration",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
              </Field>

              <Field id="unit" error={errors.unit}>
                <label className={labelClass}>Unit *</label>
                <select
                  className={inputClass}
                  value={w.unit || ""}
                  onChange={(e) =>
                    updateWarranty("unit", e.target.value || null)
                  }
                >
                  <option value="">Select unit</option>
                  <option value="days">Days</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </Field>
            </>
          )}
        </div>
      </div>
    );
  };

  const warrantySummary = () => {
    const w = formData.warranty || {};
    if (!needsWarranty || !w.type || w.type === "none") return "No warranty";
    const typeLabel = w.type === "manufacturer" ? "Manufacturer" : "Checking";
    return `${typeLabel}, ${w.duration || "?"} ${w.unit || ""}`.trim();
  };

  const renderReview = () => {
    const rows = [
      {
        step: "basics",
        title: "Basics",
        items: [
          ["Name", formData.name || "—"],
          ["SKU", formData.sku || "Auto-generated"],
          ["Category", selectedCategory?.name || "—"],
          ["Brand", selectedBrand?.name || "No brand"],
          ...(selectedCategory?.allowCondition
            ? [["Condition", formData.condition === "new" ? "New" : "Used"]]
            : []),
        ],
      },
      ...(hasSpecs
        ? [
            {
              step: "specs",
              title: "Specifications",
              items: [
                [
                  "Filled in",
                  filledAttributes.length
                    ? `${filledAttributes.length} field${filledAttributes.length > 1 ? "s" : ""}`
                    : "None",
                ],
              ],
            },
          ]
        : []),
      {
        step: "pricing",
        title: "Price and stock",
        items: [
          ["Selling price", `LKR ${formatLKR(price)}`],
          ...(discountPct > 0
            ? [
                [
                  "Compare-at",
                  `LKR ${formatLKR(originalPrice)} (${discountPct}% off)`,
                ],
              ]
            : []),
          ["On hand", String(onHand)],
          ["Reserved", String(reservedQty)],
          ["Available", String(availableStock)],
        ],
      },
      ...(needsWarranty
        ? [
            {
              step: "warranty",
              title: "Warranty",
              items: [["Cover", warrantySummary()]],
            },
          ]
        : []),
    ];

    return (
      <div className="space-y-5">
        <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-3">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Product"
              className="h-20 w-20 shrink-0 rounded-md border bg-white object-contain"
            />
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">
              {formData.name}
            </p>
            <p className="text-sm text-gray-600">
              LKR {formatLKR(price)} · {availableStock} available
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map((section) => (
            <div
              key={section.step}
              className="rounded-lg border border-gray-200 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-800">
                  {section.title}
                </h4>
                <button
                  type="button"
                  onClick={() => goTo(section.step)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#183D3D] hover:underline"
                >
                  <Pencil size={12} /> Edit
                </button>
              </div>
              <dl className="space-y-1 text-sm">
                {section.items.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-gray-500">{k}</dt>
                    <dd className="text-right text-gray-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <div>
          <p className={labelClass}>Visibility</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                value: "draft",
                title: "Save as draft",
                text: "Hidden from the shop. Finish it later.",
              },
              {
                value: "active",
                title: "Publish",
                text: "Visible in the shop right away.",
              },
            ].map((opt) => {
              const selected = formData.status === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                    selected
                      ? "border-[#183D3D] bg-[#E8F0EF]"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="product-status"
                    value={opt.value}
                    checked={selected}
                    onChange={() => onChange("status", opt.value)}
                    className="mt-1 accent-[#183D3D]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">
                      {opt.title}
                    </span>
                    <span className="block text-xs text-gray-600">
                      {opt.text}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderers = {
    basics: renderBasics,
    specs: renderSpecs,
    pricing: renderPricing,
    warranty: renderWarranty,
    review: renderReview,
  };

  /* ------------------------------------------------------------------ */
  /* Layout                                                              */
  /* ------------------------------------------------------------------ */

  const meta = STEP_META[currentId];
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="space-y-5" onKeyDown={handleKeyDown} ref={topRef}>
      {/* Stepper */}
      <nav aria-label="Product form progress">
        <ol className="flex items-center">
          {steps.map((id, index) => {
            const active = id === currentId;
            const stepIsValid = Object.keys(validateStep(id)).length === 0;
            // Red only after the user has tried to save.
            const invalid = submitAttempted && !active && !stepIsValid;
            // Green check only for steps the user has visited AND filled correctly.
            const done = !active && !invalid && reached.has(id) && stepIsValid;
            return (
              <li
                key={id}
                className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => handleStepClick(id)}
                  aria-current={active ? "step" : undefined}
                  className="group flex items-center gap-2"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                      active
                        ? "bg-[#183D3D] text-white ring-4 ring-[#E8F0EF]"
                        : invalid
                          ? "bg-red-500 text-white"
                          : done
                            ? "bg-[#183D3D] text-white"
                            : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                    }`}
                  >
                    {invalid ? (
                      <AlertCircle size={14} strokeWidth={3} />
                    ) : done ? (
                      <Check size={14} strokeWidth={3} />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={`hidden text-sm sm:inline ${
                      active
                        ? "font-semibold text-gray-900"
                        : invalid
                          ? "text-red-600"
                          : "text-gray-500 group-hover:text-gray-800"
                    }`}
                  >
                    {STEP_META[id].label}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <span
                    className={`mx-2 h-0.5 flex-1 rounded ${
                      done ? "bg-[#183D3D]" : "bg-gray-200"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Mobile: current label + progress bar */}
        <div className="mt-3 sm:hidden">
          <p className="text-sm font-medium text-gray-900">
            Step {currentIndex + 1} of {steps.length}: {meta.label}
          </p>
          <div className="mt-1 h-1 rounded bg-gray-200">
            <div
              className="h-1 rounded bg-[#183D3D] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </nav>

      {/* Step header */}
      <header className="border-b pb-2">
        <h3 className="font-semibold text-gray-800">{meta.title}</h3>
        <p className="text-sm text-gray-500">{meta.hint}</p>
      </header>

      {/* Error summary */}
      {errorCount > 0 && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>
            {errorCount === 1
              ? "1 field needs your attention."
              : `${errorCount} fields need your attention.`}
          </span>
        </div>
      )}

      {/* Step body */}
      <div key={currentId}>{renderers[currentId]()}</div>

      {/* Footer navigation */}
      <div className="sticky bottom-0 -mx-1 flex items-center justify-between gap-3 border-t bg-white/95 px-1 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          {currentIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-gray-500 sm:inline">
            Step {currentIndex + 1} of {steps.length}
          </span>
          {isLast ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[#183D3D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#122e2e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Saving…" : submitLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1 rounded-lg bg-[#183D3D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#122e2e]"
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
