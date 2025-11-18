import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Store from "../src/modules/stores/model/store.model.js";
import { fetchPaymentMethods } from "../src/modules/bundles/services/payment.service.js";

const MONGODB_URI = process.env.MONGO_URI;

async function fetchAllPayments() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully\n");

    const stores = await Store.find({
      status: "active",
      is_deleted: { $ne: true },
      access_token: { $exists: true, $ne: null },
    }).select("store_id name domain access_token payment_methods_updated_at");

    console.log(`Found ${stores.length} active stores\n`);

    if (stores.length === 0) {
      console.log("No active stores found");
      return;
    }

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    for (const store of stores) {
      console.log(`\n Processing store: ${store.name} (${store.store_id})`);
      console.log(`   Domain: ${store.domain || "N/A"}`);
      console.log(
        `   Last Updated: ${
          store.payment_methods_updated_at
            ? store.payment_methods_updated_at.toLocaleString()
            : "Never"
        }`
      );

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("\n" + "=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Stores:    ${stores.length}`);
    console.log(`Successful:   ${successCount}`);
    console.log(`Failed:       ${failureCount}`);
    console.log("=".repeat(60));

    if (results.length > 0) {
      console.log("\n               DETAILED RESULTS:");
      results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.name} (${result.store_id})`);
        console.log(`   Status: ${result.status.toUpperCase()}`);
        if (result.methods_count) {
          console.log(`   Methods: ${result.methods_count}`);
          console.log(`   ${result.methods}`);
        }
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      });
    }

    console.log("\n✅ Script completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Script error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  }
}

// Run the script
fetchAllPayments();
