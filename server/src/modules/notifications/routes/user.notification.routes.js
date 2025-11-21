import express from "express";
import {
  getMyNotifications,
  markNotificationAsRead,
  getUnreadCount,
} from "../controllers/user.notification.controller.js";
import { authenticateToken } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.use(authenticateToken);

// Get notifications for logged-in user's store
router.get("/", getMyNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark notification as read
router.post("/:id/read", markNotificationAsRead);

export default router;
