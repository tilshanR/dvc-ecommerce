
import "dotenv/config";
import mongoose from "mongoose";

import Category from "../src/modules/catalog/category/categoryModel.js";
import { createProductService } from "../src/modules/catalog/product/productService.js";

const seedProduct = async () => {
  const uri = process.env.MONGODB_TEST_URI;

  if (!uri) {
    throw new Error("MONGODB_TEST_URI is missing from .env");
  }

  const categoryId = process.env.SEED_CATEGORY_ID;

  if (!categoryId || !mongoose.isValidObjectId(categoryId)) {
    throw new Error(
      "Please provide a valid SEED_CATEGORY_ID in your .env file.",
    );
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to test database.");

    // Find an active category.
    const category = await Category.findOne({
      _id: categoryId,
      status: "active",
    });

    if (!category) {
      throw new Error("Active category not found.");
    }

    // Read category-specific attributes from .env.
    let attributes = {};

    try {
      attributes = JSON.parse(
        process.env.SEED_PRODUCT_ATTRIBUTES || "{}",
      );
    } catch {
      throw new Error(
        "SEED_PRODUCT_ATTRIBUTES must contain valid JSON.",
      );
    }

    // Create a unique product name and SKU for testing.
    const timestamp = Date.now();

    const productData = {
      name: `DVC Test Product ${timestamp}`,
      sku: `DVC-TEST-${timestamp}`,
      description: "Sample product created for backend testing.",

      category: category._id.toString(),

      brand: null,

      price: 1500,
      originalPrice: null,

      images: [],

      inventory: {
        onHand: 10,
        reserved: 0,
      },

     condition: "new",

      attributes,

      warranty: null,

      // Active products are visible in the public Shop.
      status: "active",
    };

    // Reuse the actual product creation service.
    const product = await createProductService(productData);

    console.log("\nProduct created successfully!");
    console.log("--------------------------------");
    console.log("Product ID:", product._id);
    console.log("Name:", product.name);
    console.log("Slug:", product.slug);
    console.log("SKU:", product.sku);
    console.log("Category:", category.name);
    console.log("Price:", product.price);
    console.log("Status:", product.status);
    console.log("--------------------------------");
  } finally {
    await mongoose.disconnect();
    console.log("Test database connection closed.");
  }
};

seedProduct().catch((error) => {
  console.error("\nProduct seeding failed:", error.message);

  if (error.details) {
    console.error(error.details);
  }

  process.exitCode = 1;
});
