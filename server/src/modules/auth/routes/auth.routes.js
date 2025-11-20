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
    const store = await Store.findById(req.user.storeId).select(
      "plan features"
    );

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });
    }

    res.json({
      success: true,
      data: {
        plan: store.plan || "free",
        features: store.features || {},
      },
    });
  } catch (error) {
    console.error("Refresh plan error:", error);
    res.status(500).json({ success: false, message: "Failed to refresh plan" });
  }
});

export default router;
