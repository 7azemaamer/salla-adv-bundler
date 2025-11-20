import mongoose from "mongoose";

const planConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      enum: ["basic", "pro", "enterprise", "special"],
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    limits: {
      maxBundles: {
        type: Number,
        default: 1,
        min: 0,
      },
      monthlyViews: {
        type: Number,
        default: null, // null means unlimited
      },
    },
    features: {
      // Bundle styling features
      advancedBundleStyling: {
        type: Boolean,
        default: false,
      },
      stickyButton: {
        type: Boolean,
        default: false,
      },
      timer: {
        type: Boolean,
        default: false,
      },
      freeShipping: {
        type: Boolean,
        default: false,
      },
      couponControls: {
        type: Boolean,
        default: false,
      },
      customHideSelectors: {
        type: Boolean,
        default: false,
      },
      reviewsWidget: {
        type: Boolean,
        default: false,
      },
      announcement: {
        type: Boolean,
        default: false,
      },
      // Analytics features
      bundleAnalytics: {
        type: Boolean,
        default: false,
      },
      dashboardAnalytics: {
        type: Boolean,
        default: false,
      },
      conversionInsights: {
        type: Boolean,
        default: false,
      },
      bundlePerformance: {
        type: Boolean,
        default: false,
      },
      offerAnalytics: {
        type: Boolean,
        default: false,
      },
      productReviewsSection: {
        type: Boolean,
        default: false,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "SAR",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
planConfigSchema.index({ key: 1 });
planConfigSchema.index({ isActive: 1 });

const PlanConfig = mongoose.model("PlanConfig", planConfigSchema);

export default PlanConfig;
