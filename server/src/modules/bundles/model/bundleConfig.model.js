import mongoose from "mongoose";

const BundleConfigSchema = new mongoose.Schema(
  {
    store_id: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    target_product_id: {
      type: String,
      required: true,
    },
    target_product_name: {
      type: String,
      trim: true,
    },
    target_product_data: {
      id: String,
      name: String,
      price: Number,
      currency: { type: String, default: 'SAR' },
      image: String,
      sku: String,
      status: String,
      options: [mongoose.Schema.Types.Mixed], // Product variants/options
      variants: [mongoose.Schema.Types.Mixed], // Product variant combinations
      has_variants: { type: Boolean, default: false }
    },
    bundles: [
      {
        tier: {
          type: Number,
          required: true,
          min: 1,
          max: 10,
        },
        buy_quantity: {
          type: Number,
          required: true,
          min: 1,
          max: 20,
        },
        // Tier UI Customization
        tier_title: {
          type: String,
          trim: true,
          maxLength: 50,
          default: function() {
            return `المستوى ${this.tier}`;
          }
        },
        tier_highlight_text: {
          type: String,
          trim: true,
          maxLength: 30,
        },
        tier_bg_color: {
          type: String,
          trim: true,
          default: '#f8f9fa',
        },
        tier_text_color: {
          type: String,
          trim: true,
          default: '#212529',
        },
        tier_highlight_bg_color: {
          type: String,
          trim: true,
          default: '#ffc107',
        },
        tier_highlight_text_color: {
          type: String,
          trim: true,
          default: '#000000',
        },
        is_default: {
          type: Boolean,
          default: false,
        },
        offers: [
          {
            product_id: {
              type: String,
              required: true,
            },
            product_name: {
              type: String,
              trim: true,
            },
            quantity: {
              type: Number,
              default: 1,
              min: 1,
              max: 10,
            },
            // Discount configuration
            discount_type: {
              type: String,
              enum: ["percentage", "fixed_amount", "free"],
              required: true,
              default: "free",
            },
            discount_amount: {
              type: Number,
              required: true,
              min: 0,
              max: 100, // Max 100% or 100 SAR
              default: 100,
            },
            offer_type: {
              type: String,
              enum: ["gift", "discounted_product", "additional_product"],
              default: "gift",
            },
            arabic_message: {
              type: String,
              trim: true,
              maxLength: 200,
            },
            product_data: {
              id: String,
              name: String,
              price: Number,
              currency: { type: String, default: 'SAR' },
              image: String,
              sku: String,
              status: String,
              options: [mongoose.Schema.Types.Mixed], // Product variants/options
              variants: [mongoose.Schema.Types.Mixed], // Product variant combinations
              has_variants: { type: Boolean, default: false }
            },
          },
        ],
      },
    ],
    start_date: {
      type: Date,
      required: true,
    },
    expiry_date: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > this.start_date;
        },
        message: "Expiry date must be after start date",
      },
    },
    // Modal UI Customization
    modal_title: {
      type: String,
      trim: true,
      maxLength: 100,
      default: 'اختر باقتك',
    },
    modal_subtitle: {
      type: String,
      trim: true,
      maxLength: 150,
      default: '',
    },
    cta_button_text: {
      type: String,
      trim: true,
      maxLength: 50,
      default: 'اختر الباقة',
    },
    cta_button_bg_color: {
      type: String,
      trim: true,
      default: '#0066ff',
    },
    cta_button_text_color: {
      type: String,
      trim: true,
      default: '#ffffff',
    },
    config_hash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "expired"],
      default: "draft",
      index: true,
    },
    activated_at: {
      type: Date,
    },
    deactivated_at: {
      type: Date,
    },
    // Analytics and tracking
    total_views: {
      type: Number,
      default: 0,
    },
    total_clicks: {
      type: Number,
      default: 0,
    },
    total_conversions: {
      type: Number,
      default: 0,
    },
    total_revenue: {
      type: Number,
      default: 0,
    },
    // Store references for efficient querying
    offers_count: {
      type: Number,
      default: 0,
    },
    created_by: {
      type: String,
      default: "system",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
BundleConfigSchema.index({ store_id: 1, status: 1 });
BundleConfigSchema.index({ target_product_id: 1, status: 1 });
BundleConfigSchema.index({ config_hash: 1 });
BundleConfigSchema.index({ start_date: 1, expiry_date: 1 });
BundleConfigSchema.index({ created_at: -1 });

// Virtual to check if bundle is currently active
BundleConfigSchema.virtual("is_currently_active").get(function () {
  const now = new Date();
  return (
    this.status === "active" &&
    this.start_date <= now &&
    (!this.expiry_date || this.expiry_date >= now)
  );
});

// Instance method to calculate conversion rate
BundleConfigSchema.methods.getConversionRate = function () {
  if (this.total_clicks === 0) return 0;
  return ((this.total_conversions / this.total_clicks) * 100).toFixed(2);
};

// Static method to find bundles by product
BundleConfigSchema.statics.findByProduct = function (store_id, product_id) {
  return this.find({
    store_id,
    target_product_id: product_id,
    status: "active",
  });
};

// Static method to find active bundles for a store
BundleConfigSchema.statics.findActiveByStore = function (store_id) {
  const now = new Date();
  return this.find({
    store_id,
    status: "active",
    start_date: { $lte: now },
    $or: [{ expiry_date: { $gte: now } }, { expiry_date: null }],
  });
};

// Pre-save middleware to update status based on dates
BundleConfigSchema.pre("save", function (next) {
  const now = new Date();

  // Auto-expire bundles
  if (this.expiry_date && this.expiry_date < now && this.status === "active") {
    this.status = "expired";
    this.deactivated_at = now;
  }

  next();
});

const BundleConfig = mongoose.model("BundleConfig", BundleConfigSchema);
export default BundleConfig;
