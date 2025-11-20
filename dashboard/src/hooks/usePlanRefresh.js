import { useEffect, useRef } from "react";
import useAuthStore from "../stores/useAuthStore";

export const usePlanRefresh = (options = {}) => {
  const {
    enableAutoRefresh = true,
    refreshIntervalMs = 5 * 60 * 1000, // 5 minutes default
    refreshOnFocus = true,
  } = options;

  const { refreshPlanContext, isAuthenticated } = useAuthStore();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enableAutoRefresh || !isAuthenticated) return;

    intervalRef.current = setInterval(() => {
      refreshPlanContext();
    }, refreshIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    enableAutoRefresh,
    isAuthenticated,
    refreshIntervalMs,
    refreshPlanContext,
  ]);

  // Refresh on window focus
  useEffect(() => {
    if (!refreshOnFocus || !isAuthenticated) return;

    const handleFocus = () => {
      refreshPlanContext();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshOnFocus, isAuthenticated, refreshPlanContext]);

  return { refreshPlanContext };
};
