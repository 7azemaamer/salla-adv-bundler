import { create } from "zustand";
import axios from "axios";

const useSettingsStore = create((set, get) => ({
  // State
  settings: {
    hide_default_buttons: false,
  },
  loading: {
    fetching: false,
    updating: false,
  },
  error: null,

  // Setters
  setLoading: (key, value) =>
    set((state) => ({
      loading: { ...state.loading, [key]: value },
    })),

  setError: (error) => set({ error }),

  // Settings Actions
  fetchSettings: async () => {
    try {
      set({ error: null });
      get().setLoading("fetching", true);

      const response = await axios.get("/settings");

      if (response.data.success) {
        set({ settings: response.data.data });
      } else {
        throw new Error(response.data.message || "Failed to fetch settings");
      }
    } catch (error) {
      console.error("Fetch settings error:", error);
      set({ error: error.response?.data?.message || error.message });
      throw error;
    } finally {
      get().setLoading("fetching", false);
    }
  },

  updateSettings: async (updates) => {
    try {
      set({ error: null });
      get().setLoading("updating", true);

      const response = await axios.put("/settings", updates);

      if (response.data.success) {
        // Update settings in state
        set({ settings: response.data.data });
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Update settings error:", error);
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      get().setLoading("updating", false);
    }
  },

  // Toggle specific setting
  toggleSetting: async (key) => {
    try {
      const currentValue = get().settings[key];
      const newValue = !currentValue;

      // Optimistic update
      set((state) => ({
        settings: { ...state.settings, [key]: newValue },
      }));

      // Call API
      await get().updateSettings({ [key]: newValue });
    } catch (error) {
      // Revert on error
      const currentValue = get().settings[key];
      set((state) => ({
        settings: { ...state.settings, [key]: !currentValue },
      }));
      throw error;
    }
  },
}));

export default useSettingsStore;
