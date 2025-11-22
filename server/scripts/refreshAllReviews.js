import mongoose from "mongoose";
import ProductCache from "../src/modules/products/model/productCache.model.js";
import { getValidAccessToken } from "../src/utils/tokenHelper.js";
import { fetchStoreReviews } from "../src/modules/bundles/services/reviews.service.js";
import { config } from "dotenv";

// Load environment variables
config();

/**
 * Standalone script to manually refresh all cached product reviews
 * Usage: node scripts/refreshAllReviews.js
 */
async function refreshAllReviews() {
  try {
    console.log("=".repeat(80));
    console.log("🔄 Starting Manual Review Refresh...");
    console.log("=".repeat(80));

    // Connect to MongoDB
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/salla-bundles";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Get all cached products
    const cachedProducts = await ProductCache.find({});
    console.log(
      `📦 Found ${cachedProducts.length} cached products to refresh\n`
    );

    if (cachedProducts.length === 0) {
      console.log("ℹ️  No cached products found. Nothing to refresh.");
      await mongoose.disconnect();
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Refresh reviews for each product
    for (const [index, cache] of cachedProducts.entries()) {
      const { store_id, product_id } = cache;
      const progress = `[${index + 1}/${cachedProducts.length}]`;

      try {
        console.log(
          `${progress} Processing product ${product_id} (store: ${store_id})`
        );

        // Get access token for this store
        const accessToken = await getValidAccessToken(store_id);

        if (!accessToken) {
          console.warn(
            `  ⚠️  No access token for store ${store_id} - Skipping`
          );
          skippedCount++;
          continue;
        }

        // Fetch fresh reviews from Salla API
        const reviewsResult = await fetchStoreReviews(accessToken, {
          type: "rating",
          is_published: true,
          per_page: 15,
          product_id: product_id,
        });

        if (!reviewsResult.success || !reviewsResult.data) {
          console.warn(`  ⚠️  No reviews returned from Salla API - Skipping`);
          skippedCount++;
          continue;
        }

        // Format reviews for storage
        const formattedReviews = reviewsResult.data.map((review) => ({
          id: review.id || null,
          rating: review.rating || 5,
          content: review.comment || review.content || "",
          customerName: review.author?.name || review.customer?.name || "عميل",
          customerAvatar:
            review.author?.avatar || review.customer?.avatar || null,
          customerCity: review.customer?.city || null,
          createdAt: review.created_at || new Date().toISOString(),
          timeAgo: calculateTimeAgo(review.created_at),
          isManual: false, // Mark as Salla API review
        }));

        // Preserve existing manual reviews
        const existingManualReviews =
          cache.cached_reviews?.filter((r) => r.isManual) || [];

        // Merge manual reviews with new Salla reviews (manual reviews first)
        cache.cached_reviews = [...existingManualReviews, ...formattedReviews];
        cache.last_fetched = new Date();
        cache.cache_expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await cache.save();

        console.log(
          `  ✅ Updated ${formattedReviews.length} Salla reviews (${existingManualReviews.length} manual preserved)`
        );
        successCount++;

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (productError) {
        console.error(`  ❌ Error: ${productError.message}`);
        errorCount++;
      }

      // Add separator between products
      if (index < cachedProducts.length - 1) {
        console.log("");
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("📊 Refresh Summary:");
    console.log("=".repeat(80));
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⚠️  Skipped: ${skippedCount}`);
    console.log(`📦 Total: ${cachedProducts.length}`);
    console.log("=".repeat(80));

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    console.log("🎉 Review refresh completed!\n");
  } catch (error) {
    console.error("\n❌ Fatal Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Calculate relative time ago in Arabic
 */
function calculateTimeAgo(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffMs / 2592000000);

    if (diffMins < 60) {
      return `منذ ${diffMins} دقيقة`;
    } else if (diffHours < 24) {
      return `منذ ${diffHours} ساعة`;
    } else if (diffDays < 30) {
      return `منذ ${diffDays} يوم`;
    } else {
      return `منذ ${diffMonths} شهر`;
    }
  } catch (e) {
    return "قبل يومين";
  }
}

// Run the script
refreshAllReviews();
