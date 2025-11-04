import { AppError } from "../../../utils/errorHandler.js";
import Settings from "../model/settings.model.js";

class SettingsService {
  /* ===============
   * Get settings for a store (create default if not exists)
   * ===============*/
  async getSettings(store_id) {
    try {
      let settings = await Settings.findOne({ store_id });

      // Create default settings if not exists
      if (!settings) {
        settings = await Settings.create({
          store_id,
          hide_default_buttons: false,
          hide_salla_offer_modal: false,
          hide_product_options: false,
          hide_quantity_input: false,
          hide_price_section: false,
          sticky_button: {
            enabled: false,
            text: "🛍️ اطلب باقتك الآن",
            bg_color: "#10b981",
            text_color: "#ffffff",
            position: "bottom-center",
            width_type: "auto",
            custom_width: 250,
          },
          free_shipping: {
            enabled: false,
            mode: "always",
            min_price: 0,
            text: "شحن مجاني لهذه الباقة",
            progress_text: "أضف {amount} ريال للحصول على شحن مجاني",
            bg_color: "#10b981",
            text_color: "#ffffff",
            icon: "🚚",
            progress_color: "#ffffff",
            progress_bg_color: "rgba(255, 255, 255, 0.3)",
          },
          timer: {
            enabled: false,
            duration: 21600,
            duration_type: "6h",
            auto_restart: true,
            effect: "pulse",
            text_color: "#0E1012",
            bg_color: "#FFFFFF",
            border_color: "#E5E8EC",
            border_radius: 12,
            label: "عرض محدود ينتهي خلال",
            label_color: "#60646C",
            font_size: 14,
          },
        });
      }

      return settings;
    } catch (error) {
      console.error(
        `[Settings]: Failed to get settings for store ${store_id}:`,
        error
      );
      throw new AppError("Failed to fetch settings", 500);
    }
  }

  /* ===============
   * Update settings for a store
   * ===============*/
  async updateSettings(store_id, updates) {
    try {
      // Validate updates - now supports both flat fields and nested objects
      const allowedFields = [
        "salla_theme",
        "hide_default_buttons",
        "hide_salla_offer_modal",
        "hide_product_options",
        "hide_quantity_input",
        "hide_price_section",
        "custom_hide_selectors",
        "sticky_button", // Nested object
        "free_shipping", // Nested object
        "timer", // Nested object
        "review_count", // Nested object - review count settings
        "custom_reviews", // Array of custom review objects
      ];

      const filteredUpdates = {};

      for (const field of allowedFields) {
        if (updates.hasOwnProperty(field)) {
          filteredUpdates[field] = updates[field];
        }
      }

      if (Object.keys(filteredUpdates).length === 0) {
        throw new AppError("No valid fields to update", 400);
      }

      if (
        filteredUpdates.review_count &&
        filteredUpdates.review_count.initial_count !== undefined
      ) {
        filteredUpdates.review_count.current_count =
          filteredUpdates.review_count.initial_count;
        console.log(
          "[Settings]: Syncing current_count with initial_count:",
          filteredUpdates.review_count.initial_count
        );
      }

      // Update or create settings
      const settings = await Settings.findOneAndUpdate(
        { store_id },
        { $set: filteredUpdates },
        { new: true, upsert: true, runValidators: true }
      );

      return settings;
    } catch (error) {
      console.error(
        `[Settings]: Failed to update settings for store ${store_id}:`,
        error
      );
      throw error instanceof AppError
        ? error
        : new AppError("Failed to update settings", 500);
    }
  }
}

export default new SettingsService();
