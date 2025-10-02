import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    store_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Hide Salla default buttons on products with active bundles
    hide_default_buttons: {
      type: Boolean,
      default: false,
    },
    // Hide Salla default offer modal (salla-modal with s-offer-modal-type-products)
    hide_salla_offer_modal: {
      type: Boolean,
      default: false,
    },
    // Hide product options (salla-product-options) for target product when bundle offers are applied
    hide_product_options: {
      type: Boolean,
      default: false,
    },
    // Future settings can be added here
    // e.g., button_position, custom_colors, etc.
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
