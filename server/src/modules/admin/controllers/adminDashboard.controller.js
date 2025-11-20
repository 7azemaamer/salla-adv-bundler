import Store from "../../stores/model/store.model.js";
import BundleOffer from "../../bundles/model/bundleOffer.model.js";
import BundleConfig from "../../bundles/model/bundleConfig.model.js";
import WorkerStatus from "../model/workerStatus.model.js";

/**
 * Get analytics summary for admin dashboard
 */
export const getAnalyticsSummary = async (req, res) => {
  try {
    // Store metrics
    const totalStores = await Store.countDocuments();
    const activeStores = await Store.countDocuments({ status: "active" });
    const needsReauth = await Store.countDocuments({ status: "needs_reauth" });

    // Stores created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const createdLast30Days = await Store.countDocuments({
      installed_at: { $gte: thirtyDaysAgo },
    });

    // Plan breakdown
    const planBreakdown = await Store.aggregate([
      {
        $group: {
          _id: "$plan",
          count: { $sum: 1 },
        },
      },
    ]);

    const planBreakdownObj = {};
    planBreakdown.forEach((item) => {
      planBreakdownObj[item._id] = item.count;
    });

    // Bundle metrics (use BundleConfig for actual bundle configurations)
    const totalBundles = await BundleConfig.countDocuments();
    const activeBundles = await BundleConfig.countDocuments({
      status: "active",
    });

    // Aggregate bundle analytics
    const bundleStats = await BundleConfig.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$total_views" },
          totalClicks: { $sum: "$total_clicks" },
          totalConversions: { $sum: "$total_conversions" },
          totalRevenue: { $sum: "$total_revenue" },
        },
      },
    ]);

    const stats = bundleStats[0] || {
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0,
    };

    const conversionRate =
      stats.totalViews > 0
        ? ((stats.totalConversions / stats.totalViews) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        stores: {
          total: totalStores,
          active: activeStores,
          needsReauth,
          createdLast30Days,
          planBreakdown: planBreakdownObj,
        },
        bundles: {
          total: totalBundles,
          active: activeBundles,
          totalViews: stats.totalViews,
          totalClicks: stats.totalClicks,
          totalConversions: stats.totalConversions,
          totalRevenue: stats.totalRevenue,
          conversionRate: parseFloat(conversionRate),
        },
      },
    });
  } catch (error) {
    console.error("Get analytics summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics summary",
      error: error.message,
    });
  }
};

/**
 * Get worker status
 */
export const getWorkerStatus = async (req, res) => {
  try {
    const workers = await WorkerStatus.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: workers,
    });
  } catch (error) {
    console.error("Get worker status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch worker status",
      error: error.message,
    });
  }
};

/**
 * List bundles with filters
 */
export const listBundles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      is_active,
      store_id,
      search,
      sort = "-createdAt",
    } = req.query;

    const query = {};

    // Handle status filter (BundleConfig uses status enum)
    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status;
    }

    // Legacy support for is_active param (convert to status)
    if (is_active !== undefined) {
      query.status = is_active === "true" ? "active" : "inactive";
    }

    if (store_id) {
      query.store_id = store_id; // store_id is a String in both models
    }

    // Handle 'q' param (frontend uses 'q' for search)
    const searchTerm = search || req.query.q;
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bundles, total] = await Promise.all([
      BundleConfig.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      BundleConfig.countDocuments(query),
    ]);

    // Get unique store IDs
    const storeIds = [...new Set(bundles.map((b) => b.store_id))];

    // Fetch store data
    const stores = await Store.find({
      store_id: { $in: storeIds },
    }).lean();

    // Create store lookup map
    const storeMap = stores.reduce((acc, store) => {
      acc[store.store_id] = store;
      return acc;
    }, {});

    // Format bundles with status field, store data (analytics already flat in BundleConfig)
    const formattedBundles = bundles.map((bundle) => ({
      ...bundle,
      id: bundle._id,
      status: bundle.status || "draft",
      store: storeMap[bundle.store_id] || null,
      // Analytics fields are already flat in BundleConfig model
      total_views: bundle.total_views || 0,
      total_clicks: bundle.total_clicks || 0,
      total_conversions: bundle.total_conversions || 0,
      total_revenue: bundle.total_revenue || 0,
      // Rename timestamp fields
      created_at: bundle.createdAt,
      updated_at: bundle.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedBundles,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("List bundles error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list bundles",
      error: error.message,
    });
  }
};

/**
 * Get bundle detail
 */
export const getBundleDetail = async (req, res) => {
  try {
    const { bundleId } = req.params;

    const bundle = await BundleConfig.findById(bundleId).lean();

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
      });
    }

    // Fetch store information
    const store = await Store.findOne({ store_id: bundle.store_id }).lean();

    // Format bundle with status (analytics already flat in BundleConfig model)
    const formattedBundle = {
      ...bundle,
      id: bundle._id,
      status: bundle.status || "draft",
      // Analytics fields are already flat in model (total_views, total_clicks, etc.)
      total_views: bundle.total_views || 0,
      total_clicks: bundle.total_clicks || 0,
      total_conversions: bundle.total_conversions || 0,
      total_revenue: bundle.total_revenue || 0,
      // Rename timestamp fields
      created_at: bundle.createdAt,
      updated_at: bundle.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: {
        bundle: formattedBundle,
        store: store || null,
      },
    });
  } catch (error) {
    console.error("Get bundle detail error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bundle details",
      error: error.message,
    });
  }
};

/**
 * List stores with filters
 */
export const listStores = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      is_active,
      needs_reauth,
      plan,
      search,
      sort = "-createdAt",
    } = req.query;

    const query = {};

    // Handle status filter (frontend sends 'status' param)
    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status;
    }

    // Legacy support for is_active param (convert to status field)
    if (is_active !== undefined) {
      query.status = is_active === "true" ? "active" : "inactive";
    }

    // Legacy support for needs_reauth param
    if (needs_reauth !== undefined && needs_reauth === "true") {
      query.status = "needs_reauth";
    }

    if (plan && plan !== "all") {
      query.plan = plan;
    }

    // Handle 'q' param (frontend uses 'q' for search)
    const searchTerm = search || req.query.q;
    if (searchTerm) {
      const storeId = parseInt(searchTerm);
      if (!isNaN(storeId)) {
        query.$or = [
          { store_id: storeId },
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ];
      } else {
        query.$or = [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ];
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [stores, total] = await Promise.all([
      Store.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Store.countDocuments(query),
    ]);

    // Add bundle count for each store
    const storesWithBundles = await Promise.all(
      stores.map(async (store) => {
        const bundleStats = await BundleConfig.aggregate([
          { $match: { store_id: store.store_id } },
          {
            $group: {
              _id: null,
              totalBundles: { $sum: 1 },
              activeBundles: {
                $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
              },
            },
          },
        ]);

        return {
          ...store,
          id: store._id,
          status: store.status || "inactive",
          bundleStats: bundleStats[0] || {
            totalBundles: 0,
            activeBundles: 0,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      data: storesWithBundles,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("List stores error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list stores",
      error: error.message,
    });
  }
};

/**
 * Get store detail
 */
export const getStoreDetail = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findOne({ store_id: parseInt(storeId) });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Get bundle analytics for store
    const bundleStats = await BundleConfig.aggregate([
      { $match: { store_id: storeId } },
      {
        $group: {
          _id: null,
          totalBundles: { $sum: 1 },
          activeBundles: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          totalRevenue: { $sum: "$total_revenue" },
          totalConversions: { $sum: "$total_conversions" },
          totalClicks: { $sum: "$total_clicks" },
          totalViews: { $sum: "$total_views" },
        },
      },
    ]);

    const summary = bundleStats[0] || {
      totalBundles: 0,
      activeBundles: 0,
      totalRevenue: 0,
      totalConversions: 0,
      totalClicks: 0,
      totalViews: 0,
    };

    const conversionRate =
      summary.totalClicks > 0
        ? ((summary.totalConversions / summary.totalClicks) * 100).toFixed(2)
        : 0;

    const storeData = store.toObject();

    res.status(200).json({
      success: true,
      data: {
        store: {
          ...storeData,
          status: storeData.status || "inactive",
        },
        bundleSummary: {
          ...summary,
          conversionRate: parseFloat(conversionRate),
        },
      },
    });
  } catch (error) {
    console.error("Get store detail error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch store details",
      error: error.message,
    });
  }
};

/**
 * Update store
 */
export const updateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const updates = req.body;

    // Allowed fields to update
    const allowedUpdates = ["is_active", "plan", "needs_reauth"];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const store = await Store.findOneAndUpdate(
      { store_id: parseInt(storeId) },
      filteredUpdates,
      { new: true }
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Store updated successfully",
      data: store,
    });
  } catch (error) {
    console.error("Update store error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update store",
      error: error.message,
    });
  }
};

/**
 * Refresh store token
 */
export const refreshStoreToken = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findOne({ store_id: parseInt(storeId) });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    if (!store.refresh_token) {
      return res.status(400).json({
        success: false,
        message: "No refresh token available",
      });
    }

    // Import token helper
    const { refreshAccessToken } = await import(
      "../../../utils/tokenHelper.js"
    );

    try {
      await refreshAccessToken(store);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
      });
    } catch (refreshError) {
      res.status(400).json({
        success: false,
        message: "Token refresh failed",
        error: refreshError.message,
      });
    }
  } catch (error) {
    console.error("Refresh store token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh token",
      error: error.message,
    });
  }
};

/**
 * List subscriptions (placeholder - implement based on your subscription model)
 */
export const listSubscriptions = async (req, res) => {
  try {
    // Group stores by plan
    const subscriptions = await Store.aggregate([
      {
        $group: {
          _id: "$plan",
          count: { $sum: 1 },
          stores: {
            $push: {
              store_id: "$store_id",
              name: "$name",
              email: "$email",
              is_active: "$is_active",
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("List subscriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list subscriptions",
      error: error.message,
    });
  }
};

/**
 * List audit logs (placeholder - implement based on your audit log model)
 */
export const listAuditLogs = async (req, res) => {
  try {
    // TODO: Implement audit logging system
    res.status(200).json({
      success: true,
      data: [],
      message: "Audit logging not yet implemented",
    });
  } catch (error) {
    console.error("List audit logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list audit logs",
      error: error.message,
    });
  }
};
