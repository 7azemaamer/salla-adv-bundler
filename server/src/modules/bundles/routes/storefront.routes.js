import { Router } from "express";
import {
  getBundlesByProduct,
  getBundleConfig,
  trackBundleInteraction,
} from "../controllers/storefront.controller.js";

const router = Router();

// Public storefront routes (no authentication required)

// Get bundles for a specific product
router.get(
  "/stores/:store_id/products/:product_id/bundles",
  getBundlesByProduct
);

// Check if bundles exist for a product (used by injection script)
router.get("/bundles/:product_id", getBundlesByProduct);

// Get specific bundle configuration
router.get("/bundles/:bundle_id/config", getBundleConfig);

// Track bundle interactions (analytics)
router.post("/bundles/:bundle_id/track", trackBundleInteraction);

export default router;
