import {
  getAdminProducts,
  getAdminProduct,
  createProductService,
  updateProductService,
  archiveProductService,
  restoreProductService,
} from "../productService.js";

import serializeAdminProduct, {
  serializeAdminProducts,
} from "./adminProductSerializer.js";
import { uploadImageStream } from "../../../../config/cloudinary.js";

// Helper function to parse stringified JSON from FormData
const parseProductData = (body) => {
  const data = { ...body };

  // Fields that the frontend stringifies for FormData
  const jsonFields = ["inventory", "attributes", "warranty", "images"];

  jsonFields.forEach((field) => {
    if (typeof data[field] === "string") {
      try {
        data[field] = JSON.parse(data[field]);
      } catch (e) {
        console.warn(`Could not parse ${field} from FormData`);
      }
    }
  });

  return data;
};

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
    const productData = parseProductData(req.body);

    // If a file was attached, upload to Cloudinary and assign the URL
    if (req.file) {
      const uploadResult = await uploadImageStream(req.file.buffer);
      productData.images = [
        {
          url: uploadResult.secure_url,
          isPrimary: true,
          alt: productData.name || "",
        },
      ];
    }

    const product = await createProductService(productData);

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
    const productData = parseProductData(req.body);

    // If a new file is uploaded during an update, overwrite the old image
    if (req.file) {
      const uploadResult = await uploadImageStream(req.file.buffer);
      productData.images = [
        {
          url: uploadResult.secure_url,
          isPrimary: true,
          alt: productData.name || "",
        },
      ];
    }

    const product = await updateProductService(
      req.params.productId,
      productData,
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
