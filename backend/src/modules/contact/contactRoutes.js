
import express from "express";
import contactController from "./contactController.js";

// Create a router for Contact Us API endpoints.
const router = express.Router();

// POST /api/contact
// Submit a new contact message.
router.post("/", contactController.createContactMessage);

export default router;
