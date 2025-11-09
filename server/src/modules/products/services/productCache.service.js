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
export const getCachedReviews = async (
  store_id,
  product_id,
  accessToken,
  fetchLimit = 20
) => {
  try {
    const cachedData = await ProductCache.findOne({ store_id, product_id });

    if (cachedData && cachedData.cache_expiry > new Date()) {
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
      limit: fetchLimit, // Will fetch multiple pages if needed
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

/**
 * Update a specific cached review
 */
export const updateCachedReview = async (
  store_id,
  product_id,
  review_id,
  updates
) => {
  try {
    const cachedData = await ProductCache.findOne({ store_id, product_id });

    if (!cachedData) {
      return {
        success: false,
        message: "Product cache not found",
      };
    }

    // Convert review_id to number for consistent comparison
    const numericReviewId = Number(review_id);
    const reviewIndex = cachedData.cached_reviews.findIndex(
      (r) => r.id === numericReviewId
    );

    if (reviewIndex === -1) {
      return {
        success: false,
        message: "Review not found",
      };
    }

    // Update the review fields
    if (updates.customerName !== undefined) {
      cachedData.cached_reviews[reviewIndex].customerName =
        updates.customerName;
    }
    if (updates.rating !== undefined) {
      cachedData.cached_reviews[reviewIndex].rating = updates.rating;
    }
    if (updates.content !== undefined) {
      cachedData.cached_reviews[reviewIndex].content = updates.content;
    }
    if (updates.timeAgo !== undefined) {
      cachedData.cached_reviews[reviewIndex].timeAgo = updates.timeAgo;
    }

    // Mark as modified to ensure save works with nested arrays
    cachedData.markModified("cached_reviews");
    await cachedData.save();

    return {
      success: true,
      data: cachedData.cached_reviews[reviewIndex],
    };
  } catch (error) {
    console.error(
      "[ProductCache]: Error updating cached review:",
      error.message
    );
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Force fetch reviews from Salla API (bypasses cache completely)
 * Used for manual refetch operations
 */
export const forceFetchReviews = async (
  store_id,
  product_id,
  accessToken,
  fetchLimit = 20
) => {
  try {
    console.log(
      `[ForceFetch]: Requesting ${fetchLimit} reviews for product ${product_id}`
    );

    // Fetch directly from Salla API (multi-page fetch with date filter)
    const reviewsResult = await fetchStoreReviews(accessToken, {
      type: "rating",
      is_published: true,
      limit: fetchLimit, // Will fetch multiple pages if needed
      product_id: product_id,
    });

    console.log(
      `[ForceFetch]: Fetched ${
        reviewsResult.data?.length || 0
      } reviews (requested: ${fetchLimit})`
    );

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

    // Update cache with fresh data
    const cachedData = await ProductCache.findOne({ store_id, product_id });
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

    return {
      success: true,
      data: formattedReviews,
      fromCache: false,
      lastFetched: new Date(),
      source: "salla_api",
    };
  } catch (error) {
    console.error(
      "[ProductCache]: Error force fetching reviews:",
      error.message
    );

    // Try to return cached data as fallback
    const cachedData = await ProductCache.findOne({ store_id, product_id });
    if (cachedData && cachedData.cached_reviews.length > 0) {
      return {
        success: true,
        data: cachedData.cached_reviews,
        fromCache: true,
        lastFetched: cachedData.last_fetched,
        expired: true,
        error: error.message,
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
    return result.deletedCount;
  } catch (error) {
    console.error("[ProductCache]: Error cleaning up cache:", error.message);
    return 0;
  }
};
