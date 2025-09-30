import { Router } from "express";
import {
  getProducts,
  getProductDetails,
  searchProducts,
} from "../controllers/product.controller.js";
import { authenticateToken } from "../../../middleware/auth.middleware.js";

const router = Router();

// Protected routes (require authentication)
router.use(authenticateToken);

// Product management routes
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/:product_id", getProductDetails);

export default router;
