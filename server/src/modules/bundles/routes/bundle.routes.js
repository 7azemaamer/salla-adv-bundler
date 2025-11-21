import { Router } from "express";
import {
  createBundle,
  generateBundleOffers,
  previewBundleOffers,
  listBundles,
  getBundleDetails,
  updateBundle,
  deactivateBundle,
  deleteBundle,
  trackBundleView,
  trackBundleClick,
  trackBundleConversion,
  refetchProductReviews,
} from "../controllers/bundle.controller.js";
import {
  getBundlesByProduct,
  getBundleConfig,
  trackBundleInteraction,
} from "../controllers/storefront.controller.js";
import {
  getBundleMonthlyAnalytics,
  getBundleAnalyticsHistory,
  getBundleAggregatedStats,
  getBundleTierPerformance,
  getStoreCurrentMonthAnalytics,
  getStoreAggregatedStats,
  getStoreTrendingBundles,
} from "../controllers/analytics.controller.js";
import { authenticateToken } from "../../../middleware/auth.middleware.js";

const router = Router();

// Protected routes (require authentication)
router.use(authenticateToken);

// Bundle management routes
router.post("/", createBundle);
router.get("/", listBundles);
router.get("/:bundle_id", getBundleDetails);
router.put("/:bundle_id", updateBundle);
router.delete("/:bundle_id", deleteBundle);

// Offer management routes
router.post("/:bundle_id/offers/generate", generateBundleOffers);
router.get("/:bundle_id/offers/preview", previewBundleOffers);
router.post("/:bundle_id/deactivate", deactivateBundle);

// Analytics routes (protected)
router.post("/:bundle_id/track/view", trackBundleView);
router.post("/:bundle_id/track/click", trackBundleClick);
router.post("/:bundle_id/track/conversion", trackBundleConversion);

// Monthly analytics routes
router.get("/:bundle_id/analytics", getBundleMonthlyAnalytics);
router.get("/:bundle_id/analytics/history", getBundleAnalyticsHistory);
router.get("/:bundle_id/analytics/aggregated", getBundleAggregatedStats);
router.get("/:bundle_id/analytics/tiers", getBundleTierPerformance);

// Product reviews cache
router.post("/:bundle_id/refetch-reviews", refetchProductReviews);

export default router;
