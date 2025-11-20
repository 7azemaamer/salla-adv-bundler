import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminApi } from "../../services/api";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Edit2,
  Trash2,
  PowerOff,
  Power,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../stores/authStore";

export default function UsersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    is_active: "",
    page: 1,
  });

  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  // Fetch admins list
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.role) params.append("role", filters.role);
      if (filters.is_active) params.append("is_active", filters.is_active);
      params.append("page", filters.page);

      const response = await adminApi.get(`/admin/admins?${params}`);
      return response.data.data;
    },
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await adminApi.get("/admin/admins/stats");
      return response.data.data;
    },
  });

  // Create admin mutation
  const createMutation = useMutation({
    mutationFn: (userData) => adminApi.post("/admin/admins", userData),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      queryClient.invalidateQueries(["admin-stats"]);
      setIsCreateModalOpen(false);
      toast.success("Admin user created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });

  // Update admin mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.patch(`/admin/admins/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      queryClient.invalidateQueries(["admin-stats"]);
      setEditingUser(null);
      toast.success("Admin user updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (id) => adminApi.post(`/admin/admins/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      queryClient.invalidateQueries(["admin-stats"]);
      toast.success("Status toggled successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to toggle status");
    },
  });

  // Delete admin mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.delete(`/admin/admins/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      queryClient.invalidateQueries(["admin-stats"]);
      toast.success("Admin user deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  const handleDelete = (admin) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${admin.email}? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(admin._id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage admin access and roles
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Admins" value={stats.total} />
          <StatCard
            title="Active"
            value={stats.active}
            color="text-green-600"
          />
          <StatCard
            title="Inactive"
            value={stats.inactive}
            color="text-red-600"
          />
          <StatCard
            title="Admin Role"
            value={stats.by_role?.admin || 0}
            color="text-purple-600"
          />
        </div>
      )}

      {/* Filters */}
      <div className="p-4 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email..."
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
          <select
            value={filters.role}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, role: e.target.value, page: 1 }))
            }
            className="px-3 py-2 border rounded-lg border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
          <select
            value={filters.is_active}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                is_active: e.target.value,
                page: 1,
              }))
            }
            className="px-3 py-2 border rounded-lg border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : data?.admins?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No admin users found
                    </p>
                  </td>
                </tr>
              ) : (
                data?.admins?.map((admin) => (
                  <tr
                    key={admin._id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold dark:bg-white dark:text-black">
                          {admin.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {admin.email}
                            {admin._id === currentUser?.id && (
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                (You)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {admin.roles?.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            <Shield className="w-3 h-3" />
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          admin.is_active
                            ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30"
                            : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                        }`}
                      >
                        {admin.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {admin.last_login_at
                        ? new Date(admin.last_login_at).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingUser(admin)}
                          className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 dark:hover:text-white"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {admin._id !== currentUser?.id && (
                          <>
                            <button
                              onClick={() =>
                                toggleStatusMutation.mutate(admin._id)
                              }
                              className={`p-1.5 transition-colors rounded-md ${
                                admin.is_active
                                  ? "text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  : "text-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                              }`}
                              title={
                                admin.is_active
                                  ? "Deactivate User"
                                  : "Activate User"
                              }
                            >
                              {admin.is_active ? (
                                <PowerOff className="w-4 h-4" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(admin)}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing page {data.pagination.current_page} of{" "}
              {data.pagination.total_pages} ({data.pagination.total_items}{" "}
              total)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
                disabled={!data.pagination.has_prev}
                className="px-3 py-1 text-sm border rounded-lg border-zinc-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
                disabled={!data.pagination.has_next}
                className="px-3 py-1 text-sm border rounded-lg border-zinc-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <CreateUserModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(data) => createMutation.mutate(data)}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={(data) =>
            updateMutation.mutate({ id: editingUser._id, data })
          }
        />
      )}
    </div>
  );
}

function StatCard({ title, value, color = "text-gray-600" }) {
  return (
    <div className="p-5 bg-white border rounded-xl shadow-sm border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
        {title}
      </p>
      <p className={`mt-2 text-2xl font-bold ${color} dark:text-white`}>
        {value}
      </p>
    </div>
  );
}

function CreateUserModal({ onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      roles: ["moderator"],
      is_active: true,
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Add New User
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create a new admin or moderator account
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-3 py-2 border rounded-lg border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              placeholder="user@example.com"
            />
            {errors.email && (
              <span className="text-xs text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Min 6 chars" },
              })}
              className="w-full px-3 py-2 border rounded-lg border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-xs text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              {...register("roles.0")}
              className="w-full px-3 py-2 border rounded-lg border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            >
              <option value="moderator">Moderator (Read Access)</option>
              <option value="admin">Administrator (Full Access)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("is_active")}
              className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black dark:bg-zinc-700 dark:border-zinc-600"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Active (user can login)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-200 dark:border-zinc-600 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: user.email,
      roles: user.roles || ["moderator"],
      is_active: user.is_active,
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Edit User
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Update admin user details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-3 py-2 border rounded-lg border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            />
            {errors.email && (
              <span className="text-xs text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password (leave empty to keep current)
            </label>
            <input
              type="password"
              {...register("password", {
                minLength: { value: 6, message: "Min 6 chars" },
              })}
              className="w-full px-3 py-2 border rounded-lg border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-xs text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              {...register("roles.0")}
              className="w-full px-3 py-2 border rounded-lg border-zinc-300 focus:ring-black focus:border-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            >
              <option value="moderator">Moderator (Read Access)</option>
              <option value="admin">Administrator (Full Access)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("is_active")}
              className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black dark:bg-zinc-700 dark:border-zinc-600"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Active (user can login)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-200 dark:border-zinc-600 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
