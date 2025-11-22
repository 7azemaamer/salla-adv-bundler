import planConfigService from "../../admin/services/planConfig.service.js";

export const BASE_PLAN_FEATURES = {
  advancedBundleStyling: true,
  stickyButton: true,
  timer: true,
  freeShipping: true,
  couponControls: true,
  customHideSelectors: true,
  reviewsWidget: true,
  announcement: true,
  soldOutTiers: true,
  modalStyling: true,
  bundleAnalytics: true,
  dashboardAnalytics: true,
  analyticsPage: true,
  conversionInsights: true,
  bundlePerformance: true,
  offerAnalytics: true,
  productReviewsSection: true,
};

export const BUNDLE_STYLING_DEFAULTS = {
  modal_title: "اختر باقتك",
  modal_subtitle: "",
  cta_button_text: "اختر الباقة",
  cta_button_bg_color: "#000",
  cta_button_text_color: "#ffffff",
  checkout_button_text: "الإنتقال الى الدفع — {total_price}",
  checkout_button_bg_color: "#000",
  checkout_button_text_color: "#ffffff",
};

export const TIER_STYLING_DEFAULTS = {
  tier_bg_color: "#f8f9fa",
  tier_text_color: "#212529",
  tier_highlight_bg_color: "#ffc107",
  tier_highlight_text_color: "#000000",
  tier_highlight_text: "",
};

const PLAN_TEMPLATES = {
  basic: {
    key: "basic",
    label: "Basic",
    limits: {
      maxBundles: 1,
      monthlyViews: 10000,
    },
    features: {
      ...BASE_PLAN_FEATURES,
      advancedBundleStyling: false,
      stickyButton: false,
      timer: false,
      freeShipping: false,
      couponControls: false,
      customHideSelectors: false,
      reviewsWidget: false,
      announcement: false,
      soldOutTiers: false,
      modalStyling: false,
      bundleAnalytics: false,
      dashboardAnalytics: false,
      analyticsPage: false,
      conversionInsights: false,
      bundlePerformance: false,
      offerAnalytics: false,
      productReviewsSection: false,
    },
  },
  pro: {
    key: "pro",
    label: "Pro",
    limits: {
      maxBundles: 10,
      monthlyViews: 100000,
    },
    features: {
      ...BASE_PLAN_FEATURES,
    },
  },
  enterprise: {
    key: "enterprise",
    label: "Enterprise",
    limits: {
      maxBundles: 50,
      monthlyViews: null,
    },
    features: {
      ...BASE_PLAN_FEATURES,
    },
  },
  special: {
    key: "special",
    label: "Special",
    limits: {
      maxBundles: 100,
      monthlyViews: null,
    },
    features: {
      ...BASE_PLAN_FEATURES,
    },
  },
};

export const PLAN_CONFIG = PLAN_TEMPLATES;

/**
 * Get plan config from DB if available, otherwise fallback to template
 * For synchronous contexts, use template. For async contexts, use getPlanConfigAsync
 */
export const getPlanConfig = (planKey = "basic") => {
  return PLAN_CONFIG[planKey] || PLAN_CONFIG.basic;
};

/**
 * Async version that checks DB first, then falls back to template
 * Import dynamically to avoid circular dependencies
 */
export const getPlanConfigAsync = async (planKey = "basic") => {
  try {
    return await planConfigService.getPlanConfigForStore(planKey);
  } catch (error) {
    console.warn(
      `DB plan lookup failed for ${planKey}, using template fallback`,
      error.message
    );
    return getPlanConfig(planKey);
  }
};

export const isFeatureEnabledForPlan = (planKey, featureKey) => {
  const planConfig = getPlanConfig(planKey);
  return Boolean(planConfig.features?.[featureKey]);
};

export const getPlanLimits = (planKey) => {
  const planConfig = getPlanConfig(planKey);
  return planConfig.limits;
};

export const withLockedBundleStyling = (bundleObject, planKey) => {
  const planConfig = getPlanConfig(planKey);
  if (planConfig.features.advancedBundleStyling) {
    return bundleObject;
  }

  const sanitizedBundle = {
    ...bundleObject,
    ...BUNDLE_STYLING_DEFAULTS,
  };

  if (Array.isArray(bundleObject?.bundles)) {
    sanitizedBundle.bundles = bundleObject.bundles.map((tier) => ({
      ...tier,
      ...TIER_STYLING_DEFAULTS,
    }));
  }

  return sanitizedBundle;
};

export const stripBundleStylingInput = (bundlePayload, planKey) => {
  const planConfig = getPlanConfig(planKey);
  if (planConfig.features.advancedBundleStyling) {
    return bundlePayload;
  }

  const clonedPayload = { ...bundlePayload };

  delete clonedPayload.modal_title;
  delete clonedPayload.modal_subtitle;
  delete clonedPayload.cta_button_text;
  delete clonedPayload.cta_button_bg_color;
  delete clonedPayload.cta_button_text_color;
  delete clonedPayload.checkout_button_text;
  delete clonedPayload.checkout_button_bg_color;
  delete clonedPayload.checkout_button_text_color;

  if (Array.isArray(clonedPayload.bundles)) {
    clonedPayload.bundles = clonedPayload.bundles.map((tier) => {
      const {
        tier_bg_color,
        tier_text_color,
        tier_highlight_bg_color,
        tier_highlight_text_color,
        tier_highlight_text,
        ...rest
      } = tier;
      return rest;
    });
  }

  return clonedPayload;
};

export const stripBundleStylingUpdate = (updatePayload, planKey) => {
  const planConfig = getPlanConfig(planKey);
  if (planConfig.features.advancedBundleStyling) {
    return updatePayload;
  }

  const clonedUpdates = { ...updatePayload };

  const fieldsToRemove = [
    "modal_title",
    "modal_subtitle",
    "cta_button_text",
    "cta_button_bg_color",
    "cta_button_text_color",
    "checkout_button_text",
    "checkout_button_bg_color",
    "checkout_button_text_color",
  ];

  fieldsToRemove.forEach((field) => {
    if (field in clonedUpdates) {
      delete clonedUpdates[field];
    }
  });

  if (Array.isArray(clonedUpdates.bundles)) {
    clonedUpdates.bundles = clonedUpdates.bundles.map((tier) => {
      const {
        tier_bg_color,
        tier_text_color,
        tier_highlight_bg_color,
        tier_highlight_text_color,
        tier_highlight_text,
        ...rest
      } = tier;
      return rest;
    });
  }

  return clonedUpdates;
};

export const enrichBundleForPlanResponse = (bundleObject, planKey) => {
  const planConfig = getPlanConfig(planKey);
  let enriched = withLockedBundleStyling(bundleObject, planKey);

  if (!planConfig.features.bundleAnalytics) {
    enriched = {
      ...enriched,
      total_views: 0,
      total_clicks: 0,
      total_conversions: 0,
      total_revenue: 0,
    };
  }

  if (Array.isArray(enriched?.bundles)) {
    enriched = {
      ...enriched,
      bundles: enriched.bundles.map((tier) => ({
        ...tier,
        tier_selections: planConfig.features.offerAnalytics
          ? tier.tier_selections
          : 0,
        tier_checkouts: planConfig.features.offerAnalytics
          ? tier.tier_checkouts
          : 0,
      })),
    };
  }

  return enriched;
};

export const getPlanFeatureSnapshot = (planKey, store = null) => {
  const planConfig = getPlanConfig(planKey);

  if (store?.is_unlimited) {
    return {
      plan: planConfig.key,
      label: planConfig.label + " (Unlimited)",
      limits: {
        maxBundles: null,
        monthlyViews: null,
      },
      features: {
        advancedBundleStyling: true,
        stickyButton: true,
        timer: true,
        freeShipping: true,
        couponControls: true,
        customHideSelectors: true,
        reviewsWidget: true,
        announcement: true,
        soldOutTiers: true,
        modalStyling: true,
        bundleAnalytics: true,
        dashboardAnalytics: true,
        conversionInsights: true,
        bundlePerformance: true,
        offerAnalytics: true,
        productReviewsSection: true,
      },
    };
  }

  return {
    plan: planConfig.key,
    label: planConfig.label,
    limits: planConfig.limits,
    features: planConfig.features,
  };
};
