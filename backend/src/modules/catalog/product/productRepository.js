
import Product from "./productModel.js";

/**
 * Populate reusable category and brand information.
 * Cost price remains excluded by default.
 */
const populateProductReferences = (query) => {
  return query
    .populate("category", "name slug status")
    // .populate("brand", "name slug");
};

/**
 * Create a new product.
 */
export const createProduct = async (productData) => {
  return await Product.create(productData);
};

/**
 * Find products using filters, text search, sorting, and pagination.
 *
 * Supported filters:
 * - search
 * - category
 * - brand
 * - condition
 * - status
 * - page
 * - limit
 * - sortBy
 * - sortOrder
 */
export const findAllProducts = async (filters = {}) => {
  const {
    search,
    category,
    brand,
    condition,
    status,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const query = {};

  // Text search across name and description.
  if (search?.trim()) {
    query.$text = { $search: search.trim() };
  }

  if (category) {
    query.category = category;
  }

  if (brand) {
    query.brand = brand;
  }

  if (condition) {
    query.condition = condition;
  }

  if (status) {
    query.status = status;
  }

  // Calculate pagination.
  const skip = (page - 1) * limit;

  // Build sorting configuration.
  const sort = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  // Execute product query and count query.
  const [products, total] = await Promise.all([
    populateProductReferences(
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit),
    ),
    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Find a product by MongoDB ObjectId.
 */
export const findProductById = async (productId) => {
  return await populateProductReferences(
    Product.findById(productId),
  );
};

/**
 * Find a product by slug.
 */
export const findProductBySlug = async (slug) => {
  return await populateProductReferences(
    Product.findOne({ slug }),
  );
};

/**
 * Find a product by SKU.
 */
export const findProductBySku = async (sku) => {
  if (!sku) return null;

  return await Product.findOne({ sku: sku.trim().toUpperCase() });
};

/**
 * Update an existing product.
 *
 * Document-based updates ensure that Mongoose document validation
 * and save middleware are executed.
 */
export const updateProductById = async (productId, updateData) => {
  const product = await Product.findById(productId);

  if (!product) {
    return null;
  }

  // Apply provided fields without replacing the entire document.
  product.set(updateData);

  // Explicitly mark Mixed attributes as modified when provided.
  if (Object.hasOwn(updateData, "attributes")) {
    product.markModified("attributes");
  }

  await product.save();

  // Return the updated product with populated references.
  return await populateProductReferences(
    Product.findById(product._id),
  );
};

/**
 * Archive a product.
 */
export const archiveProductById = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    return null;
  }

  product.status = "archived";

  await product.save();

  return await populateProductReferences(
    Product.findById(product._id),
  );
};

/**
 * Restore an archived product as a draft.
 */
export const restoreProductById = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    return null;
  }

  product.status = "draft";

  await product.save();

  return await populateProductReferences(
    Product.findById(product._id),
  );
};