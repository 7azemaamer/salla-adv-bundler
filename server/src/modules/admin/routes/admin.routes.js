import { Router } from "express";
import { adminLogin, seedAdmin } from "../controllers/adminAuth.controller.js";
import {
  getAnalyticsSummary,
  getWorkerStatus,
  listBundles,
  getBundleDetail,
  listStores,
  getStoreDetail,
  updateStore,
  refreshStoreToken,
  listSubscriptions,
  listAuditLogs,
} from "../controllers/adminDashboard.controller.js";
import {
  getAllPlans,
  getPlanById,
  updatePlan,
  createPlan,
  deletePlan,
  getAvailableFeatures,
  resetPlanToDefault,
} from "../controllers/planConfig.controller.js";
import {
  getSystemHealth,
  refreshNeedsReauthStores,
  clearExpiredCaches,
  getWorkerStatus as getSystemWorkerStatus,
  getSystemConfig,
  updateSystemConfig,
} from "../controllers/system.controller.js";
import {
  listAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
  getAdminStats,
} from "../controllers/adminManagement.controller.js";
import {
  authenticateAdmin,
  requireRoles,
} from "../middleware/adminAuth.middleware.js";

const router = Router();

// Public admin auth route
router.post("/auth/login", adminLogin);

// Protected seed route (admins only) - optional safeguard
router.post("/auth/seed", authenticateAdmin, requireRoles("admin"), seedAdmin);

// Example health endpoint to verify token/roles
router.get(
  "/auth/me",
  authenticateAdmin,
  requireRoles("moderator", "admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      data: req.admin,
    });
  }
);

// ============================================================================
// Admin User Management Routes (Admin only)
// ============================================================================

// Admin statistics
router.get(
  "/admins/stats",
  authenticateAdmin,
  requireRoles("admin"),
  getAdminStats
);

// List all admins with filters
router.get("/admins", authenticateAdmin, requireRoles("admin"), listAdmins);

// Get single admin
router.get(
  "/admins/:id",
  authenticateAdmin,
  requireRoles("admin"),
  getAdminById
);

// Create new admin
router.post("/admins", authenticateAdmin, requireRoles("admin"), createAdmin);

// Update admin
router.patch(
  "/admins/:id",
  authenticateAdmin,
  requireRoles("admin"),
  updateAdmin
);

// Toggle admin status
router.post(
  "/admins/:id/toggle-status",
  authenticateAdmin,
  requireRoles("admin"),
  toggleAdminStatus
);

// Delete admin
router.delete(
  "/admins/:id",
  authenticateAdmin,
  requireRoles("admin"),
  deleteAdmin
);

// Analytics & workers (moderator+)
router.get(
  "/analytics/summary",
  authenticateAdmin,
  requireRoles("moderator", "admin"),
  getAnalyticsSummary
);

router.get(
  "/workers",
  authenticateAdmin,
  requireRoles("moderator", "admin"),
  getWorkerStatus
);

// Stores management
router.get(
  "/stores",
  authenticateAdmin,
  requireRoles("moderator", "admin"),
  listStores
);

router.get(
  "/stores/:storeId",
  authenticateAdmin,
  requireRoles("moderator", "admin"),
  getStoreDetail
);

router.patch(
  "/stores/:storeId",
  authenticateAdmin,
  requireRoles("admin"),
  updateStore
);

router.post(
  "/stores/:storeId/refresh-token",
  authenticateAdmin,
  requireRoles("admin"),
  refreshStoreToken
);

// Bundle visibility
router.get(
  "/bundles",
  authenticateAdmin,
  requireRoles("moderator", "admin"),
  listBundles
);

router.get(
  "/bundles/:bundleId",
  authenticateAdmin,
  requireRoles("moderator", "admin"),
  getBundleDetail
);

// Subscriptions overview
router.get(
  "/subscriptions",
  authenticateAdmin,
  requireRoles("moderator", "admin"),
  listSubscriptions
);

// Audit trail (admin only for now)
router.get(
  "/audit-logs",
  authenticateAdmin,
  requireRoles("admin"),
  listAuditLogs
);

// Plan Configuration Management (admin only)
router.get("/plans", authenticateAdmin, requireRoles("admin"), getAllPlans);

router.get(
  "/plans/features",
  authenticateAdmin,
  requireRoles("admin"),
  getAvailableFeatures
);

router.get(
  "/plans/:planKey",
  authenticateAdmin,
  requireRoles("admin"),
  getPlanById
);

router.post("/plans", authenticateAdmin, requireRoles("admin"), createPlan);

router.patch(
  "/plans/:planKey",
  authenticateAdmin,
  requireRoles("admin"),
  updatePlan
);

router.post(
  "/plans/:planKey/reset",
  authenticateAdmin,
  requireRoles("admin"),
  resetPlanToDefault
);

router.delete(
  "/plans/:planKey",
  authenticateAdmin,
  requireRoles("admin"),
  deletePlan
);

// ============================================================================
// System Management Routes (Admin only)
// ============================================================================

// System health
router.get(
  "/system/health",
  authenticateAdmin,
  requireRoles("admin"),
  getSystemHealth
);

// Worker status
router.get(
  "/system/workers",
  authenticateAdmin,
  requireRoles("admin"),
  getSystemWorkerStatus
);

// Batch operations
router.post(
  "/system/refresh-needs-reauth",
  authenticateAdmin,
  requireRoles("admin"),
  refreshNeedsReauthStores
);

router.post(
  "/system/clear-caches",
  authenticateAdmin,
  requireRoles("admin"),
  clearExpiredCaches
);

// System configuration
router.get(
  "/system/config",
  authenticateAdmin,
  requireRoles("admin"),
  getSystemConfig
);

router.patch(
  "/system/config",
  authenticateAdmin,
  requireRoles("admin"),
  updateSystemConfig
);

export default router;
