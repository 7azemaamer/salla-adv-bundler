import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./src/config/env.js";
import connectDB from "./src/db/connectDB.js";
import firstVersion from "./src/routes/v1.routes.js";
import { errorMiddleware } from "./src/utils/errorHandler.js";
import "./src/workers/bundleCleanup.worker.js";
import { startReviewCountWorker } from "./src/workers/reviewCount.worker.js";
import { startTokenRefreshWorker } from "./src/workers/tokenRefresh.worker.js";
import { startCacheCleanupWorker } from "./src/workers/cacheCleanup.worker.js";
import { startReviewRefreshWorker } from "./src/workers/reviewRefresh.worker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (origin === config.dashboard) {
        return callback(null, true);
      }

      if (origin && origin.includes(".salla.sa")) {
        return callback(null, true);
      }

      if (
        origin &&
        (origin.startsWith("http://") || origin.startsWith("https://"))
      ) {
        return callback(null, true);
      }

      if (!origin) {
        return callback(null, true);
      }

      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// API Routes
app.use("/api/v1", firstVersion);

// Global Error middleware
app.use(errorMiddleware);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log("[Server_Init]: Server is running on port " + config.port);

      // Start background workers after server is running
      startReviewCountWorker();
      startTokenRefreshWorker(); // Easy Mode: Auto-refresh tokens every 5 days
      startCacheCleanupWorker(); // Cleanup expired product cache daily
      startReviewRefreshWorker(); // Refresh product reviews weekly on Sunday
    });
  } catch (err) {
    console.error("[Server_Init]: Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
