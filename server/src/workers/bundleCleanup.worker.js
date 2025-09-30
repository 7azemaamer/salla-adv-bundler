import cron from "node-cron";
import bundleService from "../modules/bundles/services/bundle.service.js";
import BundleOffer from "../modules/bundles/model/bundleOffer.model.js";

class BundleCleanupWorker {
  constructor() {
    this.isRunning = false;
  }

  /* ===============
   * Start the cleanup worker
   * ===============*/
  start() {
    console.log("[BundleCleanup]: Worker started");

    // Run every hour to check for expired bundles
    cron.schedule("0 * * * *", async () => {
      if (this.isRunning) {
        console.log("[BundleCleanup]: Previous cleanup still running, skipping");
        return;
      }

      this.isRunning = true;
      try {
        await this.cleanupExpiredBundles();
        await this.cleanupFailedOffers();
      } catch (error) {
        console.error("[BundleCleanup]: Cleanup failed:", error);
      } finally {
        this.isRunning = false;
      }
    });

    // Run cleanup once at startup (after 10 seconds)
    setTimeout(() => {
      this.runInitialCleanup();
    }, 10000);
  }

  /* ===============
   * Run initial cleanup on startup
   * ===============*/
  async runInitialCleanup() {
    console.log("[BundleCleanup]: Running initial cleanup");
    try {
      await this.cleanupExpiredBundles();
      await this.cleanupFailedOffers();
    } catch (error) {
      console.error("[BundleCleanup]: Initial cleanup failed:", error);
    }
  }

  /* ===============
   * Cleanup expired bundles
   * ===============*/
  async cleanupExpiredBundles() {
    try {
      const cleanedCount = await bundleService.cleanupExpiredBundles();
      if (cleanedCount > 0) {
        console.log(`[BundleCleanup]: Deactivated ${cleanedCount} expired bundles`);
      }
    } catch (error) {
      console.error("[BundleCleanup]: Failed to cleanup expired bundles:", error);
    }
  }

  /* ===============
   * Cleanup failed offers (older than 7 days)
   * ===============*/
  async cleanupFailedOffers() {
    try {
      const result = await BundleOffer.cleanupFailedOffers(7);
      if (result.deletedCount > 0) {
        console.log(`[BundleCleanup]: Removed ${result.deletedCount} failed offers`);
      }
    } catch (error) {
      console.error("[BundleCleanup]: Failed to cleanup failed offers:", error);
    }
  }

  /* ===============
   * Stop the worker
   * ===============*/
  stop() {
    console.log("[BundleCleanup]: Worker stopped");
    // Note: node-cron doesn't provide a direct way to stop scheduled tasks
    // In a production environment, you might want to use a more sophisticated
    // job scheduler like Bull Queue or Agenda
  }
}

// Create and export worker instance
const bundleCleanupWorker = new BundleCleanupWorker();

// Auto-start the worker
bundleCleanupWorker.start();

export default bundleCleanupWorker;