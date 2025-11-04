import ProductCache from "../model/productCache.model.js";
import {
  fetchStoreReviews,
  formatReview,
} from "../../bundles/services/reviews.service.js";

/**
 * Calculate relative time ago in Arabic
 */
const calculateTimeAgo = (dateString) => {
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
};

/**
 * Get cached reviews for a product
 * If cache expired or doesn't exist, fetch from Salla API and cache it
 */
export const getCachedReviews = async (store_id, product_id, accessToken) => {
  try {
    const cachedData = await ProductCache.findOne({ store_id, product_id });

    if (cachedData && cachedData.cache_expiry > new Date()) {
      console.log(
        `[ProductCache]: Using cached reviews for product ${product_id}`
      );

      cachedData.fetch_count += 1;
      await cachedData.save();

      return {
        success: true,
        data: cachedData.cached_reviews,
        fromCache: true,
        lastFetched: cachedData.last_fetched,
      };
    }

    const reviewsResult = await fetchStoreReviews(accessToken, {
      type: "rating",
      is_published: true,
      per_page: 15,
      product_id: product_id,
    });

    const formattedReviews = reviewsResult.data.map((review) => ({
      id: review.id || null,
      rating: review.rating || 5,
      content: review.comment || review.content || "",
      customerName: review.author?.name || review.customer?.name || "عميل",
      customerAvatar: review.author?.avatar || review.customer?.avatar || null,
      customerCity: review.customer?.city || null,
      createdAt: review.created_at || new Date().toISOString(),
      timeAgo: calculateTimeAgo(review.created_at),
    }));

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

    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
};

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
