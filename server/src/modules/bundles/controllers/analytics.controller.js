import { asyncWrapper } from "../../../utils/errorHandler.js";
import bundleAnalyticsService from "../services/bundleAnalytics.service.js";
import Store from "../../stores/model/store.model.js";

/**
 * Get monthly analytics for a specific bundle
 * GET /bundles/:bundle_id/analytics?year=2025&month=11
 */
export const getBundleMonthlyAnalytics = asyncWrapper(async (req, res) => {
  const { bundle_id } = req.params;
  const store_id = req.user?.store_id;

  // Parse year and month from query (default to current month if not provided)
  const now = new Date();
  const year = req.query.year ? parseInt(req.query.year) : now.getUTCFullYear();
  const month = req.query.month
    ? parseInt(req.query.month)
    : now.getUTCMonth() + 1;

  const analytics = await bundleAnalyticsService.getMonthlyAnalytics(
    bundle_id,
    year,
    month
  );

  // Return empty data instead of 404 if no analytics exist yet
  if (!analytics) {
    return res.status(200).json({
      success: true,
      data: {
        bundle_id,
        year,
        month,
        views: 0,
        unique_visitor_count: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        overall_conversion_rate: 0,
        tier_stats: [],
        period: `${year}-${String(month).padStart(2, "0")}`,
        plan_limit: null,
      },
    });
  }

  // Get plan limit for context
  let planLimit = null;
  if (store_id) {
    const store = await Store.findOne({ store_id });
    if (store) {
      planLimit = store.getMonthlyViewLimit();
    }
  }

  res.status(200).json({
    success: true,
    data: {
      ...analytics,
      unique_visitor_count: analytics.unique_visitors?.length || 0,
      unique_visitors: undefined, // Remove IP array from response for privacy
      period: `${year}-${String(month).padStart(2, "0")}`,
      plan_limit: planLimit,
    },
  });
});

/**
 * Get analytics history for a bundle (all months)
 * GET /bundles/:bundle_id/analytics/history?limit=12
 */
export const getBundleAnalyticsHistory = asyncWrapper(async (req, res) => {
  const { bundle_id } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  const history = await bundleAnalyticsService.getBundleHistory(
    bundle_id,
    limit
  );

  // Remove IP arrays from response for privacy
  const sanitizedHistory = history.map((record) => ({
    ...record,
    unique_visitors: undefined,
  }));

  res.status(200).json({
    success: true,
    data: sanitizedHistory,
    count: sanitizedHistory.length,
  });
});

/**
 * Get aggregated analytics stats for a bundle (all-time)
 * GET /bundles/:bundle_id/analytics/aggregated
 */
export const getBundleAggregatedStats = asyncWrapper(async (req, res) => {
  const { bundle_id } = req.params;
  const days = req.query.days ? parseInt(req.query.days) : null;

  const stats = await bundleAnalyticsService.getBundleAggregatedStats(
    bundle_id,
    days
  );

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * Get tier performance analytics for a bundle
 * GET /bundles/:bundle_id/analytics/tiers?year=2025&month=11
 */
export const getBundleTierPerformance = asyncWrapper(async (req, res) => {
  const { bundle_id } = req.params;
  const year = req.query.year ? parseInt(req.query.year) : null;
  const month = req.query.month ? parseInt(req.query.month) : null;

  const tierPerformance = await bundleAnalyticsService.getTierPerformance(
    bundle_id,
    year,
    month
  );

  res.status(200).json({
    success: true,
    data: tierPerformance,
  });
});

/**
 * Get current month analytics for all bundles in a store
 * GET /analytics/store/current
 */
export const getStoreCurrentMonthAnalytics = asyncWrapper(async (req, res) => {
  const store_id = req.user?.store_id;

  if (!store_id) {
    return res.status(400).json({
      success: false,
      message: "Store ID is required",
    });
  }

  const analytics = await bundleAnalyticsService.getStoreCurrentMonthAnalytics(
    store_id
  );

  // Remove IP arrays from response
  const sanitizedAnalytics = analytics.map((record) => ({
    ...record,
    unique_visitors: undefined,
  }));

  // Get plan limit
  const store = await Store.findOne({ store_id });
  const planLimit = store ? store.getMonthlyViewLimit() : null;

  // Calculate total views for the store this month
  const totalViews = sanitizedAnalytics.reduce(
    (sum, record) => sum + record.views,
    0
  );

  res.status(200).json({
    success: true,
    data: sanitizedAnalytics,
    summary: {
      total_views: totalViews,
      plan_limit: planLimit,
      usage_percentage: planLimit
        ? ((totalViews / planLimit) * 100).toFixed(2)
        : null,
      bundles_tracked: sanitizedAnalytics.length,
    },
  });
});

/**
 * Get aggregated analytics for the entire store
 * GET /analytics/store/aggregated?days=30
 */
export const getStoreAggregatedStats = asyncWrapper(async (req, res) => {
  const store_id = req.user?.store_id;
  const days = req.query.days ? parseInt(req.query.days) : null;

  if (!store_id) {
    return res.status(400).json({
      success: false,
      message: "Store ID is required",
    });
  }

  const stats = await bundleAnalyticsService.getStoreAggregatedStats(
    store_id,
    days
  );

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * Get trending bundles for a store (current month, sorted by views)
 * GET /analytics/store/trending?limit=10
 */
export const getStoreTrendingBundles = asyncWrapper(async (req, res) => {
  const store_id = req.user?.store_id;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;

  if (!store_id) {
    return res.status(400).json({
      success: false,
      message: "Store ID is required",
    });
  }

  const trending = await bundleAnalyticsService.getTrendingBundles(
    store_id,
    limit
  );

  // Remove IP arrays from response
  const sanitizedTrending = trending.map((record) => ({
    ...record,
    unique_visitors: undefined,
  }));

  res.status(200).json({
    success: true,
    data: sanitizedTrending,
  });
});
