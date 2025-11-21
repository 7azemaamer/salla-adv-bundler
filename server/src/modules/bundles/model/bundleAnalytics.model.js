import mongoose from "mongoose";

const BundleAnalyticsSchema = new mongoose.Schema(
  {
    bundle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BundleConfig",
      required: true,
      index: true,
      // Note: We keep this reference even if bundle is deleted for historical tracking
    },
    bundle_name: {
      type: String,
      required: true,
      // Store bundle name so we can display it even after deletion
    },
    store_id: {
      type: String,
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true,
    },
    // View tracking
    views: {
      type: Number,
      default: 0,
      // Total view count (all requests, including repeat visitors)
    },
    over_limit_views: {
      type: Number,
      default: 0,
      // Views that occurred after the monthly plan limit was reached
      // Helps merchants understand missed opportunities
    },
    unique_visitors: {
      type: [String],
      default: [],
      // Array of unique IP addresses for this month
      // We can calculate unique_visitor_count from this array length
    },
    // Conversion tracking
    clicks: {
      type: Number,
      default: 0,
    },
    conversions: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    // Tier-level analytics
    tier_stats: [
      {
        tier: {
          type: Number,
          required: true,
        },
        tier_name: {
          type: String,
          // Store tier name for historical display
        },
        selections: {
          type: Number,
          default: 0,
          // How many times this tier was selected
        },
        checkouts: {
          type: Number,
          default: 0,
          // How many times this tier led to checkout
        },
        conversion_rate: {
          type: Number,
          default: 0,
          // Calculated: (checkouts / bundle_views) * 100
        },
      },
    ],
    // Overall conversion rate for the month
    overall_conversion_rate: {
      type: Number,
      default: 0,
      // Calculated: (conversions / views) * 100
    },
  },
  { timestamps: true }
);

// Compound index for efficient monthly queries
BundleAnalyticsSchema.index(
  { bundle_id: 1, year: 1, month: 1 },
  { unique: true }
);
BundleAnalyticsSchema.index({ store_id: 1, year: 1, month: 1 });
BundleAnalyticsSchema.index({ year: 1, month: 1 });

// Virtual to get unique visitor count
BundleAnalyticsSchema.virtual("unique_visitor_count").get(function () {
  return this.unique_visitors ? this.unique_visitors.length : 0;
});

// Instance method to add unique visitor
BundleAnalyticsSchema.methods.addUniqueVisitor = function (ip) {
  if (!this.unique_visitors.includes(ip)) {
    this.unique_visitors.push(ip);
    return true; // New unique visitor
  }
  return false; // Already counted
};

// Instance method to recalculate conversion rates
BundleAnalyticsSchema.methods.recalculateRates = function () {
  // Overall conversion rate
  if (this.views > 0) {
    this.overall_conversion_rate = (
      (this.conversions / this.views) *
      100
    ).toFixed(2);
  } else {
    this.overall_conversion_rate = 0;
  }

  // Tier-level conversion rates
  if (this.tier_stats && this.tier_stats.length > 0) {
    this.tier_stats.forEach((tier) => {
      if (this.views > 0) {
        tier.conversion_rate = ((tier.checkouts / this.views) * 100).toFixed(2);
      } else {
        tier.conversion_rate = 0;
      }
    });
  }
};

// Static method to get or create monthly analytics record
BundleAnalyticsSchema.statics.getOrCreate = async function (
  bundle_id,
  bundle_name,
  store_id,
  year,
  month
) {
  let analytics = await this.findOne({ bundle_id, year, month });

  if (!analytics) {
    analytics = await this.create({
      bundle_id,
      bundle_name,
      store_id,
      year,
      month,
      views: 0,
      unique_visitors: [],
      clicks: 0,
      conversions: 0,
      revenue: 0,
      tier_stats: [],
      overall_conversion_rate: 0,
    });
  }

  return analytics;
};

// Static method to get all months for a bundle (ordered chronologically)
BundleAnalyticsSchema.statics.getBundleHistory = async function (bundle_id) {
  return this.find({ bundle_id }).sort({ year: -1, month: -1 }).lean();
};

// Static method to get store analytics for a month
BundleAnalyticsSchema.statics.getStoreMonthlyAnalytics = async function (
  store_id,
  year,
  month
) {
  return this.find({ store_id, year, month }).lean();
};

// Pre-save middleware to recalculate rates
BundleAnalyticsSchema.pre("save", function (next) {
  if (
    this.isModified("views") ||
    this.isModified("conversions") ||
    this.isModified("tier_stats")
  ) {
    this.recalculateRates();
  }
  next();
});

const BundleAnalytics = mongoose.model(
  "BundleAnalytics",
  BundleAnalyticsSchema
);
export default BundleAnalytics;
