import { Router } from "express";
import webhookRoutes from "../modules/webhooks/routes/webhooks.routes.js";
import authRoutes from "../modules/auth/routes/auth.routes.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/webhooks", webhookRoutes);

export default router;
