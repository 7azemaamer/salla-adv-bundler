import cron from "node-cron";
import ProductCache from "../modules/products/model/productCache.model.js";
import { getValidAccessToken } from "../utils/tokenHelper.js";
import { fetchStoreReviews } from "../modules/bundles/services/reviews.service.js";

/**
 * Worker to refresh cached product reviews
 * Runs weekly on Sunday at 2 AM
 * Merges Salla API reviews with custom reviews from settings
 */
export const startReviewRefreshWorker = () => {
  // Run every Sunday at 2:00 AM
  cron.schedule("0 2 * * 0", async () => {
    console.log("[ReviewRefresh Worker]: Starting weekly review refresh...");

    try {
      // Get all cached products
      const cachedProducts = await ProductCache.find({});

      console.log(
        `[ReviewRefresh Worker]: Found ${cachedProducts.length} products to refresh`
      );

      let successCount = 0;
      let errorCount = 0;

      // Refresh reviews for each product
      for (const cache of cachedProducts) {
        try {
          const { store_id, product_id } = cache;

          // Get access token for this store
          const accessToken = await getValidAccessToken(store_id);

          if (!accessToken) {
            console.warn(
              `[ReviewRefresh Worker]: No access token for store ${store_id}`
            );
            errorCount++;
            continue;
          }

          // Fetch fresh reviews from Salla API
          const reviewsResult = await fetchStoreReviews(accessToken, {
            type: "rating",
            is_published: true,
            per_page: 20,
            product_id: product_id,
          });

          // Format reviews for storage
          const formattedReviews = reviewsResult.data.map((review) => ({
            id: review.id || null,
            name: review.author?.name || review.customer?.name || "عميل",
            rating: review.rating || 5,
            comment: review.comment || review.content || "",
            is_verified: review.is_verified || false,
            avatar: review.author?.avatar || review.customer?.avatar || "",
            date: review.created_at || new Date().toISOString(),
            created_at: new Date(review.created_at || Date.now()),
          }));

          // Update cache with fresh reviews
          cache.cached_reviews = formattedReviews;
          cache.last_fetched = new Date();
          cache.cache_expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
          await cache.save();

          console.log(
            `[ReviewRefresh Worker]: Refreshed ${formattedReviews.length} reviews for product ${product_id} (store: ${store_id})`
          );

          successCount++;

          // Add small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (productError) {
          console.error(
            `[ReviewRefresh Worker]: Error refreshing product ${cache.product_id}:`,
            productError.message
          );
          errorCount++;
        }
      }

      console.log(
        `[ReviewRefresh Worker]: Finished - Success: ${successCount}, Errors: ${errorCount}`
      );
    } catch (error) {
      console.error(
        "[ReviewRefresh Worker]: Error during review refresh:",
        error.message
      );
    }
  });

  console.log(
    "[ReviewRefresh Worker]: Started - Runs weekly on Sunday at 2:00 AM"
  );
};
