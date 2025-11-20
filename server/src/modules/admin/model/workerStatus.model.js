import mongoose from "mongoose";

const workerStatusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "bundleCleanup",
        "reviewCount",
        "tokenRefresh",
        "cacheCleanup",
        "reviewRefresh",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    schedule: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["idle", "running", "success", "error", "unknown"],
      default: "unknown",
    },
    last_run_at: {
      type: Date,
      default: null,
    },
    last_success_at: {
      type: Date,
      default: null,
    },
    last_error_at: {
      type: Date,
      default: null,
    },
    last_error_message: {
      type: String,
      default: null,
    },
    run_count: {
      type: Number,
      default: 0,
    },
    success_count: {
      type: Number,
      default: 0,
    },
    error_count: {
      type: Number,
      default: 0,
    },
    last_duration_ms: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const WorkerStatus = mongoose.model("WorkerStatus", workerStatusSchema);

export default WorkerStatus;
