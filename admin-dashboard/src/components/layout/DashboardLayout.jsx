import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Package,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import clsx from "clsx";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { logout, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Stores", href: "/stores", icon: Store },
    { name: "Bundles", href: "/bundles", icon: Package },
    { name: "Plans", href: "/plans", icon: CreditCard },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Users", href: "/users", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
      {/* Mobile Header */}
      <div className="fixed top-0 z-50 flex items-center justify-between w-full px-4 py-3 bg-white border-b border-zinc-200 lg:hidden dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 font-medium text-gray-700 bg-gray-100 rounded-full dark:bg-zinc-800 dark:text-gray-200">
            {user?.email?.[0]?.toUpperCase() || "A"}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 dark:bg-zinc-900 dark:border-zinc-800",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Salla Bundler
            </h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-zinc-100 text-gray-900 dark:bg-zinc-800 dark:text-white"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <item.icon
                    className={clsx(
                      "w-5 h-5",
                      isActive
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => {
                navigate("/profile");
                setIsSidebarOpen(false);
              }}
              className="flex items-center gap-3 px-2 mb-3 w-full rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center justify-center w-9 h-9 font-bold text-gray-700 bg-gray-100 rounded-full dark:bg-zinc-800 dark:text-white">
                {user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                  {user?.email || "Admin User"}
                </p>
                <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                  {user?.roles?.[0] || "Administrator"}
                </p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full gap-2 px-3 py-2 text-sm font-medium text-gray-600 transition-colors rounded-lg hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-gray-50 dark:bg-zinc-950">
        {/* Add top spacing on mobile to account for fixed header */}
        <div className="p-4 pt-20 lg:p-8 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
