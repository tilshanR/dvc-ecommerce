import { z } from "zod";
import mongoose from "mongoose";
import { SRI_LANKA_DISTRICTS } from "./sriLankaDistricts.js";

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.isValidObjectId(val), {
    message: "Invalid product ID format.",
  });

export const shippingQuoteSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            productId: objectIdSchema,
            quantity: z
              .number()
              .int("Quantity must be a whole number.")
              .min(1, "Quantity must be at least 1.")
              .max(100, "Quantity exceeds maximum allowed per item."),
          })
          .strict(),
      )
      .min(1, "At least one item is required for a shipping quote.")
      .max(50, "Too many items in quote request."),

    checkoutMethod: z.enum(["delivery-online", "pickup-online", "pickup-store"]),

    district: z.enum(SRI_LANKA_DISTRICTS).nullable().optional(),
  })
  .strict();