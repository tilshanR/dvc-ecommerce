export const formatPrice = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

function getImageUrl(image) {
  if (typeof image === "string") return image;
  if (image && typeof image === "object") {
    return image.url || image.secure_url || image.src || "";
  }
  return "";
}

export function normalizeProduct(raw) {
  const pricing = raw.pricing || {};
  const brand =
    typeof raw.brand === "object" ? raw.brand?.name : raw.brand;
  const category =
    typeof raw.category === "object" ? raw.category?.name : raw.category;

  const images = Array.isArray(raw.images)
    ? raw.images.map(getImageUrl).filter(Boolean)
    : [];

  const mainImage = getImageUrl(raw.mainImage || raw.image) || images[0] || "";
  const gallery = [
    mainImage,
    ...images,
    ...(Array.isArray(raw.gallery) ? raw.gallery.map(getImageUrl) : []),
    ...(Array.isArray(raw.featureImages)
      ? raw.featureImages.map(getImageUrl)
      : []),
  ].filter(Boolean);

  const originalPrice = pricing.originalPrice ?? raw.oldPrice ?? null;
  const price = pricing.finalPrice ?? raw.price ?? raw.sellingPrice ?? 0;
  const stock = Number(
    raw.availableStock ?? raw.stock ?? raw.quantityInStock ?? 0
  );

  return {
    id: raw._id || raw.id || raw.slug,
    slug: raw.slug || "",
    name: raw.name || "Unnamed product",
    brand: brand || "Unbranded",
    category: category || "Products",
    sku: raw.sku || raw.productCode || "",
    price: Number(price),
    originalPrice:
      originalPrice === null || originalPrice === undefined
        ? null
        : Number(originalPrice),
    images: [...new Set(gallery)].slice(0, 6),
    description: raw.description || "No description available.",
    availableStock: Number.isFinite(stock) ? Math.max(0, stock) : 0,
    condition: raw.condition || "new",
    warranty: raw.warranty || null,
    specifications: raw.specifications || raw.specs || {},
    rating: Number(raw.rating ?? raw.averageRating ?? 0),
    reviewCount: Number(raw.reviewCount ?? raw.numReviews ?? 0),
  };
}
