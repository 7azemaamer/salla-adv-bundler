/**
 * Seed script to initialize plan configurations in database
 * Run: node server/src/scripts/seedPlans.js
 */
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../../../.env") });

import connectDB from "../src/db/connectDB.js";
import planConfigService from "../src/modules/admin/services/planConfig.service.js";

async function seedPlans() {
  try {
    console.log("🌱 Starting plan configuration seed...");

    // Connect to database
    await connectDB();
    console.log("✅ Database connected");

    // Initialize plans from templates
    const plans = await planConfigService.initializePlansFromTemplates();

    console.log(`✅ Initialized ${plans.length} plan configurations:`);
    plans.forEach((plan) => {
      console.log(`   - ${plan.key} (${plan.label})`);
      console.log(
        `     Max Bundles: ${plan.limits.maxBundles}, Monthly Views: ${
          plan.limits.monthlyViews || "Unlimited"
        }`
      );
      console.log(
        `     Features enabled: ${
          Object.values(plan.features).filter(Boolean).length
        }/${Object.keys(plan.features).length}`
      );
    });

    console.log("\n✅ Plan seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding plans:", error);
    process.exit(1);
  }
}

seedPlans();
