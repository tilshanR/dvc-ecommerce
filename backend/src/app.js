import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { protectAdmin } from "./middleware/adminAuthMiddleware.js";
// Import API routes
import contactRoutes from "./modules/contact/contactRoutes.js";
import categoryRoutes from "./modules/catalog/category/categoryRoutes.js";
import productRoutes from "./modules/catalog/product/productRoutes.js";
import adminProductRoutes from "./modules/catalog/product/admin/adminProductRoutes.js";
import orderRoutes from "./modules/order/orderRoutes.js";
import adminOrderRoutes from "./modules/order/admin/adminOrderRoutes.js";
import adminAuthRoutes from "./modules/adminAuth/adminAuthRoutes.js";
import paymentRoutes from "./modules/payment/paymentRoutes.js";

import storeSettingsRoutes from "./modules/settings/storeSettingsRoutes.js";
import adminStoreSettingsRoutes from "./modules/settings/admin/adminStoreSettingsRoutes.js";
import shippingRoutes from "./modules/shipping/shippingRoutes.js";

const app = express();

//  Security middleware
app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "http://localhost:5173",
  process.env.ADMIN_ORIGIN || "http://admin.localhost:5173",
].map((origin) => origin.replace(/\/+$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (Postman, PayHere webhooks) with no Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

//  Parse incoming JSON request bodies
app.use(express.json());
app.use(cookieParser());

// Limit repeated requests to API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // Allow 3,000 requests in development so you can code freely,
  // but strictly enforce the 100 limit in production.
  limit: process.env.NODE_ENV === "development" ? 3000 : 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

// Apply the rate limiter to all API endpoints
app.use("/api", apiLimiter);
//Public API routes
app.use("/api/categories", categoryRoutes);
// Register Contact Us API routes
// POST /api/contact submits a new contact message
app.use("/api/contact", contactRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api/settings", storeSettingsRoutes);
app.use("/api/shipping", shippingRoutes);

// Admin Auth routes (/signup, /login, /logout, /me, /forgot-password, /reset-password/:token)
app.use("/api/admin", adminAuthRoutes);

//  Global Admin Guard: EVERY remaining /api/admin/* route requires a valid 60m session
app.use("/api/admin", protectAdmin);

//  Protected Admin resource routes
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/settings", adminStoreSettingsRoutes);

//  Health-check endpoint
// GET /api/health checks whether the API is responding
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "DVC Ecommerce server Running",
  });
});
// Global error-handling middleware
app.use(errorMiddleware);

export default app;
