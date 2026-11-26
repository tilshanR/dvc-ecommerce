import express from "express";
import { getPublicStoreSettings } from "./storeSettingsController.js";

const router = express.Router();

router.get("/public", getPublicStoreSettings);

export default router;