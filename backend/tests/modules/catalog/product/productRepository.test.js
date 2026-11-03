
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import "dotenv/config";

import Product from "../../../../src/modules/catalog/product/productModel.js";
import Category from "../../../../src/modules/catalog/category/categoryModel.js";

// import "../../../../src/modules/catalog/brand/brandModel.js";

import {
  createProduct,
  findAllProducts,
  findProductById,
  findProductBySlug,
  findProductBySku,
  updateProductById,
  archiveProductById,
  restoreProductById,
} from "../../../../src/modules/catalog/product/productRepository.js";

describe("Product Repository Tests", () => {
  let category;
  let product1;
  let product2;
  let product3;

  const testId = Date.now();

  beforeAll(async () => {
    // Connect to a dedicated test database.
    const mongoUri = process.env.MONGODB_TEST_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGODB_TEST_URI is not defined in your environment.",
      );
    }

    await mongoose.connect(mongoUri);

    // Ensure MongoDB indexes, including the text index, are created.
    await Product.init();

    // Create a test category.
    category = await Category.create({
      name: `Test Electronics ${testId}`,
      slug: `test-electronics-${testId}`,
    });

    // Create test products.
    product1 = await createProduct({
      name: `Samsung Galaxy ${testId}`,
      slug: `samsung-galaxy-${testId}`,
      sku: `SAM-${testId}-01`,
      description: "Samsung smartphone with AMOLED display.",
      category: category._id,
      price: 100000,
      condition: "new",
      status: "active",
      inventory: {
        onHand: 10,
        reserved: 2,
      },
    });

    product2 = await createProduct({
      name: `Apple iPhone ${testId}`,
      slug: `apple-iphone-${testId}`,
      sku: `APP-${testId}-02`,
      description: "Apple smartphone with advanced camera.",
      category: category._id,
      price: 200000,
      condition: "new",
      status: "active",
      inventory: {
        onHand: 5,
        reserved: 1,
      },
    });

    product3 = await createProduct({
      name: `Test Tablet ${testId}`,
      slug: `test-tablet-${testId}`,
      sku: `TAB-${testId}-03`,
      description: "A tablet for testing product repository.",
      category: category._id,
      price: 75000,
      condition: "used",
      status: "draft",
      inventory: {
        onHand: 3,
        reserved: 0,
      },
    });
  });

  afterAll(async () => {
    // Remove only the documents created by this test suite.
    if (product1 && product2 && product3) {
      await Product.deleteMany({
        _id: {
          $in: [product1._id, product2._id, product3._id],
        },
      });
    }

    if (category) {
      await Category.findByIdAndDelete(category._id);
    }

    await mongoose.disconnect();
  });

  // --------------------------------------------------
  // CREATE PRODUCT
  // --------------------------------------------------

  it("should create a product", async () => {
    const product = await createProduct({
      name: `Created Product ${testId}`,
      slug: `created-product-${testId}`,
      category: category._id,
      price: 50000,
      inventory: {
        onHand: 5,
        reserved: 0,
      },
    });

    expect(product).toBeDefined();
    expect(product.name).toBe(`Created Product ${testId}`);
    expect(product.price).toBe(50000);

    // Clean up this additional test product.
    await Product.findByIdAndDelete(product._id);
  });

  // --------------------------------------------------
  // FIND ALL PRODUCTS
  // --------------------------------------------------

  it("should retrieve products with pagination", async () => {
    const result = await findAllProducts({
      category: category._id.toString(),
      page: 1,
      limit: 2,
      sortBy: "price",
      sortOrder: "asc",
    });

    expect(result.products).toHaveLength(2);
    expect(result.pagination.total).toBe(3);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(2);
    expect(result.pagination.totalPages).toBe(2);

    expect(result.products[0].price).toBe(75000);
  });

  it("should filter products by status", async () => {
    const result = await findAllProducts({
      category: category._id.toString(),
      status: "active",
    });

    expect(result.products).toHaveLength(2);

    result.products.forEach((product) => {
      expect(product.status).toBe("active");
    });
  });

  it("should filter products by condition", async () => {
    const result = await findAllProducts({
      category: category._id.toString(),
      condition: "used",
    });

    expect(result.products).toHaveLength(1);
    expect(result.products[0].condition).toBe("used");
  });

  it("should search products using MongoDB text search", async () => {
    const result = await findAllProducts({
      search: "AMOLED",
      category: category._id.toString(),
    });

    expect(result.products).toHaveLength(1);
    expect(result.products[0].name).toContain("Samsung Galaxy");
  });

  it("should populate category information", async () => {
    const result = await findProductById(product1._id);

    expect(result.category).toBeDefined();
    expect(result.category.name).toBe(`Test Electronics ${testId}`);
    expect(result.category.slug).toBe(`test-electronics-${testId}`);
  });

  // --------------------------------------------------
  // FIND PRODUCT BY ID, SLUG AND SKU
  // --------------------------------------------------

  it("should find a product by ID", async () => {
    const product = await findProductById(product1._id);

    expect(product).not.toBeNull();
    expect(product.name).toBe(`Samsung Galaxy ${testId}`);
  });

  it("should find a product by slug", async () => {
    const product = await findProductBySlug(
      `apple-iphone-${testId}`,
    );

    expect(product).not.toBeNull();
    expect(product.name).toBe(`Apple iPhone ${testId}`);
  });

  it("should find a product by SKU", async () => {
    const product = await findProductBySku(
      `app-${testId}-02`,
    );

    expect(product).not.toBeNull();
    expect(product.sku).toBe(`APP-${testId}-02`);
  });

  it("should return null when SKU is empty", async () => {
    const product = await findProductBySku("");

    expect(product).toBeNull();
  });

  // --------------------------------------------------
  // UPDATE PRODUCT
  // --------------------------------------------------

  it("should update product details", async () => {
    const updatedProduct = await updateProductById(
      product1._id,
      {
        price: 110000,
        description: "Updated Samsung smartphone description.",
      },
    );

    expect(updatedProduct).not.toBeNull();
    expect(updatedProduct.price).toBe(110000);
    expect(updatedProduct.description).toBe(
      "Updated Samsung smartphone description.",
    );
  });

  it("should update inventory without losing reserved quantity", async () => {
    const updatedProduct = await updateProductById(
      product1._id,
      {
        inventory: {
          onHand: 15,
          reserved: 2,
        },
      },
    );

    expect(updatedProduct.inventory.onHand).toBe(15);
    expect(updatedProduct.inventory.reserved).toBe(2);
    expect(updatedProduct.availableStock).toBe(13);
  });

  it("should return null when updating a nonexistent product", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const result = await updateProductById(fakeId, {
      price: 1000,
    });

    expect(result).toBeNull();
  });

  // --------------------------------------------------
  // ARCHIVE PRODUCT
  // --------------------------------------------------

  it("should archive a product", async () => {
    const archivedProduct = await archiveProductById(
      product2._id,
    );

    expect(archivedProduct).not.toBeNull();
    expect(archivedProduct.status).toBe("archived");
  });

  // --------------------------------------------------
  // RESTORE PRODUCT
  // --------------------------------------------------

  it("should restore an archived product as draft", async () => {
    const restoredProduct = await restoreProductById(
      product2._id,
    );

    expect(restoredProduct).not.toBeNull();
    expect(restoredProduct.status).toBe("draft");
  });

  it("should return null when archiving a nonexistent product", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const result = await archiveProductById(fakeId);

    expect(result).toBeNull();
  });

  it("should return null when restoring a nonexistent product", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const result = await restoreProductById(fakeId);

    expect(result).toBeNull();
  });
   { sequence: { concurrent: false } }
});
