import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../services/api";
import {
  Users,
  Package,
  TrendingUp,
  Activity,
  ShoppingCart,
  Eye,
  MousePointer,
} from "lucide-react";

export default function DashboardHome() {
  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: async () => {
      const response = await adminApi.get("/admin/analytics/summary");
      return response.data.data;
    },
  });

  const { data: workers } = useQuery({
    queryKey: ["workers-status"],
    queryFn: async () => {
      const response = await adminApi.get("/admin/workers");
      return response.data.data;
    },
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 dark:text-red-400">
        Error loading dashboard data
      </div>
    );

  const stats = [
    {
      title: "Total Revenue",
      value: new Intl.NumberFormat("en-SA", {
        style: "currency",
        currency: "SAR",
      }).format(analytics?.bundles?.totalRevenue || 0),
      subValue: "From active bundles",
      icon: "riyal",
      color: "text-green-600",
    },
    {
      title: "Total Bundles",
      value: analytics?.bundles?.total || 0,
      subValue: `${analytics?.bundles?.active || 0} Active`,
      icon: Package,
      color: "text-gray-600",
    },
    {
      title: "Total Conversions",
      value: analytics?.bundles?.totalConversions || 0,
      subValue: `${analytics?.bundles?.conversionRate || 0}% Rate`,
      icon: ShoppingCart,
      color: "text-purple-600",
    },
    {
      title: "Total Views",
      value: new Intl.NumberFormat("en-US", { notation: "compact" }).format(
        analytics?.bundles?.totalViews || 0
      ),
      subValue: `${new Intl.NumberFormat("en-US", {
        notation: "compact",
      }).format(analytics?.bundles?.totalClicks || 0)} Clicks`,
      icon: Eye,
      color: "text-orange-600",
    },
  ];

  const storeStats = [
    {
      title: "Total Stores",
      value: analytics?.stores?.total || 0,
      subValue: `${analytics?.stores?.active || 0} Active`,
      icon: Users,
      color: "text-indigo-600",
    },
    {
      title: "Needs Reauth",
      value: analytics?.stores?.needsReauth || 0,
      subValue: "Action Required",
      icon: Activity,
      color: "text-red-600",
    },
    {
      title: "New (30d)",
      value: analytics?.stores?.createdLast30Days || 0,
      subValue: "Recent Installs",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Performance metrics and platform health
          </p>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 bg-white px-3 py-1 rounded-lg border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          Updated: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Primary Stats Grid */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 dark:text-gray-400">
          Performance
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Secondary Stats & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 dark:text-gray-400">
              Store Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {storeStats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>

          {/* Worker Status */}
          <div className="p-6 bg-white border rounded-xl shadow-sm border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              System Health
            </h3>
            <div className="space-y-3">
              {workers?.map((worker) => (
                <div
                  key={worker.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {worker.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {worker.schedule}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      worker.status === "success"
                        ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300"
                        : worker.status === "error"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {worker.status || "unknown"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan Distribution */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 dark:text-gray-400">
            Distribution
          </h3>
          <div className="p-6 bg-white border rounded-xl shadow-sm border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 h-full">
            <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">
              Store Plans
            </h3>
            <div className="space-y-6">
              {Object.entries(analytics?.stores?.planBreakdown || {}).map(
                ([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-black rounded-full dark:bg-white" />
                      <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                        {plan}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white bg-zinc-100 px-2 py-1 rounded dark:bg-zinc-800">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, icon, color }) {
  return (
    <div className="p-5 bg-white border rounded-xl shadow-sm border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`p-2.5 rounded-lg bg-opacity-10 ${color.replace(
            "text-",
            "bg-"
          )}`}
        >
          {icon === "riyal" ? (
            <img
              src="/riyal.svg"
              alt="SAR"
              className="w-5 h-5"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(39%) sepia(89%) saturate(433%) hue-rotate(88deg) brightness(97%) contrast(87%)",
              }}
            />
          ) : (
            (() => {
              const IconComponent = icon;
              return <IconComponent className={`w-5 h-5 ${color}`} />;
            })()
          )}
        </div>
      </div>
      <div className="mt-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-zinc-50 px-2 py-1 rounded dark:bg-zinc-800">
          {subValue}
        </span>
      </div>
    </div>
  );
}
