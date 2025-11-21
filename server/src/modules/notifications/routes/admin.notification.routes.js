import express from "express";
import {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  getStatistics,
} from "../controllers/admin.notification.controller.js";

const router = express.Router();

// Get all notifications with optional filters
router.get("/", getAllNotifications);

// Get statistics
router.get("/statistics", getStatistics);

// Get specific notification
router.get("/:id", getNotificationById);

// Create notification
router.post("/", createNotification);

// Update notification
router.patch("/:id", updateNotification);

// Delete notification
router.delete("/:id", deleteNotification);

export default router;
