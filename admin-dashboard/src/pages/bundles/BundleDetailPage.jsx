import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { adminApi } from "../../services/api";
import {
  ArrowLeft,
  Package,
  Store as StoreIcon,
  Eye,
  MousePointer,
  ShoppingCart,
  Calendar,
  Tag,
  ExternalLink,
  Percent,
  Gift,
} from "lucide-react";

export default function BundleDetailPage() {
  const { bundleId } = useParams();
  const navigate = useNavigate();

  // Fetch bundle details
  const { data, isLoading, error } = useQuery({
    queryKey: ["bundle-detail", bundleId],
    queryFn: async () => {
      const response = await adminApi.get(`/admin/bundles/${bundleId}`);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
        Loading bundle details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/20 dark:border-red-900/30">
        <p className="text-red-700 dark:text-red-400">
          Error loading bundle: {error.message}
        </p>
      </div>
    );
  }

  const { bundle, store } = data;

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30";
      case "draft":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
      case "inactive":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30";
      case "expired":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const calculateConversionRate = () => {
    if (!bundle.total_clicks || bundle.total_clicks === 0) return "0.00";
    return ((bundle.total_conversions / bundle.total_clicks) * 100).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/bundles")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {bundle.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Bundle Details & Analytics
          </p>
        </div>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full border capitalize ${getStatusColor(
            bundle.status
          )}`}
        >
          {bundle.status}
        </span>
      </div>

      {/* Store Info Card */}
      {store && (
        <Link
          to={`/stores/${store.store_id}`}
          className="block p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-100 rounded-lg dark:bg-zinc-800">
                <StoreIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {store.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {store.domain} • {store.merchant_email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                    {store.plan}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      store.bundles_enabled
                        ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {store.bundles_enabled
                      ? "Bundles Enabled"
                      : "Bundles Disabled"}
                  </span>
                </div>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Views"
          value={bundle.total_views}
          icon={Eye}
          color="text-blue-600"
        />
        <StatCard
          title="Total Clicks"
          value={bundle.total_clicks}
          icon={MousePointer}
          color="text-purple-600"
        />
        <StatCard
          title="Conversions"
          value={bundle.total_conversions}
          subtitle={`${calculateConversionRate()}% rate`}
          icon={ShoppingCart}
          color="text-green-600"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(bundle.total_revenue)}
          icon="riyal"
          color="text-green-600"
        />
      </div>

      {/* Bundle Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Bundle Information
          </h2>
          <div className="space-y-4">
            <InfoRow label="Bundle ID" value={bundle.id} mono />
            <InfoRow label="Store ID" value={bundle.store_id} mono />
            <InfoRow
              label="Target Product ID"
              value={bundle.target_product_id}
              mono
            />
            <InfoRow
              label="Target Product"
              value={bundle.target_product_name}
            />
            {bundle.description && (
              <InfoRow label="Description" value={bundle.description} />
            )}
            <InfoRow
              label="Created"
              value={new Date(bundle.created_at).toLocaleString()}
            />
            <InfoRow
              label="Last Updated"
              value={new Date(bundle.updated_at).toLocaleString()}
            />
            {bundle.start_date && (
              <InfoRow
                label="Start Date"
                value={new Date(bundle.start_date).toLocaleString()}
              />
            )}
            {bundle.expiry_date && (
              <InfoRow
                label="Expiry Date"
                value={new Date(bundle.expiry_date).toLocaleString()}
              />
            )}
          </div>
        </div>

        {/* Modal Configuration */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Modal Configuration
          </h2>
          <div className="space-y-4">
            {bundle.modal_title && (
              <InfoRow label="Modal Title" value={bundle.modal_title} />
            )}
            {bundle.modal_subtitle && (
              <InfoRow label="Modal Subtitle" value={bundle.modal_subtitle} />
            )}
            {bundle.cta_text && (
              <InfoRow label="CTA Button Text" value={bundle.cta_text} />
            )}
            {bundle.primary_color && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Primary Color
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-700"
                    style={{ backgroundColor: bundle.primary_color }}
                  />
                  <span className="text-sm text-gray-900 dark:text-white font-mono">
                    {bundle.primary_color}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bundle Tiers */}
      {bundle.bundles && bundle.bundles.length > 0 && (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Bundle Tiers ({bundle.bundles.length})
          </h2>
          <div className="space-y-4">
            {bundle.bundles.map((tier, index) => (
              <TierCard key={tier._id || index} tier={tier} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Additional Bundle Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CTA Button Config */}
        {(bundle.cta_button_text || bundle.cta_button_bg_color) && (
          <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              CTA Button Configuration
            </h2>
            <div className="space-y-4">
              {bundle.cta_button_text && (
                <InfoRow label="Button Text" value={bundle.cta_button_text} />
              )}
              {bundle.cta_button_bg_color && (
                <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Background Color
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-700"
                      style={{ backgroundColor: bundle.cta_button_bg_color }}
                    />
                    <span className="text-sm text-gray-900 dark:text-white font-mono">
                      {bundle.cta_button_bg_color}
                    </span>
                  </div>
                </div>
              )}
              {bundle.cta_button_text_color && (
                <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Text Color
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-700"
                      style={{ backgroundColor: bundle.cta_button_text_color }}
                    />
                    <span className="text-sm text-gray-900 dark:text-white font-mono">
                      {bundle.cta_button_text_color}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Checkout Button Config */}
        {(bundle.checkout_button_text || bundle.checkout_button_bg_color) && (
          <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Checkout Button Configuration
            </h2>
            <div className="space-y-4">
              {bundle.checkout_button_text && (
                <InfoRow
                  label="Button Text"
                  value={bundle.checkout_button_text}
                />
              )}
              {bundle.checkout_button_bg_color && (
                <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Background Color
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-700"
                      style={{
                        backgroundColor: bundle.checkout_button_bg_color,
                      }}
                    />
                    <span className="text-sm text-gray-900 dark:text-white font-mono">
                      {bundle.checkout_button_bg_color}
                    </span>
                  </div>
                </div>
              )}
              {bundle.checkout_button_text_color && (
                <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Text Color
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-700"
                      style={{
                        backgroundColor: bundle.checkout_button_text_color,
                      }}
                    />
                    <span className="text-sm text-gray-900 dark:text-white font-mono">
                      {bundle.checkout_button_text_color}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="p-5 bg-white border rounded-xl shadow-sm border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
          {title}
        </p>
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
      <p className={`text-2xl font-bold ${color} dark:text-white`}>{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span
        className={`text-sm text-gray-900 dark:text-white text-right max-w-xs ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function TierCard({ tier, index }) {
  return (
    <div
      className="p-5 rounded-lg border-2 dark:border-zinc-700"
      style={{
        backgroundColor: tier.tier_bg_color || "#f8f9fa",
        borderColor: tier.is_default
          ? "#000000"
          : tier.tier_highlight_bg_color || "#e0e0e0",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="text-lg font-bold"
              style={{ color: tier.tier_text_color || "#212529" }}
            >
              {tier.tier_title || `Tier ${tier.tier || index + 1}`}
            </h3>
            {tier.is_default && (
              <span className="px-2 py-0.5 text-xs font-medium bg-black text-white rounded-full dark:bg-white dark:text-black">
                Default
              </span>
            )}
          </div>
          {tier.tier_summary_text && (
            <p
              className="text-sm mb-2"
              style={{ color: tier.tier_text_color || "#212529" }}
            >
              {tier.tier_summary_text}
            </p>
          )}
          {tier.tier_highlight_text && (
            <span
              className="inline-block px-3 py-1 text-xs font-bold rounded-full"
              style={{
                backgroundColor: tier.tier_highlight_bg_color || "#ffc107",
                color: tier.tier_highlight_text_color || "#000000",
              }}
            >
              {tier.tier_highlight_text}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
            Buy Quantity
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: tier.tier_text_color || "#212529" }}
          >
            {tier.buy_quantity}
          </p>
        </div>
      </div>

      {/* Offers */}
      {tier.offers && tier.offers.length > 0 && (
        <div className="space-y-3">
          <p
            className="text-xs font-medium uppercase mb-2"
            style={{ color: tier.tier_text_color || "#212529", opacity: 0.7 }}
          >
            <Gift className="w-3 h-3 inline mr-1" />
            Offers ({tier.offers.length})
          </p>
          <div className="space-y-2">
            {tier.offers.map((offer, offerIndex) => (
              <div
                key={offer._id || offerIndex}
                className="flex items-center justify-between p-3 bg-white/80 rounded-lg dark:bg-zinc-900/80 backdrop-blur-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {offer.product_name}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-1">
                    ID: {offer.product_id}
                  </p>
                  {offer.arabic_message && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                      {offer.arabic_message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 ml-3">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    Qty: {offer.quantity}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                    {offer.offer_type}
                  </span>
                  {offer.discount_type && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        offer.discount_type === "free"
                          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      }`}
                    >
                      {offer.discount_type === "free"
                        ? "FREE"
                        : `${offer.discount_amount}% off`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
