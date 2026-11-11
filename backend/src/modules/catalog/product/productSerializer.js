
const serializeProduct = (product) => {
  if (!product) return null;

  const item =
    typeof product.toObject === "function"
      ? product.toObject({ virtuals: true })
      : product;

  return {
    _id: item._id?.toString(),
    name: item.name,
    slug: item.slug,
    sku: item.sku,
    description: item.description,

    category:
      item.category && typeof item.category === "object"
        ? {
            _id: item.category._id?.toString(),
            name: item.category.name,
            slug: item.category.slug,
          }
        : null,

    brand:
      item.brand && typeof item.brand === "object"
        ? {
            _id: item.brand._id?.toString(),
            name: item.brand.name,
            slug: item.brand.slug,
          }
        : null,

    price: item.price,
    originalPrice: item.originalPrice,

    images: item.images || [],
    mainImage: item.mainImage || item.image || "",

    inventory: {
      onHand: item.inventory?.onHand ?? 0,
      reserved: item.inventory?.reserved ?? 0,
    },

    availableStock: item.availableStock ?? item.stock ?? 0,
    stock: item.availableStock ?? item.stock ?? 0,

    condition: item.condition,
    attributes: item.attributes || {},
    warranty: item.warranty,

    status: item.status,

    averageRating: item.averageRating ?? 0,
    reviewCount: item.reviewCount ?? 0,

    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

export const serializeProducts = (products) => {
  return products.map(serializeProduct);
};

export default serializeProduct;
