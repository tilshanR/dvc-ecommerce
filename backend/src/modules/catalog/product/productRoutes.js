import { Router } from "express";

import {
  getShopProducts,
  getShopProduct,
} from "./productController.js";


const router = Router();

// Public Shop routes
router.get("/", getShopProducts);
router.get("/:productId", getShopProduct);

export default router;