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
          hide_product_price: false,
        });
      }

      return settings;
    } catch (error) {
      console.error(`[Settings]: Failed to get settings for store ${store_id}:`, error);
      throw new AppError("Failed to fetch settings", 500);
    }
  }

  /* ===============
   * Update settings for a store
   * ===============*/
  async updateSettings(store_id, updates) {
    try {
      // Validate updates
      const allowedFields = ["hide_default_buttons", "hide_salla_offer_modal", "hide_product_options", "hide_quantity_input", "hide_product_price"];
      const filteredUpdates = {};

      for (const field of allowedFields) {
        if (updates.hasOwnProperty(field)) {
          filteredUpdates[field] = updates[field];
        }
      }

      if (Object.keys(filteredUpdates).length === 0) {
        throw new AppError("No valid fields to update", 400);
      }

      // Update or create settings
      const settings = await Settings.findOneAndUpdate(
        { store_id },
        { $set: filteredUpdates },
        { new: true, upsert: true, runValidators: true }
      );

      console.log(
        `[Settings]: Updated settings for store ${store_id}:`,
        filteredUpdates
      );

      return settings;
    } catch (error) {
      console.error(`[Settings]: Failed to update settings for store ${store_id}:`, error);
      throw error instanceof AppError
        ? error
        : new AppError("Failed to update settings", 500);
    }
  }
}

export default new SettingsService();
