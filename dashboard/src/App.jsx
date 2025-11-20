import { useEffect } from "react";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import AppRouter from "./routes/AppRouter";
import useAuthStore from "./stores/useAuthStore";
import { usePlanRefresh } from "./hooks/usePlanRefresh";

// Custom theme for RTL support and Arabic typography
const theme = createTheme({
  dir: "rtl",
  fontFamily: "Almarai, Tajawal, sans-serif",
  primaryColor: "blue",
  colors: {
    blue: [
      "#e7f5ff",
      "#d0ebff",
      "#a5d8ff",
      "#74c0fc",
      "#339af0",
      "#228be6",
      "#1c7ed6",
      "#1971c2",
      "#1864ab",
      "#145388",
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        radius: "md",
        shadow: "sm",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  // Auto-refresh plan context every 5 minutes and on window focus
  usePlanRefresh({
    enableAutoRefresh: true,
    refreshIntervalMs: 5 * 60 * 1000, // 5 minutes
    refreshOnFocus: true,
  });

  useEffect(() => {
    // Initialize auth on app start
    initAuth();
  }, [initAuth]);

  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" zIndex={1000} />
      <AppRouter />
    </MantineProvider>
  );
}

export default App;
