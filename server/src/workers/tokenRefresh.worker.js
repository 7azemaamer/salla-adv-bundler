import cron from "node-cron";
import Store from "../modules/stores/model/store.model.js";
import axios from "axios";
import { config } from "../config/env.js";

/**
 * Token Refresh Worker
 * Runs daily to check and refresh tokens that are close to expiring
 * Each store has its own refresh schedule based on token age
 * Refreshes tokens when they have 4 days or less remaining (tokens valid for 2 weeks)
 */

class TokenRefreshWorker {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Refresh access token for a single store
   */
  async refreshStoreToken(store) {
    try {
      if (!store.refresh_token) {
        console.warn(
          `[Token Refresh]: Store ${store.store_id} has no refresh_token, skipping`
        );
        return false;
      }

      console.log(
        `[Token Refresh]: Refreshing token for store ${store.store_id}`
      );

      const tokenData = new URLSearchParams();
      tokenData.append("grant_type", "refresh_token");
      tokenData.append("refresh_token", store.refresh_token);
      tokenData.append("client_id", config.clientKey);
      tokenData.append("client_secret", config.clientSecretKey);

      const response = await axios.post(
        "https://accounts.salla.sa/oauth2/token",
        tokenData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Update store with new tokens
      store.access_token = access_token;
      if (refresh_token) {
        store.refresh_token = refresh_token;
      }
      store.access_token_expires_at = new Date(Date.now() + expires_in * 1000);
      await store.save();

      console.log(
        `[Token Refresh]: ✅ Successfully refreshed token for store ${store.store_id}`
      );
      return true;
    } catch (error) {
      console.error(
        `[Token Refresh]: ❌ Failed to refresh token for store ${store.store_id}:`,
        error.response?.data || error.message
      );

      // If refresh token is invalid, mark store as needing re-authorization
      if (error.response?.status === 401 || error.response?.status === 400) {
        store.status = "needs_reauth";
        await store.save();
        console.error(
          `[Token Refresh]: Store ${store.store_id} marked as needs_reauth`
        );
      }

      return false;
    }
  }

  /**
   * Refresh tokens for stores that need it (10 days old or expiring soon)
   */
  async refreshAllTokens() {
    if (this.isRunning) {
      console.log("[Token Refresh]: Already running, skipping this cycle");
      return;
    }

    this.isRunning = true;
    console.log("[Token Refresh]: Starting token refresh check...");

    try {
      const now = new Date();
      const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000);

      // Find stores that need token refresh:
      // 1. Token was issued 10+ days ago (access_token_expires_at - 14 days <= 10 days ago)
      // 2. OR token expires in less than 4 days
      const fourDaysFromNow = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

      const stores = await Store.find({
        is_deleted: false,
        status: "active",
        refresh_token: { $exists: true, $ne: null },
        $or: [
          // Token expires soon (less than 4 days remaining)
          { access_token_expires_at: { $lt: fourDaysFromNow } },
          // Token is old (issued more than 10 days ago)
          {
            access_token_expires_at: {
              $lt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // Less than 4 days remaining
            },
          },
        ],
      });

      console.log(
        `[Token Refresh]: Found ${stores.length} stores with tokens needing refresh`
      );

      let successCount = 0;
      let failCount = 0;

      // Refresh tokens one by one to avoid rate limits
      for (const store of stores) {
        const expiresAt = new Date(store.access_token_expires_at);
        const daysRemaining = (expiresAt - now) / (1000 * 60 * 60 * 24);

        console.log(
          `[Token Refresh]: Store ${
            store.store_id
          } - Token expires in ${daysRemaining.toFixed(1)} days`
        );

        const success = await this.refreshStoreToken(store);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }

        // Small delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log(
        `[Token Refresh]: Check completed - Success: ${successCount}, Failed: ${failCount}, Skipped: ${
          stores.length - successCount - failCount
        }`
      );
    } catch (error) {
      console.error("[Token Refresh]: Job failed:", error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Start the cron job (runs daily to check which stores need token refresh)
   */
  start() {
    // Run daily at 3:00 AM to check which stores need token refresh
    // Each store is checked individually based on its token age
    // Cron format: minute hour day-of-month month day-of-week
    // "0 3 * * *" = At 3:00 AM every day
    cron.schedule("0 3 * * *", async () => {
      console.log("[Token Refresh]: Scheduled daily check triggered");
      await this.refreshAllTokens();
    });

    console.log(
      "[Token Refresh Worker]: ✅ Started - Runs daily at 3:00 AM to check tokens"
    );
    console.log(
      "[Token Refresh Worker]: Tokens are refreshed when they have 4 days or less remaining"
    );

    // Optional: Run once on startup for testing
    // Uncomment the line below to test immediately
    // this.refreshAllTokens();
  }

  /**
   * Manually trigger refresh for a specific store
   */
  async refreshSpecificStore(storeId) {
    const store = await Store.findOne({ store_id: storeId, is_deleted: false });
    if (!store) {
      throw new Error(`Store ${storeId} not found or deleted`);
    }
    return await this.refreshStoreToken(store);
  }
}

// Create singleton instance
const tokenRefreshWorker = new TokenRefreshWorker();

// Export for use in index.js
export const startTokenRefreshWorker = () => {
  tokenRefreshWorker.start();
};

export default tokenRefreshWorker;
