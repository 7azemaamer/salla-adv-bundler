import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/api";
import {
  Plus,
  Edit2,
  Trash2,
  Bell,
  Filter,
  Eye,
  EyeOff,
  Calendar,
  Target,
} from "lucide-react";
import NotificationModal from "../../components/NotificationModal";

export default function NotificationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const queryClient = useQueryClient();

  // Fetch Notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", filterStatus],
    queryFn: async () => {
      const params = {};
      if (filterStatus !== "all") {
        params.isActive = filterStatus === "active";
      }
      const response = await adminApi.get("/admin/notifications", { params });
      return response.data.data;
    },
  });

  // Fetch Statistics
  const { data: stats } = useQuery({
    queryKey: ["notification-stats"],
    queryFn: async () => {
      const response = await adminApi.get("/admin/notifications/statistics");
      return response.data.data;
    },
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.delete(`/admin/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notification-stats"]);
    },
  });

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingNotification(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNotification(null);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      deleteMutation.mutate(id);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      success:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      warning:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[type] || colors.info;
  };

  const getPriorityLabel = (priority) => {
    const labels = { 1: "Low", 2: "Normal", 3: "High" };
    return labels[priority] || "Normal";
  };

  const getTargetLabel = (target) => {
    if (target.type === "all") return "All Users";
    if (target.type === "plan")
      return `Plan: ${target.plans?.join(", ") || "None"}`;
    if (target.type === "store")
      return `Specific Stores (${target.storeIds?.length || 0})`;
    return "Specific Users";
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage user notifications and announcements
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-black rounded-lg hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <Plus className="w-4 h-4" />
          Create Notification
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 bg-white border rounded-lg border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="p-4 bg-white border rounded-lg border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Active
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.active}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="p-4 bg-white border rounded-lg border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Inactive
                </p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {stats.inactive}
                </p>
              </div>
              <EyeOff className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="p-4 bg-white border rounded-lg border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Expired
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.expired}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filterStatus === "all"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus("active")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filterStatus === "active"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-700"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilterStatus("inactive")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filterStatus === "inactive"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-700"
          }`}
        >
          Inactive
        </button>
      </div>

      {/* Notifications Table */}
      <div className="overflow-hidden bg-white border rounded-lg border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                  Notification
                </th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                  Target
                </th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                  Priority
                </th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                  Created
                </th>
                <th className="px-4 py-3 text-xs font-medium text-right text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {notifications?.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No notifications found
                  </td>
                </tr>
              ) : (
                notifications?.map((notification) => (
                  <tr
                    key={notification._id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {notification.message}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        {notification.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {getTargetLabel(notification.target)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {getPriorityLabel(notification.priority)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          notification.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400"
                        }`}
                      >
                        {notification.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(notification)}
                          className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 dark:hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <NotificationModal
          notification={editingNotification}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
