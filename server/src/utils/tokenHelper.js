import axios from "axios";
import Store from "../modules/stores/model/store.model.js";

/**
 * Get valid access token, refreshing if necessary
 * @param {string} store_id - Store ID
 * @returns {Promise<string>} Valid access token
 */
export const getValidAccessToken = async (store_id) => {
  const store = await Store.findOne({ store_id });

  if (!store || !store.access_token) {
    throw new Error("Store not found or access token missing");
  }

  // Check if token is expired or about to expire (within 5 minutes)
  const now = new Date();
  const expiresAt = store.access_token_expires_at
    ? new Date(store.access_token_expires_at)
    : null;

  const needsRefresh =
    !expiresAt || expiresAt.getTime() - now.getTime() < 5 * 60 * 1000;

  if (needsRefresh && store.refresh_token) {
    console.log(`[TokenHelper] Refreshing token for store ${store_id}`);
    return await refreshAccessToken(store_id);
  }

  return store.access_token;
};

/**
 * Refresh access token using refresh token
 * @param {string} store_id - Store ID
 * @returns {Promise<string>} New access token
 */
export const refreshAccessToken = async (store_id) => {
  const store = await Store.findOne({ store_id });

  if (!store || !store.refresh_token) {
    throw new Error("Cannot refresh token: store or refresh token not found");
  }

  try {
    const response = await axios.post(
      "https://accounts.salla.sa/oauth2/token",
      {
        grant_type: "refresh_token",
        refresh_token: store.refresh_token,
        client_id: process.env.CLIENT_KEY,
        client_secret: process.env.CLIENT_SECRET_KEY,
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Update store with new tokens
    await Store.updateOne(
      { store_id },
      {
        access_token,
        refresh_token,
        access_token_expires_at: new Date(Date.now() + expires_in * 1000),
      }
    );

    console.log(
      `[TokenHelper] Token refreshed successfully for store ${store_id}`
    );
    return access_token;
  } catch (error) {
    console.error(
      `[TokenHelper] Token refresh failed for store ${store_id}:`,
      error.response?.data || error.message
    );
    throw new Error("Failed to refresh access token");
  }
};
