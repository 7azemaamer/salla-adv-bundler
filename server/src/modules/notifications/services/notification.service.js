import Notification from "../model/notification.model.js";
import NotificationRead from "../model/notificationRead.model.js";

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(data, adminId) {
    try {
      const notification = new Notification({
        ...data,
        createdBy: adminId,
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw new Error("Failed to create notification");
    }
  }

  /**
   * Get all notifications (admin view)
   */
  async getAllNotifications(filters = {}) {
    try {
      const query = {};

      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.targetType) {
        query["target.type"] = filters.targetType;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .populate("createdBy", "name email")
        .lean();

      return notifications;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new Error("Failed to fetch notifications");
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(notificationId) {
    try {
      const notification = await Notification.findById(notificationId)
        .populate("createdBy", "name email")
        .lean();

      if (!notification) {
        throw new Error("Notification not found");
      }

      return notification;
    } catch (error) {
      console.error("Error fetching notification:", error);
      throw error;
    }
  }

  /**
   * Update notification
   */
  async updateNotification(notificationId, updates) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!notification) {
        throw new Error("Notification not found");
      }

      return notification;
    } catch (error) {
      console.error("Error updating notification:", error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      const notification = await Notification.findByIdAndDelete(notificationId);

      if (!notification) {
        throw new Error("Notification not found");
      }

      // Delete all read records for this notification
      await NotificationRead.deleteMany({ notificationId });

      return { success: true, message: "Notification deleted successfully" };
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  /**
   * Get notifications for a specific store (user view)
   */
  async getNotificationsForStore(storeId, storePlan) {
    try {
      const now = new Date();

      // Build query to find applicable notifications
      const query = {
        isActive: true,
        startDate: { $lte: now },
        $and: [
          {
            $or: [{ endDate: null }, { endDate: { $gte: now } }],
          },
          {
            $or: [
              { "target.type": "all" },
              { "target.type": "plan", "target.plans": storePlan },
              { "target.type": "store", "target.storeIds": storeId },
              { "target.type": "specific", "target.storeIds": storeId },
            ],
          },
        ],
      };

      const notifications = await Notification.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .lean();

      // Get read status for this store
      const notificationIds = notifications.map((n) => n._id);
      const readRecords = await NotificationRead.find({
        notificationId: { $in: notificationIds },
        storeId,
      }).lean();

      const readMap = new Map(
        readRecords.map((r) => [r.notificationId.toString(), r.readAt])
      );

      // Add read status to notifications
      const notificationsWithStatus = notifications.map((notification) => ({
        ...notification,
        isRead: readMap.has(notification._id.toString()),
        readAt: readMap.get(notification._id.toString()) || null,
      }));

      return notificationsWithStatus;
    } catch (error) {
      console.error("Error fetching store notifications:", error);
      throw new Error("Failed to fetch notifications");
    }
  }

  /**
   * Mark notification as read for a store
   */
  async markAsRead(notificationId, storeId) {
    try {
      // Check if notification exists
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new Error("Notification not found");
      }

      // Create or update read record (upsert)
      const readRecord = await NotificationRead.findOneAndUpdate(
        { notificationId, storeId },
        { $set: { readAt: new Date() } },
        { upsert: true, new: true }
      );

      return readRecord;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Get unread count for a store
   */
  async getUnreadCount(storeId, storePlan) {
    try {
      const now = new Date();

      // Get all applicable notifications
      const query = {
        isActive: true,
        startDate: { $lte: now },
        $and: [
          {
            $or: [{ endDate: null }, { endDate: { $gte: now } }],
          },
          {
            $or: [
              { "target.type": "all" },
              { "target.type": "plan", "target.plans": storePlan },
              { "target.type": "store", "target.storeIds": storeId },
              { "target.type": "specific", "target.storeIds": storeId },
            ],
          },
        ],
      };

      const notifications = await Notification.find(query).select("_id").lean();
      const notificationIds = notifications.map((n) => n._id);

      // Get read notifications
      const readCount = await NotificationRead.countDocuments({
        notificationId: { $in: notificationIds },
        storeId,
      });

      const unreadCount = notificationIds.length - readCount;

      return unreadCount;
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw new Error("Failed to get unread count");
    }
  }

  /**
   * Get notification statistics (admin)
   */
  async getStatistics() {
    try {
      const total = await Notification.countDocuments();
      const active = await Notification.countDocuments({ isActive: true });
      const expired = await Notification.countDocuments({
        endDate: { $lt: new Date() },
      });

      return {
        total,
        active,
        inactive: total - active,
        expired,
      };
    } catch (error) {
      console.error("Error getting notification statistics:", error);
      throw new Error("Failed to get statistics");
    }
  }
}

export default new NotificationService();
