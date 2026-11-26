import { z } from "zod";
import { SRI_LANKA_DISTRICTS } from "../shipping/sriLankaDistricts.js";
import mongoose from "mongoose";

// Reusable MongoDB ObjectId validator
const objectIdSchema = z
  .string()
  .refine((val) => mongoose.isValidObjectId(val), {
    message: "Invalid ID format.",
  });

/* --------------------------------
   1. PUBLIC STOREFRONT SCHEMA
--------------------------------- */
export const createOrderSchema = z.object({
  body: z
    .object({
      customer: z.object({
        firstName: z.string().trim().min(2, "First name is required."),
        lastName: z.string().trim().min(2, "Last name is required."),
        email: z.string().trim().email("Invalid email address."),
        phone: z
          .string()
          .trim()
          .regex(/^[0-9+\s()-]{9,15}$/, "Invalid phone number."),
      }),
      
      shippingAddress: z
        .object({
          streetAddress: z.string().trim().optional(),
          city: z.string().trim().optional(),
          district: z.preprocess(
            (val) =>
              typeof val === "string" && val.trim() === "" ? undefined : val,
            z.enum(SRI_LANKA_DISTRICTS).optional(),
          ),
          postcode: z.string().trim().optional(),
        })
        .optional(),

      items: z
        .array(
          z.object({
            productId: objectIdSchema,
            quantity: z
              .number()
              .int("Quantity must be a whole number.")
              .min(1, "Quantity must be at least 1."),
          }),
        )
        .min(1, "Order must contain at least one item."),

      checkoutMethod: z.enum(
        ["delivery-online", "pickup-online", "pickup-store"],
        {
          errorMap: () => ({ message: "Invalid checkout method selected." }),
        },
      ),
    })
    // Conditional validation: Require full address + district ONLY if delivery is selected
    .superRefine((data, ctx) => {
      if (data.checkoutMethod === "delivery-online") {
        if (
          !data.shippingAddress?.streetAddress ||
          !data.shippingAddress?.city ||
          !data.shippingAddress?.district ||
          !data.shippingAddress?.postcode
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "A complete shipping address including delivery district is required for home delivery.",
            path: ["shippingAddress"],
          });
        }
      }
    }),
});

/* --------------------------------
   2. ADMIN SCHEMAS
--------------------------------- */
export const adminUpdateOrderSchema = z.object({
  params: z.object({
    orderId: objectIdSchema,
  }),
  body: z
    .object({
      orderStatus: z
        .enum([
          "Pending",
          "Processing",
          "Ready for Pickup",
          "Shipped",
          "Delivered",
          "Cancelled",
        ])
        .optional(),

      paymentStatus: z
        .enum(["Pending", "Paid", "Failed", "Refunded"])
        .optional(),

      notes: z.string().trim().optional(),

      // Courier tracking updates
      fulfillment: z
        .object({
          courierProvider: z.string().trim().nullable().optional(),
          trackingNumber: z.string().trim().nullable().optional(),
          dispatchedAt: z.string().datetime().nullable().optional(), // ISO 8601 string cast to Date
          deliveredAt: z.string().datetime().nullable().optional(),
        })
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided to update the order.",
    }),
});

// Used for admin dashboard filtering (e.g., viewing all "Pending" orders)
export const orderQuerySchema = z.object({
  query: z.object({
    orderStatus: z.string().optional(),
    paymentStatus: z.string().optional(),
    search: z.string().trim().optional(), // For searching orderNumber, email, phone
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
