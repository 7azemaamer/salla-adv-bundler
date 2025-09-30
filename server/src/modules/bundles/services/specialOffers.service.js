import axios from "axios";
import Store from "../../stores/model/store.model.js";
import { AppError } from "../../../utils/errorHandler.js";

class SpecialOffersService {
  constructor() {
    this.baseURL = "https://api.salla.dev/admin/v2/specialoffers";
  }

  /* ===============
   * Get valid access token for store
   * ===============*/
  async getValidToken(store_id) {
    const store = await Store.findOne({ store_id });
    if (!store) {
      throw new AppError("Store not found", 404);
    }

    // Check if token is expired
    if (new Date() >= store.access_token_expires_at) {
      const refreshedToken = await this.refreshToken(store_id);
      return refreshedToken;
    }

    return store.access_token;
  }

  /* ===============
   * Refresh access token
   * ===============*/
  async refreshToken(store_id) {
    const store = await Store.findOne({ store_id });
    if (!store || !store.refresh_token) {
      throw new AppError(
        "Cannot refresh token: store or refresh token not found",
        401
      );
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

      return access_token;
    } catch (error) {
      console.error(
        `[SpecialOffers]: Token refresh failed for store ${store_id}:`,
        error.response?.data
      );
      throw new AppError("Failed to refresh access token", 401);
    }
  }

  /* ===============
   * Create a Special Offer
   * ===============*/
  async createOffer(store_id, payload) {
    const token = await this.getValidToken(store_id);

    try {
      const response = await axios.post(this.baseURL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(
        `[SpecialOffers]: Created offer for store ${store_id}:`,
        response.data.data?.id
      );
      return response.data;
    } catch (error) {
      console.error(
        `[SpecialOffers]: Failed to create offer for store ${store_id}:`,
        error.response?.data
      );

      // Create enhanced error that preserves original response data
      const enhancedError = new AppError(
        `Failed to create special offer: ${
          error.response?.data?.message || error.message
        }`,
        error.response?.status || 500
      );

      // Preserve original response data for debugging
      enhancedError.originalResponse = error.response;
      throw enhancedError;
    }
  }

  /* ===============
   * Update offer status (activate/deactivate)
   * ===============*/
  async updateOfferStatus(store_id, offer_id, status) {
    const token = await this.getValidToken(store_id);

    try {
      const response = await axios.put(
        `${this.baseURL}/${offer_id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        `[SpecialOffers]: Updated offer ${offer_id} status to ${status} for store ${store_id}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `[SpecialOffers]: Failed to update offer status for store ${store_id}:`,
        error.response?.data
      );
      throw new AppError(
        `Failed to update offer status: ${
          error.response?.data?.message || error.message
        }`,
        error.response?.status || 500
      );
    }
  }

  /* ===============
   * List all offers for a store
   * ===============*/
  async listOffers(store_id, page = 1, per_page = 50) {
    const token = await this.getValidToken(store_id);

    try {
      const response = await axios.get(this.baseURL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          per_page,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        `[SpecialOffers]: Failed to list offers for store ${store_id}:`,
        error.response?.data
      );
      throw new AppError(
        `Failed to list offers: ${
          error.response?.data?.message || error.message
        }`,
        error.response?.status || 500
      );
    }
  }

  /* ===============
   * Get specific offer details
   * ===============*/
  async getOffer(store_id, offer_id) {
    const token = await this.getValidToken(store_id);

    try {
      const response = await axios.get(`${this.baseURL}/${offer_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        `[SpecialOffers]: Failed to get offer ${offer_id} for store ${store_id}:`,
        error.response?.data
      );
      throw new AppError(
        `Failed to get offer: ${
          error.response?.data?.message || error.message
        }`,
        error.response?.status || 500
      );
    }
  }

  /* ===============
   * Delete a Special Offer
   * ===============*/
  async deleteOffer(store_id, offer_id) {
    const token = await this.getValidToken(store_id);

    try {
      const response = await axios.delete(`${this.baseURL}/${offer_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        `[SpecialOffers]: Deleted offer ${offer_id} for store ${store_id}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `[SpecialOffers]: Failed to delete offer ${offer_id} for store ${store_id}:`,
        error.response?.data
      );
      throw new AppError(
        `Failed to delete offer: ${
          error.response?.data?.message || error.message
        }`,
        error.response?.status || 500
      );
    }
  }

  /* ===============
   * Build offer payload for bundle
   * ===============*/
  buildBundleOfferPayload(bundleConfig, tier, offer) {
    // Validate required fields
    if (!bundleConfig.target_product_id || !offer.product_id) {
      throw new Error("Missing required product IDs");
    }

    if (!tier.buy_quantity || tier.buy_quantity < 1) {
      throw new Error("Invalid buy_quantity");
    }

    if (!offer.quantity || offer.quantity < 1) {
      throw new Error("Invalid offer quantity");
    }

    // Determine discount type for Salla API
    let sallaDiscountType = "percentage";
    let discountAmount = offer.discount_amount || 100;

    if (offer.discount_type === "free") {
      sallaDiscountType = "percentage";
      discountAmount = 100; // 100% off = FREE
    } else if (offer.discount_type === "percentage") {
      sallaDiscountType = "percentage";
      discountAmount = Math.min(Math.max(offer.discount_amount || 0, 1), 99); // 1-99%
    } else if (offer.discount_type === "fixed_amount") {
      sallaDiscountType = "fixed_amount";
      discountAmount = Math.max(offer.discount_amount || 0, 0.01); // Minimum 0.01 SAR
    }

    // Generate appropriate name and message based on discount type
    let offerName, offerMessage;

    const productName = offer.product_name || `Product ${offer.product_id}`;
    const bundleName = bundleConfig.name || "Bundle Offer";

    if (offer.discount_type === "free") {
      offerName = `${bundleName} T${tier.tier}: ${productName} FREE`;
      offerMessage =
        offer.arabic_message ||
        `اشترِ ${tier.buy_quantity} واحصل على ${productName} مجاناً`;
    } else if (offer.discount_type === "percentage") {
      offerName = `${bundleName} T${tier.tier}: ${productName} ${discountAmount}% OFF`;
      offerMessage =
        offer.arabic_message ||
        `اشترِ ${tier.buy_quantity} واحصل على خصم ${discountAmount}% على ${productName}`;
    } else if (offer.discount_type === "fixed_amount") {
      offerName = `${bundleName} T${tier.tier}: ${productName} ${discountAmount} SAR OFF`;
      offerMessage =
        offer.arabic_message ||
        `اشترِ ${tier.buy_quantity} واحصل على خصم ${discountAmount} ريال على ${productName}`;
    }

    // Ensure name is not too long (Salla might have limits)
    if (offerName.length > 100) {
      offerName = offerName.substring(0, 97) + "...";
    }

    const now = new Date();
    console.log(
      `[SpecialOffers]: Current system time (UTC): ${now.toISOString()}`
    );

    // Convert to Saudi Arabia time (UTC+3) and add 5 minutes buffer
    const saudiTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 hours for Saudi timezone
    const futureTime = new Date(saudiTime.getTime() + 5 * 60 * 1000); // +5 minutes buffer
    const effectiveStartDate = futureTime
      .toISOString()
      .replace("T", " ")
      .split(".")[0];

    console.log(`[SpecialOffers]: Saudi time: ${saudiTime.toISOString()}`);
    console.log(
      `[SpecialOffers]: Using future datetime (Saudi+5min): ${effectiveStartDate}`
    );
    console.log(
      `[SpecialOffers]: Bundle original start date: ${
        bundleConfig.start_date.toISOString().split("T")[0]
      }`
    );

    const payload = {
      name: offerName,
      message: offerMessage,
      applied_channel: "browser_and_application",
      offer_type: "buy_x_get_y",
      applied_to: "product",
      start_date: effectiveStartDate,
      min_purchase_amount: 0, // Required field - set to 0 for no minimum
      min_items_count: 0, // Required field - set to 0 for no minimum
      min_items: 0, // Required field - set to 0 for no minimum
      discounts_table: [
        // Required field for buy_x_get_y offers
        {
          quantity: parseInt(tier.buy_quantity),
          discount_amount: parseFloat(discountAmount),
        },
      ],
      buy: {
        type: "product",
        min_amount: 0, // Required field - minimum amount
        quantity: parseInt(tier.buy_quantity),
        products: [parseInt(bundleConfig.target_product_id)], // Ensure numeric ID
      },
      get: {
        type: "product",
        discount_type: sallaDiscountType,
        discount_amount: parseFloat(discountAmount),
        quantity: parseInt(offer.quantity),
        products: [parseInt(offer.product_id)], // Ensure numeric ID
      },
    };

    // Always add expiry date (recommended by Salla) - 30 days from future start time
    const expiryDate = new Date(
      futureTime.getTime() + 30 * 24 * 60 * 60 * 1000
    ); // +30 days from start
    const effectiveExpiryDate = expiryDate
      .toISOString()
      .replace("T", " ")
      .split(".")[0]; // YYYY-MM-DD HH:mm:ss format

    console.log(
      `[SpecialOffers]: Setting expiry date to 30 days from start: ${effectiveExpiryDate}`
    );
    payload.expiry_date = effectiveExpiryDate;

    // Validate the final payload
    this.validateOfferPayload(payload);

    return payload;
  }

  /* ===============
   * Validate offer payload before sending to Salla
   * ===============*/
  validateOfferPayload(payload) {
    const errors = [];

    // Required fields
    if (!payload.name || payload.name.trim().length === 0) {
      errors.push("Offer name is required");
    }

    if (!payload.offer_type) {
      errors.push("Offer type is required");
    }

    if (!payload.start_date) {
      errors.push("Start date is required");
    }

    // Buy validation
    if (
      !payload.buy ||
      !payload.buy.products ||
      payload.buy.products.length === 0
    ) {
      errors.push("Buy products are required");
    }

    if (!payload.buy || !payload.buy.quantity || payload.buy.quantity < 1) {
      errors.push("Buy quantity must be at least 1");
    }

    // Get validation
    if (
      !payload.get ||
      !payload.get.products ||
      payload.get.products.length === 0
    ) {
      errors.push("Get products are required");
    }

    if (!payload.get || !payload.get.quantity || payload.get.quantity < 1) {
      errors.push("Get quantity must be at least 1");
    }

    if (!payload.get || !payload.get.discount_type) {
      errors.push("Discount type is required");
    }

    if (
      !payload.get ||
      payload.get.discount_amount === undefined ||
      payload.get.discount_amount < 0
    ) {
      errors.push("Discount amount must be a positive number");
    }

    if (payload.get && payload.get.discount_type === "percentage") {
      if (payload.get.discount_amount > 100) {
        errors.push("Percentage discount cannot exceed 100%");
      }
    }

    // Basic payload logging for debugging
    console.log(
      `[SpecialOffers]: Final payload start_date: ${payload.start_date}`
    );
    console.log(
      `[SpecialOffers]: Final payload expiry_date: ${
        payload.expiry_date || "none"
      }`
    );
    console.log(
      `[SpecialOffers]: Product IDs - Buy: ${payload.buy.products}, Get: ${payload.get.products}`
    );

    if (payload.expiry_date) {
      const expiryDate = new Date(payload.expiry_date);
      const startDate = new Date(payload.start_date);
      if (expiryDate <= startDate) {
        errors.push("Expiry date must be after start date");
      }
    }

    if (errors.length > 0) {
      throw new Error(`Payload validation failed: ${errors.join(", ")}`);
    }
  }

  /* ===============
   * Validate store has required scopes
   * ===============*/
  async validateStoreScopes(store_id) {
    const store = await Store.findOne({ store_id });
    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const requiredScopes = ["specialoffers.read_write"];
    const storeScopes = store.scope ? store.scope.split(" ") : [];

    const hasRequiredScopes = requiredScopes.every((scope) =>
      storeScopes.includes(scope)
    );

    if (!hasRequiredScopes) {
      throw new AppError(
        `Store missing required scopes: ${requiredScopes.join(
          ", "
        )}. Current scopes: ${store.scope}`,
        403
      );
    }

    return true;
  }

  /* ===============
   * Batch create offers for bundle
   * ===============*/
  async createBundleOffers(store_id, bundleConfig) {
    // Validate store scopes first
    await this.validateStoreScopes(store_id);

    const createdOffers = [];
    const errors = [];

    try {
      for (const tier of bundleConfig.bundles) {
        const tierOffers = tier.offers || tier.gifts || [];
        for (const offer of tierOffers) {
          let offerPayload = null;
          try {
            offerPayload = this.buildBundleOfferPayload(
              bundleConfig,
              tier,
              offer
            );
            const offerResponse = await this.createOffer(
              store_id,
              offerPayload
            );

            // Activate the offer immediately
            await this.updateOfferStatus(
              store_id,
              offerResponse.data.id,
              "active"
            );

            createdOffers.push({
              offer_id: offerResponse.data.id,
              tier: tier.tier,
              gift_product_id: offer.product_id,
              gift_product_name: offer.product_name,
              buy_quantity: tier.buy_quantity,
              gift_quantity: offer.quantity,
              discount_type: offer.discount_type || "free",
              discount_amount: offer.discount_amount || 100,
              offer_type: offer.offer_type || "gift",
              salla_response: offerResponse.data,
              offer_config: offerPayload,
            });

            console.log(
              `[SpecialOffers]: Created offer ${offerResponse.data.id} for tier ${tier.tier} (${offer.discount_type}: ${offer.discount_amount})`
            );

            // Small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            // Enhanced error logging using preserved response data
            const responseData =
              error.originalResponse?.data || error.response?.data;
            const responseStatus =
              error.originalResponse?.status || error.response?.status;

            console.error(
              `[SpecialOffers]: Failed to create offer for tier ${tier.tier}, product ${offer.product_id}:`
            );
            console.error(`[SpecialOffers]: Error message: ${error.message}`);
            console.error(`[SpecialOffers]: HTTP Status: ${responseStatus}`);
            console.error(
              `[SpecialOffers]: Response data:`,
              JSON.stringify(responseData, null, 2)
            );
            console.error(
              `[SpecialOffers]: Sent payload:`,
              JSON.stringify(offerPayload, null, 2)
            );

            // Log detailed field validation errors
            if (responseData?.error?.fields) {
              console.error(
                `[SpecialOffers]: Detailed field validation errors:`
              );
              Object.entries(responseData.error.fields).forEach(
                ([field, errors]) => {
                  console.error(
                    `  - ${field}: ${
                      Array.isArray(errors) ? errors.join(", ") : errors
                    }`
                  );
                }
              );
            }
            errors.push({
              tier: tier.tier,
              gift_product_id: offer.product_id,
              error: error.message,
              details: error.response?.data,
              payload: offerPayload || "Payload creation failed",
              offer_data: offer,
            });
          }
        }
      }

      if (createdOffers.length === 0 && errors.length > 0) {
        throw new AppError("Failed to create any offers", 500);
      }

      return {
        success: true,
        created_offers: createdOffers,
        errors: errors,
        total_created: createdOffers.length,
        total_errors: errors.length,
      };
    } catch (error) {
      console.error(
        `[SpecialOffers]: Batch offer creation failed for store ${store_id}:`,
        error
      );
      throw error;
    }
  }

  /* ===============
   * Batch deactivate offers
   * ===============*/
  async deactivateOffers(store_id, offer_ids) {
    const results = [];

    for (const offer_id of offer_ids) {
      try {
        await this.updateOfferStatus(store_id, offer_id, "inactive");
        results.push({ offer_id, status: "deactivated" });
      } catch (error) {
        console.error(
          `[SpecialOffers]: Failed to deactivate offer ${offer_id}:`,
          error
        );
        results.push({ offer_id, status: "failed", error: error.message });
      }
    }

    return results;
  }

  /* ===============
   * Batch delete offers
   * ===============*/
  async deleteOffers(store_id, offer_ids) {
    const results = [];

    for (const offer_id of offer_ids) {
      try {
        await this.deleteOffer(store_id, offer_id);
        results.push({ offer_id, status: "deleted" });
      } catch (error) {
        console.error(
          `[SpecialOffers]: Failed to delete offer ${offer_id}:`,
          error
        );
        results.push({ offer_id, status: "failed", error: error.message });
      }
    }

    return results;
  }
}

export default new SpecialOffersService();
