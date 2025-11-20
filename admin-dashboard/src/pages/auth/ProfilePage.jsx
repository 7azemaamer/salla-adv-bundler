import React from "react";
import { useAuthStore } from "../../stores/authStore";
import { User, Shield, Mail, Clock, Key } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold dark:bg-white dark:text-black">
              {user?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.email}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                  <Shield className="w-3 h-3" />
                  {user?.roles?.join(", ") || "Admin"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Account Details
              </h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg dark:bg-zinc-800/50">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Email Address
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg dark:bg-zinc-800/50">
                  <Key className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      User ID
                    </p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {user?.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Card */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Session Info
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Status
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Active
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last Login
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {user?.last_login_at
                  ? new Date(user.last_login_at).toLocaleString()
                  : "Just now"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last IP
              </span>
              <span className="text-sm font-mono text-gray-900 dark:text-white">
                {user?.last_login_ip || "::1"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
