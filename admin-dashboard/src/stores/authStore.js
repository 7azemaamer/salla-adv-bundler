import { create } from "zustand";
import { adminApi } from "../services/api";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem("admin_token"),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApi.post("/admin/auth/login", {
        email,
        password,
      });
      const { token, admin } = response.data.data;

      localStorage.setItem("admin_token", token);
      set({
        user: admin,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Login failed",
        isLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("admin_token");
    set({ user: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      const response = await adminApi.get("/admin/auth/me");
      set({ user: response.data.data });
    } catch (error) {
      console.error("Failed to fetch profile", error);
      // If fetching profile fails with 401, logout
      if (error.response?.status === 401) {
        localStorage.removeItem("admin_token");
        set({ user: null, isAuthenticated: false });
      }
    }
  },
}));
