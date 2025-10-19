import settingsService from "../services/settings.service.js";
import { AppError, asyncWrapper } from "../../../utils/errorHandler.js";

/* ===============
 * Get store settings
 * ===============*/
export const getSettings = asyncWrapper(async (req, res) => {
  const { store_id } = req.user;

  if (!store_id) {
    throw new AppError("Store ID not found in request", 400);
  }

  const settings = await settingsService.getSettings(store_id);

  res.status(200).json({
    success: true,
    data: settings,
  });
});

/* ===============
 * Update store settings
 * ===============*/
export const updateSettings = asyncWrapper(async (req, res) => {
  const { store_id } = req.user;

  if (!store_id) {
    throw new AppError("Store ID not found in request", 400);
  }

  const settings = await settingsService.updateSettings(store_id, req.body);

  res.status(200).json({
    success: true,
    message: "Settings updated successfully",
    data: settings,
  });
});

/* ===============
 * Get review count settings (public endpoint for modal)
 * ===============*/
export const getReviewCountSettings = asyncWrapper(async (req, res) => {
  const { store_id } = req.params;

  if (!store_id) {
    throw new AppError("Store ID is required", 400);
  }

  const settings = await settingsService.getSettings(store_id);

  // Return only review count settings
  res.status(200).json({
    success: true,
    data: settings?.review_count || {
      enabled: true,
      mode: "real",
      current_count: 0,
    },
  });
});
