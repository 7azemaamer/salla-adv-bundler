import { Router } from "express";
import webhookRoutes from "../modules/webhooks/routes/webhooks.routes.js";
import authRoutes from "../modules/auth/routes/auth.routes.js";
import bundleRoutes from "../modules/bundles/routes/bundle.routes.js";
import storefrontRoutes from "../modules/bundles/routes/storefront.routes.js";
import productRoutes from "../modules/products/routes/product.routes.js";
import injectionRoutes from "../modules/bundles/routes/injection.routes.js";
import modalRoutes from "../modules/bundles/routes/modal.routes.js";
import docsRoutes from "../modules/bundles/routes/docs.routes.js";
import snippetRoutes from "../modules/bundles/routes/snippet.routes.js";

const router = Router();

// Authentication routes
router.use("/auth", authRoutes);

// Webhook routes
router.use("/webhooks", webhookRoutes);

// Product management routes (protected)
router.use("/products", productRoutes);

// Bundle management routes (protected)
router.use("/bundles", bundleRoutes);

// Storefront routes (public)
router.use("/storefront", storefrontRoutes);

// Injection script (public - for Salla stores)
router.use("/inject", injectionRoutes);

// Bundle modal script (public - loaded on demand) - MUST be before protected bundles routes
router.use("/modal", modalRoutes);

// Documentation routes (public)
router.use("/docs", docsRoutes);

// App Snippet routes (public - for Salla App Snippets)
router.use("/snippet", snippetRoutes);

export default router;
