
import mongoose from "mongoose";

import {
  findAllProducts,
  findActiveProductById,
  findActiveProductBySlug,
} from "./productRepository.js";

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

  const normalizedLimit = Math.min(
    100,
    Math.max(1, Number(limit) || 12),
  );

  // Allow only supported sorting fields.
  const allowedSortFields = [
    "name",
    "price",
    "createdAt",
    "updatedAt",
  ];

  const normalizedSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";

  const normalizedSortOrder =
    sortOrder === "asc" ? "asc" : "desc";

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


/* --------------------------------
   SINGLE SHOP PRODUCT
--------------------------------- */

/**
 * Retrieve one active product using its MongoDB ID or slug.
 *
 * @param {string} identifier - Product ObjectId or slug.
 * @returns {Promise<object|null>}
 */
export const getShopProduct = async (identifier) => {
  if (
    typeof identifier !== "string" ||
    !identifier.trim()
  ) {
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
