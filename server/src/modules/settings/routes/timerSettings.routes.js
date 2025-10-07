import express from "express";
import {
  getTimerSettings,
  updateTimerSettings,
  resetTimerSettings,
  getTimerCSS,
} from "../controllers/timerSettings.controller.js";

const router = express.Router();

// Get timer settings for a store
router.get("/:storeId", getTimerSettings);

// Update timer settings
router.put("/:storeId", updateTimerSettings);

// Reset to defaults
router.post("/:storeId/reset", resetTimerSettings);

// Get CSS variables for timer styling
router.get("/:storeId/css", getTimerCSS);

export default router;
