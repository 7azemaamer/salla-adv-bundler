import express from "express";
import * as settingsController from "../controllers/settings.controller.js";
import { authenticateToken } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Public endpoint for modal (no auth required)
// GET /api/v1/settings/:store_id/review-count - Get review count settings
router.get(
  "/:store_id/review-count",
  settingsController.getReviewCountSettings
);

// All routes below require authentication
router.use(authenticateToken);

// GET /api/v1/settings - Get store settings
router.get("/", settingsController.getSettings);

// PUT /api/v1/settings - Update store settings
router.put("/", settingsController.updateSettings);

// POST /api/v1/settings/refetch-payment-methods - Refetch payment methods from Salla
router.post(
  "/refetch-payment-methods",
  settingsController.refetchPaymentMethods
);

export default router;
