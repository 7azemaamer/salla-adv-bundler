import express from "express";
import { registerNewStore } from "../controllers/register.controller.js";
import { handleOrderCreated } from "../controllers/order.controller.js";
import {
  verifyWebhookSignature,
  webhookTimeout,
} from "../../../utils/webhookSecurity.js";

const router = express.Router();

// Main webhook endpoint - handles all Salla webhook events
router.post(
  "/",
  webhookTimeout,
  verifyWebhookSignature,
  async (req, res, next) => {
    const { event } = req.body;

    // Route to appropriate handler based on event type
    if (event === "order.created") {
      return handleOrderCreated(req, res, next);
    } else {
      // All other events go to registerNewStore (app.installed, app.store.authorize, etc.)
      return registerNewStore(req, res, next);
    }
  }
);

export default router;
