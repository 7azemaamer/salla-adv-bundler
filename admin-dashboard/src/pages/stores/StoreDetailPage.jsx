import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminApi } from "../../services/api";
import {
  Store,
  Globe,
  Mail,
  RefreshCw,
  Save,
  ArrowLeft,
  Package,
  MousePointer,
  Eye,
  TrendingUp,
  Shield,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

export default function StoreDetailPage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["store", storeId],
    queryFn: async () => {
      const response = await adminApi.get(`/admin/stores/${storeId}`);
      return response.data.data;
    },
  });

  // Fetch all plans for syncing
  const { data: plansData } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await adminApi.get("/admin/plans");
      return response.data.data;
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: (updates) =>
      adminApi.patch(`/admin/stores/${storeId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(["store", storeId]);
      toast.success("Store updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update store");
    },
  });

  const refreshTokenMutation = useMutation({
    mutationFn: () => adminApi.post(`/admin/stores/${storeId}/refresh-token`),
    onSuccess: () => {
      toast.success("Token refreshed successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to refresh token");
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center p-8">Loading store details...</div>
    );
  if (error)
    return (
      <div className="text-red-500 p-8">
        Error loading store: {error.message}
      </div>
    );

  const { store, bundleSummary } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/stores")}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              {store.name}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                ${
                  store.status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : store.status === "needs_reauth"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {store.status.replace("_", " ")}
              </span>
              {store.plan_override_enabled && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Custom Config
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> {store.domain}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> {store.merchant_email}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refreshTokenMutation.mutate()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-200 dark:border-zinc-700 dark:hover:bg-zinc-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Token
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`${bundleSummary?.totalRevenue || 0} SAR`}
          icon="riyal"
          color="text-gray-600"
        />
        <StatCard
          title="Active Bundles"
          value={`${bundleSummary?.activeBundles || 0}`}
          subtitle={`of ${bundleSummary?.totalBundles || 0} total`}
          icon={Package}
          color="text-gray-600"
        />
        <StatCard
          title="Total Conversions"
          value={bundleSummary?.totalConversions || 0}
          icon={TrendingUp}
          color="text-purple-600"
        />
        <StatCard
          title="Conversion Rate"
          value={`${bundleSummary?.conversionRate || 0}%`}
          subtitle={`${bundleSummary?.totalClicks || 0} clicks`}
          icon={MousePointer}
          color="text-orange-600"
        />
      </div>

      {/* Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EditStoreForm
            store={store}
            plans={plansData || []}
            onSubmit={(data) => updateStoreMutation.mutate(data)}
          />
        </div>

        <div className="space-y-6">
          {/* Additional Info Card */}
          <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              System Info
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Store ID
                </span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">
                  {store.store_id}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Installed At
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(store.installed_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Updated At
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(store.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        <div
          className={`p-2 rounded-lg bg-opacity-10 ${color.replace(
            "text-",
            "bg-"
          )}`}
        >
          {icon === "riyal" ? (
            <img src="/riyal.svg" alt="SAR" className="w-5 h-5" />
          ) : (
            (() => {
              const IconComponent = icon;
              return <IconComponent className={`w-5 h-5 ${color}`} />;
            })()
          )}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        {subtitle && (
          <span className="text-xs text-gray-500 mb-1">{subtitle}</span>
        )}
      </div>
    </div>
  );
}

function EditStoreForm({ store, plans, onSubmit }) {
  const [isOverrideMode, setIsOverrideMode] = useState(
    store.plan_override_enabled || false
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      plan: store.plan,
      status: store.status,
      bundles_enabled: store.bundles_enabled,
      plan_override_enabled: store.plan_override_enabled || false,
      bundle_settings: {
        max_bundles_per_store: store.bundle_settings?.max_bundles_per_store,
        max_monthly_views: store.bundle_settings?.max_monthly_views,
        analytics_enabled: store.bundle_settings?.analytics_enabled,
      },
    },
  });

  // Watch plan changes to sync limits
  const selectedPlan = useWatch({ control, name: "plan" });

  // Sync plan limits when plan changes (unless in override mode)
  useEffect(() => {
    if (!isOverrideMode && selectedPlan && plans.length > 0) {
      const planConfig = plans.find((p) => p.key === selectedPlan);
      if (planConfig) {
        setValue(
          "bundle_settings.max_bundles_per_store",
          planConfig.limits.maxBundles
        );
        setValue(
          "bundle_settings.max_monthly_views",
          planConfig.limits.monthlyViews
        );
      }
    }
  }, [selectedPlan, plans, isOverrideMode, setValue]);

  const selectedPlanConfig = plans.find((p) => p.key === selectedPlan);

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      plan_override_enabled: isOverrideMode,
    });
  };

  return (
    <div className="space-y-6">
      {/* Override Mode Banner */}
      {isOverrideMode && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3 dark:bg-yellow-900/20 dark:border-yellow-900/30">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
              Override Mode Enabled
            </h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
              This store has custom configuration that overrides the default
              plan limits. Changes to plan tier will not auto-sync limits.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 space-y-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Store Configuration
          </h3>
          <button
            type="button"
            onClick={() => setIsOverrideMode(!isOverrideMode)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              isOverrideMode
                ? "bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50"
                : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700"
            }`}
          >
            {isOverrideMode ? (
              <>
                <Unlock className="w-3 h-3" />
                Override Active
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                Enable Override
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plan Tier
            </label>
            <select
              {...register("plan")}
              className="w-full px-3 py-2 border rounded-lg border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            >
              {plans.map((plan) => (
                <option key={plan.key} value={plan.key}>
                  {plan.label}
                </option>
              ))}
            </select>
            {selectedPlanConfig && !isOverrideMode && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Auto-sync: {selectedPlanConfig.limits.maxBundles} bundles,{" "}
                {selectedPlanConfig.limits.monthlyViews
                  ? `${selectedPlanConfig.limits.monthlyViews.toLocaleString()} views/mo`
                  : "Unlimited views"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Store Status
            </label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 border rounded-lg border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="needs_reauth">Needs Re-auth</option>
              <option value="uninstalled">Uninstalled</option>
            </select>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <span>Max Bundles Limit</span>
              {!isOverrideMode && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  (Plan: {selectedPlanConfig?.limits.maxBundles})
                </span>
              )}
            </label>
            <input
              type="number"
              {...register("bundle_settings.max_bundles_per_store", {
                valueAsNumber: true,
              })}
              disabled={!isOverrideMode}
              className="w-full px-3 py-2 border rounded-lg border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <span>Max Monthly Views</span>
              {!isOverrideMode && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  (Plan:{" "}
                  {selectedPlanConfig?.limits.monthlyViews
                    ? selectedPlanConfig.limits.monthlyViews.toLocaleString()
                    : "∞"}
                  )
                </span>
              )}
            </label>
            <input
              type="number"
              {...register("bundle_settings.max_monthly_views", {
                setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
              })}
              disabled={!isOverrideMode}
              placeholder="Leave empty for unlimited"
              className="w-full px-3 py-2 border rounded-lg border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("bundles_enabled")}
              className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black dark:bg-zinc-700 dark:border-zinc-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Bundles Feature
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("bundle_settings.analytics_enabled")}
              className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black dark:bg-zinc-700 dark:border-zinc-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Analytics Tracking
            </span>
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!isDirty}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>

      {/* Plan Features Display */}
      {selectedPlanConfig && <PlanFeaturesCard plan={selectedPlanConfig} />}
    </div>
  );
}

function PlanFeaturesCard({ plan }) {
  const featureCategories = {
    "Bundle Styling": [
      { key: "advancedBundleStyling", label: "Advanced Bundle Styling" },
      { key: "stickyButton", label: "Sticky CTA Button" },
      { key: "timer", label: "Countdown Timer" },
      { key: "freeShipping", label: "Free Shipping Badge" },
      { key: "couponControls", label: "Coupon Controls" },
      { key: "customHideSelectors", label: "Custom Hide Selectors" },
      { key: "reviewsWidget", label: "Reviews Widget" },
      { key: "announcement", label: "Announcement Banner" },
    ],
    "Analytics & Insights": [
      { key: "bundleAnalytics", label: "Bundle Analytics" },
      { key: "dashboardAnalytics", label: "Dashboard Analytics" },
      { key: "conversionInsights", label: "Conversion Insights" },
      { key: "bundlePerformance", label: "Bundle Performance" },
      { key: "offerAnalytics", label: "Offer Analytics" },
      { key: "productReviewsSection", label: "Product Reviews Section" },
    ],
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5" />
        {plan.label} Plan Features
      </h3>

      {/* Plan Limits */}
      <div className="mb-6 p-4 bg-zinc-50 rounded-lg dark:bg-zinc-800/50">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Plan Limits
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Max Bundles
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {plan.limits.maxBundles}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Monthly Views
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {plan.limits.monthlyViews
                  ? plan.limits.monthlyViews.toLocaleString()
                  : "Unlimited"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Categories */}
      <div className="space-y-6">
        {Object.entries(featureCategories).map(([category, features]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {category}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {features.map((feature) => {
                const isEnabled = plan.features[feature.key];
                return (
                  <div
                    key={feature.key}
                    className="flex items-center gap-2 text-sm"
                  >
                    {isEnabled ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300 dark:text-zinc-600 flex-shrink-0" />
                    )}
                    <span
                      className={
                        isEnabled
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-zinc-500"
                      }
                    >
                      {feature.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
