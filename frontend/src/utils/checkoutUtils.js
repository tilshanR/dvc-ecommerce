import { z } from "zod";

export const SRI_LANKA_DISTRICTS = Object.freeze([
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
]);

export const DEFAULT_PUBLIC_SETTINGS = Object.freeze({
  shipping: {
    shopDistrict: "Matale",
    localBaseFee: 300,
    islandwideBaseFee: 450,
    extraKgFee: 150,
    baseWeightGrams: 1000,
    defaultItemWeightGrams: 500,
    freeShippingThreshold: 15000,
  },
  orderPolicies: {
    onlinePaymentTimeoutMinutes: 30,
    storePickupHoldHours: 72,
    autoCancelStorePickup: true,
  },
  legal: {
    termsAndConditions: "",
    termsUpdatedAt: null,
  },
  districts: SRI_LANKA_DISTRICTS,
});

export const checkoutSchema = z.object({
  firstName: z.string().trim().min(2, "Enter your first name."),
  lastName: z.string().trim().min(2, "Enter your last name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]{9,15}$/, "Enter a valid phone number."),
  streetAddress: z.string().trim().optional(),
  city: z.string().trim().optional(),
  district: z.string().trim().optional(),
  postcode: z.string().trim().optional(),
});

export const formatLKR = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatWeightGrams = (grams) => {
  const value = Number(grams);
  if (!Number.isFinite(value) || value <= 0) return null;
  if (value >= 1000) {
    const kg = (value / 1000).toFixed(2).replace(/\.?0+$/, "");
    return `${kg} kg`;
  }
  return `${Math.round(value)} g`;
};

export const formatHoldHours = (hours) => {
  const h = Number(hours);
  if (!Number.isFinite(h) || h <= 0) return "72 hours";
  if (h % 24 === 0) {
    const days = h / 24;
    return `${h} hours (${days} ${days === 1 ? "day" : "days"})`;
  }
  return `${h} hours`;
};

export const checkoutOptions = {
  "delivery-online": {
    title: "Home Delivery",
    payment: "Online Payment",
    description: "Your order will be delivered to your address.",
  },
  "pickup-online": {
    title: "Store Pickup",
    payment: "Online Payment",
    description: "Collect your order from our store.",
  },
  "pickup-store": {
    title: "Store Pickup",
    payment: "Pay at Store",
    description: "Reserve your order and pay when collecting it.",
  },
};
