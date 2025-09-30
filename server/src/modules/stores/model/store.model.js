import mongoose from "mongoose";

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
    plan: {
      type: String,
      enum: ["basic", "pro", "enterprise", "special"],
      default: "basic",
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
    // Bundle system fields
    bundles_enabled: {
      type: Boolean,
      default: true,
    },
    bundle_settings: {
      max_bundles_per_store: {
        type: Number,
        default: 3, // Default to basic plan limit
      },
      analytics_enabled: {
        type: Boolean,
        default: true,
      }
    },
    // Track store status for bundle system
    status: {
      type: String,
      enum: ["active", "inactive", "uninstalled"],
      default: "active",
    },
  },
  { timestamps: true }
);


// Pre-save middleware to set bundle limits based on plan
StoreSchema.pre("save", function (next) {
  // Set max_bundles_per_store based on plan
  if (this.plan && (!this.bundle_settings || !this.bundle_settings.max_bundles_per_store)) {
    if (!this.bundle_settings) {
      this.bundle_settings = {};
    }

    switch (this.plan) {
      case "basic":
        this.bundle_settings.max_bundles_per_store = 3;
        break;
      case "pro":
        this.bundle_settings.max_bundles_per_store = 10;
        break;
      case "enterprise":
        this.bundle_settings.max_bundles_per_store = 50;
        break;
      case "special":
        this.bundle_settings.max_bundles_per_store = 100;
        break;
      default:
        this.bundle_settings.max_bundles_per_store = 3;
    }
  }

  next();
});

// Instance method to get bundle limit
StoreSchema.methods.getBundleLimit = function() {
  if (this.bundle_settings && this.bundle_settings.max_bundles_per_store) {
    return this.bundle_settings.max_bundles_per_store;
  }

  // Fallback based on plan
  switch (this.plan) {
    case "basic": return 3;
    case "pro": return 10;
    case "enterprise": return 50;
    case "special": return 100;
    default: return 3;
  }
};

const Store = mongoose.model("Store", StoreSchema);
export default Store;
