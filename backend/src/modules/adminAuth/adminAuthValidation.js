import { z } from "zod";

const passwordRules = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(72, "Password cannot exceed 72 characters.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

export const adminSignupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name cannot exceed 100 characters."),
    email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
    password: passwordRules,
    confirmPassword: z.string(),
    role: z.enum(["admin", "super_admin"]).optional(),
    signupSecret: z.string().trim().optional(),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const adminLoginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
    password: z.string().min(1, "Password is required."),
  })
  .strict();

export const adminForgotPasswordSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  })
  .strict();

export const adminResetPasswordSchema = z
  .object({
    password: passwordRules,
    confirmPassword: z.string(),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

// Reusable Express middleware for Zod v4 validation
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues?.[0];
    const err = new Error(firstIssue?.message || "Invalid request payload.");
    err.statusCode = 400;
    return next(err);
  }

  req.body = result.data;
  return next();
};