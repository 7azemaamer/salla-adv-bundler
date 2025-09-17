import express from "express";
import cors from "cors";
import { config } from "./src/config/env.js";
import connectDB from "./src/db/connectDB.js";
import firstVersion from "./src/routes/v1.routes.js";
import { errorMiddleware } from "./src/utils/errorHandler.js";

const app = express();

// CORS configuration
app.use(cors({
  origin: config.dashboard,
  credentials: true
}));

app.use(express.json());

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
