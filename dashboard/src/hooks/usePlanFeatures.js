import { useMemo } from "react";
import useAuthStore from "../stores/useAuthStore";

export const usePlanFeatures = () => {
  const { planContext } = useAuthStore();

  const features = useMemo(() => {
    if (!planContext?.features) {
      return {
        advancedBundleStyling: false,
        stickyButton: false,
        timer: false,
        freeShipping: false,
        couponControls: false,
        customHideSelectors: false,
        reviewsWidget: false,
        announcement: false,
        bundleAnalytics: false,
        dashboardAnalytics: false,
        conversionInsights: false,
        bundlePerformance: false,
        offerAnalytics: false,
        productReviewsSection: false,
      };
    }
    return planContext.features;
  }, [planContext]);

  const limits = useMemo(() => {
    if (!planContext?.limits) {
      return {
        maxBundles: 1,
        monthlyViews: 10000,
      };
    }
    return planContext.limits;
  }, [planContext]);

  const plan = useMemo(() => {
    return planContext?.plan || "basic";
  }, [planContext]);

  const isFeatureEnabled = (featureKey) => {
    return Boolean(features[featureKey]);
  };

  const canCreateBundle = (currentCount) => {
    return currentCount < limits.maxBundles;
  };

  const isViewLimitApproaching = (currentViews) => {
    if (!limits.monthlyViews) return false;
    return currentViews >= limits.monthlyViews * 0.8;
  };

  const isViewLimitReached = (currentViews) => {
    if (!limits.monthlyViews) return false;
    return currentViews >= limits.monthlyViews;
  };

  return {
    features,
    limits,
    plan,
    planLabel: planContext?.label || "Basic",
    isFeatureEnabled,
    canCreateBundle,
    isViewLimitApproaching,
    isViewLimitReached,
    isBasicPlan: plan === "basic",
    isPremiumPlan: plan !== "basic",
  };
};

export default usePlanFeatures;
