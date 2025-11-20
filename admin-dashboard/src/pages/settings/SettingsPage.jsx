import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../services/api";
import {
  Settings,
  Activity,
  Server,
  CheckCircle,
  XCircle,
  Loader2,
  Database,
} from "lucide-react";

export default function SettingsPage() {
  const {
    data: healthData,
    isLoading: healthLoading,
    error: healthError,
  } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const response = await adminApi.get("/admin/system/health");
      return response.data.data;
    },
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  const {
    data: workersData,
    isLoading: workersLoading,
    error: workersError,
  } = useQuery({
    queryKey: ["workers-status"],
    queryFn: async () => {
      const response = await adminApi.get("/admin/workers");
      return response.data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            System Settings & Health
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor system health and configure settings
          </p>
        </div>
      </div>

      {/* System Health Check */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Server className="w-5 h-5" /> System Health Overview
        </h2>
        {healthLoading ? (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading health data...
          </div>
        ) : healthError ? (
          <div className="text-red-500">Error: {healthError.message}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <HealthStatusCard
              title="Overall Status"
              status={healthData?.status}
            />
            <HealthStatusCard
              title="Database"
              status={healthData?.services?.database}
            />
            {healthData?.services?.redis && (
              <HealthStatusCard
                title="Redis"
                status={healthData.services.redis}
              />
            )}
            <HealthStatusCard
              title="Salla API"
              status={healthData?.services?.salla_api}
            />
            {healthData?.metrics?.active_connections !== undefined && (
              <MetricCard
                title="Active Connections"
                value={healthData.metrics.active_connections}
              />
            )}
            {healthData?.metrics?.pending_jobs !== undefined && (
              <MetricCard
                title="Pending Jobs"
                value={healthData.metrics.pending_jobs}
              />
            )}
          </div>
        )}
      </div>

      {/* Worker Status Monitoring */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Background Workers
        </h2>
        {workersLoading ? (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading worker
            status...
          </div>
        ) : workersError ? (
          <div className="text-red-500">Error: {workersError.message}</div>
        ) : (
          <div className="space-y-4">
            {workersData?.map((worker) => (
              <div
                key={worker.name}
                className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 rounded-lg dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 gap-3"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {worker.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {worker.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Schedule: {worker.schedule}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full capitalize border ${
                      worker.status === "healthy" ||
                      worker.status === "connected" ||
                      worker.status === "operational" ||
                      worker.status === "success"
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30"
                        : worker.status === "error" ||
                          worker.status === "unhealthy"
                        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                        : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                    }`}
                  >
                    {worker.status || "unknown"}
                  </span>
                  {worker.last_success_at && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Last: {new Date(worker.last_success_at).toLocaleString()}
                    </span>
                  )}
                  {worker.last_error_at && (
                    <span className="text-xs text-red-500 dark:text-red-400">
                      Error: {new Date(worker.last_error_at).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* General Settings (Placeholder) */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" /> General Configuration
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Further system-wide settings will be available here.
        </p>
      </div>
    </div>
  );
}

function HealthStatusCard({ title, status }) {
  const isHealthy =
    status === "healthy" || status === "connected" || status === "operational";
  const Icon = isHealthy ? CheckCircle : XCircle;
  const colorClass = isHealthy ? "text-green-600" : "text-red-600";
  const bgColorClass = isHealthy
    ? "bg-green-50 dark:bg-green-900/20"
    : "bg-red-50 dark:bg-red-900/20";

  return (
    <div className="p-4 bg-gray-50 rounded-lg dark:bg-zinc-800/50 flex items-center gap-3 border border-zinc-100 dark:border-zinc-700">
      <div className={`p-2 rounded-full ${bgColorClass}`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p
          className={`text-lg font-bold capitalize ${
            isHealthy
              ? "text-green-700 dark:text-green-400"
              : "text-red-700 dark:text-red-400"
          }`}
        >
          {status}
        </p>
      </div>
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg dark:bg-zinc-800/50 flex items-center gap-3 border border-zinc-100 dark:border-zinc-700">
      <div className="p-2 rounded-full bg-gray-100 dark:bg-zinc-700">
        <Database className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
