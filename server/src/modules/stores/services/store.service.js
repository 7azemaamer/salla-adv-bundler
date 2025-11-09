import Store from "../model/store.model.js";
import { fetchPaymentMethods } from "../../bundles/services/payment.service.js";
import axios from "axios";
import crypto from "crypto";

class StoreService {
  /* ===============
   * Save new stores in database (handles both new installs and reinstalls)
   * ===============*/
  async saveStore({ store_id, payload }) {
    const { access_token, refresh_token, expires, token_type, scope } = payload;

    let storeInfo = null;
    try {
      const response = await axios.get(
        "https://api.salla.dev/admin/v2/store/info",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      storeInfo = response.data.data;
    } catch (error) {
      console.error(
        `[Store Service]: Failed to fetch store info for ${store_id}:`,
        error.response?.data || error.message
      );
    }

    const defaultBundleSettings = {
      max_bundles_per_store: 3, 
      analytics_enabled: true,
    };

    const existingStore = await Store.findOne({ store_id });

    const updateData = {
      store_id,
      name: storeInfo?.name || `Store ${store_id}`,
      domain: storeInfo?.domain,
      avatar: storeInfo?.avatar,
      description: storeInfo?.description,
      merchant_email: storeInfo?.email,
      plan: storeInfo?.plan || "basic",
      access_token,
      refresh_token,
      scope,
      token_type,
      bundles_enabled: true,
      status: "active",
      is_deleted: false, 
      deleted_at: null, 
    };

    if (
      !existingStore ||
      existingStore.is_deleted === true ||
      !existingStore.first_login_completed
    ) {
      updateData.setup_token = crypto.randomBytes(32).toString("hex");
    }

    if (expires && !isNaN(expires) && expires > 0) {
      updateData.access_token_expires_at = new Date(
        Date.now() + expires * 1000
      );
    } else if (expires) {
      console.warn(
        `[Store Service] Invalid expires value: ${expires}, using default 1 hour`
      );
      updateData.access_token_expires_at = new Date(Date.now() + 3600 * 1000);
    }

    if (!existingStore) {
      updateData.installed_at = new Date();
      updateData.bundle_settings = defaultBundleSettings;
    }

    const store = await Store.findOneAndUpdate({ store_id }, updateData, {
      upsert: true,
      new: true,
    });

    if (access_token) {
      try {
        const paymentMethodsResult = await fetchPaymentMethods(access_token);

        if (paymentMethodsResult && paymentMethodsResult.data) {
          store.payment_methods = paymentMethodsResult.data;
          store.payment_methods_updated_at = new Date();
          await store.save();
        }
      } catch (error) {
        console.error(
          `[Store Service] Failed to fetch payment methods for store ${store_id}:`,
          error.message
        );
      }
    }
  }

  /* ===============
   * Soft delete store (mark as deleted, don't remove from DB)
   * ===============*/
  async deleteStore(store_id) {
    const store = await Store.findOneAndUpdate(
      { store_id },
      {
        status: "uninstalled",
        is_deleted: true,
        deleted_at: new Date(),
        bundles_enabled: false,
        access_token: null,
        refresh_token: null,
      },
      { new: true }
    );

    if (!store) {
      console.warn(`[Store Service] Store ${store_id} not found for deletion`);
    }

    return store;
  }

  /* ===============
   * update store gsc credentials information
   * ===============*/
  async updateGSCCredentials(store_id, { filename, gscDomain }) {
    const store = await Store.findOne({ store_id, is_deleted: false });
    if (!store) throw new Error("Store not found or deleted");

    store.automation_settings.gsc_key_uploaded = true;
    store.automation_settings.gsc_key_filename = filename;
    store.automation_settings.gsc_domain = gscDomain;

    await store.save();
    return store;
  }

  /* ===============
   * Get store by ID (includes deleted stores for admin purposes)
   * ===============*/
  async getStoreById(store_id) {
    const store = await Store.findOne({ store_id });
    if (!store) throw new Error("Store not found");
    return store;
  }

  /* ===============
   * Get store by store_id (alias for consistency)
   * ===============*/
  async getStoreByStoreId(store_id) {
    const store = await Store.findOne({ store_id, is_deleted: false });
    return store;
  }

  /* ===============
   * Update store plan from subscription webhooks
   * ===============*/
  async updateStorePlan(store_id, plan) {
    const validPlans = ["basic", "pro", "enterprise", "special"];
    const normalizedPlan = validPlans.includes(plan) ? plan : "basic";

    // Calculate new bundle limit based on plan
    let maxBundles = 3; // default
    switch (normalizedPlan) {
      case "basic":
        maxBundles = 3;
        break;
      case "pro":
        maxBundles = 10;
        break;
      case "enterprise":
        maxBundles = 50;
        break;
      case "special":
        maxBundles = 100;
        break;
    }

    const store = await Store.findOneAndUpdate(
      { store_id },
      {
        plan: normalizedPlan,
        "bundle_settings.max_bundles_per_store": maxBundles,
      },
      { new: true }
    );

    if (!store) throw new Error("Store not found");
    return store;
  }

  /* ===============
   * Get store by domain
   * Handles both:
   * - Full path: https://demostore.salla.sa/dev-lmzuaqmkvvib8woi
   * - Base domain: demostore.salla.sa
   * ===============*/
  async getStoreByDomain(domain) {
    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");

    let store = await Store.findOne({ domain: cleanDomain });

    if (!store && cleanDomain) {
      store = await Store.findOne({
        domain: {
          $regex: cleanDomain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          $options: "i",
        },
      });
    }

    return store;
  }
}

export default new StoreService();
