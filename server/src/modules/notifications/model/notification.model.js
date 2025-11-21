import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    target: {
      type: {
        type: String,
        enum: ["all", "plan", "store", "specific"],
        default: "all",
      },
      plans: [
        {
          type: String,
          enum: ["free", "basic", "pro", "enterprise", "special"],
        },
      ],
      storeIds: [
        {
          type: String, // Salla store IDs are strings, not ObjectIds
        },
      ],
    },
    link: {
      type: String,
      default: "",
      trim: true,
    },
    priority: {
      type: Number,
      enum: [1, 2, 3], // 1=low, 2=normal, 3=high
      default: 2,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null, // null means no expiry
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
notificationSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
notificationSchema.index({ "target.type": 1 });
notificationSchema.index({ "target.plans": 1 });
notificationSchema.index({ "target.storeIds": 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
