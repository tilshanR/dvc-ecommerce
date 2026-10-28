import { z } from "zod";

export const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name cannot exceed 100 characters"),

  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s()-]/g, ""))
    .pipe(
      z
        .string()
        .regex(
          /^(?:0\d{9}|\+94\d{9})$/,
          "Enter a valid Sri Lankan phone number",
        ),
    ),

  email: z
    .string()
    .trim()
     .max(254, "Email cannot exceed 254 characters")
    .pipe(z.email({ error: "Enter a valid email address" })),
    
  subject: z.enum([
    "General Inquiry",
    "Hardware Availability Check",
    "Pickup Order Question",
    "Other",
  ]),

  message: z
    .string()
    .trim()
    .min(10, "Message must contain at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
});
