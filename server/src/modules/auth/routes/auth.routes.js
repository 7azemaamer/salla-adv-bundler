import { Router } from "express";
import {
  getSetupInfo,
  completeSetup,
  loginWithCredentials,
  forgotPassword,
  resetPassword,
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
router.post("/forgot-password", forgotPassword); // Send 6-digit code
router.post("/reset-password", resetPassword); // Verify code & update password

// Protected route to validate JWT token
router.get("/validate", authenticateToken, validateToken);

// Refresh plan info (fetch latest plan from store)
router.get("/refresh-plan", authenticateToken, async (req, res) => {
  try {
    const Store = (await import("../../stores/model/store.model.js")).default;
    const storeId = req.user?.store_id;

    if (!storeId) {
      return res
        .status(400)
        .json({ success: false, message: "Store ID not found" });
    }

    const store = await Store.findOne({ store_id: storeId }).select("plan");

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });
    }

    // Get plan config details
    const planConfig = await PlanConfig.findOne({ key: store.plan });

    res.json({
      success: true,
      plan_context: {
        plan: store.plan,
        label: planConfig?.label || store.plan,
        limits: planConfig?.limits || {},
        features: planConfig?.features || {},
      },
    });
  } catch (error) {
    console.error("Refresh plan error:", error);
    res.status(500).json({ success: false, message: "Failed to refresh plan" });
  }
});

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
