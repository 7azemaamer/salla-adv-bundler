import { Router } from "express";
import {
  loginViaSalla,
  sallaCallback,
} from "../controllers/auth.controller.js";
import { validateToken } from "../controllers/validate.controller.js";
import { authenticateToken } from "../../../middleware/auth.middleware.js";

const router = Router();

router.get("/login", loginViaSalla);
router.get("/callback", sallaCallback);

// Protected route to validate token
router.get("/validate", authenticateToken, validateToken);

export default router;
