#!/usr/bin/env node

/**
 * Test Token Refresh Script
 *
 * This script tests the token refresh functionality on a single store
 * before running the full force refresh.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Store from "../src/modules/stores/model/store.model.js";

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGO_URI;

async function testTokenRefresh() {
  console.log("🧪 Testing token refresh setup...\n");

  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully\n");
    // Check environment variables
    const clientKey = process.env.CLIENT_KEY;
    const clientSecret = process.env.CLIENT_SECRET_KEY;

    if (!clientKey || !clientSecret) {
      console.error("❌ Missing CLIENT_KEY or CLIENT_SECRET_KEY in .env file");
      process.exit(1);
    }

    console.log("✅ Environment variables found");

    // Test database connection
    const stores = await Store.find({
      is_deleted: false,
      refresh_token: { $exists: true, $ne: null }
    }).limit(1);

    if (stores.length === 0) {
      console.log("ℹ️  No stores found with refresh tokens in database");
      console.log("   Make sure your database is connected and stores exist");
      process.exit(1);
    }

    const testStore = stores[0];
    console.log(`✅ Database connection working`);
    console.log(`📊 Found test store: ${testStore.store_id} (${testStore.name || 'Unknown'})`);

    // Show store token status
    const expiresAt = testStore.access_token_expires_at ? new Date(testStore.access_token_expires_at) : null;
    const daysRemaining = expiresAt ? ((expiresAt - new Date()) / (1000 * 60 * 60 * 24)).toFixed(1) : 'Unknown';

    console.log(`🔑 Token status: ${testStore.status}`);
    console.log(`⏰ Token expires: ${expiresAt ? expiresAt.toLocaleString() : 'Unknown'} (${daysRemaining} days)`);
    console.log(`🔄 Has refresh token: ${testStore.refresh_token ? 'Yes' : 'No'}`);

    console.log("\n✅ All tests passed! You can now run the full refresh:");
    console.log("   npm run refresh-all-tokens");
    console.log("   or");
    console.log("   node scripts/forceRefreshAllTokens.js");

  } catch (error) {
    console.error("❌ Test failed:", error.message);

    if (error.message.includes('Mongo') || error.name === 'MongooseServerSelectionError') {
      console.log("\n💡 Make sure your MongoDB is running and connection string is correct in .env");
    }

    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

testTokenRefresh();