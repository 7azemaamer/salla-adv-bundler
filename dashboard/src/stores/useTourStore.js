import { create } from "zustand";
import { persist } from "zustand/middleware";

const useTourStore = create(
  persist(
    (set, get) => ({
      completedTours: {}, // { dashboard: true, createBundle: true, ... }
      tourStep: 0,
      isTourActive: false,
      currentTourId: null,

      startTour: (tourId) =>
        set({ isTourActive: true, tourStep: 0, currentTourId: tourId }),

      completeTour: (tourId) =>
        set((state) => ({
          completedTours: { ...state.completedTours, [tourId]: true },
          isTourActive: false,
          currentTourId: null,
        })),

      skipTour: () => set({ isTourActive: false, currentTourId: null }),

      resetTour: (tourId) =>
        set((state) => {
          const newCompleted = { ...state.completedTours };
          delete newCompleted[tourId];
          return { completedTours: newCompleted, tourStep: 0 };
        }),

      resetAllTours: () =>
        set({ completedTours: {}, tourStep: 0, isTourActive: false }),

      hasCompletedTour: (tourId) => {
        const state = get();
        return state.completedTours[tourId] === true;
      },

      setTourStep: (step) => set({ tourStep: step }),
    }),
    {
      name: "salla-bundle-tour",
    }
  )
);

export default useTourStore;
