import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../services/api";
import {
  Package,
  Search,
  ExternalLink,
  Eye,
  MousePointer,
  ShoppingCart,
  DollarSign,
  Calendar,
  Filter,
  Store as StoreIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BundlesPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    store_id: "",
    page: 1,
    limit: 25,
  });
  const [storeSearchTerm, setStoreSearchTerm] = useState("");

  const navigate = useNavigate();

  // Stable callbacks with useCallback
  const handleStoreSearchChange = useCallback((value) => {
    setStoreSearchTerm(value);
  }, []);

  const handleStoreSelect = useCallback((storeId) => {
    setFilters((prev) => ({ ...prev, store_id: storeId, page: 1 }));
  }, []);

  // Fetch stores list for filter dropdown
  const { data: storesData } = useQuery({
    queryKey: ["stores-list-filter"],
    queryFn: async () => {
      const response = await adminApi.get("/admin/stores?limit=100");
      return response.data.data || [];
    },
  });

  // Fetch bundles list
  const { data, isLoading } = useQuery({
    queryKey: ["admin-bundles", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("q", filters.search);
      if (filters.status) params.append("status", filters.status);
      if (filters.store_id) params.append("store_id", filters.store_id);
      params.append("page", filters.page);
      params.append("limit", filters.limit);

      const response = await adminApi.get(`/admin/bundles?${params}`);
      return response.data;
    },
  });

  // Filter stores based on search term
  const filteredStores =
    storesData?.filter((store) => {
      if (!storeSearchTerm) return true;
      const searchLower = storeSearchTerm.toLowerCase();
      return (
        store.name?.toLowerCase().includes(searchLower) ||
        store.domain?.toLowerCase().includes(searchLower) ||
        store.store_id?.toLowerCase().includes(searchLower)
      );
    }) || [];

  // Get selected store details
  const selectedStore = storesData?.find(
    (s) => s.store_id === filters.store_id
  );

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

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US", { notation: "compact" }).format(
      num || 0
    );
  };

  const calculateConversionRate = (conversions, clicks) => {
    if (!clicks || clicks === 0) return "0";
    return ((conversions / clicks) * 100).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bundle Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage bundles across all stores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {data?.meta?.total || 0} total bundles
          </span>
        </div>
      </div>

      {/* Stats Overview */}
      {data?.meta && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Bundles"
            value={data.meta.total}
            icon={Package}
          />
          <StatCard
            title="Current Page"
            value={`${data.meta.page}/${data.meta.totalPages}`}
            icon={Filter}
          />
        </div>
      )}

      {/* Filters */}
      <div className="p-4 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bundle name or product..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                  page: 1,
                }))
              }
              className="w-full pl-10 pr-3 py-2 border rounded-lg border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            />
          </div>

          <StoreSelect
            stores={filteredStores}
            selectedStore={selectedStore}
            storeSearchTerm={storeSearchTerm}
            onStoreSearchChange={handleStoreSearchChange}
            onStoreSelect={handleStoreSelect}
          />

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value,
                page: 1,
              }))
            }
            className="px-3 py-2 border rounded-lg border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          <button
            onClick={() => {
              setFilters({
                search: "",
                status: "",
                store_id: "",
                page: 1,
                limit: 25,
              });
              setStoreSearchTerm("");
            }}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-200 dark:border-zinc-600 dark:hover:bg-zinc-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
        {(filters.search || filters.status || filters.store_id) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Filter className="w-4 h-4" />
            <span>Active filters:</span>
            {filters.search && (
              <span className="px-2 py-1 bg-gray-100 rounded dark:bg-zinc-800">
                Search: "{filters.search}"
              </span>
            )}
            {filters.status && (
              <span className="px-2 py-1 bg-gray-100 rounded dark:bg-zinc-800 capitalize">
                Status: {filters.status}
              </span>
            )}
            {filters.store_id && selectedStore && (
              <span className="px-2 py-1 bg-gray-100 rounded dark:bg-zinc-800">
                Store: {selectedStore.name} ({selectedStore.store_id})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
              Loading bundles...
            </div>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No bundles found</p>
          </div>
        ) : (
          data?.data?.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              onViewDetails={() => navigate(`/bundles/${bundle.id}`)}
              onViewStore={() =>
                navigate(`/stores/${bundle.store_id || bundle.store?.store_id}`)
              }
              getStatusColor={getStatusColor}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
              calculateConversionRate={calculateConversionRate}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing page {data.meta.page} of {data.meta.totalPages} (
              {data.meta.total} total)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
                disabled={data.meta.page === 1}
                className="px-3 py-1 text-sm border rounded-lg border-zinc-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-white"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                {data.meta.page}
              </span>
              <button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
                disabled={data.meta.page >= data.meta.totalPages}
                className="px-3 py-1 text-sm border rounded-lg border-zinc-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: IconComponent }) {
  const IconToRender = IconComponent;
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
        <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <IconToRender className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
      </div>
    </div>
  );
}

const StoreSelect = React.memo(function StoreSelect({
  stores,
  selectedStore,
  storeSearchTerm,
  onStoreSearchChange,
  onStoreSelect,
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left border rounded-lg border-zinc-300 hover:bg-gray-50 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
      >
        <StoreIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="flex-1 truncate text-sm">
          {selectedStore ? (
            <>
              {selectedStore.name} ({selectedStore.store_id})
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">
              Filter by Store...
            </span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-zinc-200 dark:border-zinc-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stores..."
                value={storeSearchTerm}
                onChange={(e) => onStoreSearchChange(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-sm border rounded border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-60">
            <button
              type="button"
              onClick={() => {
                onStoreSelect("");
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300"
            >
              All Stores
            </button>
            {stores.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No stores found
              </div>
            ) : (
              stores.map((store) => (
                <button
                  key={store.store_id}
                  type="button"
                  onClick={() => {
                    onStoreSelect(store.store_id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 ${
                    selectedStore?.store_id === store.store_id
                      ? "bg-gray-100 dark:bg-zinc-700"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <StoreIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {store.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {store.domain} • {store.store_id}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        store.status === "active"
                          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-gray-50 text-gray-700 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {store.plan}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

function BundleCard({
  bundle,
  onViewDetails,
  onViewStore,
  getStatusColor,
  formatCurrency,
  formatNumber,
  calculateConversionRate,
}) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {bundle.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
            {bundle.target_product_name}
          </p>
        </div>
        <span
          className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border capitalize ${getStatusColor(
            bundle.status
          )}`}
        >
          {bundle.status}
        </span>
      </div>

      {/* Store Info */}
      {bundle.store && (
        <button
          onClick={onViewStore}
          className="w-full mb-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-left"
        >
          <div className="flex items-center gap-2">
            <StoreIcon className="w-4 h-4 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {bundle.store.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {bundle.store.domain}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
        </button>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-gray-50 rounded-lg dark:bg-zinc-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Views
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatNumber(bundle.total_views)}
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg dark:bg-zinc-800/50">
          <div className="flex items-center gap-2 mb-1">
            <MousePointer className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Clicks
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatNumber(bundle.total_clicks)}
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg dark:bg-zinc-800/50">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Conversions
            </span>
          </div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {bundle.total_conversions}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {calculateConversionRate(
              bundle.total_conversions,
              bundle.total_clicks
            )}
            % rate
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg dark:bg-zinc-800/50">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Revenue
            </span>
          </div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatCurrency(bundle.total_revenue)}
          </p>
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>
            Created: {new Date(bundle.created_at).toLocaleDateString()}
          </span>
        </div>
        {bundle.updated_at !== bundle.created_at && (
          <span>
            Updated: {new Date(bundle.updated_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* View Details Button */}
      <button
        onClick={onViewDetails}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        View Details
      </button>
    </div>
  );
}
