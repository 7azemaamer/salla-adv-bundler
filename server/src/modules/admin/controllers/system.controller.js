import mongoose from "mongoose";
import Store from "../../stores/model/store.model.js";
import ProductCache from "../../products/model/productCache.model.js";
import WorkerStatus from "../model/workerStatus.model.js";

/**
 * Get system health status
 */
export const getSystemHealth = async (req, res) => {
  try {
    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    // Get worker statuses
    const workers = await WorkerStatus.find().select(
      "name status last_run_at last_error_at"
    );

    // Calculate system status
    const hasErrors = workers.some((w) => w.status === "error");
    const systemStatus =
      dbStatus === "connected" && !hasErrors ? "healthy" : "unhealthy";

    res.status(200).json({
      success: true,
      data: {
        status: systemStatus,
        timestamp: new Date().toISOString(),
        services: {
          database: dbStatus,
          salla_api: "operational", // TODO: Add actual Salla API health check
        },
        workers: workers.map((w) => ({
          name: w.name,
          status: w.status,
          last_run_at: w.last_run_at,
          last_error_at: w.last_error_at,
        })),
      },
    });
  } catch (error) {
    console.error("Get system health error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check system health",
      error: error.message,
    });
  }
};

/**
 * Get detailed worker status
 */
export const getWorkerStatus = async (req, res) => {
  try {
    const workers = await WorkerStatus.find().sort({ name: 1 });

    // Initialize workers if they don't exist
    if (workers.length === 0) {
      const defaultWorkers = [
        {
          name: "bundleCleanup",
          description:
            "Deactivates expired bundles and purges failed Salla offers.",
          schedule: "0 * * * *",
        },
        {
          name: "reviewCount",
          description: "Auto-increments synthetic review counters for stores.",
          schedule: "@daily",
        },
        {
          name: "tokenRefresh",
          description: "Refreshes Salla access tokens that are expiring.",
          schedule: "0 3 * * *",
        },
        {
          name: "cacheCleanup",
          description: "Removes expired product review cache entries.",
          schedule: "0 3 * * *",
        },
        {
          name: "reviewRefresh",
          description: "Refreshes cached reviews for tracked products.",
          schedule: "0 2 * * 0",
        },
      ];

      await WorkerStatus.insertMany(defaultWorkers);
      const newWorkers = await WorkerStatus.find().sort({ name: 1 });

      return res.status(200).json({
        success: true,
        data: newWorkers,
      });
    }

    res.status(200).json({
      success: true,
      data: workers,
    });
  } catch (error) {
    console.error("Get worker status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch worker status",
      error: error.message,
    });
  }
};

/**
 * Refresh tokens for stores needing reauth
 */
export const refreshNeedsReauthStores = async (req, res) => {
  try {
    const stores = await Store.find({
      status: "needs_reauth",
      refresh_token: { $ne: null },
    });

    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No stores need reauth",
        data: {
          total: 0,
          success: 0,
          failed: 0,
          results: [],
        },
      });
    }

    // Import token helper
    const { refreshAccessToken } = await import(
      "../../../utils/tokenHelper.js"
    );

    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const store of stores) {
      try {
        await refreshAccessToken(store);
        results.push({
          store_id: store.store_id,
          status: "success",
        });
        successCount++;
      } catch (error) {
        results.push({
          store_id: store.store_id,
          status: "failed",
          reason: error.message,
        });
        failedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Refreshed ${successCount} stores, ${failedCount} failed`,
      data: {
        total: stores.length,
        success: successCount,
        failed: failedCount,
        results,
      },
    });
  } catch (error) {
    console.error("Refresh needs reauth stores error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh stores",
      error: error.message,
    });
  }
};

/**
 * Clear expired caches
 */
export const clearExpiredCaches = async (req, res) => {
  try {
    const result = await ProductCache.deleteMany({
      expires_at: { $lt: new Date() },
    });

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} expired cache entries`,
      data: {
        deleted_count: result.deletedCount,
      },
    });
  } catch (error) {
    console.error("Clear expired caches error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear caches",
      error: error.message,
    });
  }
};

/**
 * Get system configuration
 */
export const getSystemConfig = async (req, res) => {
  try {
    const config = {
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      features: {
        bundles: true,
        analytics: true,
        webhooks: true,
        plan_management: true,
      },
      limits: {
        max_bundles_per_request: 100,
        max_products_per_bundle: 50,
        api_rate_limit: "100/minute",
      },
    };

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Get system config error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system configuration",
      error: error.message,
    });
  }
};

/**
 * Update system configuration
 */
export const updateSystemConfig = async (req, res) => {
  try {
    const { limits, features } = req.body;

    // TODO: Implement actual config update logic
    // For now, just return the updated values

    res.status(200).json({
      success: true,
      message: "System configuration updated successfully",
      data: {
        limits,
        features,
      },
    });
  } catch (error) {
    console.error("Update system config error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update system configuration",
      error: error.message,
    });
  }
};
