import {
  getAdminProducts,
  getAdminProduct,
  createProductService,
  updateProductService,
  archiveProductService,
  restoreProductService,
} from "../productService.js";

import {
  serializeAdminProducts,
} from "./adminProductSerializer.js";


// GET /api/admin/products
export const getAdminProductsHandler = async (req, res, next) => {
  try {
    const result = await getAdminProducts(req.query);

    return res.status(200).json({
      success: true,
      products: serializeAdminProducts(result.products),
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/products/:productId
export const getAdminProductHandler = async (req, res, next) => {
  try {
    const product = await getAdminProduct(req.params.productId);

    return res.status(200).json({
      success: true,
      product: serializeAdminProduct(product),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/products
export const createAdminProductHandler = async (req, res, next) => {
  try {
    const product = await createProductService(req.body);

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product: serializeAdminProduct(product),
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/products/:productId
export const updateAdminProductHandler = async (req, res, next) => {
  try {
    const product = await updateProductService(
      req.params.productId,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: serializeAdminProduct(product),
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/products/:productId/archive
export const archiveAdminProductHandler = async (req, res, next) => {
  try {
    const product = await archiveProductService(req.params.productId);

    return res.status(200).json({
      success: true,
      message: "Product archived successfully.",
      product: serializeAdminProduct(product),
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/products/:productId/restore
export const restoreAdminProductHandler = async (req, res, next) => {
  try {
    const product = await restoreProductService(req.params.productId);

    return res.status(200).json({
      success: true,
      message: "Product restored successfully.",
      product: serializeAdminProduct(product),
    });
  } catch (error) {
    next(error);
  }
};
