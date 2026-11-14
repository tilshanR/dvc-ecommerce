import { z } from "zod";

// MongoDB ObjectId validation.
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId.");

// Product name.
const productNameSchema = z
  .string()
  .trim()
  .min(1, "Product name is required.")
  .max(200, "Product name cannot exceed 200 characters.");

// SKU is optional.
// Empty and whitespace-only values become undefined.
const skuSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().max(100).optional(),
);

// Product description.
const descriptionSchema = z
  .string()
  .trim()
  .max(10000, "Description cannot exceed 10,000 characters.");

// Prices must be non-negative numbers.
const priceSchema = z.number().finite().min(0);

// Product condition.
const conditionSchema = z.enum(["new", "used"]).nullable();

// Product status.
const statusSchema = z.enum(["draft", "active", "archived"]);

//PRODUCT IMAGE VALIDATION

const productImageSchema = z
  .object({
    url: z.string().trim().min(1, "Image URL is required."),
    alt: z.string().trim().max(300).optional(),
    isPrimary: z.boolean().optional().default(false),
    sortOrder: z.number().int().min(0).optional().default(0),
  })
  .strict();

const productImagesSchema = z
  .array(productImageSchema)
  .default([])
  .superRefine((images, ctx) => {
    const primaryCount = images.filter((image) => image.isPrimary).length;

    // If images exist, exactly one must be primary.
    if (images.length > 0 && primaryCount !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "A product must have exactly one primary image.",
      });
    }
  });

//INVENTORY VALIDATION

// Used when creating a product.
// Both values default to zero.
const createInventorySchema = z
  .object({
    onHand: z.number().int().min(0).default(0),
    reserved: z.number().int().min(0).default(0),
  })
  .strict()
  .superRefine((inventory, ctx) => {
    if (inventory.reserved > inventory.onHand) {
      ctx.addIssue({
        code: "custom",
        path: ["reserved"],
        message: "Reserved stock cannot exceed on-hand stock.",
      });
    }
  });

// Used when updating inventory.
// The service will compare the supplied values with
// the existing inventory before saving.
const updateInventorySchema = z
  .object({
    onHand: z.number().int().min(0).optional(),
    reserved: z.number().int().min(0).optional(),
  })
  .strict();

//DYNAMIC ATTRIBUTES

// Category-specific attribute validation will happen
// in productService.js because it requires Category data.
const attributesSchema = z.record(z.string(), z.unknown());

/// WARRANTY VALIDATION

const warrantySchema = z
  .object({
    type: z.enum(["manufacturer", "checking", "none"]),

    duration: z.number().int().positive().nullable(),

    unit: z.enum(["days", "months", "years"]).nullable(),
  })
  .strict()
  .superRefine((warranty, ctx) => {
    if (warranty.type === "none") {
      if (warranty.duration !== null || warranty.unit !== null) {
        ctx.addIssue({
          code: "custom",
          message: "A product without warranty cannot have a duration or unit.",
        });
      }
    } else {
      if (warranty.duration === null || warranty.unit === null) {
        ctx.addIssue({
          code: "custom",
          message: "Warranty duration and unit are required.",
        });
      }
    }
  });

// CREATE PRODUCT

export const createProductSchema = z
  .object({
    name: productNameSchema,

    sku: skuSchema,

    description: descriptionSchema.optional().default(""),

    category: objectIdSchema,

    brand: objectIdSchema.nullable().optional().default(null),

    price: priceSchema,

    originalPrice: priceSchema,

    images: productImagesSchema,
    imageFile: z.any().optional(),
    inventory: createInventorySchema.optional().default({
      onHand: 0,
      reserved: 0,
    }),

    condition: conditionSchema.optional().default(null),

    attributes: attributesSchema.optional().default({}),

    warranty: warrantySchema.nullable().optional().default(null),

    status: statusSchema.optional().default("draft"),
  })
  .strict();

//  UPDATE PRODUCT

export const updateProductSchema = z.preprocess(
  (input) => {
    if (
      input !== null &&
      typeof input === "object" &&
      !Array.isArray(input) &&
      Object.keys(input).length === 0
    ) {
      return undefined;
    }

    return input;
  },
  z
    .object({
      name: productNameSchema.optional(),
      sku: skuSchema,
      description: descriptionSchema.optional(),
      category: objectIdSchema.optional(),
      brand: objectIdSchema.nullable().optional(),
      price: priceSchema.optional(),
      originalPrice: priceSchema.nullable().optional(),
      images: productImagesSchema.optional(),
      imageFile: z.any().optional(),
      inventory: updateInventorySchema.optional(),
      condition: conditionSchema.optional(),
      attributes: attributesSchema.optional(),
      warranty: warrantySchema.nullable().optional(),
      status: statusSchema.optional(),
    })
    .strict(),
);

// PRODUCT ID VALIDATION

export const productIdSchema = z
  .object({
    id: objectIdSchema,
  })
  .strict();

// PRODUCT QUERY VALIDATION

export const productQuerySchema = z
  .object({
    search: z.string().trim().optional(),

    category: objectIdSchema.optional(),

    brand: objectIdSchema.optional(),

    condition: conditionSchema.optional(),

    status: statusSchema.optional(),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    sortBy: z
      .enum(["name", "price", "createdAt", "updatedAt"])
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();
