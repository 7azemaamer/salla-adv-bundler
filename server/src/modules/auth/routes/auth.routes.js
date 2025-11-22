import { Router } from "express";
import {
  getSetupInfo,
  completeSetup,
  loginWithCredentials,
  forgotPassword,
  resetPassword,
  getUserInfo,
  refreshPlan,
} from "../controllers/auth.controller.js";
import { validateToken } from "../controllers/validate.controller.js";
import { authenticateToken } from "../../../middleware/auth.middleware.js";
import PlanConfig from "../../admin/model/planConfig.model.js";

const router = Router();

// First-time setup
router.get("/setup", getSetupInfo);
router.post("/setup", completeSetup);

// Email/Password login
router.post("/login", loginWithCredentials);

// Password reset flow
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected route to validate JWT token
router.get("/validate", authenticateToken, validateToken);
router.get("/me", authenticateToken, getUserInfo);
router.get("/refresh-plan", authenticateToken, refreshPlan);

// Get all available plans (public - for user dashboard plans page)
router.get("/plans", authenticateToken, async (req, res) => {
  try {
    const plans = await PlanConfig.find({ isActive: true }).sort({ price: 1 });

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch plans" });
  }
});

export default router;
