import { create } from "zustand";
import axios from "axios";

const useBundleStore = create((set, get) => ({
  // State
  bundles: [],
  currentBundle: null,
  products: [],
  analytics: null,
  loading: {
    bundles: false,
    products: false,
    creating: false,
    updating: false,
    deleting: false,
    generating: false,
  },
  error: null,
  filters: {
    status: "all",
    search: "",
  },

  // Setters
  setLoading: (key, value) =>
    set((state) => ({
      loading: { ...state.loading, [key]: value },
    })),

  setError: (error) => set({ error }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  // Bundle Actions
  fetchBundles: async () => {
    try {
      set({ error: null });
      get().setLoading("bundles", true);

      const { filters } = get();
      const params = new URLSearchParams();

      if (filters.status !== "all") {
        params.append("status", filters.status);
      }

      const response = await axios.get(`/bundles?${params.toString()}`);

      if (response.data.success) {
        set({ bundles: response.data.data });
      } else {
        throw new Error(response.data.message || "Failed to fetch bundles");
      }
    } catch (error) {
      console.error("Fetch bundles error:", error);
      set({ error: error.response?.data?.message || error.message });
    } finally {
      get().setLoading("bundles", false);
    }
  },

  createBundle: async (bundleData) => {
    try {
      set({ error: null });
      get().setLoading("creating", true);

      const response = await axios.post("/bundles", bundleData);

      if (response.data.success) {
        // Add new bundle to list
        set((state) => ({
          bundles: [response.data.data, ...state.bundles],
        }));
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to create bundle");
      }
    } catch (error) {
      console.error("Create bundle error:", error);
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      get().setLoading("creating", false);
    }
  },

  updateBundle: async (bundleId, updateData) => {
    try {
      set({ error: null });
      get().setLoading("updating", true);

      const response = await axios.put(`/bundles/${bundleId}`, updateData);

      if (response.data.success) {
        // Update bundle in list
        set((state) => ({
          bundles: state.bundles.map((bundle) =>
            bundle._id === bundleId ? response.data.data : bundle
          ),
        }));

        return {
          ...response.data.data,
          offers_regenerated: response.data.offers_regenerated,
          offers_count: response.data.offers_count,
          error: response.data.error,
        };
      } else {
        throw new Error(response.data.message || "Failed to update bundle");
      }
    } catch (error) {
      console.error("Update bundle error:", error);
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      get().setLoading("updating", false);
    }
  },

  deleteBundle: async (bundleId) => {
    try {
      set({ error: null });
      get().setLoading("deleting", true);

      const response = await axios.delete(`/bundles/${bundleId}`);

      if (response.data.success) {
        // Remove bundle from list
        set((state) => ({
          bundles: state.bundles.filter((bundle) => bundle._id !== bundleId),
        }));
        return true;
      } else {
        throw new Error(response.data.message || "Failed to delete bundle");
      }
    } catch (error) {
      console.error("Delete bundle error:", error);
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      get().setLoading("deleting", false);
    }
  },

  generateOffers: async (bundleId) => {
    try {
      set({ error: null });
      get().setLoading("generating", true);

      const response = await axios.post(`/bundles/${bundleId}/offers/generate`);

      if (response.data.success) {
        // Update bundle status in list
        set((state) => ({
          bundles: state.bundles.map((bundle) =>
            bundle._id === bundleId
              ? {
                  ...bundle,
                  status: "active",
                  offers_count: response.data.data.offers_created,
                }
              : bundle
          ),
        }));
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to generate offers");
      }
    } catch (error) {
      console.error("Generate offers error:", error);
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      get().setLoading("generating", false);
    }
  },

  deactivateBundle: async (bundleId) => {
    try {
      set({ error: null });

      const response = await axios.post(`/bundles/${bundleId}/deactivate`);

      if (response.data.success) {
        // Update bundle status in list
        set((state) => ({
          bundles: state.bundles.map((bundle) =>
            bundle._id === bundleId ? { ...bundle, status: "inactive" } : bundle
          ),
        }));
        return true;
      } else {
        throw new Error(response.data.message || "Failed to deactivate bundle");
      }
    } catch (error) {
      console.error("Deactivate bundle error:", error);
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getBundleDetails: async (bundleId) => {
    try {
      set({ error: null });

      const response = await axios.get(`/bundles/${bundleId}`);

      if (response.data.success) {
        set({ currentBundle: response.data.data });
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch bundle details"
        );
      }
    } catch (error) {
      console.error("Get bundle details error:", error);
      set({ error: error.response?.data?.message || error.message });
    }
  },

  // Product Actions
  fetchProducts: async (search = "") => {
    try {
      set({ error: null });
      get().setLoading("products", true);

      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const response = await axios.get(`/products?${params.toString()}`);

      if (response.data.success) {
        set({ products: response.data.data.products || response.data.data });
      } else {
        throw new Error(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      set({ error: error.response?.data?.message || error.message });
    } finally {
      get().setLoading("products", false);
    }
  },

  // Analytics Actions
  fetchAnalytics: async (bundleId = null) => {
    try {
      set({ error: null });

      const endpoint = bundleId
        ? `/bundles/${bundleId}/analytics`
        : "/bundles/analytics";
      const response = await axios.get(endpoint);

      if (response.data.success) {
        set({ analytics: response.data.data });
      } else {
        throw new Error(response.data.message || "Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Fetch analytics error:", error);
      set({ error: error.response?.data?.message || error.message });
    }
  },

  // Track Events
  trackBundleView: async (bundleId) => {
    try {
      await axios.post(`/bundles/${bundleId}/track/view`);
    } catch (error) {
      console.error("Track view error:", error);
    }
  },

  trackBundleClick: async (bundleId) => {
    try {
      await axios.post(`/bundles/${bundleId}/track/click`);
    } catch (error) {
      console.error("Track click error:", error);
    }
  },

  trackBundleConversion: async (bundleId, revenue = 0) => {
    try {
      await axios.post(`/bundles/${bundleId}/track/conversion`, { revenue });
    } catch (error) {
      console.error("Track conversion error:", error);
    }
  },

  getFilteredBundles: () => {
    const { bundles, filters } = get();

    return bundles.filter((bundle) => {
      // Status filter
      if (filters.status !== "all" && bundle.status !== filters.status) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          bundle.name.toLowerCase().includes(searchLower) ||
          bundle.target_product_name?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  },

  // Reset state
  reset: () =>
    set({
      bundles: [],
      currentBundle: null,
      products: [],
      analytics: null,
      error: null,
      filters: {
        status: "all",
        search: "",
      },
    }),
}));

export default useBundleStore;
