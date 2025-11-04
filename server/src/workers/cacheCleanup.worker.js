import cron from "node-cron";
import { cleanupExpiredCache } from "../modules/products/services/productCache.service.js";

/**
 * Worker to cleanup expired product cache
 * Runs daily at 3 AM
 */
export const startCacheCleanupWorker = () => {
  // Run every day at 3:00 AM
  cron.schedule("0 3 * * *", async () => {
    console.log("[CacheCleanup Worker]: Starting cleanup of expired cache...");

    try {
      const deletedCount = await cleanupExpiredCache();
      console.log(
        `[CacheCleanup Worker]: Cleaned up ${deletedCount} expired cache entries`
      );
    } catch (error) {
      console.error(
        "[CacheCleanup Worker]: Error during cleanup:",
        error.message
      );
    }
  });

  console.log("[CacheCleanup Worker]: Started - Runs daily at 3:00 AM");
};
