import { asyncWrapper } from "../../../utils/errorHandler.js";
import bundleService from "../services/bundle.service.js";
import BundleConfig from "../model/bundleConfig.model.js";

/* ===============================================
 * Create a new bundle configuration
 * =============================================== */
export const createBundle = asyncWrapper(async (req, res) => {
  const { store_id } = req.user;
  const bundleData = req.body;

  // Validate required fields
  if (
    !bundleData.name ||
    !bundleData.target_product_id ||
    !bundleData.bundles ||
    !bundleData.start_date
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required fields: name, target_product_id, bundles, start_date",
    });
  }

  // Validate bundles array
  if (!Array.isArray(bundleData.bundles) || bundleData.bundles.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Bundles must be an array with at least one tier",
    });
  }

  const bundle = await bundleService.createBundle(store_id, bundleData);

  res.status(201).json({
    success: true,
    message: "Bundle created successfully",
    data: bundle,
  });
});

/* ===============================================
 * Generate Special Offers for bundle
 * =============================================== */
export const generateBundleOffers = asyncWrapper(async (req, res) => {
  const { store_id } = req.user;
  const { bundle_id } = req.params;

  const result = await bundleService.generateOffers(bundle_id);

  res.status(200).json({
    success: true,
    message: `Generated ${result.offers_created} offers successfully`,
    data: result,
  });
});

/* ===============================================
 * Debug: Preview bundle offers payload
 * =============================================== */
export const previewBundleOffers = asyncWrapper(async (req, res) => {
  const { store_id } = req.user;
  const { bundle_id } = req.params;

  const result = await bundleService.previewOffers(bundle_id);

  res.status(200).json({
    success: true,
    message: "Bundle offers preview generated successfully",
    data: result,
  });
});

/* ===============================================
 * List all bundles for store
 * =============================================== */
export const listBundles = asyncWrapper(async (req, res) => {
  const { store_id } = req.user;
  const filters = {
    status: req.query.status,
    target_product_id: req.query.target_product_id,
    limit: parseInt(req.query.limit) || 50,
  };

  const bundles = await bundleService.listBundles(store_id, filters);

  res.status(200).json({
    success: true,
    data: bundles,
    total: bundles.length,
  });
});

/* ===============================================
 * Get bundle details
 * =============================================== */
export const getBundleDetails = asyncWrapper(async (req, res) => {
  const { bundle_id } = req.params;

  const bundle = await bundleService.getBundleDetails(bundle_id);

  res.status(200).json({
    success: true,
    data: bundle,
  });
});

/* ===============================================
 * Update bundle configuration
 * =============================================== */
export const updateBundle = asyncWrapper(async (req, res) => {
  const { store_id } = req.user;
  const { bundle_id } = req.params;
  const updateData = req.body;

  const allowedUpdates = [
    "name",
    "description",
    "start_date",
    "expiry_date",
    "bundles",
    "target_product_id",
    "target_product_name",
    "modal_title",
    "modal_subtitle",
    "cta_button_text",
    "cta_button_bg_color",
    "cta_button_text_color",
    "checkout_button_text",
    "checkout_button_bg_color",
    "checkout_button_text_color",
  ];
  const updates = {};

  for (const field of allowedUpdates) {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  }

  // Add updated timestamp
  updates.updatedAt = new Date();

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid update fields provided",
    });
  }

  // Update the bundle
  const updatedBundle = await BundleConfig.findOneAndUpdate(
    { _id: bundle_id, store_id },
    updates,
    { new: true }
  );

  if (!updatedBundle) {
    return res.status(404).json({
      success: false,
      message: "Bundle not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Bundle updated successfully",
    data: updatedBundle,
  });
});

/* ===============================================
 * Deactivate bundle
 * =============================================== */
export const deactivateBundle = asyncWrapper(async (req, res) => {
  const { bundle_id } = req.params;

  const result = await bundleService.deactivateBundle(bundle_id);

  res.status(200).json({
    success: true,
    message: "Bundle deactivated successfully",
    data: result,
  });
});

/* ===============================================
 * Delete bundle
 * =============================================== */
export const deleteBundle = asyncWrapper(async (req, res) => {
  const { bundle_id } = req.params;

  const result = await bundleService.deleteBundle(bundle_id);

  res.status(200).json({
    success: true,
    message: "Bundle deleted successfully",
    data: result,
  });
});

/* ===============================================
 * Track bundle analytics
 * =============================================== */
export const trackBundleView = asyncWrapper(async (req, res) => {
  const { bundle_id } = req.params;

  await bundleService.trackBundleView(bundle_id);

  res.status(200).json({
    success: true,
    message: "View tracked",
  });
});

export const trackBundleClick = asyncWrapper(async (req, res) => {
  const { bundle_id } = req.params;

  await bundleService.trackBundleClick(bundle_id);

  res.status(200).json({
    success: true,
    message: "Click tracked",
  });
});

export const trackBundleConversion = asyncWrapper(async (req, res) => {
  const { bundle_id } = req.params;
  const { revenue } = req.body;

  await bundleService.trackBundleConversion(bundle_id, revenue || 0);

  res.status(200).json({
    success: true,
    message: "Conversion tracked",
  });
});
