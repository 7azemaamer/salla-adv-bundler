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
    // Hide quantity input section (parent section of salla-quantity-input) for target product
    hide_quantity_input: {
      type: Boolean,
      default: false,
    },
    // Hide price section (price-wrapper and related elements) inside product-form
    hide_price_section: {
      type: Boolean,
      default: false,
    },
    // Sticky floating button settings (nested object)
    sticky_button: {
      enabled: {
        type: Boolean,
        default: false,
      },
      text: {
        type: String,
        default: " اطلب باقتك الآن",
      },
      bg_color: {
        type: String,
        default: "#10b981",
      },
      text_color: {
        type: String,
        default: "#ffffff",
      },
      position: {
        type: String,
        enum: ["bottom-left", "bottom-right", "bottom-center"],
        default: "bottom-center",
      },
      width_type: {
        type: String,
        enum: ["auto", "full", "custom"],
        default: "auto",
      },
      custom_width: {
        type: Number,
        default: 250,
        min: 100,
        max: 600,
      },
    },
    // Free shipping banner settings (nested object)
    free_shipping: {
      enabled: {
        type: Boolean,
        default: true,
      },
      mode: {
        type: String,
        enum: ["always", "min_price", "hidden"],
        default: "always",
      },
      min_price: {
        type: Number,
        default: 0,
        min: 0,
      },
      text: {
        type: String,
        default: "شحن مجاني لهذه الباقة",
      },
      progress_text: {
        type: String,
        default: "أضف {amount} ريال للحصول على شحن مجاني",
      },
      bg_color: {
        type: String,
        default: "#10b981",
      },
      text_color: {
        type: String,
        default: "#ffffff",
      },
      icon: {
        type: String,
        default: "🚚",
      },
      progress_color: {
        type: String,
        default: "#ffffff",
      },
      progress_bg_color: {
        type: String,
        default: "rgba(255, 255, 255, 0.3)",
      },
      border_radius: {
        type: Number,
        default: 12,
        min: 0,
        max: 50,
      },
    },
    // Timer settings (nested object)
    timer: {
      enabled: {
        type: Boolean,
        default: true,
      },
      duration: {
        type: Number,
        default: 21600, // 6 hours in seconds
        min: 300,
        max: 86400,
      },
      duration_type: {
        type: String,
        enum: ["custom", "6h", "12h", "24h"],
        default: "6h",
      },
      auto_restart: {
        type: Boolean,
        default: true,
      },
      effect: {
        type: String,
        enum: ["none", "pulse", "glow"],
        default: "pulse",
      },
      text_color: {
        type: String,
        default: "#0E1012",
      },
      bg_color: {
        type: String,
        default: "#FFFFFF",
      },
      border_color: {
        type: String,
        default: "#E5E8EC",
      },
      border_radius: {
        type: Number,
        default: 12,
        min: 0,
        max: 50,
      },
      label: {
        type: String,
        default: "عرض محدود ينتهي خلال",
      },
      label_color: {
        type: String,
        default: "#60646C",
      },
      font_size: {
        type: Number,
        default: 14,
        min: 10,
        max: 24,
      },
    },
    // Future settings can be added here
    // e.g., custom_colors, etc.
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
