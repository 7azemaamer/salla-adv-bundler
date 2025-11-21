import notificationService from "../services/notification.service.js";

/**
 * Get all notifications (Admin)
 */
export const getAllNotifications = async (req, res) => {
  try {
    const { isActive, type, targetType } = req.query;

    const filters = {};
    if (isActive !== undefined) filters.isActive = isActive === "true";
    if (type) filters.type = type;
    if (targetType) filters.targetType = targetType;

    const notifications = await notificationService.getAllNotifications(
      filters
    );

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get all notifications error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notifications",
    });
  }
};

/**
 * Get notification by ID (Admin)
 */
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await notificationService.getNotificationById(id);

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Get notification error:", error);
    res.status(error.message === "Notification not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to fetch notification",
    });
  }
};

/**
 * Create notification (Admin)
 */
export const createNotification = async (req, res) => {
  try {
    const adminId = req.user?._id || req.user?.id;

    const notification = await notificationService.createNotification(
      req.body,
      adminId
    );

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create notification",
    });
  }
};

/**
 * Update notification (Admin)
 */
export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await notificationService.updateNotification(
      id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Update notification error:", error);
    res.status(error.message === "Notification not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to update notification",
    });
  }
};

/**
 * Delete notification (Admin)
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await notificationService.deleteNotification(id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(error.message === "Notification not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to delete notification",
    });
  }
};

/**
 * Get notification statistics (Admin)
 */
export const getStatistics = async (req, res) => {
  try {
    const stats = await notificationService.getStatistics();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get statistics",
    });
  }
};
