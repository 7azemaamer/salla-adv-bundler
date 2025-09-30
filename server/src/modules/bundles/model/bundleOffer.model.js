import mongoose from "mongoose";

const BundleOfferSchema = new mongoose.Schema(
  {
    bundle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BundleConfig",
      required: true,
      index: true,
    },
    store_id: {
      type: String,
      required: true,
      index: true,
    },
    offer_id: {
      type: String,
      required: true,
      unique: true, // Salla Special Offer ID must be unique
    },
    tier: {
      type: Number,
      required: true,
      min: 1,
    },
    gift_product_id: {
      type: String,
      required: true,
    },
    gift_product_name: {
      type: String,
      trim: true,
    },
    buy_quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    gift_quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    // Enhanced discount tracking
    discount_type: {
      type: String,
      enum: ["percentage", "fixed_amount", "free"],
      default: "free",
    },
    discount_amount: {
      type: Number,
      default: 100,
    },
    offer_type: {
      type: String,
      enum: ["gift", "discounted_product", "additional_product"],
      default: "gift",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted", "failed"],
      default: "active",
      index: true,
    },
    // Salla API response data
    salla_response: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Offer configuration from Salla
    offer_config: {
      name: String,
      message: String,
      start_date: Date,
      expiry_date: Date,
      applied_channel: String,
      offer_type: String,
      applied_to: String,
    },
    // Tracking fields
    last_sync_at: {
      type: Date,
    },
    sync_status: {
      type: String,
      enum: ["pending", "synced", "failed"],
      default: "pending",
    },
    error_message: {
      type: String,
    },
    // Performance tracking
    usage_count: {
      type: Number,
      default: 0,
    },
    revenue_generated: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
BundleOfferSchema.index({ bundle_id: 1, status: 1 });
BundleOfferSchema.index({ store_id: 1, status: 1 });
BundleOfferSchema.index({ offer_id: 1 });
BundleOfferSchema.index({ gift_product_id: 1 });
BundleOfferSchema.index({ tier: 1, buy_quantity: 1 });
BundleOfferSchema.index({ created_at: -1 });

// Static method to find offers by bundle
BundleOfferSchema.statics.findByBundle = function (bundle_id) {
  return this.find({ bundle_id }).populate("bundle_id");
};

// Static method to find active offers for a store
BundleOfferSchema.statics.findActiveByStore = function (store_id) {
  return this.find({
    store_id,
    status: "active",
  }).populate("bundle_id");
};

// Static method to find offers by tier
BundleOfferSchema.statics.findByTier = function (bundle_id, tier) {
  return this.find({
    bundle_id,
    tier,
    status: "active",
  });
};

// Instance method to update sync status
BundleOfferSchema.methods.updateSyncStatus = function (status, error = null) {
  this.sync_status = status;
  this.last_sync_at = new Date();
  if (error) {
    this.error_message = error;
  }
  return this.save();
};

// Instance method to track usage
BundleOfferSchema.methods.trackUsage = function (revenue = 0) {
  this.usage_count += 1;
  this.revenue_generated += revenue;
  return this.save();
};

// Virtual to get offer performance
BundleOfferSchema.virtual("performance").get(function () {
  return {
    usage_count: this.usage_count,
    revenue_generated: this.revenue_generated,
    last_used: this.updatedAt,
    days_active: Math.ceil(
      (new Date() - this.createdAt) / (1000 * 60 * 60 * 24)
    ),
  };
});

// Pre-remove middleware to cleanup related data
BundleOfferSchema.pre("deleteOne", { document: true }, async function () {
  // Here you could add logic to deactivate the offer in Salla
  console.log(`Preparing to delete offer: ${this.offer_id}`);
});

// Static method to cleanup failed offers
BundleOfferSchema.statics.cleanupFailedOffers = function (olderThanDays = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  return this.deleteMany({
    status: "failed",
    createdAt: { $lt: cutoffDate },
  });
};

const BundleOffer = mongoose.model("BundleOffer", BundleOfferSchema);
export default BundleOffer;
