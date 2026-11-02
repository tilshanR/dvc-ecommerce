import { z } from "zod";

/* MONGODB OBJECT ID VALIDATION */

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID.");

/* CATEGORY ATTRIBUTE VALIDATION */

const categoryAttributeSchema = z
  .object({
    key: z
      .string()
      .trim()
      .toLowerCase()
      .regex(
        /^[a-z][a-z0-9_]*$/,
        "Attribute key must start with a letter and contain only letters, numbers, and underscores.",
      ),

    label: z.string().trim().min(1).max(100),

    type: z.enum(["text", "number", "select", "multiselect", "boolean"]),

    options: z.array(z.string().trim().min(1)).default([]),

    unit: z.string().trim().max(30).default(""),

    isRequired: z.boolean().default(false),

    isFilterable: z.boolean().default(false),

    sortOrder: z.number().int().min(0).default(0),
  })
  .superRefine((attribute, ctx) => {
    const needsOptions = ["select", "multiselect"].includes(attribute.type);

    if (needsOptions && attribute.options.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Select and multiselect attributes require options.",
        path: ["options"],
      });
    }

    if (!needsOptions && attribute.options.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: "This attribute type does not support options.",
        path: ["options"],
      });
    }

    const uniqueOptions = new Set(
      attribute.options.map((option) => option.toLowerCase()),
    );

    if (uniqueOptions.size !== attribute.options.length) {
      ctx.addIssue({
        code: "custom",
        message: "Attribute options must be unique.",
        path: ["options"],
      });
    }
  });

/* CATEGORY ATTRIBUTES ARRAY VALIDATION */

const attributesSchema = z
  .array(categoryAttributeSchema)
  .default([])
  .superRefine((attributes, ctx) => {
    const keys = attributes.map((attribute) => attribute.key);

    if (new Set(keys).size !== keys.length) {
      ctx.addIssue({
        code: "custom",
        message: "Attribute keys must be unique within a category.",
      });
    }
  });

/* MAIN CATEGORY VALIDATION */

const categorySchema = z
  .object({
    name: z.string().trim().min(2).max(100),

    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2)
      .max(120)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain lowercase letters, numbers, and hyphens.",
      ),

    description: z.string().trim().max(1000).default(""),

    sortOrder: z.number().int().min(0).default(0),

    parent: objectIdSchema.nullable().default(null),

    attributes: attributesSchema,

    allowCondition: z.boolean().default(false),

    status: z.enum(["active", "archived"]).default("active"),
  })
  .strict();

/* CREATE CATEGORY */

export const createCategorySchema = categorySchema;

/* UPDATE CATEGORY */

export const updateCategorySchema = categorySchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for updating.",
  );

/* EXPORT ATTRIBUTE VALIDATION */

export { categoryAttributeSchema };
