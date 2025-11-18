#!/usr/bin/env node

/**
 * Force Refresh All Salla Tokens Script
 *
 * This script forcefully refreshes ALL store tokens regardless of expiration time.
 * Use this when global issues (like Cloudflare outages) cause token invalidation.
 *
 * Usage: node scripts/forceRefreshAllTokens.js
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Store from "../src/modules/stores/model/store.model.js";
import axios from "axios";

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

class ForceTokenRefresher {
  constructor() {
    this.clientKey = process.env.CLIENT_KEY;
    this.clientSecret = process.env.CLIENT_SECRET_KEY;
    this.successCount = 0;
    this.failCount = 0;
    this.reauthCount = 0;
    this.results = [];
  }

  /**
   * Refresh token for a single store
   */
  async refreshStoreToken(store) {
    const startTime = Date.now();

    try {
      if (!store.refresh_token) {
        console.warn(`❌ Store ${store.store_id} (${store.name || 'Unknown'}): No refresh token available`);
        this.reauthCount++;
        this.results.push({
          store_id: store.store_id,
          name: store.name,
          status: 'no_refresh_token',
          error: 'No refresh token available'
        });
        return false;
      }

      console.log(`🔄 Refreshing token for store ${store.store_id} (${store.name || 'Unknown'})...`);

      const tokenData = new URLSearchParams();
      tokenData.append("grant_type", "refresh_token");
      tokenData.append("refresh_token", store.refresh_token);
      tokenData.append("client_id", this.clientKey);
      tokenData.append("client_secret", this.clientSecret);

      const response = await axios.post(
        "https://accounts.salla.sa/oauth2/token",
        tokenData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Update store with new tokens
      store.access_token = access_token;
      if (refresh_token) {
        store.refresh_token = refresh_token;
      }
      store.access_token_expires_at = new Date(Date.now() + expires_in * 1000);
      store.status = "active"; // Ensure store is marked as active
      await store.save();

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Store ${store.store_id}: Token refreshed successfully (${duration}s) - Expires: ${store.access_token_expires_at.toLocaleDateString()}`);

      this.successCount++;
      this.results.push({
        store_id: store.store_id,
        name: store.name,
        status: 'success',
        expires_at: store.access_token_expires_at,
        duration: `${duration}s`
      });

      return true;

    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      const errorDetails = error.response?.data || error.message;

      console.error(`❌ Store ${store.store_id}: Token refresh failed (${duration}s) -`, errorDetails);

      // If refresh token is invalid, mark store as needing re-authorization
      if (error.response?.status === 401 || error.response?.status === 400) {
        store.status = "needs_reauth";
        await store.save();
        this.reauthCount++;
        console.warn(`⚠️  Store ${store.store_id} marked as needing re-authorization`);
      }

      this.failCount++;
      this.results.push({
        store_id: store.store_id,
        name: store.name,
        status: 'failed',
        error: errorDetails,
        needs_reauth: error.response?.status === 401 || error.response?.status === 400,
        duration: `${duration}s`
      });

      return false;
    }
  }

  /**
   * Get all active stores and refresh their tokens
   */
  async refreshAllStoreTokens() {
    console.log("🚀 Starting force refresh of ALL Salla tokens...\n");

    try {
      // Get ALL stores with refresh tokens (regardless of expiration)
      const stores = await Store.find({
        is_deleted: false,
        refresh_token: { $exists: true, $ne: null }
      }).select('store_id name refresh_token access_token_expires_at status');

      console.log(`📊 Found ${stores.length} stores with refresh tokens\n`);

      if (stores.length === 0) {
        console.log("ℹ️  No stores found with refresh tokens");
        return;
      }

      // Display initial status
      console.log("📋 Initial Store Status:");
      stores.forEach(store => {
        const expiresAt = store.access_token_expires_at ? new Date(store.access_token_expires_at) : null;
        const daysRemaining = expiresAt ? ((expiresAt - new Date()) / (1000 * 60 * 60 * 24)).toFixed(1) : 'Unknown';
        console.log(`   • Store ${store.store_id} (${store.name || 'Unknown'}): ${store.status} - ${daysRemaining} days remaining`);
      });
      console.log("");

      // Process stores with delay to avoid rate limiting
      console.log("🔄 Starting token refresh process...\n");

      for (let i = 0; i < stores.length; i++) {
        const store = stores[i];
        console.log(`[${i + 1}/${stores.length}] Processing store...`);

        await this.refreshStoreToken(store);

        // Add delay between requests (1-2 seconds) to avoid rate limiting
        if (i < stores.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      // Final summary
      console.log("\n" + "=".repeat(80));
      console.log("📈 REFRESH SUMMARY");
      console.log("=".repeat(80));
      console.log(`✅ Successfully refreshed: ${this.successCount} stores`);
      console.log(`❌ Failed to refresh: ${this.failCount} stores`);
      console.log(`⚠️  Need re-authorization: ${this.reauthCount} stores`);
      console.log(`📊 Total processed: ${stores.length} stores`);

      // Show failed stores
      if (this.failCount > 0) {
        console.log("\n❌ Failed Stores:");
        this.results
          .filter(r => r.status === 'failed')
          .forEach(r => {
            console.log(`   • Store ${r.store_id} (${r.name}): ${r.error}`);
          });
      }

      // Show stores needing re-authorization
      if (this.reauthCount > 0) {
        console.log("\n⚠️  Stores Needing Re-authorization:");
        this.results
          .filter(r => r.needs_reauth || r.status === 'no_refresh_token')
          .forEach(r => {
            console.log(`   • Store ${r.store_id} (${r.name})`);
          });
      }

      // Save detailed results to file
      const resultsFile = `token-refresh-results-${new Date().toISOString().split('T')[0]}.json`;
      await import('fs').then(fs => {
        fs.writeFileSync(resultsFile, JSON.stringify({
          timestamp: new Date().toISOString(),
          summary: {
            total: stores.length,
            success: this.successCount,
            failed: this.failCount,
            needs_reauth: this.reauthCount
          },
          results: this.results
        }, null, 2));
        console.log(`\n💾 Detailed results saved to: ${resultsFile}`);
      });

    } catch (error) {
      console.error("💥 Script failed:", error);
      process.exit(1);
    }
  }

  /**
   * Test API connectivity before starting
   */
  async testConnectivity() {
    console.log("🔍 Testing API connectivity...");
    try {
      const response = await axios.get("https://api.salla.dev/admin/v2/store/info", {
        headers: {
          "Authorization": "Bearer test",
        },
        timeout: 10000
      });
    } catch (error) {
      // We expect this to fail with 401, but it confirms the API is reachable
      if (error.response?.status === 401) {
        console.log("✅ API connectivity confirmed");
        return true;
      } else {
        console.error("❌ API connectivity issue:", error.message);
        return false;
      }
    }
  }
}

// Main execution
async function main() {
  const refresher = new ForceTokenRefresher();

  // Check environment variables
  if (!refresher.clientKey || !refresher.clientSecret) {
    console.error("❌ Missing CLIENT_KEY or CLIENT_SECRET_KEY in environment variables");
    process.exit(1);
  }

  // Test connectivity
  const connectivityOk = await refresher.testConnectivity();
  if (!connectivityOk) {
    console.error("❌ Cannot proceed due to connectivity issues");
    process.exit(1);
  }

  // Start the refresh process
  await refresher.refreshAllStoreTokens();

  console.log("\n🎉 Force refresh completed!");

  // Exit with appropriate code
  if (refresher.failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default ForceTokenRefresher;