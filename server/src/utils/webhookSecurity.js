import crypto from "crypto";
import { config } from "../config/env.js";

/* ===============
 * Verify Salla webhook signature
 * ===============*/
export const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers["x-salla-signature"];
  const securityStrategy = req.headers["x-salla-security-strategy"];
  const authorizationToken = req.headers["authorization"];

  // Validation - support both strategies
  if (securityStrategy === "Token") {
    if (!authorizationToken) {
      return res.status(401).json({ error: "Missing authorization token" });
    }
  } else if (securityStrategy === "signature") {
    if (!signature) {
      return res.status(401).json({ error: "Missing signature" });
    }

    const body = JSON.stringify(req.body);
    const webhookSecret = config.webhookSecret || "your-webhook-secret";

    const expectedSignature = crypto
      .createHash("sha256")
      .update(body + webhookSecret)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: "Invalid signature" });
    }
  }

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

  req.on("close", () => clearTimeout(timeout));
  res.on("finish", () => clearTimeout(timeout));

  next();
};
