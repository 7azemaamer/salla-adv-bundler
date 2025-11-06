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

// Product reviews cache
router.post("/:bundle_id/refetch-reviews", refetchProductReviews);

export default router;
