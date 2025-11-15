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
    console.log(
      "[Get Bundles] Using store from query/header:",
      store,
      storeIdFromHeader
    );
    store_id = store || storeIdFromHeader;
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
        hide_coupon_section: settings.hide_coupon_section,
        custom_hide_selectors: settings.custom_hide_selectors || [],
        sticky_button: settings.sticky_button,
        free_shipping: settings.free_shipping,
        timer: settings.timer,
        review_count: settings.review_count,
        review_display: settings.review_display,
        show_payment_methods: settings.show_payment_methods !== false, // Default to true
        announcement: settings.announcement,
        cache_version: Math.max(
          settings.cache_version || 0,
          bundle.cache_version || 0
        ), // Use latest version
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
  const { action, revenue, tier_id } = req.body;

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
      // Also track tier checkout if tier_id is provided
      if (tier_id) {
        await bundleService.trackTierCheckout(bundle_id, tier_id);
      }
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
 * Track tier selection (public endpoint)
 * =============================================== */
export const trackTierSelection = asyncWrapper(async (req, res) => {
  const { bundle_id } = req.params;
  const { tier_id } = req.body;

  if (!tier_id) {
    return res.status(400).json({
      success: false,
      message: "tier_id is required",
    });
  }

  await bundleService.trackTierSelection(bundle_id, tier_id);

  res.status(200).json({
    success: true,
    message: "Tier selection tracked successfully",
  });
});

/* ===============================================
 * Track tier checkout (public endpoint)
 * =============================================== */
export const trackTierCheckout = asyncWrapper(async (req, res) => {
  const { bundle_id } = req.params;
  const { tier_id } = req.body;

  if (!tier_id) {
    return res.status(400).json({
      success: false,
      message: "tier_id is required",
    });
  }

  await bundleService.trackTierCheckout(bundle_id, tier_id);

  res.status(200).json({
    success: true,
    message: "Tier checkout tracked successfully",
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

      return reviews.map((review) => {
        const plainReview = review.toObject ? review.toObject() : { ...review };
        return {
          id: plainReview.id,
          rating: plainReview.rating,
          content: plainReview.content,
          customerName: plainReview.customerName,
          customerAvatar: plainReview.customerAvatar,
          customerCity: plainReview.customerCity,
          createdAt: plainReview.createdAt,
          timeAgo:
            presetPool[Math.floor(Math.random() * presetPool.length)] ||
            plainReview.timeAgo,
        };
      });
    };

    const applyDisplayConfig = (reviews = []) => {
      if (!Array.isArray(reviews) || reviews.length === 0) return reviews;

      return reviews.map((review) => {
        // Convert Mongoose doc to plain object
        const plainReview = review.toObject ? review.toObject() : { ...review };
        return {
          id: plainReview.id,
          rating:
            reviewDisplay.hide_ratings || plainReview.rating === undefined
              ? null
              : plainReview.rating,
          content: plainReview.content,
          customerName: reviewDisplay.hide_names
            ? ""
            : plainReview.customerName,
          customerAvatar: reviewDisplay.hide_avatars
            ? null
            : plainReview.customerAvatar,
          customerCity: plainReview.customerCity,
          createdAt: plainReview.createdAt,
          timeAgo: reviewDisplay.hide_dates ? null : plainReview.timeAgo,
          _display: reviewDisplay,
        };
      });
    };

    let cachedReviews = [];
    let fromCache = false;

    if (product_id && !hideRealReviews) {
      try {
        const accessToken = await getValidAccessToken(store_id);

        if (accessToken) {
          const normalizedProductId = product_id.toString().replace(/^p/, "");

          const cacheResult = await getCachedReviews(
            store_id,
            normalizedProductId,
            accessToken
          );

          if (
            cacheResult.success &&
            cacheResult.data &&
            cacheResult.data.length > 0
          ) {
            cachedReviews = cacheResult.data;
            fromCache = cacheResult.fromCache;
          }
        }
      } catch (tokenError) {
        // Silent fail
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
        }
      }
    } catch (apiError) {
      // Silent fail
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
    return res.status(200).json({
      success: true,
      data: [],
      message: "Failed to fetch reviews",
    });
  }
});

/* ===============================================
 * Get Payment Methods (Public endpoint for modal)
 * =============================================== */
export const getPaymentMethods = asyncWrapper(async (req, res) => {
  const { store_id } = req.params; // This is actually the domain

  try {
    const store = await storeService.getStoreByDomain(store_id);

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

    const accessToken = await getValidAccessToken(store.store_id);

    if (!accessToken) {
      return res.status(200).json({
        success: true,
        data: store.payment_methods || [],
        message: "No access token configured, using cached data",
      });
    }

    console.log(
      "[Payment Methods] Access token found, fetching payment methods..."
    );

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
