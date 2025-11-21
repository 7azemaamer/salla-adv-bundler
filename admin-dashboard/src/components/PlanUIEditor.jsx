import React, { useState } from "react";
import {
  Plus,
  Trash2,
  X,
  DollarSign,
  CheckCircle,
  XCircle,
  Link2,
  Award,
  Type,
  FileText,
} from "lucide-react";

export default function PlanUIEditor({ plan, onSave, onClose }) {
  const [formData, setFormData] = useState({
    displayTitle: plan?.ui?.displayTitle || plan?.label || "",
    displayDescription: plan?.ui?.displayDescription || plan?.description || "",
    featuresIncluded: plan?.ui?.featuresIncluded || [],
    featuresExcluded: plan?.ui?.featuresExcluded || [],
    discountBadge: plan?.ui?.discountBadge || "",
    upgradeLink: plan?.ui?.upgradeLink || "",
    ctaButtonText: plan?.ui?.ctaButtonText || "ترقية الآن",
    highlight: plan?.ui?.highlight || false,
    popularBadge: plan?.ui?.popularBadge || "",
    displayOrder: plan?.ui?.displayOrder || 0,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateFeatureIncluded = (index, value) => {
    const newFeatures = [...formData.featuresIncluded];
    newFeatures[index] = value;
    updateField("featuresIncluded", newFeatures);
  };

  const addFeatureIncluded = () => {
    updateField("featuresIncluded", [...formData.featuresIncluded, ""]);
  };

  const removeFeatureIncluded = (index) => {
    updateField(
      "featuresIncluded",
      formData.featuresIncluded.filter((_, i) => i !== index)
    );
  };

  const updateFeatureExcluded = (index, value) => {
    const newFeatures = [...formData.featuresExcluded];
    newFeatures[index] = value;
    updateField("featuresExcluded", newFeatures);
  };

  const addFeatureExcluded = () => {
    updateField("featuresExcluded", [...formData.featuresExcluded, ""]);
  };

  const removeFeatureExcluded = (index) => {
    updateField(
      "featuresExcluded",
      formData.featuresExcluded.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Plan UI: {plan?.label}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Customize how this plan appears to users on the plans page
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div className="p-6 space-y-6">
            {/* Display Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Type size={16} />
                Display Title
              </label>
              <input
                type="text"
                value={formData.displayTitle}
                onChange={(e) => updateField("displayTitle", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                placeholder="e.g., Basic Plan"
              />
            </div>

            {/* Display Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText size={16} />
                Display Description
              </label>
              <textarea
                value={formData.displayDescription}
                onChange={(e) =>
                  updateField("displayDescription", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white resize-none"
                placeholder="Short description shown to users"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-4">
                <DollarSign size={18} />
                Pricing
              </h3>

              {/* Plan Configuration Prices (Disabled/Read-only) */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (from plan config)
                  </label>
                  <input
                    type="text"
                    value={
                      plan?.price
                        ? `${plan.price} ${plan.currency || "SAR"}`
                        : "Free"
                    }
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Original Price (from plan config)
                  </label>
                  <input
                    type="text"
                    value={plan?.originalPrice || "Not set"}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Discount Badge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discount Badge
                </label>
                <input
                  type="text"
                  value={formData.discountBadge}
                  onChange={(e) => updateField("discountBadge", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  placeholder="Save $50"
                />
              </div>
            </div>

            {/* Features */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-4">
                <CheckCircle size={18} />
                Features
              </h3>

              {/* Features Included */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <CheckCircle size={16} className="text-green-600" />
                  Included Features
                </label>
                <div className="space-y-2">
                  {formData.featuresIncluded.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) =>
                          updateFeatureIncluded(index, e.target.value)
                        }
                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                        placeholder="e.g., Up to 10 bundles"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeatureIncluded(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeatureIncluded}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-gray-300 dark:border-zinc-700"
                  >
                    <Plus size={18} />
                    <span>Add Feature</span>
                  </button>
                </div>
              </div>

              {/* Features Excluded */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <XCircle size={16} className="text-gray-500" />
                  Excluded Features
                </label>
                <div className="space-y-2">
                  {formData.featuresExcluded.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) =>
                          updateFeatureExcluded(index, e.target.value)
                        }
                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                        placeholder="e.g., Advanced analytics"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeatureExcluded(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeatureExcluded}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-gray-300 dark:border-zinc-700"
                  >
                    <Plus size={18} />
                    <span>Add Locked Feature</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Upgrade Options */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-4">
                <Link2 size={18} />
                Upgrade Options
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upgrade Link
                  </label>
                  <input
                    type="text"
                    value={formData.upgradeLink}
                    onChange={(e) => updateField("upgradeLink", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.ctaButtonText}
                    onChange={(e) =>
                      updateField("ctaButtonText", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                    placeholder="Upgrade Now"
                  />
                </div>
              </div>
            </div>

            {/* Badges & Highlighting */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-4">
                <Award size={18} />
                Badges & Highlighting
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan Highlighting
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-300 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.highlight}
                      onChange={(e) =>
                        updateField("highlight", e.target.checked)
                      }
                      className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black dark:bg-zinc-700 dark:border-zinc-600 dark:text-white dark:focus:ring-white"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Highlight Plan (colored border)
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Popular Badge
                  </label>
                  <input
                    type="text"
                    value={formData.popularBadge}
                    onChange={(e) =>
                      updateField("popularBadge", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                    placeholder="Most Popular"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    updateField("displayOrder", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Lower numbers appear first (e.g., 0, 1, 2, 3...)
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-zinc-800 shadow-sm dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
