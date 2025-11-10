import { Router } from "express";
import {
  getBundlesByProduct,
  getBundleConfig,
  trackBundleInteraction,
  trackTierSelection,
  trackTierCheckout,
  getStoreReviews,
  getPaymentMethods,
  validateDiscountCode,
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

// Track tier selection (which offer user clicked)
router.post("/bundles/:bundle_id/track/tier-selection", trackTierSelection);

// Track tier checkout (which offer user proceeded to checkout with)
router.post("/bundles/:bundle_id/track/tier-checkout", trackTierCheckout);

// Get store reviews (for modal display)
router.get("/stores/:store_id/reviews", getStoreReviews);

// Get store payment methods
router.get("/stores/:store_id/payment-methods", getPaymentMethods);

// Validate discount/coupon code
router.post("/stores/:store_id/validate-coupon", validateDiscountCode);

export default router;
