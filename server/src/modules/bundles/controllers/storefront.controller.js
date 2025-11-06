import { asyncWrapper } from "../../../utils/errorHandler.js";
import bundleService from "../services/bundle.service.js";
import settingsService from "../../settings/services/settings.service.js";
import { formatReview } from "../services/reviews.service.js";
import { fetchPaymentMethods } from "../services/payment.service.js";
import axios from "axios";
import storeService from "../../stores/services/store.service.js";
import { getValidAccessToken } from "../../../utils/tokenHelper.js";
import { getCachedReviews } from "../../products/services/productCache.service.js";

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

  // If store is a domain (contains dots), look up the store_id from database
  if (store_id && store_id.includes(".")) {
    const storeDoc = await storeService.getStoreByDomain(store_id);
    if (storeDoc) {
      store_id = storeDoc.store_id;
    }
  }

  if (!store_id || !product_id) {
    return res.status(400).json({
      success: false,
      message: "Store ID and Product ID are required",
    });
  }

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
  const enhancedBundle = await bundleService.getEnhancedBundleData(
    store_id,
    bundle
  );

  // Get store settings (includes hide_default_buttons)
  const settings = await settingsService.getSettings(store_id);

  // Return enhanced bundle configuration for frontend with settings
  res.status(200).json({
    success: true,
    data: {
      ...enhancedBundle,
      settings: {
        hide_default_buttons: settings.hide_default_buttons,
        hide_salla_offer_modal: settings.hide_salla_offer_modal,
        hide_product_options: settings.hide_product_options,
        hide_quantity_input: settings.hide_quantity_input,
        hide_price_section: settings.hide_price_section,
        custom_hide_selectors: settings.custom_hide_selectors || [],
        sticky_button: settings.sticky_button,
        free_shipping: settings.free_shipping,
        timer: settings.timer,
        show_payment_methods: settings.show_payment_methods !== false, // Default to true
      },
    },
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

/* ===============================================
 * Get Store Reviews (Public endpoint for modal)
 * =============================================== */
export const getStoreReviews = asyncWrapper(async (req, res) => {
  let { store_id } = req.params;
  const { limit = 10, product_id } = req.query;

  try {
    if (store_id && store_id.includes(".")) {
      const storeDoc = await storeService.getStoreByDomain(store_id);
      if (storeDoc) {
        store_id = storeDoc.store_id;
      } else {
        console.error(`[Reviews]: Store not found for domain: ${store_id}`);
        return res.status(200).json({
          success: true,
          data: [],
          message: "Store not found",
        });
      }
    }

    const settings = await settingsService.getSettings(store_id);

    const reviewDateRandomizer = settings.review_date_randomizer || {};
    const hideRealReviews = reviewDateRandomizer.hide_real_reviews === true;
    const reviewDisplayRaw = settings.review_display || {};
    const reviewDisplay = {
      hide_dates: !!reviewDisplayRaw.hide_dates,
      hide_ratings: !!reviewDisplayRaw.hide_ratings,
      hide_names: !!reviewDisplayRaw.hide_names,
      hide_avatars: !!reviewDisplayRaw.hide_avatars,
    };
    const defaultDatePresets = [
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
    ];
    const presetPoolRaw = Array.isArray(reviewDateRandomizer.presets)
      ? reviewDateRandomizer.presets.filter(
          (value) => typeof value === "string" && value.trim().length > 0
        )
      : [];
    const presetPool =
      presetPoolRaw.length > 0 ? presetPoolRaw : defaultDatePresets;

    const randomizeReviewDates = (reviews = []) => {
      if (!reviewDateRandomizer.enabled || !Array.isArray(reviews)) {
        return reviews;
      }

      if (!presetPool.length) {
        return reviews;
      }

      return reviews.map((review) => ({
        ...review,
        timeAgo:
          presetPool[Math.floor(Math.random() * presetPool.length)] ||
          review.timeAgo,
      }));
    };

    const applyDisplayConfig = (reviews = []) => {
      if (!Array.isArray(reviews) || reviews.length === 0) return reviews;

      return reviews.map((review) => ({
        ...review,
        timeAgo: reviewDisplay.hide_dates ? null : review.timeAgo,
        rating:
          reviewDisplay.hide_ratings || review.rating === undefined
            ? null
            : review.rating,
        customerName: reviewDisplay.hide_names ? "" : review.customerName,
        customerAvatar: reviewDisplay.hide_avatars
          ? null
          : review.customerAvatar,
        _display: reviewDisplay,
      }));
    };

    let cachedReviews = [];
    let fromCache = false;

    if (product_id && !hideRealReviews) {
      try {
        const accessToken = await getValidAccessToken(store_id);

        if (accessToken) {
          const normalizedProductId = product_id.toString().replace(/^p/, "");

          console.log(
            `[Reviews]: Fetching reviews for product ${product_id} (normalized: ${normalizedProductId}), store: ${store_id}`
          );

          const cacheResult = await getCachedReviews(
            store_id,
            normalizedProductId,
            accessToken
          );

          console.log(
            `[Reviews]: Cache result - success: ${
              cacheResult.success
            }, data length: ${cacheResult.data?.length || 0}, fromCache: ${
              cacheResult.fromCache
            }`
          );

          if (
            cacheResult.success &&
            cacheResult.data &&
            cacheResult.data.length > 0
          ) {
            cachedReviews = cacheResult.data;
            fromCache = cacheResult.fromCache;
            console.log(
              `[Reviews]: ${fromCache ? "Using cached" : "Fetched fresh"} ${
                cachedReviews.length
              } reviews for product ${product_id} (normalized: ${normalizedProductId})`
            );
          } else {
            console.log(
              `[Reviews]: No cached reviews found for product ${normalizedProductId}`
            );
          }
        } else {
          console.log(
            `[Reviews]: No access token available for store ${store_id}`
          );
        }
      } catch (tokenError) {
        console.error("[Reviews]: Token error:", tokenError.message);
      }
    }

    const customReviews = settings.custom_reviews || [];

    const formattedCustomReviews = customReviews.map((review) => ({
      id: review._id || null,
      rating: review.stars || 5,
      content: review.comment || "",
      customerName: review.name || "عميل",
      customerAvatar:
        review.gender === "female"
          ? "https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_female.png"
          : "https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png",
      customerCity: review.city || null,
      createdAt: review.created_at || new Date().toISOString(),
      timeAgo: review.date_text || "قبل يومين",
      isVerified: review.is_verified || false,
    }));

    let allReviews = hideRealReviews
      ? [...formattedCustomReviews]
      : [...cachedReviews, ...formattedCustomReviews];

    allReviews.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });

    if (allReviews.length > 0) {
      console.log(
        `[Reviews]: Returning ${allReviews.length} reviews (${
          formattedCustomReviews.length
        } custom, ${cachedReviews.length} cached) for product ${
          product_id || "N/A"
        } - sorted by newest`
      );
      const limitedReviews = allReviews.slice(0, parseInt(limit));
      const finalReviews = applyDisplayConfig(
        randomizeReviewDates(limitedReviews)
      );

      return res.status(200).json({
        success: true,
        data: finalReviews,
        total: finalReviews.length,
        fromCache,
        hasCustomReviews: formattedCustomReviews.length > 0,
        display_config: reviewDisplay,
      });
    }

    if (!product_id) {
      console.log(
        "[Reviews]: No product_id provided, returning custom reviews only"
      );
      const limitedCustom = formattedCustomReviews.slice(0, parseInt(limit));
      const finalCustom = applyDisplayConfig(
        randomizeReviewDates(limitedCustom)
      );
      return res.status(200).json({
        success: true,
        data: finalCustom,
        total: finalCustom.length,
        fromCache,
        hasCustomReviews: formattedCustomReviews.length > 0,
        display_config: reviewDisplay,
      });
    }

    if (hideRealReviews) {
      console.log(
        `[Reviews]: Real reviews are hidden by settings, returning custom reviews only for product ${product_id}`
      );
      const limitedCustom = formattedCustomReviews.slice(0, parseInt(limit));
      const finalCustom = applyDisplayConfig(
        randomizeReviewDates(limitedCustom)
      );
      return res.status(200).json({
        success: true,
        data: finalCustom,
        total: finalCustom.length,
        fromCache,
        hasCustomReviews: formattedCustomReviews.length > 0,
        display_config: reviewDisplay,
      });
    }

    console.log(
      `[Reviews]: No cached reviews for product ${product_id}, fetching from API`
    );
    try {
      const accessToken = await getValidAccessToken(store_id);

      if (accessToken) {
        const cacheResult = await getCachedReviews(
          store_id,
          product_id,
          accessToken
        );

        if (cacheResult.success && cacheResult.data.length > 0) {
          allReviews = cacheResult.data;
          fromCache = cacheResult.fromCache;

          console.log(
            `[Reviews]: Fetched and cached ${allReviews.length} reviews for product ${product_id}`
          );
        }
      }
    } catch (apiError) {
      console.error("[Reviews]: API fetch failed:", apiError.message);
    }

    allReviews.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });

    const limitedReviews = allReviews.slice(0, parseInt(limit));
    const finalReviews = applyDisplayConfig(
      randomizeReviewDates(limitedReviews)
    );

    res.status(200).json({
      success: true,
      data: finalReviews,
      total: finalReviews.length,
      fromCache,
      hasCustomReviews: formattedCustomReviews.length > 0,
      display_config: reviewDisplay,
    });
  } catch (error) {
    console.error("[Reviews]: Error fetching reviews:", error.message);
    return res.status(200).json({
      success: true,
      data: [],
      message: "Failed to fetch reviews",
      display_config: reviewDisplay,
    });
  }
});

/* ===============================================
 * Get Payment Methods (Public endpoint for modal)
 * =============================================== */
export const getPaymentMethods = asyncWrapper(async (req, res) => {
  const { store_id } = req.params;

  try {
    let store = await storeService.getStoreByDomain(store_id);

    if (!store) {
      store = await storeService.getStoreByStoreId(store_id);
    }

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const CACHE_DURATION = 24 * 60 * 60 * 1000;
    const isCacheFresh =
      store.payment_methods_updated_at &&
      Date.now() - new Date(store.payment_methods_updated_at).getTime() <
        CACHE_DURATION;

    if (
      isCacheFresh &&
      store.payment_methods &&
      store.payment_methods.length > 0
    ) {
      return res.status(200).json({
        success: true,
        data: store.payment_methods,
        cached: true,
      });
    }

    const accessToken = await getValidAccessToken(store_id);

    if (!accessToken) {
      return res.status(200).json({
        success: true,
        data: store.payment_methods || [],
        message: "No access token configured, using cached data",
      });
    }

    const methodsResult = await fetchPaymentMethods(accessToken);

    store.payment_methods = methodsResult.data;
    store.payment_methods_updated_at = new Date();
    await store.save();

    console.log(
      "[Payment Methods] Cached",
      methodsResult.data.length,
      "payment methods"
    );

    res.status(200).json({
      success: true,
      data: methodsResult.data,
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error.message);

    let store = await storeService.getStoreByDomain(store_id);
    if (!store) {
      store = await storeService.getStoreByStoreId(store_id);
    }

    if (store && store.payment_methods && store.payment_methods.length > 0) {
      return res.status(200).json({
        success: true,
        data: store.payment_methods,
        message: "Using cached payment methods due to error",
        cached: true,
      });
    }

    return res.status(200).json({
      success: true,
      data: [],
      message: "Failed to fetch payment methods",
    });
  }
});

/* ===============================================
 * Validate Discount/Coupon Code (Public endpoint for modal)
 * =============================================== */
export const validateDiscountCode = asyncWrapper(async (req, res) => {
  const { store_id } = req.params;
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Coupon code is required",
    });
  }

  try {
    const accessToken = await getValidAccessToken(store_id);

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Store not configured",
      });
    }

    const response = await axios.get("https://api.salla.dev/admin/v2/coupons", {
      params: {
        code: code,
        per_page: 1,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      const coupon = response.data.data[0];

      const now = new Date();
      const isActive = coupon.status === "active" || coupon.status === 1;
      const isExpired = coupon.expires_at
        ? new Date(coupon.expires_at) < now
        : false;

      if (!isActive || isExpired) {
        return res.status(200).json({
          success: false,
          valid: false,
          message: isExpired
            ? "كود الخصم منتهي الصلاحية"
            : "كود الخصم غير فعال",
        });
      }

      return res.status(200).json({
        success: true,
        valid: true,
        data: {
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_amount: coupon.discount_amount || coupon.amount,
          expires_at: coupon.expires_at,
          message: `تم تطبيق كود الخصم: ${coupon.code}`,
        },
      });
    }

    return res.status(200).json({
      success: false,
      valid: false,
      message: "كود الخصم غير صالح",
    });
  } catch (error) {
    console.error(
      "Validate coupon error:",
      error.response?.data || error.message
    );
    return res.status(200).json({
      success: false,
      valid: false,
      message: error.response?.data?.message || "كود الخصم غير صالح",
    });
  }
});
