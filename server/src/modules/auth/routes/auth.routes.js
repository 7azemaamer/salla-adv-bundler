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

export default router;
