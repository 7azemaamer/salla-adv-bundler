import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    store_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Salla theme selector for proper element targeting
    salla_theme: {
      type: String,
      enum: ["basic", "raed", "wathiq", "on-demand"],
      default: "basic",
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
    // Hide coupon section in modal (both desktop and mobile)
    hide_coupon_section: {
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
      // Desktop width (used when width_type is "custom")
      desktop_width: {
        type: Number,
        default: 250,
        min: 100,
      },
      // Mobile width
      mobile_width: {
        type: Number,
        default: 250,
        min: 100,
      },
      // Desktop positioning
      desktop_bottom: {
        type: Number,
        default: 20,
        min: 0,
        max: 200,
      },
      desktop_left: {
        type: Number,
        default: 20,
        min: 0,
        max: 500,
      },
      desktop_right: {
        type: Number,
        default: 20,
        min: 0,
        max: 500,
      },
      // Mobile positioning
      mobile_bottom: {
        type: Number,
        default: 20,
        min: 0,
        max: 200,
      },
      mobile_left: {
        type: Number,
        default: 20,
        min: 0,
        max: 200,
      },
      mobile_right: {
        type: Number,
        default: 20,
        min: 0,
        max: 200,
      },
      // Border radius
      border_radius: {
        type: Number,
        default: 12,
        min: 0,
        max: 50,
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
      motivation_0_25: {
        type: String,
        default: " ابدأ رحلتك نحو الشحن المجاني!",
      },
      motivation_25_50: {
        type: String,
        default: " أحسنت! واصل التقدم...",
      },
      motivation_50_75: {
        type: String,
        default: "رائع! اقتربت جداً من الهدف!",
      },
      motivation_75_100: {
        type: String,
        default: " ممتاز! خطوة أخيرة فقط!",
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
      show_in_step: {
        type: String,
        enum: [
          "bundles",
          "target_variants",
          "free_gifts",
          "discounted",
          "review",
          "all",
        ],
        default: "review", // Show free shipping in review step by default
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
      show_in_step: {
        type: String,
        enum: [
          "bundles",
          "target_variants",
          "free_gifts",
          "discounted",
          "review",
          "all",
        ],
        default: "bundles", // Show timer in bundle selection step by default
      },
    },
    // Review count settings (nested object)
    review_count: {
      enabled: {
        type: Boolean,
        default: true,
      },
      show_in_step: {
        type: String,
        enum: [
          "bundles",
          "target_variants",
          "free_gifts",
          "discounted",
          "review",
          "all",
        ],
        default: "bundles", // Show reviews in bundle selection step by default
      },
      mode: {
        type: String,
        enum: ["real", "custom"],
        default: "real", // "real" = show actual review count, "custom" = use custom number
      },
      initial_count: {
        type: Number,
        default: 150,
        min: 0,
      },
      current_count: {
        type: Number,
        default: 150, // This will be updated daily
        min: 0,
      },
      daily_increase_min: {
        type: Number,
        default: 1,
        min: 0,
        max: 100,
      },
      daily_increase_max: {
        type: Number,
        default: 5,
        min: 0,
        max: 100,
      },
      last_update_date: {
        type: Date,
        default: Date.now,
      },
    },
    review_date_randomizer: {
      enabled: {
        type: Boolean,
        default: false,
      },
      presets: {
        type: [String],
        default: () => [
          "قبل يوم",
          "قبل يومين",
          "قبل 3 أيام",
          "قبل 5 أيام",
          "منذ أسبوع",
          "منذ 10 أيام",
          "منذ أسبوعين",
          "منذ 3 أسابيع",
          "منذ شهر",
          "منذ شهر ونصف",
        ],
      },
      hide_real_reviews: {
        type: Boolean,
        default: false,
      },
    },
    review_display: {
      hide_dates: {
        type: Boolean,
        default: false,
      },
      hide_ratings: {
        type: Boolean,
        default: false,
      },
      hide_names: {
        type: Boolean,
        default: false,
      },
      hide_avatars: {
        type: Boolean,
        default: false,
      },
    },
    // Custom reviews (array of review objects)
    custom_reviews: {
      type: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          is_verified: {
            type: Boolean,
            default: false, // "قام بالشراء والتقييم"
          },
          date_text: {
            type: String,
            default: "قبل يومين", // e.g., "قبل يومين", "منذ أسبوع"
          },
          stars: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
          },
          gender: {
            type: String,
            enum: ["male", "female"],
            required: true,
          },
          comment: {
            type: String,
            default: "",
          },
          created_at: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    // Custom CSS selectors to hide (array of strings)
    custom_hide_selectors: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.every(
            (selector) =>
              typeof selector === "string" && selector.trim().length > 0
          );
        },
        message: "Each selector must be a non-empty string",
      },
    },
    // Payment methods display settings
    show_payment_methods: {
      type: Boolean,
      default: true, // Show payment methods bar by default
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
