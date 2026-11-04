
import "dotenv/config";
import mongoose from "mongoose";

import Category from "../src/modules/catalog/category/categoryModel.js";
import { createProductService } from "../src/modules/catalog/product/productService.js";
import {
  findProductBySku,
} from "../src/modules/catalog/product/productRepository.js";

const MAIN_SLUG = "test-smartphones";

const categoryDefinitions = [
  {
    name: "Test Smartphones",
    slug: MAIN_SLUG,
    description: "Main category for testing parent-child product filtering.",
    sortOrder: 1,
    parent: null,
    allowCondition: true,
    attributes: [
      {
        key: "ram",
        label: "RAM",
        type: "select",
        options: ["4GB", "8GB", "12GB"],
        unit: "",
        isRequired: true,
        isFilterable: true,
        sortOrder: 1,
      },
    ],
  },
  {
    name: "Android Phones",
    slug: "android-phones",
    description: "Test Android smartphone products.",
    sortOrder: 1,
    parentSlug: MAIN_SLUG,
    allowCondition: true,
    attributes: [
      {
        key: "ram",
        label: "RAM",
        type: "select",
        options: ["4GB", "8GB", "12GB"],
        unit: "",
        isRequired: true,
        isFilterable: true,
        sortOrder: 1,
      },
    ],
  },
  {
    name: "iPhones",
    slug: "iphones",
    description: "Test iPhone products.",
    sortOrder: 2,
    parentSlug: MAIN_SLUG,
    allowCondition: true,
    attributes: [
      {
        key: "storage",
        label: "Storage",
        type: "select",
        options: ["128GB", "256GB", "512GB"],
        unit: "",
        isRequired: true,
        isFilterable: true,
        sortOrder: 1,
      },
    ],
  },
];

const productDefinitions = [
  {
    name: "Test Main Category Smartphone",
    sku: "DVC-TEST-MAIN-001",
    categorySlug: MAIN_SLUG,
    price: 1500,
    attributes: { ram: "8GB" },
  },
  {
    name: "Test Android Smartphone",
    sku: "DVC-TEST-ANDROID-001",
    categorySlug: "android-phones",
    price: 1800,
    attributes: { ram: "12GB" },
  },
  {
    name: "Test iPhone",
    sku: "DVC-TEST-IPHONE-001",
    categorySlug: "iphones",
    price: 2500,
    attributes: { storage: "256GB" },
  },
];

const seedShopHierarchy = async () => {
  const uri = process.env.MONGODB_TEST_URI;

  if (!uri) {
    throw new Error("MONGODB_TEST_URI is missing from .env");
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to test database.");

    // 1. Create or update the main category.
    const mainDefinition = categoryDefinitions[0];

    const mainCategory = await Category.findOneAndUpdate(
      { slug: mainDefinition.slug },
      {
        $set: {
          name: mainDefinition.name,
          description: mainDefinition.description,
          sortOrder: mainDefinition.sortOrder,
          parent: null,
          allowCondition: mainDefinition.allowCondition,
          attributes: mainDefinition.attributes,
          status: "active",
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    console.log("Main category ready:", mainCategory.name);

    // 2. Create or update the subcategories.
    const categoryMap = new Map([
      [MAIN_SLUG, mainCategory],
    ]);

    for (const definition of categoryDefinitions.slice(1)) {
      const parent = categoryMap.get(definition.parentSlug);

      const subcategory = await Category.findOneAndUpdate(
        { slug: definition.slug },
        {
          $set: {
            name: definition.name,
            description: definition.description,
            sortOrder: definition.sortOrder,
            parent: parent._id,
            allowCondition: definition.allowCondition,
            attributes: definition.attributes,
            status: "active",
          },
        },
        { new: true, upsert: true, runValidators: true },
      );

      categoryMap.set(definition.slug, subcategory);

      console.log("Subcategory ready:", subcategory.name);
    }

    // 3. Create or update the test products.
    for (const definition of productDefinitions) {
      const category = categoryMap.get(definition.categorySlug);

      const existingProduct = await findProductBySku(definition.sku);

      if (existingProduct) {
        console.log("Product already exists:", definition.sku);
        console.log("Existing product ID:", existingProduct._id);
        continue;
      }

      const product = await createProductService({
        name: definition.name,
        sku: definition.sku,
        description: "Test product for Shop category filtering.",
        category: category._id.toString(),
        brand: null,
        price: definition.price,
        originalPrice: null,
        images: [],
        inventory: {
          onHand: 10,
          reserved: 0,
        },
        condition: "new",
        attributes: definition.attributes,
        warranty: null,
        status: "active",
      });

      console.log("Product created:", product.name);
      console.log("Product ID:", product._id);
    }

    console.log("\nShop hierarchy seeding completed!");
    console.log("--------------------------------");
    console.log("Main category:", mainCategory.name);
    console.log("Subcategories: Android Phones, iPhones");
    console.log("Test products:", productDefinitions.length);
    console.log("--------------------------------");
  } finally {
    await mongoose.disconnect();
    console.log("Test database connection closed.");
  }
};

seedShopHierarchy().catch((error) => {
  console.error("\nShop hierarchy seeding failed:", error.message);

  if (error.details) {
    console.error(error.details);
  }

  process.exitCode = 1;
});
