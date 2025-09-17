import Store from "../model/store.model.js";

class StoreService {
  /* ===============
   * Save new stores in database
   * ===============*/
  async saveStore({ store_id, payload }) {
    const {
      access_token,
      refresh_token,
      expires,
      store_name,
      token_type,
      scope,
    } = payload;

    await Store.findOneAndUpdate(
      { store_id },
      {
        store_id,
        name: store_name,
        access_token,
        refresh_token,
        scope,
        token_type,
        access_token_expires_at: new Date(Date.now() + expires * 1000),
        installed_at: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  /* ===============
   * update store gsc credentials information
   * ===============*/
  async updateGSCCredentials(store_id, { filename, gscDomain }) {
    const store = await Store.findOne({ store_id });
    if (!store) throw new Error("Store not found");

    store.automation_settings.gsc_key_uploaded = true;
    store.automation_settings.gsc_key_filename = filename;
    store.automation_settings.gsc_domain = gscDomain;

    await store.save();
    return store;
  }

  /* ===============
   * Get store by ID
   * ===============*/
  async getStoreById(store_id) {
    const store = await Store.findOne({ store_id });
    if (!store) throw new Error("Store not found");
    return store;
  }

  /* ===============
   * Update store plan from subscription webhooks
   * ===============*/
  async updateStorePlan(store_id, plan) {
    const validPlans = ["basic", "pro", "enterprise", "special"];
    const normalizedPlan = validPlans.includes(plan) ? plan : "basic";
    
    const store = await Store.findOneAndUpdate(
      { store_id },
      { plan: normalizedPlan },
      { new: true }
    );
    
    if (!store) throw new Error("Store not found");
    return store;
  }
}

export default new StoreService();
