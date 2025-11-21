import notificationService from "../services/notification.service.js";

/**
 * Get notifications for logged-in user's store
 */
export const getMyNotifications = async (req, res) => {
  try {
    const storeId = req.user?.store_id;
    const storePlan = req.user?.plan || "free";

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID not found",
      });
    }

    const notifications = await notificationService.getNotificationsForStore(
      storeId,
      storePlan
    );

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get my notifications error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notifications",
    });
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const storeId = req.user?.store_id;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID not found",
      });
    }

    await notificationService.markAsRead(id, storeId);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(error.message === "Notification not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to mark notification as read",
    });
  }
};

/**
 * Get unread count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const storeId = req.user?.store_id;
    const storePlan = req.user?.plan || "free";

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID not found",
      });
    }

    const count = await notificationService.getUnreadCount(storeId, storePlan);

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get unread count",
    });
  }
};
