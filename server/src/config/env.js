import dotenv from "dotenv";
dotenv.config();

export const config = {
  // Server Port
  port: process.env.PORT || 3001,
  // App Status (dev)
  nodeEnv: process.env.NODE_ENV || "development",
  // Salla Keys
  clientKey: process.env.CLIENT_KEY || "CLIENT_KEY",
  clientSecretKey: process.env.CLIENT_SECRET_KEY || "CLIENT_SECRET_KEY",
  redirectUri: process.env.REDIRECT_URI,
  // Mongo Database URI
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/seo-booster",
  // Strong Token Secret
  jwtSecret: process.env.JWT_SECRET,
  // AI API Key
  aiApiKey: process.env.AI_API_KEY,
  // Webhook Security
  webhookSecret: process.env.WEBHOOK_SECRET,
  //dashboard
  dashboard: process.env.DASHBOARD_URL || "http://localhost:5173",
};
