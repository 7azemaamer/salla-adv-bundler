import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

axios.defaults.baseURL = API_BASE_URL;

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      planContext: null,

      // Actions
      setAuth: (token, user) => {
        // Set axios authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        set({
          token,
          user,
          isAuthenticated: true,
          planContext: user?.plan_context || null,
          error: null,
        });
      },

      clearAuth: () => {
        // Remove axios authorization header
        delete axios.defaults.headers.common["Authorization"];

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          planContext: null,
          error: null,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setPlanContext: (planContext) =>
        set((state) => ({
          planContext,
          user: state.user
            ? {
                ...state.user,
                plan_context: planContext,
              }
            : state.user,
        })),

      // Login via Salla redirect
      loginViaSalla: () => {
        window.location.href = `${API_BASE_URL}/auth/login`;
      },

      // Handle callback from Salla OAuth
      handleAuthCallback: (token, userData) => {
        try {
          const user =
            typeof userData === "string" ? JSON.parse(userData) : userData;
          get().setAuth(token, user);
          return true;
        } catch (error) {
          console.error("Auth callback error:", error);
          get().setError("Authentication failed");
          return false;
        }
      },

      // Logout
      logout: () => {
        get().clearAuth();
        // Optionally call server logout endpoint
        // axios.post('/auth/logout').catch(() => {});
      },

      // Validate token and refresh user data
      validateAuth: async () => {
        const { token } = get();
        if (!token) return false;

        try {
          set({ isLoading: true });

          // Set header for this request
          const response = await axios.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.success) {
            set({
              user: response.data.data,
              isAuthenticated: true,
              planContext: response.data.data?.plan_context || null,
              error: null,
            });
            return true;
          } else {
            get().clearAuth();
            return false;
          }
        } catch (error) {
          console.error("Auth validation error:", error);
          get().clearAuth();
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Refresh plan context (call after admin updates plan)
      refreshPlanContext: async () => {
        const { token } = get();
        if (!token) return false;

        try {
          const response = await axios.get("/auth/refresh-plan", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.success) {
            const newPlanContext = response.data.plan_context;
            get().setPlanContext(newPlanContext);
            console.log("✅ Plan context refreshed:", newPlanContext);
            return true;
          }
          return false;
        } catch (error) {
          console.error("Plan refresh error:", error);
          return false;
        }
      },

      // Initialize auth on app start
      initAuth: () => {
        const { token, isAuthenticated } = get();
        if (token && isAuthenticated) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({ isAuthenticated: true });
        } else {
          delete axios.defaults.headers.common["Authorization"];
          set({ isAuthenticated: false, planContext: null });
        }
      },
    }),
    {
      name: "salla-bundles-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        planContext: state.planContext,
      }),
    }
  )
);

axios.interceptors.request.use(
  (config) => {
    // Get current token from store
    const authStore = useAuthStore.getState();
    const token = authStore.token;

    if (token && authStore.isAuthenticated) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid, clear auth
      const authStore = useAuthStore.getState();
      authStore.clearAuth();

      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default useAuthStore;
