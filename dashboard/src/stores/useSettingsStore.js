import { create } from "zustand";
import axios from "axios";
import useAuthStore from "./useAuthStore";

const useSettingsStore = create((set, get) => ({
  // State
  settings: {
    hide_default_buttons: false,
    hide_salla_offer_modal: false,
    hide_product_options: false,
    hide_quantity_input: false,
    hide_price_section: false,
    sticky_button: {
      enabled: false,
      text: " اطلب باقتك الآن",
      bg_color: "#10b981",
      text_color: "#ffffff",
      position: "bottom-center",
      width_type: "auto",
    },
    free_shipping: {
      enabled: true,
      mode: "always",
      min_price: 0,
      text: "شحن مجاني لهذه الباقة",
      progress_text: "أضف {amount} ريال للحصول على شحن مجاني",
      motivation_0_25: " ابدأ رحلتك نحو الشحن المجاني!",
      motivation_25_50: " أحسنت! واصل التقدم...",
      motivation_50_75: "رائع! اقتربت جداً من الهدف!",
      motivation_75_100: " ممتاز! خطوة أخيرة فقط!",
      bg_color: "#10b981",
      text_color: "#ffffff",
      icon: "truck",
      progress_color: "#ffffff",
      progress_bg_color: "rgba(255, 255, 255, 0.3)",
    },
    timer: {
      enabled: true,
      duration: 21600,
      duration_type: "6h",
      auto_restart: true,
      effect: "pulse",
      text_color: "#0E1012",
      bg_color: "#FFFFFF",
      border_color: "#E5E8EC",
      border_radius: 12,
      label: "عرض محدود ينتهي خلال",
      label_color: "#60646C",
      font_size: 14,
    },
    review_date_randomizer: {
      enabled: false,
      presets: [
        "قبل يوم",
        "قبل يومين",
        "قبل 3 أيام",
        "قبل 5 أيام",
        "منذ أسبوع",
        "منذ 10 أيام",
        "منذ أسبوعين",
        "منذ 3 أسابيع",
        "منذ شهر",
        "منذ شهر ونصف",
      ],
      hide_real_reviews: false,
    },
    review_display: {
      hide_dates: false,
      hide_ratings: false,
      hide_names: false,
      hide_avatars: false,
    },
    announcement: {
      enabled: false,
      title: "",
      content: "إعلان مهم للعملاء",
      icon: "info",
      bg_color: "#e0f2fe",
      text_color: "#0c4a6e",
    },
  },
  loading: {
    fetching: false,
    updating: false,
  },
  error: null,
  planContext: null,

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
        const planContext = response.data.meta || get().planContext;
        set({
          settings: response.data.data,
          planContext,
        });
        if (planContext) {
          useAuthStore.getState().setPlanContext(planContext);
        }
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
        const planContext = response.data.meta || get().planContext;
        set({
          settings: response.data.data,
          planContext,
        });
        if (planContext) {
          useAuthStore.getState().setPlanContext(planContext);
        }
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

  // Toggle specific setting (supports nested paths with dot notation)
  toggleSetting: async (key) => {
    try {
      const state = get();

      // Support nested paths like "timer.enabled" or "sticky_button.enabled"
      const keys = key.split(".");
      let currentValue;

      if (keys.length === 1) {
        // Flat key (e.g., "hide_default_buttons")
        currentValue = state.settings[key];
      } else {
        // Nested key (e.g., "timer.enabled")
        const [parent, child] = keys;
        currentValue = state.settings[parent]?.[child];
      }

      const newValue = !currentValue;

      // Optimistic update
      if (keys.length === 1) {
        // Flat key update
        set((state) => ({
          settings: { ...state.settings, [key]: newValue },
        }));
      } else {
        // Nested key update
        const [parent, child] = keys;
        set((state) => ({
          settings: {
            ...state.settings,
            [parent]: {
              ...state.settings[parent],
              [child]: newValue,
            },
          },
        }));
      }

      // Call API with nested structure
      if (keys.length === 1) {
        await get().updateSettings({ [key]: newValue });
      } else {
        const [parent, child] = keys;
        await get().updateSettings({
          [parent]: {
            ...state.settings[parent],
            [child]: newValue,
          },
        });
      }
    } catch (error) {
      // Revert on error
      const state = get();
      const keys = key.split(".");
      let currentValue;

      if (keys.length === 1) {
        currentValue = state.settings[key];
        set((state) => ({
          settings: { ...state.settings, [key]: !currentValue },
        }));
      } else {
        const [parent, child] = keys;
        currentValue = state.settings[parent]?.[child];
        set((state) => ({
          settings: {
            ...state.settings,
            [parent]: {
              ...state.settings[parent],
              [child]: !currentValue,
            },
          },
        }));
      }

      throw error;
    }
  },

  // Refetch payment methods from Salla
  refetchPaymentMethods: async () => {
    try {
      const response = await axios.post("/settings/refetch-payment-methods");

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to refetch payment methods"
        );
      }
    } catch (error) {
      console.error("Refetch payment methods error:", error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(errorMessage);
    }
  },
}));

export default useSettingsStore;
