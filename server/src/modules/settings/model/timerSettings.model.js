import mongoose from "mongoose";

const timerSettingsSchema = new mongoose.Schema(
  {
    store_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Timer Configuration
    enabled: {
      type: Boolean,
      default: true,
    },

    duration: {
      type: Number,
      default: 21600, // 6 hours in seconds (6 * 60 * 60)
      min: 300, // 5 minutes minimum
      max: 86400, // 24 hours maximum
    },

    duration_type: {
      type: String,
      enum: ["custom", "6h", "12h", "24h"],
      default: "6h",
    },

    // Position Configuration
    position: {
      type: String,
      enum: ["header", "above_summary", "below_summary", "sticky_top"],
      default: "above_summary",
    },

    // Mobile specific position
    mobile_position: {
      type: String,
      enum: [
        "header",
        "above_summary",
        "below_summary",
        "sticky_top",
        "sticky_bottom",
      ],
      default: "sticky_top",
    },

    // Style Configuration
    style: {
      // Timer text/number color
      text_color: {
        type: String,
        default: "#0E1012", // dark text
      },

      // Background color
      bg_color: {
        type: String,
        default: "#FFFFFF", // white background
      },

      // Border color
      border_color: {
        type: String,
        default: "#E5E8EC", // subtle border
      },

      // Border radius
      border_radius: {
        type: Number,
        default: 12, // in pixels
        min: 0,
        max: 50,
      },

      // Label/description text
      label: {
        type: String,
        default: "عرض محدود ينتهي خلال",
      },

      label_color: {
        type: String,
        default: "#60646C", // secondary text
      },

      // Font size
      font_size: {
        type: Number,
        default: 14, // in pixels
        min: 10,
        max: 24,
      },

      // Timer display format
      format: {
        type: String,
        enum: ["hms", "digital", "text"],
        default: "hms", // 00:00:00
      },
    },

    // Animation effects
    effect: {
      type: String,
      enum: ["none", "pulse", "fade", "bounce", "glow"],
      default: "pulse",
    },

    // Show/hide conditions
    show_on_mobile: {
      type: Boolean,
      default: true,
    },

    show_on_desktop: {
      type: Boolean,
      default: true,
    },

    // Auto-restart when timer ends
    auto_restart: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for getting duration in hours
timerSettingsSchema.virtual("duration_hours").get(function () {
  return Math.floor(this.duration / 3600);
});

// Method to get CSS variables for timer styling
timerSettingsSchema.methods.getCSSVariables = function () {
  return `
    --timer-text-color: ${this.style.text_color};
    --timer-bg-color: ${this.style.bg_color};
    --timer-border-color: ${this.style.border_color};
    --timer-border-radius: ${this.style.border_radius}px;
    --timer-label-color: ${this.style.label_color};
    --timer-font-size: ${this.style.font_size}px;
  `;
};

// Static method to get default settings
timerSettingsSchema.statics.getDefaultSettings = function () {
  return {
    enabled: true,
    duration: 21600,
    duration_type: "6h",
    position: "above_summary",
    mobile_position: "sticky_top",
    style: {
      text_color: "#0E1012",
      bg_color: "#FFFFFF",
      border_color: "#E5E8EC",
      border_radius: 12,
      label: "عرض محدود ينتهي خلال",
      label_color: "#60646C",
      font_size: 14,
      format: "hms",
    },
    effect: "pulse",
    show_on_mobile: true,
    show_on_desktop: true,
    auto_restart: true,
  };
};

const TimerSettings = mongoose.model("TimerSettings", timerSettingsSchema);

export default TimerSettings;
