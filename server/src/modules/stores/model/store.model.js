import mongoose from "mongoose";
import { getPlanConfig } from "../constants/planConfig.js";

const StoreSchema = new mongoose.Schema(
  {
    store_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    domain: String,
    scope: String,
    avatar: String,
    description: String,
    merchant_email: String,
    plan: {
      type: String,
      enum: ["basic", "pro", "enterprise", "special"],
      default: "basic",
    },
    is_unlimited: {
      type: Boolean,
      default: false,
    },
    refresh_token: { type: String },
    access_token: {
      type: String,
      required: true,
    },
    access_token_expires_at: { type: Date },
    installed_at: {
      type: Date,
      default: Date.now,
    },
    json_path: {
      type: String,
    },
    email: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    first_login_completed: {
      type: Boolean,
      default: false,
    },
    setup_token: {
      type: String,
      unique: true,
      sparse: true,
    },
    reset_code: {
      type: String,
      select: false,
    },
    reset_code_expires: {
      type: Date,
      select: false,
    },
    bundles_enabled: {
      type: Boolean,
      default: true,
    },
    bundle_settings: {
      max_bundles_per_store: {
        type: Number,
        default: 3,
      },
      analytics_enabled: {
        type: Boolean,
        default: true,
      },
    },
    plan_usage: {
      monthly_views: {
        period: {
          type: String,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    },
    payment_methods: {
      type: Array,
      default: [],
    },
    payment_methods_updated_at: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "uninstalled", "needs_reauth"],
      default: "active",
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

StoreSchema.pre("save", function (next) {
  const planConfig = getPlanConfig(this.plan);

  if (!this.bundle_settings) {
    this.bundle_settings = {};
  }

  if (
    this.isNew ||
    this.isModified("plan") ||
    this.bundle_settings.max_bundles_per_store === undefined
  ) {
    this.bundle_settings.max_bundles_per_store = planConfig.limits.maxBundles;
  }

  if (
    this.isNew ||
    this.isModified("plan") ||
    this.bundle_settings.analytics_enabled === undefined
  ) {
    this.bundle_settings.analytics_enabled = Boolean(
      planConfig.features.bundleAnalytics
    );
  }

  next();
});

StoreSchema.methods.getBundleLimit = function () {
  if (this.is_unlimited) {
    return null;
  }
  const planConfig = getPlanConfig(this.plan);
  return planConfig.limits.maxBundles;
};

StoreSchema.methods.getPlanConfig = function () {
  return getPlanConfig(this.plan);
};

StoreSchema.methods.getMonthlyViewLimit = function () {
  if (this.is_unlimited) {
    return null;
  }
  const planConfig = this.getPlanConfig();
  return planConfig.limits.monthlyViews;
};

const Store = mongoose.model("Store", StoreSchema);
export default Store;
