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
    merchant_email: String, // Merchant's email from Salla store info
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
    // Dashboard login credentials
    email: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't include password in queries by default
    },
    first_login_completed: {
      type: Boolean,
      default: false,
    },
    // Secure setup token (generated on install)
    setup_token: {
      type: String,
      unique: true,
      sparse: true, // Allow null, but if set, must be unique
    },
    // Password reset code (6-digit)
    reset_code: {
      type: String,
      select: false,
    },
    reset_code_expires: {
      type: Date,
      select: false,
    },
    // Bundle system fields
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
    // Cached payment methods
    payment_methods: {
      type: Array,
      default: [],
    },
    payment_methods_updated_at: {
      type: Date,
    },
    // Track store status for bundle system
    status: {
      type: String,
      enum: ["active", "inactive", "uninstalled", "needs_reauth"],
      default: "active",
    },
    // Soft deletion flag
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

// Pre-save middleware to set bundle limits based on plan
StoreSchema.pre("save", function (next) {
  // Set max_bundles_per_store based on plan
  if (
    this.plan &&
    (!this.bundle_settings || !this.bundle_settings.max_bundles_per_store)
  ) {
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
StoreSchema.methods.getBundleLimit = function () {
  if (this.bundle_settings && this.bundle_settings.max_bundles_per_store) {
    return this.bundle_settings.max_bundles_per_store;
  }

  // Fallback based on plan
  switch (this.plan) {
    case "basic":
      return 3;
    case "pro":
      return 10;
    case "enterprise":
      return 50;
    case "special":
      return 100;
    default:
      return 3;
  }
};

const Store = mongoose.model("Store", StoreSchema);
export default Store;
