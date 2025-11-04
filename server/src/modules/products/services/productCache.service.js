import ProductCache from "../model/productCache.model.js";
import {
  fetchStoreReviews,
  formatReview,
} from "../../bundles/services/reviews.service.js";

/**
 * Get cached reviews for a product
 * If cache expired or doesn't exist, fetch from Salla API and cache it
 */
export const getCachedReviews = async (store_id, product_id, accessToken) => {
  try {
    // Check if we have cached reviews
    const cachedData = await ProductCache.findOne({ store_id, product_id });

    // If cache exists and not expired, return cached reviews
    if (cachedData && cachedData.cache_expiry > new Date()) {
      console.log(
        `[ProductCache]: Using cached reviews for product ${product_id}`
      );

      // Update fetch count
      cachedData.fetch_count += 1;
      await cachedData.save();

      return {
        success: true,
        data: cachedData.cached_reviews,
        fromCache: true,
        lastFetched: cachedData.last_fetched,
      };
    }

    // Cache expired or doesn't exist - fetch from Salla API
    console.log(
      `[ProductCache]: Fetching fresh reviews for product ${product_id}`
    );

    const reviewsResult = await fetchStoreReviews(accessToken, {
      type: "rating",
      is_published: true,
      per_page: 15,
      product_id: product_id, // Filter by product
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
      created_at: new Date(),
    }));

    // Update or create cache
    const cacheData = {
      store_id,
      product_id,
      cached_reviews: formattedReviews,
      last_fetched: new Date(),
      cache_expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      fetch_count: cachedData ? cachedData.fetch_count + 1 : 1,
    };

    await ProductCache.findOneAndUpdate({ store_id, product_id }, cacheData, {
      upsert: true,
      new: true,
    });

    console.log(
      `[ProductCache]: Cached ${formattedReviews.length} reviews for product ${product_id}`
    );

    return {
      success: true,
      data: formattedReviews,
      fromCache: false,
      lastFetched: new Date(),
    };
  } catch (error) {
    console.error(
      "[ProductCache]: Error getting cached reviews:",
      error.message
    );

    // On error, return cached data if available (even if expired)
    const cachedData = await ProductCache.findOne({ store_id, product_id });
    if (cachedData && cachedData.cached_reviews.length > 0) {
      console.log(`[ProductCache]: Returning expired cache due to error`);
      return {
        success: true,
        data: cachedData.cached_reviews,
        fromCache: true,
        lastFetched: cachedData.last_fetched,
        expired: true,
      };
    }

    // No cache available, return empty
    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
};

/**
 * Invalidate cache for a product (force refresh on next request)
 */
export const invalidateProductCache = async (store_id, product_id) => {
  try {
    await ProductCache.findOneAndUpdate(
      { store_id, product_id },
      { cache_expiry: new Date(0) } // Set expiry to past
    );
    console.log(`[ProductCache]: Invalidated cache for product ${product_id}`);
    return true;
  } catch (error) {
    console.error("[ProductCache]: Error invalidating cache:", error.message);
    return false;
  }
};

/**
 * Clear all expired cache entries
 */
export const cleanupExpiredCache = async () => {
  try {
    const result = await ProductCache.deleteMany({
      cache_expiry: { $lt: new Date() },
    });
    console.log(
      `[ProductCache]: Cleaned up ${result.deletedCount} expired cache entries`
    );
    return result.deletedCount;
  } catch (error) {
    console.error("[ProductCache]: Error cleaning up cache:", error.message);
    return 0;
  }
};
