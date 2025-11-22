import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Store as StoreIcon,
  ExternalLink,
} from "lucide-react";

export default function StoresPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["stores", page, search, statusFilter, planFilter],
    queryFn: async () => {
      const params = {
        page,
        limit: 10,
        q: search,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(planFilter !== "all" && { plan: planFilter }),
      };
      const response = await adminApi.get("/admin/stores", { params });
      return response.data;
    },
    keepPreviousData: true,
  });

  const refreshTokenMutation = useMutation({
    mutationFn: (storeId) =>
      adminApi.post(`/admin/stores/${storeId}/refresh-token`),
    onSuccess: () => {
      queryClient.invalidateQueries(["stores"]);
      // Add toast notification here
    },
  });

  if (isLoading && !data)
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Loading stores...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Store Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and monitor all connected Salla stores
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-black rounded-lg hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            <RefreshCw className="w-4 h-4" />
            Sync All
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-white border rounded-xl shadow-sm border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search stores by name, domain, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg border-zinc-300 focus:ring-2 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:focus:ring-white dark:focus:border-white"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg border-zinc-300 focus:ring-2 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:focus:ring-white dark:focus:border-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="needs_reauth">Needs Reauth</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg border-zinc-300 focus:ring-2 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:focus:ring-white dark:focus:border-white"
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stores Table */}
      <div className="overflow-hidden bg-white border rounded-xl shadow-sm border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-gray-50 dark:bg-zinc-900/50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                Store Info
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                Plan
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                Bundles
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200 dark:divide-zinc-800 dark:bg-zinc-900">
            {data?.data?.map((store) => (
              <tr
                key={store.id}
                className="hover:bg-gray-50 dark:hover:bg-zinc-800/50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full dark:bg-zinc-800">
                      <StoreIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {store.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {store.domain}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                        store.plan === "enterprise"
                          ? "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                          : store.plan === "pro"
                          ? "bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                          : "bg-white text-gray-600 border-gray-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-700"
                      }`}
                    >
                      {store.plan}
                    </span>
                    {store.plan_override_enabled && (
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        title="Custom configuration"
                      >
                        ⚡
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                      store.status === "active"
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30"
                        : store.status === "needs_reauth"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                    }`}
                  >
                    {store.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {store.bundleStats?.activeBundles || 0} /{" "}
                  {store.bundleStats?.totalBundles || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        refreshTokenMutation.mutate(store.store_id)
                      }
                      className="p-1 text-gray-400 hover:text-black dark:hover:text-white"
                      title="Refresh Token"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/stores/${store.store_id || store.id}`)
                      }
                      className="p-1 text-gray-400 hover:text-black dark:hover:text-white"
                      title="View Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing page {data?.meta?.page} of {data?.meta?.totalPages}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 text-sm border rounded-lg border-zinc-300 disabled:opacity-50 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Previous
          </button>
          <button
            disabled={page === data?.meta?.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 text-sm border rounded-lg border-zinc-300 disabled:opacity-50 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
