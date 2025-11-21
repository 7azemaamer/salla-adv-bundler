import mongoose from "mongoose";

const notificationReadSchema = new mongoose.Schema(
  {
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
    },
    storeId: {
      type: String, // Salla store IDs are strings, not ObjectIds
      required: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate reads and fast lookups
notificationReadSchema.index(
  { notificationId: 1, storeId: 1 },
  { unique: true }
);
notificationReadSchema.index({ storeId: 1, readAt: -1 });

const NotificationRead = mongoose.model(
  "NotificationRead",
  notificationReadSchema
);

export default NotificationRead;
