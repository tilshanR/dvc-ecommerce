import { z } from "zod";
import { SRI_LANKA_DISTRICTS } from "../shipping/sriLankaDistricts.js";

const nonNegativeMoney = z.number().finite().min(0).max(10000000);

const shippingUpdateSchema = z
  .object({
    shopDistrict: z.enum(SRI_LANKA_DISTRICTS).optional(),
    localBaseFee: nonNegativeMoney.optional(),
    islandwideBaseFee: nonNegativeMoney.optional(),
    extraKgFee: nonNegativeMoney.optional(),
    baseWeightGrams: z.number().int().min(100).max(50000).optional(),
    defaultItemWeightGrams: z.number().int().min(1).max(50000).optional(),
    freeShippingThreshold: nonNegativeMoney.optional(),
  })
  .strict();

const orderPoliciesUpdateSchema = z
  .object({
    onlinePaymentTimeoutMinutes: z.number().int().min(5).max(120).optional(),
    storePickupHoldHours: z.number().int().min(1).max(336).optional(),
    autoCancelStorePickup: z.boolean().optional(),
  })
  .strict();

const legalUpdateSchema = z
  .object({
    termsAndConditions: z
      .string()
      .trim()
      .min(20, "Terms and conditions must be at least 20 characters.")
      .max(15000, "Terms and conditions cannot exceed 15,000 characters.")
      .optional(),
  })
  .strict();

export const updateStoreSettingsSchema = z
  .object({
    shipping: shippingUpdateSchema.optional(),
    orderPolicies: orderPoliciesUpdateSchema.optional(),
    legal: legalUpdateSchema.optional(),
  })
  .strict()
  .refine(
    (data) =>
      Boolean(
        (data.shipping && Object.keys(data.shipping).length > 0) ||
          (data.orderPolicies && Object.keys(data.orderPolicies).length > 0) ||
          (data.legal && Object.keys(data.legal).length > 0),
      ),
    {
      message: "At least one settings field must be provided.",
    },
  );