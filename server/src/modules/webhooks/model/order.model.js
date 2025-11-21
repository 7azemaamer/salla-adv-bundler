import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    // Salla order identifiers
    order_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reference_id: {
      type: String,
      required: true,
    },
    store_id: {
      type: String,
      required: true,
      index: true,
    },
    // Order status
    status: {
      slug: String,
      name: String,
    },
    // Payment
    payment_method: String,
    currency: String,
    total_amount: {
      type: Number,
      required: true,
    },
    // Order date
    order_date: {
      type: Date,
      required: true,
    },
    // Customer info (minimal)
    customer: {
      id: String,
      name: String,
      email: String,
    },
    // Bundle items in this order
    bundle_items: [
      {
        bundle_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "BundleConfig",
          required: true,
        },
        bundle_name: String,
        tier_id: {
          type: Number,
          required: true,
        },
        tier_name: String,
        quantity: {
          type: Number,
          default: 1,
        },
        total_price: {
          type: Number,
          required: true,
        },
        // Store the product IDs that were part of this bundle purchase
        products: [
          {
            product_id: String,
            product_name: String,
            quantity: Number,
            price: Number,
          },
        ],
      },
    ],
    // Track if analytics have been updated
    analytics_processed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index for efficient store queries
OrderSchema.index({ store_id: 1, order_date: -1 });
OrderSchema.index({ analytics_processed: 1 });

const Order = mongoose.model("Order", OrderSchema);

export default Order;
