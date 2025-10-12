import express from "express";
import cors from "cors";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./src/config/env.js";
import connectDB from "./src/db/connectDB.js";
import firstVersion from "./src/routes/v1.routes.js";
import { errorMiddleware } from "./src/utils/errorHandler.js";
import "./src/workers/bundleCleanup.worker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable gzip compression for all responses
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from dashboard
      if (origin === config.dashboard) {
        return callback(null, true);
      }
      if (origin === "https://*.salla.sa") {
        return callback(null, true);
      }

      // Allow requests from any Salla store domain (*.salla.sa)
      if (origin && origin.includes('.salla.sa')) {
        return callback(null, true);
      }

      // Allow requests with no origin (like Postman, mobile apps, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Reject all other origins
      callback(new Error('Not allowed by CORS'));
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
    });
  } catch (err) {
    console.error("[Server_Init]: Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
