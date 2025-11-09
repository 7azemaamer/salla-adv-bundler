import { Router } from "express";
import {
  getProducts,
  getProductDetails,
  searchProducts,
  getProductReviews,
  updateProductReview,
} from "../controllers/product.controller.js";
import { authenticateToken } from "../../../middleware/auth.middleware.js";

const router = Router();

// Protected routes (require authentication)
router.use(authenticateToken);

// Product management routes
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/:product_id/reviews", getProductReviews);
router.put("/:product_id/reviews/:review_id", updateProductReview);
router.get("/:product_id", getProductDetails);

export default router;
