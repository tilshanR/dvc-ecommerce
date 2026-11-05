// Product normalization 
export function normalizeProduct(product) {
  const mainImage = product.mainImage;

  const image =
    (typeof mainImage === "string" ? mainImage : mainImage?.url) ||
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    product.image ||
    "/images/product-placeholder.png";

  const availableStock =
    product.availableStock ??
    Math.max(
      0,
      Number(product.inventory?.onHand ?? 0) -
        Number(product.inventory?.reserved ?? 0),
    );

  return {
    ...product,
    _id: String(product._id ?? product.id ?? ""),
    brand:
      typeof product.brand === "object"
        ? (product.brand?.name ?? "")
        : (product.brand ?? ""),
    category:
      typeof product.category === "object"
        ? (product.category?.name ?? "")
        : (product.category ?? ""),
    categorySlug:
      typeof product.category === "object"
        ? (product.category?.slug ?? "")
        : (product.categorySlug ?? ""),
    image,
    availableStock: Number(availableStock),
    stock: Number(availableStock),
  };
}

/* ---------- Attribute helpers ---------- */

// Supports both plain strings and { value, label } objects.
export function toOption(option) {
  if (option && typeof option === "object") {
    const value = option.value ?? option.label ?? "";

    return {
      value: String(value),
      label: String(option.label ?? value),
    };
  }

  return {
    value: String(option),
    label: String(option),
  };
}

// Extracts an attribute value from a product.
export function getProductAttributeValue(product, key) {
  const raw =
    product.attributes?.[key] ??
    product.specs?.[key] ??
    product[key];

  if (raw == null) return [];

  return (Array.isArray(raw) ? raw : [raw]).map((value) =>
    String(value).toLowerCase(),
  );
}
