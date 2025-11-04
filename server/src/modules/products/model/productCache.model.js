import mongoose from "mongoose";

/**
 * Product Cache Model
 * Stores cached product data including reviews to reduce Salla API calls
 */
const ProductCacheSchema = new mongoose.Schema(
  {
    store_id: {
      type: String,
      required: true,
      index: true,
    },
    product_id: {
      type: String,
      required: true,
      index: true,
    },
    // Cached product data
    product_name: {
      type: String,
      trim: true,
    },
    product_image: {
      type: String,
    },
    product_price: {
      type: Number,
    },
    // Cached reviews from Salla API (4-5 stars only)
    cached_reviews: [
      {
        id: String,
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          default: "",
        },
        is_verified: {
          type: Boolean,
          default: false,
        },
        avatar: {
          type: String,
          default: "",
        },
        date: {
          type: String,
          default: "",
        },
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Cache metadata
    last_fetched: {
      type: Date,
      default: Date.now,
    },
    cache_expiry: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    fetch_count: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster queries
ProductCacheSchema.index({ store_id: 1, product_id: 1 }, { unique: true });

// Index for cache expiry cleanup
ProductCacheSchema.index({ cache_expiry: 1 });

const ProductCache = mongoose.model("ProductCache", ProductCacheSchema);

export default ProductCache;
