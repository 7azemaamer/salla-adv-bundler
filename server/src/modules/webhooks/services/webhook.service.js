import axios from "axios";
import Store from "../../stores/model/store.model.js";
import { AppError } from "../../../utils/errorHandler.js";

class WebhookService {
  constructor() {
    this.baseURL = "https://api.salla.dev/admin/v2/webhooks";
  }

  /* ===============
   * Get valid access token for store
   * ===============*/
  async getValidToken(store_id) {
    const store = await Store.findOne({ store_id });
    if (!store) {
      throw new AppError("Store not found", 404);
    }
    return store.access_token;
  }

  /* ===============
   * Register webhook events for a store
   * ===============*/
  async registerWebhooks(store_id, webhook_url) {
    const token = await this.getValidToken(store_id);

    const webhookEvents = [
      "app.store.authorize",
      "app.subscription.started",
      "app.subscription.renewed",
      "app.subscription.canceled",
      "app.subscription.expired",
      "app.uninstalled",
      "order.created", // For tracking bundle conversions
      "product.updated" // For bundle validation
    ];

    const results = [];

    for (const event of webhookEvents) {
      try {
        const response = await axios.post(this.baseURL, {
          name: `Bundle App - ${event}`,
          url: webhook_url,
          events: [event]
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        results.push({
          event,
          status: 'success',
          webhook_id: response.data.data?.id
        });

        console.log(`[Webhook]: Registered ${event} webhook for store ${store_id}`);
      } catch (error) {
        console.error(`[Webhook]: Failed to register ${event} for store ${store_id}:`, error.response?.data);
        results.push({
          event,
          status: 'failed',
          error: error.response?.data?.message || error.message
        });
      }
    }

    return results;
  }

  /* ===============
   * List registered webhooks for a store
   * ===============*/
  async listWebhooks(store_id) {
    const token = await this.getValidToken(store_id);

    try {
      const response = await axios.get(this.baseURL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error(`[Webhook]: Failed to list webhooks for store ${store_id}:`, error.response?.data);
      throw new AppError(
        `Failed to list webhooks: ${error.response?.data?.message || error.message}`,
        error.response?.status || 500
      );
    }
  }

  /* ===============
   * Delete webhook
   * ===============*/
  async deleteWebhook(store_id, webhook_id) {
    const token = await this.getValidToken(store_id);

    try {
      const response = await axios.delete(`${this.baseURL}/${webhook_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`[Webhook]: Deleted webhook ${webhook_id} for store ${store_id}`);
      return response.data;
    } catch (error) {
      console.error(`[Webhook]: Failed to delete webhook ${webhook_id} for store ${store_id}:`, error.response?.data);
      throw new AppError(
        `Failed to delete webhook: ${error.response?.data?.message || error.message}`,
        error.response?.status || 500
      );
    }
  }
}

export default new WebhookService();