import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AuthCallback from "../components/auth/AuthCallback";
import LoginPage from "../pages/LoginPage";
import SetupPage from "../pages/SetupPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardHome from "../pages/DashboardHome";
import BundlesPage from "../pages/BundlesPage";
import CreateBundlePage from "../pages/CreateBundlePage";
import EditBundlePage from "../pages/EditBundlePage";
import BundleDetailsPage from "../pages/BundleDetailsPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import SettingsPage from "../pages/SettingsPage";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Routes - All wrapped in DashboardLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard sub-routes */}
          <Route index element={<DashboardHome />} />
          <Route path="bundles" element={<BundlesPage />} />
          <Route path="bundles/create" element={<CreateBundlePage />} />
          <Route path="bundles/:bundleId/edit" element={<EditBundlePage />} />
          <Route path="bundles/:bundleId" element={<BundleDetailsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
