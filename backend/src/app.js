import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import errorMiddleware from "./middleware/errorMiddleware.js";

// Import API routes
import contactRoutes from "./modules/contact/contactRoutes.js";
import categoryRoutes from "./modules/catalog/category/categoryRoutes.js";

const app = express();

//  Security middleware
app.use(helmet());

//  Allow requests from your React frontend
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  }),
);

//  Parse incoming JSON request bodies
app.use(express.json());

// Limit repeated requests to API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Maximum 100 requests per window
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

// Apply the rate limiter to all API endpoints
app.use("/api", apiLimiter);
app.use("/api/categories", categoryRoutes);
// Register Contact Us API routes
// POST /api/contact submits a new contact message
app.use("/api/contact", contactRoutes);

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
