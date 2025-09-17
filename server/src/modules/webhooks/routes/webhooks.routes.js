import express from "express";
import { registerNewStore } from "../controllers/register.controller.js";
import { verifyWebhookSignature, webhookTimeout } from "../../../utils/webhookSecurity.js";

const router = express.Router();

router.post("/", webhookTimeout, verifyWebhookSignature, registerNewStore);

export default router;
