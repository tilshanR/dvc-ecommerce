import mongoose from "mongoose";

import {
  findAllProducts,
  findProductById,
  findProductBySlug,
} from "./productRepository.js";

import { productQuerySchema } from "./productValidation.js";

import {
  serializeProducts,
} from "./productSerializer.js";

import serializeProduct from "./productSerializer.js";

// GET /api/products
export const getShopProducts = async (req, res, next) => {
  try {
    // Do not accept status from public Shop requests.
    const { status, ...publicQuery } = req.query;

    const validation = productQuerySchema
      .omit({ status: true })
      .safeParse(publicQuery);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid product filters.",
        errors: validation.error.flatten(),
      });
    }

    const filters = {
      ...validation.data,
      status: "active",
      limit: Math.min(validation.data.limit, 100),
    };

    const result = await findAllProducts(filters);

    return res.status(200).json({
      success: true,
      products: serializeProducts(result.products),
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:productId
export const getShopProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let product;

    if (mongoose.isValidObjectId(productId)) {
      product = await findProductById(productId);
    } else {
      product = await findProductBySlug(productId);
    }

    // Only active products are visible in the public Shop.
    if (!product || product.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      product: serializeProduct(product),
    });
  } catch (error) {
    next(error);
  }
};