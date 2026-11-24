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
// Helper controller (flip to `req.user?.role === "super_admin"` once role is ready)
const canAccessCostPrice = (req) => true; // e.g. req.user?.role === "super_admin"

const parseProductData = (body) => {
  const data = { ...body };

  //Parse nested JSON fields
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

  //Convert FormData strings back into strict Numbers for Zod
  if (data.price !== undefined && data.price !== "") {
    data.price = Number(data.price);
  }

  if (data.originalPrice !== undefined && data.originalPrice !== "") {
    data.originalPrice = Number(data.originalPrice);
  } else {
    // If originalPrice was left blank on the frontend, remove it so Zod doesn't trip on an empty string
    delete data.originalPrice;
  }
  if (data.costPrice === "" || data.costPrice === "null") {
    data.costPrice = null;
  } else if (data.costPrice !== undefined) {
    data.costPrice = Number(data.costPrice);
  }

  //  The Final Safety Check: Catch FormData stringified nulls and empty strings
  // FormData turns a primitive null into the word "null" or "".
  // Zod will reject the word "null", so we convert it back to primitive null here.
  if (data.brand === "null" || data.brand === "") {
    data.brand = null;
  }

  if (data.condition === "null" || data.condition === "") {
    data.condition = null;
  }

  // Remove frontend-only file property to pass .strict()
  delete data.imageFile;

  return data;
};
// GET /api/admin/products
export const getAdminProductsHandler = async (req, res, next) => {
  try {
    const includeCostPrice = canAccessCostPrice(req);
    // const result = await getAdminProducts(req.query);
    const result = await getAdminProducts(req.query, { includeCostPrice });
    return res.status(200).json({
      success: true,
      products: serializeAdminProducts(result.products, { includeCostPrice }),
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/products/:productId
export const getAdminProductHandler = async (req, res, next) => {
  try {
    const includeCostPrice = canAccessCostPrice(req);
    const product = await getAdminProduct(req.params.productId, {
      includeCostPrice,
    });
    return res.status(200).json({
      success: true,
      product: serializeAdminProduct(product, { includeCostPrice }),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/products
export const createAdminProductHandler = async (req, res, next) => {
  try {
    const includeCostPrice = canAccessCostPrice(req);
    const productData = parseProductData(req.body);
    if (!includeCostPrice) delete productData.costPrice;

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
    if (!includeCostPrice) {
      delete productData.costPrice; // prevents regular admins from modifying or wiping it
    }

    const product = await createProductService(productData);

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product: serializeAdminProduct(product, { includeCostPrice }),
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/products/:productId
export const updateAdminProductHandler = async (req, res, next) => {
  try {
    const includeCostPrice = canAccessCostPrice(req);
    console.log("Incoming Content-Type:", req.headers["content-type"]);
    console.log("Incoming req.body:", req.body);
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

    if (!includeCostPrice) {
      delete productData.costPrice; // prevents regular admins from modifying or wiping it
    }

    const product = await updateProductService(
      req.params.productId,
      productData,
      { includeCostPrice },
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: serializeAdminProduct(product, { includeCostPrice }),
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/products/:productId/archive
export const archiveAdminProductHandler = async (req, res, next) => {
  try {
    const includeCostPrice = canAccessCostPrice(req);
    const product = await archiveProductService(req.params.productId, {
      includeCostPrice,
    });
    return res.status(200).json({
      success: true,
      message: "Product archived successfully.",
      product: serializeAdminProduct(product, { includeCostPrice }),
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/products/:productId/restore
export const restoreAdminProductHandler = async (req, res, next) => {
  try {
    const includeCostPrice = canAccessCostPrice(req);

    // const product = await archiveProductService(req.params.productId, {
     const product = await restoreProductService(req.params.productId, {
      includeCostPrice,
    });
    return res.status(200).json({
      success: true,
      message: "Product restored successfully.",
      product: serializeAdminProduct(product, { includeCostPrice }),
    });
  } catch (error) {
    next(error);
  }
};
