import mongoose from "mongoose";

import {
  findAllProducts,
  findProductById,
  findActiveProductById,
  findActiveProductBySlug,
  createProduct,
  updateProductById,
  archiveProductById,
  restoreProductById,
  findProductBySku,
  productSlugExists,
} from "./productRepository.js";

import Category from "../category/categoryModel.js";

import { createProductSchema,   updateProductSchema, productQuerySchema, } from "./productValidation.js";
/* --------------------------------
   SHOP PRODUCT LISTING
--------------------------------- */

/**
 * Retrieve active products for the public Shop.
 *
 * Supported filters:
 * - search
 * - category
 * - brand
 * - condition
 * - page
 * - limit
 * - sortBy
 * - sortOrder
 *
 * Status is always forced to "active".
 */

/* --------------------------------
   PRODUCT CREATION HELPERS
--------------------------------- */

// Generate a URL-friendly slug from a product name.
const slugify = (value) => {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Generate a unique slug.
const generateUniqueSlug = async (name) => {
  const baseSlug = slugify(name) || "product";

  let slug = baseSlug;
  let counter = 2;

  while (await productSlugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Create a consistent service error.
const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/* --------------------------------
   CATEGORY ATTRIBUTE VALIDATION
--------------------------------- */

const validateCategoryAttributes = (
  categoryAttributes = [],
  submittedAttributes = {},
) => {
  const allowedKeys = new Set(
    categoryAttributes.map((attribute) => attribute.key),
  );

  // Reject attributes that don't belong to this category.
  for (const key of Object.keys(submittedAttributes)) {
    if (!allowedKeys.has(key)) {
      throw createServiceError(
        `Attribute "${key}" is not allowed for this category.`,
      );
    }
  }

  // Validate each category-defined attribute.
  for (const definition of categoryAttributes) {
    const { key, label, type, options = [], isRequired } = definition;

    const exists = Object.hasOwn(submittedAttributes, key);
    const value = submittedAttributes[key];

    if (!exists || value === undefined || value === null) {
      if (isRequired) {
        throw createServiceError(`${label} is required.`);
      }

      continue;
    }

    switch (type) {
      case "text":
        if (typeof value !== "string" || (isRequired && !value.trim())) {
          throw createServiceError(`${label} must be a valid text value.`);
        }
        break;

      case "number":
        if (typeof value !== "number" || !Number.isFinite(value)) {
          throw createServiceError(`${label} must be a valid number.`);
        }
        break;

      case "select":
        if (typeof value !== "string" || !options.includes(value)) {
          throw createServiceError(
            `${label} must be one of the available options.`,
          );
        }
        break;

      case "multiselect":
        if (
          !Array.isArray(value) ||
          !value.every(
            (item) => typeof item === "string" && options.includes(item),
          ) ||
          (isRequired && value.length === 0)
        ) {
          throw createServiceError(
            `${label} must contain valid selected options.`,
          );
        }
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          throw createServiceError(`${label} must be true or false.`);
        }
        break;

      default:
        throw createServiceError(`Unsupported attribute type for "${label}".`);
    }
  }
};

/* --------------------------------
   CREATE PRODUCT
--------------------------------- */

export const createProductService = async (input) => {
  // 1. Validate the incoming product data.
  const validation = createProductSchema.safeParse(input);

  if (!validation.success) {
    const error = createServiceError("Invalid product data.", 400);

    error.details = validation.error.flatten();

    throw error;
  }

  const productData = validation.data;

  // 2. Check whether the category exists and is active.
  const category = await Category.findOne({
    _id: productData.category,
    status: "active",
  });

  if (!category) {
    throw createServiceError("Active category not found.", 404);
  }

  // 3. Validate category-specific conditions.
  if (productData.condition !== null && !category.allowCondition) {
    throw createServiceError(
      "This category does not support product conditions.",
    );
  }

  // 4. Validate dynamic category attributes.
  validateCategoryAttributes(category.attributes, productData.attributes);

  // 5. Check SKU uniqueness.
  if (productData.sku) {
    const existingSku = await findProductBySku(productData.sku);

    if (existingSku) {
      throw createServiceError("A product with this SKU already exists.", 409);
    }
  }

  // 6. Generate a unique slug.
  const slug = await generateUniqueSlug(productData.name);

  // 7. Save the product.
  const product = await createProduct({
    ...productData,
    slug,
  });

  // 8. Populate category information for serialization.
  await product.populate("category", "name slug status");

  return product;
};

export const getShopProducts = async (filters = {}) => {
  const {
    search,
    category,
    brand,
    condition,
    page = 1,
    limit = 12,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  // Normalize pagination.
  const normalizedPage = Math.max(1, Number(page) || 1);

  const normalizedLimit = Math.min(100, Math.max(1, Number(limit) || 12));

  // Allow only supported sorting fields.
  const allowedSortFields = ["name", "price", "createdAt", "updatedAt"];

  const normalizedSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";

  const normalizedSortOrder = sortOrder === "asc" ? "asc" : "desc";

  // Force public Shop queries to retrieve active products only.
  const productFilters = {
    search,
    category,
    brand,
    condition,
    page: normalizedPage,
    limit: normalizedLimit,
    sortBy: normalizedSortBy,
    sortOrder: normalizedSortOrder,
    status: "active",
  };

  return await findAllProducts(productFilters);
};
//single shop product

/**
 * Retrieve one active product using its MongoDB ID or slug.
 *
 * @param {string} identifier - Product ObjectId or slug.
 * @returns {Promise<object|null>}
 */
export const getShopProduct = async (identifier) => {
  if (typeof identifier !== "string" || !identifier.trim()) {
    return null;
  }
  const productIdentifier = identifier.trim();

  // Find by MongoDB ObjectId.
  if (mongoose.isValidObjectId(productIdentifier)) {
    return await findActiveProductById(productIdentifier);
  }

  // Otherwise, find by slug.
  return await findActiveProductBySlug(productIdentifier);
};
/**
 * Retrieves a filtered list of products for admin users.
 * 
 * @param {Object} [filters={}] - Query parameters and filter criteria for products.
 * @throws {ServiceError} Throws a 400 error if the provided filters fail validation.
 * @returns {Promise<Array>} A promise that resolves to the list of matching products.
 */
export const getAdminProducts = async (filters = {}) => {
  const validation = productQuerySchema.safeParse(filters);

  if (!validation.success) {
    throw createServiceError("Invalid product filters.", 400);
  }
  return await findAllProducts(validation.data);
};
/**
 * Retrieves a single product by its unique identifier for admin users.
 * 
 * @param {string} productId - The unique MongoDB ObjectId of the product to retrieve.
 * @throws {ServiceError} Throws a 400 error if the productId is invalid, or a 404 error if the product does not exist.
 * @returns {Promise<Object>} A promise that resolves to the product object.
 */
export const getAdminProduct = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw createServiceError("Invalid product ID.", 400);
  }
  const product = await findProductById(productId);

  if (!product) {
    throw createServiceError("Product not found.", 404);
  }

  return product;
};
/**
 * Updates an existing product with new data, ensuring validation, uniqueness, inventory consistency, and category compatibility.
 * 
 * @param {string} productId - The unique MongoDB ObjectId of the product to update.
 * @param {Object} input - The partial or full object containing fields to update.
 * @throws {ServiceError} Throws errors for invalid IDs (400), non-existent products/categories (404), invalid schema data or logic conflicts (400), or duplicate SKUs (409).
 * @returns {Promise<Object>} A promise that resolves to the updated product object.
 */
export const updateProductService = async (productId, input) => {
  // 1. Validate product ID
  if (!mongoose.isValidObjectId(productId)) {
    throw createServiceError("Invalid product ID.", 400);
  }
  // 2. Find existing product
  const existingProduct = await findProductById(productId);

  if (!existingProduct) {
    throw createServiceError("Product not found.", 404);
  }
  // 3. Validate incoming update data
  const validation = updateProductSchema.safeParse(input);

 if (!validation.success) {
    const error = createServiceError("Invalid product update data.", 400);
    error.details = validation.error.issues;
    throw error;
  }
  const updates = validation.data;

  if (!updates || Object.keys(updates).length === 0) {
    throw createServiceError("At least one field is required for an update.", 400);
  }
  // 4. Check SKU uniqueness
  if (updates.sku) {
    const existingSkuProduct = await findProductBySku(updates.sku);

    if (
      existingSkuProduct &&
      existingSkuProduct._id.toString() !== existingProduct._id.toString()
    ) {
      throw createServiceError("This SKU is already in use.", 409);
    }
  }
  // 5. Merge and validate inventory
  if (updates.inventory) {
    const nextInventory = {
      onHand:
        updates.inventory.onHand ??
        existingProduct.inventory?.onHand ??
        0,

      reserved:
        updates.inventory.reserved ??
        existingProduct.inventory?.reserved ??
        0,
    };

    if (nextInventory.reserved > nextInventory.onHand) {
      throw createServiceError(
        "Reserved stock cannot exceed on-hand stock.",
        400
      );
    }

    updates.inventory = nextInventory;
  }

  // 6. Determine the resulting category
  const existingCategoryId =
    existingProduct.category?._id || existingProduct.category;

  const nextCategoryId = updates.category ?? existingCategoryId;

  const categoryChanged =
    updates.category &&
    updates.category.toString() !== existingCategoryId.toString();

  const attributesSubmitted = Object.hasOwn(updates, "attributes");
  const conditionSubmitted = Object.hasOwn(updates, "condition");

  // 7. Validate category attributes and condition when relevant
  if (categoryChanged || attributesSubmitted || conditionSubmitted) {
    const category = await Category.findById(nextCategoryId);

    if (!category) {
      throw createServiceError("Selected category not found.", 404);
    }

   if (category.status !== "active") {
      throw createServiceError("Selected category is not active.", 400);
    }

    const nextAttributes = attributesSubmitted
      ? updates.attributes
      : categoryChanged
        ? {}
        : existingProduct.attributes || {};

    if (categoryChanged || attributesSubmitted) {
      validateCategoryAttributes(
        category.attributes || [],
        nextAttributes
      );

      updates.attributes = nextAttributes;
    }
    const nextCondition = conditionSubmitted
      ? updates.condition
      : existingProduct.condition;

    if (nextCondition && !category.allowCondition) {
      throw createServiceError(
        "This category does not allow product conditions.",
        400
      );
    }
  }
  // 8. Save the updated product
  const updatedProduct = await updateProductById(productId, updates);

  if (!updatedProduct) {
    throw createServiceError("Product not found.", 404);
  }

  return updatedProduct;
};
