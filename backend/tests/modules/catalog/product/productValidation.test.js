import { describe, it, expect } from "vitest";

import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productQuerySchema,
} from "../../../../src/modules/catalog/product/productValidation.js";

// Valid MongoDB ObjectIds for testing.
const validCategoryId = "6ae816bf23d24f2c02943d62";
const validBrandId = "6ae816bf23d24f2c02943d63";
const validProductId = "6ae816bf23d24f2c02943d64";

// Reusable valid product data.
const validProduct = {
  name: "Samsung Galaxy S24",
  category: validCategoryId,
  brand: validBrandId,
  price: 250000,
  status: "draft",
};

describe("Product Creation Validation", () => {
  it("accepts valid product data", () => {
    const result = createProductSchema.safeParse(validProduct);

    expect(result.success).toBe(true);
  });

  it("rejects an empty product name", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      name: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a product name exceeding 200 characters", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      name: "A".repeat(201),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing category", () => {
    const { category, ...product } = validProduct;

    const result = createProductSchema.safeParse(product);

    expect(result.success).toBe(false);
  });

  it("rejects an invalid category ObjectId", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      category: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a null brand", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      brand: null,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a negative price", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      price: -100,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing price", () => {
    const { price, ...product } = validProduct;

    const result = createProductSchema.safeParse(product);

    expect(result.success).toBe(false);
  });

  it("accepts zero price", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      price: 0,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid product status", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      status: "published",
    });

    expect(result.success).toBe(false);
  });

  it("defaults status to draft", () => {
    const result = createProductSchema.safeParse({
      name: validProduct.name,
      category: validCategoryId,
      price: 250000,
    });

    expect(result.success).toBe(true);
    expect(result.data.status).toBe("draft");
  });
});

describe("Product SKU Validation", () => {
  it.each([
    ["uppercase SKU", "SAM-S24-128"],
    ["lowercase SKU", "sam-s24-128"],
    ["mixed-case SKU", "Sam-S24-128"],
  ])("accepts %s", (_name, sku) => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      sku,
    });

    expect(result.success).toBe(true);
  });

  it("accepts an omitted SKU", () => {
    const result = createProductSchema.safeParse(validProduct);

    expect(result.success).toBe(true);
  });

  it("converts an empty SKU to undefined", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      sku: "",
    });

    expect(result.success).toBe(true);
    expect(result.data.sku).toBeUndefined();
  });

  it("converts a whitespace-only SKU to undefined", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      sku: "   ",
    });

    expect(result.success).toBe(true);
    expect(result.data.sku).toBeUndefined();
  });

  it("rejects a non-string SKU", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      sku: 12345,
    });

    expect(result.success).toBe(false);
  });
});

describe("Product Image Validation", () => {
  const primaryImage = {
    url: "https://example.com/product.jpg",
    alt: "Samsung Galaxy S24",
    isPrimary: true,
    sortOrder: 0,
  };

  const secondaryImage = {
    url: "https://example.com/product-back.jpg",
    alt: "Back view",
    isPrimary: false,
    sortOrder: 1,
  };

  it("accepts an empty image array", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      images: [],
    });

    expect(result.success).toBe(true);
  });

  it("accepts one primary image", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      images: [primaryImage],
    });

    expect(result.success).toBe(true);
  });

  it("accepts multiple images with exactly one primary image", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      images: [primaryImage, secondaryImage],
    });

    expect(result.success).toBe(true);
  });

  it("rejects images without a primary image", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      images: [
        {
          ...secondaryImage,
          isPrimary: false,
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects multiple primary images", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      images: [
        primaryImage,
        {
          ...secondaryImage,
          isPrimary: true,
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects an image without a URL", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      images: [
        {
          isPrimary: true,
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});

describe("Product Inventory Validation", () => {
  it("accepts valid inventory", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      inventory: {
        onHand: 10,
        reserved: 5,
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts equal on-hand and reserved quantities", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      inventory: {
        onHand: 10,
        reserved: 10,
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects reserved stock greater than on-hand stock", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      inventory: {
        onHand: 10,
        reserved: 15,
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative on-hand stock", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      inventory: {
        onHand: -5,
        reserved: 0,
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative reserved stock", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      inventory: {
        onHand: 10,
        reserved: -2,
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects decimal inventory quantities", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      inventory: {
        onHand: 10.5,
        reserved: 2,
      },
    });

    expect(result.success).toBe(false);
  });

  it("defaults inventory quantities to zero", () => {
    const result = createProductSchema.safeParse(validProduct);

    expect(result.success).toBe(true);
    expect(result.data.inventory).toEqual({
      onHand: 0,
      reserved: 0,
    });
  });
});

describe("Product Condition Validation", () => {
  it.each(["new", "used", null])(
    "accepts condition: %s",
    (condition) => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        condition,
      });

      expect(result.success).toBe(true);
    },
  );

  it("defaults condition to null", () => {
    const result = createProductSchema.safeParse(validProduct);

    expect(result.success).toBe(true);
    expect(result.data.condition).toBeNull();
  });

  it("rejects an invalid condition", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      condition: "refurbished",
    });

    expect(result.success).toBe(false);
  });
});

describe("Product Update Validation", () => {
  it("accepts a partial product update", () => {
    const result = updateProductSchema.safeParse({
      price: 230000,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a condition-only update", () => {
    const result = updateProductSchema.safeParse({
      condition: "used",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a partial inventory update", () => {
    const result = updateProductSchema.safeParse({
      inventory: {
        onHand: 20,
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty update object", () => {
    const result = updateProductSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("rejects a negative updated price", () => {
    const result = updateProductSchema.safeParse({
      price: -100,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid updated inventory quantity", () => {
    const result = updateProductSchema.safeParse({
      inventory: {
        onHand: -5,
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects unknown update fields", () => {
    const result = updateProductSchema.safeParse({
      unknownField: "value",
    });

    expect(result.success).toBe(false);
  });
});

describe("Product ID Validation", () => {
  it("accepts a valid MongoDB ObjectId", () => {
    const result = productIdSchema.safeParse({
      id: validProductId,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid MongoDB ObjectId", () => {
    const result = productIdSchema.safeParse({
      id: "invalid-id",
    });

    expect(result.success).toBe(false);
  });
});

describe("Product Query Validation", () => {
  it("accepts valid product filters", () => {
    const result = productQuerySchema.safeParse({
      category: validCategoryId,
      brand: validBrandId,
      status: "active",
      page: "2",
      limit: "20",
      sortBy: "price",
      sortOrder: "asc",
    });

    expect(result.success).toBe(true);
    expect(result.data.page).toBe(2);
    expect(result.data.limit).toBe(20);
  });

  it("applies default query values", () => {
    const result = productQuerySchema.safeParse({});

    expect(result.success).toBe(true);
    expect(result.data.page).toBe(1);
    expect(result.data.limit).toBe(10);
    expect(result.data.sortBy).toBe("createdAt");
    expect(result.data.sortOrder).toBe("desc");
  });

  it("rejects an invalid category filter", () => {
    const result = productQuerySchema.safeParse({
      category: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a page number less than one", () => {
    const result = productQuerySchema.safeParse({
      page: "0",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a limit greater than 100", () => {
    const result = productQuerySchema.safeParse({
      limit: "101",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unsupported sort field", () => {
    const result = productQuerySchema.safeParse({
      sortBy: "sku",
    });

    expect(result.success).toBe(false);
  });
});
