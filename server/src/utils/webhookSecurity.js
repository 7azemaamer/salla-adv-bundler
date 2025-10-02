import crypto from "crypto";
import { config } from "../config/env.js";

/* ===============
 * Verify Salla webhook signature
 * ===============*/
export const verifyWebhookSignature = (req, res, next) => {
  // ==================== FULL REQUEST LOGGING ====================
  console.log("\n" + "=".repeat(80));
  console.log("🔔 INCOMING WEBHOOK REQUEST");
  console.log("=".repeat(80));

  // Log timestamp
  console.log("⏰ Timestamp:", new Date().toISOString());

  // Log request method and URL
  console.log("\n📍 REQUEST INFO:");
  console.log("  Method:", req.method);
  console.log("  URL:", req.originalUrl);
  console.log("  Path:", req.path);
  console.log("  IP:", req.ip);
  console.log("  User-Agent:", req.headers['user-agent']);

  // Log ALL headers
  console.log("\n📋 ALL HEADERS:");
  Object.keys(req.headers).forEach(key => {
    console.log(`  ${key}: ${req.headers[key]}`);
  });

  // Log body
  console.log("\n📦 REQUEST BODY:");
  console.log(JSON.stringify(req.body, null, 2));

  // Log query parameters
  if (Object.keys(req.query).length > 0) {
    console.log("\n🔍 QUERY PARAMETERS:");
    console.log(JSON.stringify(req.query, null, 2));
  }

  // Extract Salla-specific headers
  const signature = req.headers["x-salla-signature"];
  const securityStrategy = req.headers["x-salla-security-strategy"];
  const sallaEvent = req.headers["x-salla-event"];
  const sallaMerchant = req.headers["x-salla-merchant"];

  console.log("\n🔐 SALLA SECURITY HEADERS:");
  console.log("  x-salla-signature:", signature || "❌ MISSING");
  console.log("  x-salla-security-strategy:", securityStrategy || "❌ MISSING");
  console.log("  x-salla-event:", sallaEvent || "Not provided");
  console.log("  x-salla-merchant:", sallaMerchant || "Not provided");

  console.log("\n🔑 WEBHOOK SECRET CONFIG:");
  console.log("  Configured Secret:", config.webhookSecret ? `✅ Set (${config.webhookSecret.substring(0, 10)}...)` : "❌ NOT SET");

  // Validation
  if (!signature || !securityStrategy) {
    console.log("\n❌ VALIDATION FAILED: Missing security headers");
    console.log("=".repeat(80) + "\n");
    return res.status(401).json({ error: "Missing security headers" });
  }

  if (securityStrategy === "signature") {
    const body = JSON.stringify(req.body);
    const webhookSecret = config.webhookSecret || "your-webhook-secret";

    console.log("\n🔐 SIGNATURE VALIDATION:");
    console.log("  Strategy: signature");
    console.log("  Body String:", body.substring(0, 100) + "...");
    console.log("  Body Length:", body.length);
    console.log("  Secret Used:", webhookSecret.substring(0, 10) + "...");

    const expectedSignature = crypto
      .createHash("sha256")
      .update(body + webhookSecret)
      .digest("hex");

    console.log("  Received Signature:", signature);
    console.log("  Expected Signature:", expectedSignature);
    console.log("  Signatures Match:", signature === expectedSignature ? "✅ YES" : "❌ NO");

    if (signature !== expectedSignature) {
      console.log("\n❌ VALIDATION FAILED: Invalid signature");
      console.log("=".repeat(80) + "\n");
      return res.status(401).json({ error: "Invalid signature" });
    }

    console.log("\n✅ SIGNATURE VALIDATION PASSED");
  } else {
    console.log("\n⚠️  SECURITY STRATEGY:", securityStrategy, "(not validating)");
  }

  console.log("=".repeat(80) + "\n");
  next();
};

/* ===============
 * Verify webhook timeout (30 seconds max)
 * ===============*/
export const webhookTimeout = (req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({ error: "Webhook timeout" });
    }
  }, 25000); 
  
  req.on('close', () => clearTimeout(timeout));
  res.on('finish', () => clearTimeout(timeout));
  
  next();
};