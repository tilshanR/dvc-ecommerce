import mongoose from "mongoose";
import { SRI_LANKA_DISTRICTS } from "../shipping/sriLankaDistricts.js";

const { Schema } = mongoose;

export const DEFAULT_TERMS_AND_CONDITIONS = `## 1. General Terms
By placing an order through DVC Store, you confirm that all contact, billing, and delivery details provided at checkout are accurate and complete.

## 2. Order Confirmation & Payment
Online payments are processed securely through PayHere in Sri Lankan Rupees (LKR). Unpaid online orders are automatically cancelled once the active payment window expires, and reserved stock is returned to inventory.

## 3. Store Pickup Reservations
Orders placed with Pay at Store are held for the active store pickup window listed above. Please bring your order number when collecting your items at our counter.

## 4. Delivery & Shipping
Delivery fees are calculated automatically based on your delivery district, total parcel weight, and any active free-shipping threshold shown at checkout. Dispatch times may vary due to courier schedules or public holidays.

## 5. Returns, Warranty & Refunds
Product warranty terms apply as listed on each product page. Approved refunds for online payments are processed back to the original payment method.`;

const storeSettingsSchema = new Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
      immutable: true,
    },

    shipping: {
      shopDistrict: {
        type: String,
        enum: SRI_LANKA_DISTRICTS,
        default: "Matale",
      },
      localBaseFee: {
        type: Number,
        min: 0,
        default: 300,
      },
      islandwideBaseFee: {
        type: Number,
        min: 0,
        default: 450,
      },
      extraKgFee: {
        type: Number,
        min: 0,
        default: 150,
      },
      baseWeightGrams: {
        type: Number,
        min: 100,
        default: 1000,
      },
      defaultItemWeightGrams: {
        type: Number,
        min: 1,
        default: 500,
      },
      freeShippingThreshold: {
        type: Number,
        min: 0,
        default: 0, // Set to 0 to disable free shipping
      },
    },

    orderPolicies: {
      onlinePaymentTimeoutMinutes: {
        type: Number,
        min: 5,
        max: 120,
        default: 30,
      },
      storePickupHoldHours: {
        type: Number,
        min: 1,
        max: 336,
        default: 72,
      },
      autoCancelStorePickup: {
        type: Boolean,
        default: true,
      },
    },

    legal: {
      termsAndConditions: {
        type: String,
        trim: true,
        maxlength: 15000,
        default: DEFAULT_TERMS_AND_CONDITIONS,
      },
      termsUpdatedAt: {
        type: Date,
        default: null,
      },
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const StoreSettings =
  mongoose.models.StoreSettings ||
  mongoose.model("StoreSettings", storeSettingsSchema);

export default StoreSettings;
