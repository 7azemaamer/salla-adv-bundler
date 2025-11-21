import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { adminApi } from "../services/api";
import { X } from "lucide-react";

export default function NotificationModal({ notification, onClose }) {
  const queryClient = useQueryClient();
  const isEditing = !!notification;

  // Fetch available plans
  const { data: plansData } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await adminApi.get("/admin/plans");
      return response.data.data;
    },
  });

  const [formData, setFormData] = useState(() => {
    if (notification) {
      return {
        title: notification.title || "",
        message: notification.message || "",
        type: notification.type || "info",
        target: notification.target || { type: "all", plans: [], storeIds: [] },
        link: notification.link || "",
        priority: notification.priority || 2,
        startDate: notification.startDate
          ? new Date(notification.startDate).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        endDate: notification.endDate
          ? new Date(notification.endDate).toISOString().slice(0, 16)
          : "",
        isActive:
          notification.isActive !== undefined ? notification.isActive : true,
      };
    }

    return {
      title: "",
      message: "",
      type: "info",
      target: {
        type: "all",
        plans: [],
        storeIds: [],
      },
      link: "",
      priority: 2,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: "",
      isActive: true,
    };
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminApi.post("/admin/notifications", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notification-stats"]);
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      adminApi.patch(`/admin/notifications/${notification._id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notification-stats"]);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
      endDate: formData.endDate ? new Date(formData.endDate) : null,
    };

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateTargetField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      target: { ...prev.target, [field]: value },
    }));
  };

  const togglePlan = (plan) => {
    const plans = formData.target.plans || [];
    if (plans.includes(plan)) {
      updateTargetField(
        "plans",
        plans.filter((p) => p !== plan)
      );
    } else {
      updateTargetField("plans", [...plans, plan]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-xl dark:bg-zinc-900 max-h-[90vh] flex flex-col border border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? "Edit Notification" : "Create Notification"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isEditing
                  ? "Update notification details"
                  : "Send a new notification to users"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              placeholder="Important Update"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => updateField("message", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              placeholder="Notification message..."
              rows={4}
              required
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => updateField("type", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  updateField("priority", parseInt(e.target.value))
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              >
                <option value={1}>Low</option>
                <option value={2}>Normal</option>
                <option value={3}>High</option>
              </select>
            </div>
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Audience
            </label>
            <select
              value={formData.target.type}
              onChange={(e) => updateTargetField("type", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Users</option>
              <option value="plan">Specific Plans</option>
              <option value="store">Specific Stores</option>
            </select>
          </div>

          {/* Plan Selection */}
          {formData.target.type === "plan" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Plans
              </label>
              <div className="flex flex-wrap gap-2">
                {plansData?.map((plan) => (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => togglePlan(plan.key)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      formData.target.plans?.includes(plan.key)
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {plan.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Store IDs Input */}
          {formData.target.type === "store" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store IDs (comma separated)
              </label>
              <textarea
                value={formData.target.storeIds?.join(", ") || ""}
                onChange={(e) =>
                  updateTargetField(
                    "storeIds",
                    e.target.value
                      .split(",")
                      .map((id) => id.trim())
                      .filter(Boolean)
                  )
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                placeholder="store_id_1, store_id_2, store_id_3"
                rows={2}
              />
            </div>
          )}

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link (Optional)
            </label>
            <select
              value={formData.link}
              onChange={(e) => updateField("link", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
            >
              <option value="">-- No Link --</option>
              <optgroup label="Dashboard Pages">
                <option value="/dashboard">الرئيسية (Home)</option>
                <option value="/dashboard/bundles">الباقات (Bundles)</option>
                <option value="/dashboard/bundles/create">
                  إنشاء باقة (Create Bundle)
                </option>
                <option value="/dashboard/analytics">
                  التحليلات (Analytics)
                </option>
                <option value="/dashboard/settings">
                  الإعدادات (Settings)
                </option>
                <option value="/dashboard/plans">الخطط (Plans)</option>
                <option value="/dashboard/profile">
                  الملف الشخصي (Profile)
                </option>
              </optgroup>
              <optgroup label="External Link">
                <option value="custom">Custom URL...</option>
              </optgroup>
            </select>
            {formData.link === "custom" && (
              <input
                type="text"
                placeholder="https://example.com"
                onChange={(e) => updateField("link", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white mt-2"
              />
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Active Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => updateField("isActive", e.target.checked)}
                className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black dark:bg-zinc-700 dark:border-zinc-600 dark:text-white dark:focus:ring-white"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active (show to users immediately)
              </span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isLoading || updateMutation.isLoading}
            className="px-4 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-zinc-800 shadow-sm dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50"
          >
            {createMutation.isLoading || updateMutation.isLoading
              ? "Saving..."
              : isEditing
              ? "Update"
              : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
