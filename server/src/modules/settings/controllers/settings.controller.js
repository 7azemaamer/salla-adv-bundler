import settingsService from "../services/settings.service.js";
import { AppError, asyncWrapper } from "../../../utils/errorHandler.js";
import storeService from "../../stores/services/store.service.js";
import { fetchPaymentMethods } from "../../bundles/services/payment.service.js";
import { getValidAccessToken } from "../../../utils/tokenHelper.js";

/* ===============
 * Get store settings
 * ===============*/
export const getSettings = asyncWrapper(async (req, res) => {
  const { store_id } = req.user;

  if (!store_id) {
    throw new AppError("Store ID not found in request", 400);
  }

  const { settings, planContext } = await settingsService.getSettings(store_id);

  res.status(200).json({
    success: true,
    data: settings,
    meta: planContext,
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

  const { settings, planContext } = await settingsService.updateSettings(
    store_id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Settings updated successfully",
    data: settings,
    meta: planContext,
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

/* ===============
 * Refetch payment methods from Salla
 * ===============*/
export const refetchPaymentMethods = asyncWrapper(async (req, res) => {
  const { store_id } = req.user;

  if (!store_id) {
    throw new AppError("Store ID not found in request", 400);
  }

  try {
    const accessToken = await getValidAccessToken(store_id);

    if (!accessToken) {
      throw new AppError("Access token not available", 400);
    }

    const methodsResult = await fetchPaymentMethods(accessToken);

    // Update store with new payment methods
    const store = await storeService.getStoreByStoreId(store_id);
    if (store) {
      store.payment_methods = methodsResult.data;
      store.payment_methods_updated_at = new Date();
      await store.save();
    }

    res.status(200).json({
      success: true,
      message: `تم تحديث ${methodsResult.data.length} طريقة دفع بنجاح`,
      data: methodsResult.data,
    });
  } catch (error) {
    throw new AppError(
      `Failed to refetch payment methods: ${error.message}`,
      500
    );
  }
});
