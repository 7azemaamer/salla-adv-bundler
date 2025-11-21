import BundleAnalytics from "../model/bundleAnalytics.model.js";
import BundleConfig from "../model/bundleConfig.model.js";

class BundleAnalyticsService {
  /**
   * Get monthly analytics for a specific bundle
   */
  async getMonthlyAnalytics(bundle_id, year, month) {
    const analytics = await BundleAnalytics.findOne({
      bundle_id,
      year,
      month,
    }).lean();

    return analytics;
  }

  /**
   * Get current month analytics for a bundle
   */
  async getCurrentMonthAnalytics(bundle_id) {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    return this.getMonthlyAnalytics(bundle_id, year, month);
  }

  /**
   * Get all monthly analytics history for a bundle (sorted by date descending)
   */
  async getBundleHistory(bundle_id, limit = null) {
    let query = BundleAnalytics.find({ bundle_id }).sort({
      year: -1,
      month: -1,
    });

    if (limit) {
      query = query.limit(limit);
    }

    const history = await query.lean();

    // Enrich with calculated fields
    return history.map((record) => ({
      ...record,
      unique_visitor_count: record.unique_visitors?.length || 0,
      period: `${record.year}-${String(record.month).padStart(2, "0")}`,
      click_through_rate:
        record.views > 0
          ? ((record.clicks / record.views) * 100).toFixed(2)
          : 0,
    }));
  }

  /**
   * Get analytics for all bundles in a store for a specific month
   */
  async getStoreMonthlyAnalytics(store_id, year, month) {
    const analytics = await BundleAnalytics.find({
      store_id,
      year,
      month,
    })
      .sort({ views: -1 })
      .lean();

    // Enrich with calculated fields
    return analytics.map((record) => ({
      ...record,
      unique_visitor_count: record.unique_visitors?.length || 0,
      period: `${record.year}-${String(record.month).padStart(2, "0")}`,
      click_through_rate:
        record.views > 0
          ? ((record.clicks / record.views) * 100).toFixed(2)
          : 0,
    }));
  }

  /**
   * Get current month analytics for all bundles in a store
   */
  async getStoreCurrentMonthAnalytics(store_id) {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    return this.getStoreMonthlyAnalytics(store_id, year, month);
  }

  /**
   * Get aggregated analytics across all months for a bundle
   */
  async getBundleAggregatedStats(bundle_id, days = null) {
    const query = { bundle_id };

    // Add date range filter if days is specified
    if (days) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;

      query.$or = [];
      let currentYear = startYear;
      let currentMonth = startMonth;

      while (
        currentYear < endYear ||
        (currentYear === endYear && currentMonth <= endMonth)
      ) {
        query.$or.push({ year: currentYear, month: currentMonth });
        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
      }
    }

    const history = await BundleAnalytics.find(query).lean();

    if (history.length === 0) {
      return {
        total_views: 0,
        total_unique_visitors: 0,
        total_clicks: 0,
        total_conversions: 0,
        total_revenue: 0,
        average_conversion_rate: 0,
        months_tracked: 0,
      };
    }

    // Aggregate all unique IPs across all months (for lifetime unique visitors)
    const allUniqueIps = new Set();
    history.forEach((record) => {
      if (record.unique_visitors) {
        record.unique_visitors.forEach((ip) => allUniqueIps.add(ip));
      }
    });

    const totals = history.reduce(
      (acc, record) => ({
        views: acc.views + (record.views || 0),
        clicks: acc.clicks + (record.clicks || 0),
        conversions: acc.conversions + (record.conversions || 0),
        revenue: acc.revenue + (record.revenue || 0),
      }),
      { views: 0, clicks: 0, conversions: 0, revenue: 0 }
    );

    const avgConversionRate =
      totals.views > 0
        ? ((totals.conversions / totals.views) * 100).toFixed(2)
        : 0;

    return {
      total_views: totals.views,
      total_unique_visitors: allUniqueIps.size,
      total_clicks: totals.clicks,
      total_conversions: totals.conversions,
      total_revenue: totals.revenue,
      average_conversion_rate: parseFloat(avgConversionRate),
      months_tracked: history.length,
    };
  }

  /**
   * Get aggregated analytics for a store across all bundles and months
   */
  async getStoreAggregatedStats(store_id, days = null) {
    const query = { store_id };

    // Add date range filter if days is specified
    if (days) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Filter by year and month to match records within the date range
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;

      // Build date range query
      query.$or = [];
      let currentYear = startYear;
      let currentMonth = startMonth;

      while (
        currentYear < endYear ||
        (currentYear === endYear && currentMonth <= endMonth)
      ) {
        query.$or.push({ year: currentYear, month: currentMonth });
        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
      }
    }

    const history = await BundleAnalytics.find(query).lean();

    if (history.length === 0) {
      return {
        total_views: 0,
        total_unique_visitors: 0,
        total_clicks: 0,
        total_conversions: 0,
        total_revenue: 0,
        average_conversion_rate: 0,
        active_bundles: 0,
        months_tracked: 0,
      };
    }

    // Get unique bundle IDs
    const uniqueBundleIds = new Set(
      history.map((record) => record.bundle_id.toString())
    );

    // Aggregate all unique IPs across all records
    const allUniqueIps = new Set();
    history.forEach((record) => {
      if (record.unique_visitors) {
        record.unique_visitors.forEach((ip) => allUniqueIps.add(ip));
      }
    });

    const totals = history.reduce(
      (acc, record) => ({
        views: acc.views + (record.views || 0),
        clicks: acc.clicks + (record.clicks || 0),
        conversions: acc.conversions + (record.conversions || 0),
        revenue: acc.revenue + (record.revenue || 0),
      }),
      { views: 0, clicks: 0, conversions: 0, revenue: 0 }
    );

    const avgConversionRate =
      totals.views > 0
        ? ((totals.conversions / totals.views) * 100).toFixed(2)
        : 0;

    return {
      total_views: totals.views,
      total_unique_visitors: allUniqueIps.size,
      total_clicks: totals.clicks,
      total_conversions: totals.conversions,
      total_revenue: totals.revenue,
      average_conversion_rate: parseFloat(avgConversionRate),
      active_bundles: uniqueBundleIds.size,
      months_tracked: history.length,
    };
  }

  /**
   * Get tier performance analytics for a bundle
   */
  async getTierPerformance(bundle_id, year = null, month = null) {
    let query = { bundle_id };

    if (year && month) {
      query.year = year;
      query.month = month;
    }

    const analytics = await BundleAnalytics.find(query).lean();

    // Aggregate tier stats across all records
    const tierMap = new Map();

    analytics.forEach((record) => {
      if (record.tier_stats && record.tier_stats.length > 0) {
        record.tier_stats.forEach((tierStat) => {
          const key = tierStat.tier;
          if (!tierMap.has(key)) {
            tierMap.set(key, {
              tier: tierStat.tier,
              tier_name: tierStat.tier_name,
              total_selections: 0,
              total_checkouts: 0,
              total_views: 0,
            });
          }

          const existing = tierMap.get(key);
          existing.total_selections += tierStat.selections || 0;
          existing.total_checkouts += tierStat.checkouts || 0;
          existing.total_views += record.views || 0;
        });
      }
    });

    // Convert to array and calculate conversion rates
    const tierPerformance = Array.from(tierMap.values()).map((tier) => ({
      ...tier,
      conversion_rate:
        tier.total_views > 0
          ? ((tier.total_checkouts / tier.total_views) * 100).toFixed(2)
          : 0,
      selection_rate:
        tier.total_views > 0
          ? ((tier.total_selections / tier.total_views) * 100).toFixed(2)
          : 0,
    }));

    // Sort by total checkouts descending
    return tierPerformance.sort(
      (a, b) => b.total_checkouts - a.total_checkouts
    );
  }

  /**
   * Get trending bundles for a store in current month
   */
  async getTrendingBundles(store_id, limit = 10) {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    const analytics = await BundleAnalytics.find({
      store_id,
      year,
      month,
    })
      .sort({ views: -1 })
      .limit(limit)
      .lean();

    // Enrich with bundle details
    const bundleIds = analytics.map((a) => a.bundle_id);
    const bundles = await BundleConfig.find({
      _id: { $in: bundleIds },
    }).lean();

    const bundleMap = new Map(bundles.map((b) => [b._id.toString(), b]));

    return analytics.map((record) => ({
      ...record,
      unique_visitor_count: record.unique_visitors?.length || 0,
      bundle_details: bundleMap.get(record.bundle_id.toString()) || null,
    }));
  }
}

export default new BundleAnalyticsService();
