import { z } from "zod";

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
  postcode: z.string().trim().optional(),
});

export const formatLKR = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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