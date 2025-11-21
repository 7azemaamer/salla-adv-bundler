import { create } from "zustand";
import axios from "axios";

const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  // Fetch notifications
  fetchNotifications: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get("/notifications");

      if (response.data.success) {
        set({ notifications: response.data.data });
      }
    } catch (error) {
      console.error("Fetch notifications error:", error);
      set({ error: error.response?.data?.message || error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch unread count
  fetchUnreadCount: async () => {
    try {
      const response = await axios.get("/notifications/unread-count");

      if (response.data.success) {
        set({ unreadCount: response.data.data.count });
      }
    } catch (error) {
      console.error("Fetch unread count error:", error);
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      await axios.post(`/notifications/${notificationId}/read`);

      // Update local state
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        ),
      }));

      // Refresh unread count
      get().fetchUnreadCount();
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  },

  // Start polling for unread count
  startPolling: () => {
    // Initial fetch
    get().fetchUnreadCount();

    // Poll every 30 seconds
    const intervalId = setInterval(() => {
      get().fetchUnreadCount();
    }, 30000);

    return intervalId;
  },

  // Stop polling
  stopPolling: (intervalId) => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  },
}));

export default useNotificationStore;
