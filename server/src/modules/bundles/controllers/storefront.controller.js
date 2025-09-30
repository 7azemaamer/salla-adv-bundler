import { asyncWrapper } from "../../../utils/errorHandler.js";
import bundleService from "../services/bundle.service.js";

/* ===============================================
 * Get bundles for a specific product (public endpoint)
 * =============================================== */
export const getBundlesByProduct = asyncWrapper(async (req, res) => {
  let { store_id, product_id } = req.params;
  const { store, store_id: queryStoreId } = req.query;

  // Extract additional context from headers (sent by App Snippet)
  const storeDomain = req.headers["x-store-domain"] || store;
  const storeIdFromHeader = req.headers["x-store-id"] || queryStoreId;
  const customerId = req.headers["x-customer-id"];

  // Handle simplified route: /bundles/:product_id?store=domain
  if (!store_id && (store || storeIdFromHeader)) {
    store_id = storeIdFromHeader || store;
    product_id = req.params.product_id;
  }

  if (!store_id || !product_id) {
    return res.status(400).json({
      success: false,
      message: "Store ID and Product ID are required",
    });
  }

  // Log context for debugging (useful for analytics)
  console.log(
    `[Bundle Check] Store: ${storeDomain}, Customer: ${
      customerId || "anonymous"
    }, Product: ${product_id}`
  );

  const bundle = await bundleService.getBundlesByProduct(store_id, product_id);

  if (!bundle) {
    return res.status(404).json({
      success: false,
      message: "No active bundles found for this product",
    });
  }

  // Track bundle view
  await bundleService.trackBundleView(bundle._id);

  // Get enhanced bundle data with product information
  const enhancedBundle = await bundleService.getEnhancedBundleData(store_id, bundle);

  // Return enhanced bundle configuration for frontend
  res.status(200).json({
    success: true,
    data: enhancedBundle,
  });
});

/* ===============================================
 * Get specific bundle configuration (public endpoint)
 * =============================================== */
export const getBundleConfig = asyncWrapper(async (req, res) => {
  const { bundle_id } = req.params;

  const bundle = await bundleService.getBundleDetails(bundle_id);

  if (bundle.status !== "active") {
    return res.status(404).json({
      success: false,
      message: "Bundle not found or not active",
    });
  }

  // Check if bundle is currently valid (within date range)
  if (!bundle.is_currently_active) {
    return res.status(404).json({
      success: false,
      message: "Bundle is not currently active",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      id: bundle._id,
      name: bundle.name,
      target_product_id: bundle.target_product_id,
      target_product_name: bundle.target_product_name,
      bundles: bundle.bundles,
      start_date: bundle.start_date,
      expiry_date: bundle.expiry_date,
    },
  });
});

/* ===============================================
 * Track bundle interaction (public endpoint)
 * =============================================== */
export const trackBundleInteraction = asyncWrapper(async (req, res) => {
  const { bundle_id } = req.params;
  const { action, revenue } = req.body;

  if (!action || !["view", "click", "conversion"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Invalid action. Must be 'view', 'click', or 'conversion'",
    });
  }

  switch (action) {
    case "view":
      await bundleService.trackBundleView(bundle_id);
      break;
    case "click":
      await bundleService.trackBundleClick(bundle_id);
      break;
    case "conversion":
      await bundleService.trackBundleConversion(bundle_id, revenue || 0);
      break;
  }

  res.status(200).json({
    success: true,
    message: `${action} tracked successfully`,
  });
});
