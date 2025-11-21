import { Router } from "express";
import webhookRoutes from "../modules/webhooks/routes/webhooks.routes.js";
import authRoutes from "../modules/auth/routes/auth.routes.js";
import bundleRoutes from "../modules/bundles/routes/bundle.routes.js";
import storefrontRoutes from "../modules/bundles/routes/storefront.routes.js";
import productRoutes from "../modules/products/routes/product.routes.js";
import modalRoutes from "../modules/bundles/routes/modal.routes.js";
import docsRoutes from "../modules/bundles/routes/docs.routes.js";
import snippetRoutes from "../modules/bundles/routes/snippet.routes.js";
import settingsRoutes from "../modules/settings/routes/settings.routes.js";
import timerSettingsRoutes from "../modules/settings/routes/timerSettings.routes.js";
import adminRoutes from "../modules/admin/routes/admin.routes.js";
import adminNotificationRoutes from "../modules/notifications/routes/admin.notification.routes.js";
import userNotificationRoutes from "../modules/notifications/routes/user.notification.routes.js";
import analyticsRoutes from "../modules/bundles/routes/analytics.routes.js";

const router = Router();

// Admin routes (protected - requires admin authentication)
router.use("/admin", adminRoutes);
router.use("/admin/notifications", adminNotificationRoutes);

// Authentication routes
router.use("/auth", authRoutes);

// Notification routes (protected - user routes)
router.use("/notifications", userNotificationRoutes);

// Webhook routes
router.use("/webhooks", webhookRoutes);

// Product management routes (protected)
router.use("/products", productRoutes);

// Bundle management routes (protected)
router.use("/bundles", bundleRoutes);

// Analytics routes (protected)
router.use("/analytics", analyticsRoutes);

// Settings routes (protected)
router.use("/settings", settingsRoutes);

// Timer settings routes (protected)
router.use("/timer-settings", timerSettingsRoutes);

// Storefront routes (public)
router.use("/storefront", storefrontRoutes);

// Bundle modal script (public - loaded on demand) - MUST be before protected bundles routes
router.use("/modal", modalRoutes);

// Documentation routes (public)
router.use("/docs", docsRoutes);

// App Snippet routes (public - for Salla App Snippets)
router.use("/snippet", snippetRoutes);

export default router;
