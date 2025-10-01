import express from "express";
import * as settingsController from "../controllers/settings.controller.js";
import { authenticateToken } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/v1/settings - Get store settings
router.get("/", settingsController.getSettings);

// PUT /api/v1/settings - Update store settings
router.put("/", settingsController.updateSettings);

export default router;
