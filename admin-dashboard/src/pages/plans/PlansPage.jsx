import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/api";
import { useForm } from "react-hook-form";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RotateCcw,
  Package,
  Eye,
  Infinity as InfinityIcon,
  Save,
  Palette,
} from "lucide-react";
import PlanUIEditor from "../../components/PlanUIEditor";

export default function PlansPage() {
  const [editingPlan, setEditingPlan] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUI, setEditingUI] = useState(null);
  const queryClient = useQueryClient();

  // Fetch Plans
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await adminApi.get("/admin/plans");
      return response.data.data;
    },
  });

  // Sort plans by displayOrder
  const plans = plansData?.sort((a, b) => {
    const orderA = a.ui?.displayOrder ?? 999;
    const orderB = b.ui?.displayOrder ?? 999;
    return orderA - orderB;
  });

  // Fetch Features
  const { data: featuresData } = useQuery({
    queryKey: ["features"],
    queryFn: async () => {
      const response = await adminApi.get("/admin/plans/features");
      return response.data.data;
    },
  });

  const features = featuresData?.features || [];

  // Mutations
  const updatePlanMutation = useMutation({
    mutationFn: ({ key, data }) => adminApi.patch(`/admin/plans/${key}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["plans"]);
      setEditingPlan(null);
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: (data) => adminApi.post("/admin/plans", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["plans"]);
      setIsCreateModalOpen(false);
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (key) => adminApi.delete(`/admin/plans/${key}`),
    onSuccess: () => queryClient.invalidateQueries(["plans"]),
  });

  const resetPlanMutation = useMutation({
    mutationFn: (key) => adminApi.post(`/admin/plans/${key}/reset`),
    onSuccess: () => queryClient.invalidateQueries(["plans"]),
  });

  if (plansLoading)
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Loading plans...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Plan Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure subscription plans, limits, and feature access
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-black rounded-lg hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <Plus className="w-4 h-4" />
          Create New Plan
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {plans?.map((plan) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            features={features}
            isEditing={editingPlan?.key === plan.key}
            onEdit={() => setEditingPlan(plan)}
            onCancel={() => setEditingPlan(null)}
            onSave={(data) =>
              updatePlanMutation.mutate({ key: plan.key, data })
            }
            onDelete={() => deletePlanMutation.mutate(plan.key)}
            onReset={() => resetPlanMutation.mutate(plan.key)}
            onEditUI={() => setEditingUI(plan)}
          />
        ))}
      </div>

      {isCreateModalOpen && (
        <CreatePlanModal
          features={features}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(data) => createPlanMutation.mutate(data)}
        />
      )}

      {editingUI && (
        <PlanUIEditor
          plan={editingUI}
          onSave={(uiData) => {
            updatePlanMutation.mutate({
              key: editingUI.key,
              data: { ui: uiData },
            });
            setEditingUI(null);
          }}
          onClose={() => setEditingUI(null)}
        />
      )}
    </div>
  );
}

function PlanCard({
  plan,
  features,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onReset,
  onEditUI,
}) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: plan,
  });

  const maxBundles = watch("limits.maxBundles");
  const monthlyViews = watch("limits.monthlyViews");

  React.useEffect(() => {
    if (isEditing) reset(plan);
  }, [isEditing, plan, reset]);

  const onSubmit = (data) => {
    onSave(data);
  };

  // Helper to toggle unlimited
  const toggleUnlimited = (field, currentValue) => {
    if (currentValue === null) {
      setValue(field, 0); // Set to 0 or some default when unchecking unlimited
    } else {
      setValue(field, null); // Set to null for unlimited
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border shadow-sm rounded-xl border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 transition-all hover:shadow-md">
      {isEditing ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full p-5 gap-4"
        >
          {/* Header Edit */}
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-2">
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Plan Name
              </label>
              <input
                {...register("label")}
                className="w-full px-3 py-2 text-lg font-bold border rounded-lg border-zinc-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                placeholder="Plan Name"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Key
              </label>
              <span className="inline-block px-2 py-1 text-xs font-mono font-medium text-gray-600 bg-gray-100 rounded dark:bg-zinc-800 dark:text-gray-300">
                {plan.key}
              </span>
            </div>
          </div>

          {/* Pricing Edit */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg dark:bg-zinc-800/50">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Price
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", {
                    valueAsNumber: true,
                    min: 0,
                    validate: (value) =>
                      value >= 0 || "Price must be 0 or greater",
                  })}
                  className="w-full pl-3 pr-8 py-2 text-sm border rounded-lg border-zinc-300 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  onKeyDown={(e) => {
                    // Prevent minus sign
                    if (e.key === "-" || e.key === "e" || e.key === "E") {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Original Price
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("originalPrice", {
                    valueAsNumber: true,
                    min: 0,
                    validate: (value) =>
                      !value || value >= 0 || "Price must be 0 or greater",
                  })}
                  className="w-full pl-3 pr-8 py-2 text-sm border rounded-lg border-zinc-300 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="For discount display"
                  onKeyDown={(e) => {
                    // Prevent minus sign
                    if (e.key === "-" || e.key === "e" || e.key === "E") {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Currency
              </label>
              <select
                {...register("currency")}
                className="w-full px-3 py-2 text-sm border rounded-lg border-zinc-300 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              >
                <option value="SAR">SAR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* Limits Edit */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4" /> Limits
            </h4>

            {/* Max Bundles */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Max Bundles
                </label>
                <input
                  type="number"
                  disabled={maxBundles === null}
                  {...register("limits.maxBundles", { valueAsNumber: true })}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-zinc-300 disabled:opacity-50 disabled:bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => toggleUnlimited("limits.maxBundles", maxBundles)}
                className={`px-3 py-2 mb-[1px] border rounded-lg text-sm font-medium transition-colors ${
                  maxBundles === null
                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                    : "bg-white text-gray-700 border-zinc-300 hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600"
                }`}
              >
                <InfinityIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Monthly Views */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Monthly Views
                </label>
                <input
                  type="number"
                  disabled={monthlyViews === null}
                  {...register("limits.monthlyViews", { valueAsNumber: true })}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-zinc-300 disabled:opacity-50 disabled:bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  placeholder="Unlimited"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  toggleUnlimited("limits.monthlyViews", monthlyViews)
                }
                className={`px-3 py-2 mb-[1px] border rounded-lg text-sm font-medium transition-colors ${
                  monthlyViews === null
                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                    : "bg-white text-gray-700 border-zinc-300 hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600"
                }`}
              >
                <InfinityIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Features Edit */}
          <div className="flex-1 space-y-2 min-h-0 flex flex-col">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Check className="w-4 h-4" /> Features
            </h4>
            <div className="p-3 overflow-y-auto border rounded-lg border-zinc-200 dark:border-zinc-700 space-y-2 max-h-60 bg-gray-50 dark:bg-zinc-800/50">
              {features.map((feature) => (
                <label
                  key={feature.key}
                  className="flex items-center gap-3 p-2 bg-white rounded border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  <input
                    type="checkbox"
                    {...register(`features.${feature.key}`)}
                    className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black dark:bg-zinc-700 dark:border-zinc-600 dark:text-white dark:focus:ring-white"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
                    {feature.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 mt-auto border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              className="flex items-center justify-center flex-1 gap-2 px-4 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-zinc-800 shadow-sm transition-all dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-200 dark:border-zinc-600 dark:hover:bg-zinc-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Plan Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wide ${
                  plan.isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {plan.isActive ? "Active" : "Inactive"}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={onEdit}
                  className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 dark:hover:text-white"
                  title="Edit Plan"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {plan.label}
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {plan.price}
              </span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {plan.currency} / month
              </span>
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800"></div>

          {/* Limits & Features */}
          <div className="p-6 pt-4 flex-1 flex flex-col gap-6">
            {/* Limits */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Limits
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col p-3 bg-gray-50 rounded-lg dark:bg-zinc-800/50">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Package className="w-4 h-4" />
                    <span className="text-xs font-medium">Bundles</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {plan.limits.maxBundles ?? (
                      <InfinityIcon className="w-5 h-5" />
                    )}
                  </span>
                </div>
                <div className="flex flex-col p-3 bg-gray-50 rounded-lg dark:bg-zinc-800/50">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs font-medium">Views</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {plan.limits.monthlyViews ?? (
                      <InfinityIcon className="w-5 h-5" />
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Included Features
              </h4>
              <ul className="space-y-2.5">
                {features.slice(0, 5).map((feature) => {
                  const isIncluded = plan.features[feature.key];
                  return (
                    <li
                      key={feature.key}
                      className={`flex items-center gap-3 text-sm ${
                        isIncluded
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-400 dark:text-gray-600 line-through opacity-60"
                      }`}
                    >
                      {isIncluded ? (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/30">
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center dark:bg-zinc-800">
                          <X className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                      {feature.label}
                    </li>
                  );
                })}
                {features.length > 5 && (
                  <li className="pl-8 text-xs text-gray-500 font-medium">
                    + {features.length - 5} more features
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-gray-50 border-t border-zinc-100 dark:bg-zinc-800/30 dark:border-zinc-800 rounded-b-xl flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={onReset}
                disabled={plan.key === "basic"}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>

              {plan.key !== "basic" && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this plan?"))
                      onDelete();
                  }}
                  className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              )}
            </div>

            <button
              onClick={onEditUI}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <Palette className="w-3 h-3" /> Edit UI
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CreatePlanModal({ features, onClose, onSubmit }) {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      price: 0,
      currency: "SAR",
      limits: {
        maxBundles: 10,
        monthlyViews: 10000,
      },
      features: {},
    },
  });

  const maxBundles = watch("limits.maxBundles");
  const monthlyViews = watch("limits.monthlyViews");

  const toggleUnlimited = (field, currentValue) => {
    if (currentValue === null) {
      setValue(field, 1000);
    } else {
      setValue(field, null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-xl dark:bg-zinc-900 max-h-[90vh] flex flex-col border border-zinc-200 dark:border-zinc-800">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Create New Plan
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Define limits and features for the new tier
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto"
        >
          <div className="p-6 space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan Key <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("key")}
                  className="w-full px-3 py-2 border rounded-lg border-zinc-300 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white placeholder-gray-400"
                  placeholder="e.g., premium_plus"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unique identifier for the database
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Label <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("label")}
                  className="w-full px-3 py-2 border rounded-lg border-zinc-300 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white placeholder-gray-400"
                  placeholder="e.g., Premium Plus"
                  required
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg dark:bg-zinc-800/30 border border-gray-100 dark:border-zinc-800">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Price
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("price", {
                      valueAsNumber: true,
                      min: 0,
                      validate: (value) =>
                        value >= 0 || "Price must be 0 or greater",
                    })}
                    className="w-full pl-3 pr-4 py-2 border rounded-lg border-zinc-300 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    onKeyDown={(e) => {
                      // Prevent minus sign, e, and E
                      if (e.key === "-" || e.key === "e" || e.key === "E") {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  {...register("currency")}
                  className="w-full px-3 py-2 border rounded-lg border-zinc-300 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                >
                  <option value="SAR">SAR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            {/* Limits */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b pb-2 dark:border-zinc-800">
                Plan Limits
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Bundles
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      disabled={maxBundles === null}
                      {...register("limits.maxBundles", {
                        valueAsNumber: true,
                      })}
                      className="flex-1 px-3 py-2 border rounded-lg border-zinc-300 disabled:opacity-50 disabled:bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        toggleUnlimited("limits.maxBundles", maxBundles)
                      }
                      className={`px-3 py-2 border rounded-lg ${
                        maxBundles === null
                          ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                          : "bg-white text-gray-500 border-gray-300 dark:bg-zinc-800 dark:border-zinc-700"
                      }`}
                      title="Toggle Unlimited"
                    >
                      <InfinityIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Monthly Views
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      disabled={monthlyViews === null}
                      {...register("limits.monthlyViews", {
                        valueAsNumber: true,
                      })}
                      className="flex-1 px-3 py-2 border rounded-lg border-zinc-300 disabled:opacity-50 disabled:bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        toggleUnlimited("limits.monthlyViews", monthlyViews)
                      }
                      className={`px-3 py-2 border rounded-lg ${
                        monthlyViews === null
                          ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                          : "bg-white text-gray-500 border-gray-300 dark:bg-zinc-800 dark:border-zinc-700"
                      }`}
                      title="Toggle Unlimited"
                    >
                      <InfinityIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b pb-2 dark:border-zinc-800">
                Included Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feature) => (
                  <label
                    key={feature.key}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors border-zinc-200 dark:border-zinc-700"
                  >
                    <input
                      type="checkbox"
                      {...register(`features.${feature.key}`)}
                      className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black dark:bg-zinc-700 dark:border-zinc-600 dark:text-white dark:focus:ring-white"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {feature.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 rounded-b-xl flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-zinc-800 shadow-sm dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
