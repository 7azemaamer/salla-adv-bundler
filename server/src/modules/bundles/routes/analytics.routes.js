import { Router } from "express";
import {
  getStoreCurrentMonthAnalytics,
  getStoreAggregatedStats,
  getStoreTrendingBundles,
} from "../controllers/analytics.controller.js";
import { authenticateToken } from "../../../middleware/auth.middleware.js";

const router = Router();

// Protected routes (require authentication)
router.use(authenticateToken);

// Store-level analytics routes
router.get("/store/current", getStoreCurrentMonthAnalytics);
router.get("/store/aggregated", getStoreAggregatedStats);
router.get("/store/trending", getStoreTrendingBundles);

export default router;
