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
   * Fetch product details from Salla API
   * ===============*/
  async fetchProductData(store_id, product_id) {
    try {
      const token = await this.getValidToken(store_id);
      const response = await axios.get(
        `https://api.salla.dev/admin/v2/products/${product_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const product = response.data.data;

      let price = 0;
      if (typeof product.price === "number") {
        price = product.price;
      } else if (typeof product.price === "object" && product.price !== null) {
        price =
          product.price.amount ||
          product.price.value ||
          parseFloat(product.price);
      } else {
        price = parseFloat(product.price) || 0;
      }

      return {
        id: product.id,
        name: product.name,
        price: price,
        currency: product.currency || "SAR",
        image: product.main_image || product.thumbnail,
        sku: product.sku,
        status: product.status,
      };
    } catch (error) {
      console.error(
        `[SpecialOffers]: Failed to fetch product ${product_id}:`,
        error.message
      );
      return null;
    }
  }

  /* ===============
   * Build SINGLE consolidated offer payload per tier with fixed-amount discount
   *
   * CONSOLIDATED APPROACH:
   * Instead of creating multiple offers per tier (one for each gift/discount),
   * we create ONE offer per tier using fixed_amount discount equal to total savings.
   *
   * Calculation: Sum of (free products at full price + percentage discounts + fixed discounts)
   *
   * Example Tier with 3 offers:
   * - FREE product A (100 SAR) × 1 = 100 SAR discount
   * - 50% OFF product B (200 SAR) = 100 SAR discount
   * - Fixed 30 SAR OFF product C = 30 SAR discount
   * Total = 230 SAR fixed_amount discount
   *
   * Payload structure:
   * {
   *   offer_type: "buy_x_get_y",
   *   buy: { products: [target_product] },
   *   get: {
   *     discount_type: "fixed_amount",
   *     discount_amount: 230,
   *     products: [productA, productB, productC]
   *   }
   * }
   * ===============*/
  async buildConsolidatedBundleOfferPayload(bundleConfig, tier, store_id) {
    // Validate required fields
    if (!bundleConfig.target_product_id) {
      throw new Error("Missing target product ID");
    }

    if (!tier.buy_quantity || tier.buy_quantity < 1) {
      throw new Error("Invalid buy_quantity");
    }

    if (!tier.offers || tier.offers.length === 0) {
      throw new Error("No offers found in tier");
    }

    // Step 1: Calculate TOTAL fixed discount for this tier
    let totalDiscountAmount = 0;
    const allOfferProductIds = [];

    for (const offer of tier.offers) {
      // Fetch product price if missing
      let productPrice = offer.product_data?.price || 0;

      if (!productPrice || productPrice === 0) {
        const productData = await this.fetchProductData(
          store_id,
          offer.product_id
        );
        if (productData) {
          productPrice = productData.price;
        }
      }
      const productId = parseInt(offer.product_id);
      const quantity = offer.quantity || 1;

      if (!allOfferProductIds.includes(productId)) {
        allOfferProductIds.push(productId);
      }

      let offerDiscount = 0;
      if (offer.discount_type === "free") {
        // FREE = full product price as discount
        offerDiscount = productPrice * quantity;
      } else if (offer.discount_type === "percentage") {
        // Percentage = (price × percentage / 100)
        const discountValue = (productPrice * offer.discount_amount) / 100;
        offerDiscount = discountValue * quantity;
      } else if (offer.discount_type === "fixed_amount") {
        offerDiscount = offer.discount_amount * quantity;
      }

      totalDiscountAmount += offerDiscount;
    }

    // Round to 2 decimal places
    totalDiscountAmount = Math.round(totalDiscountAmount * 100) / 100;

    // Calculate total quantity of all gifts
    const totalGiftQuantity = tier.offers.reduce(
      (sum, offer) => sum + (offer.quantity || 1),
      0
    );

    // Step 2: Generate offer name and message
    const bundleName = bundleConfig.name || "Bundle Offer";
    const offerName = `${bundleName} T${tier.tier}`;
    const offerMessage =
      tier.tier_title ||
      `اشترِ ${tier.buy_quantity} واحصل على عرض باقة بخصم ${totalDiscountAmount} ريال`;

    // Step 3: Prepare dates
    const now = new Date();
    const saudiTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // UTC+3
    const futureTime = new Date(saudiTime.getTime() + 5 * 60 * 1000); // +5min buffer
    const effectiveStartDate = futureTime
      .toISOString()
      .replace("T", " ")
      .split(".")[0];

    // Expiry date (if provided)
    let expiryDate = null;
    if (bundleConfig.expiry_date) {
      const expirySaudiTime = new Date(
        bundleConfig.expiry_date.getTime() + 3 * 60 * 60 * 1000
      );
      expiryDate = expirySaudiTime
        .toISOString()
        .replace("T", " ")
        .split(".")[0];
    }

    // Step 5: Build payload with fixed_amount offer type
    const payload = {
      name: offerName.substring(0, 100), // Limit name length
      message: offerMessage,
      applied_channel: "browser_and_application",
      offer_type: "fixed_amount", // Use fixed_amount as the offer type
      applied_to: "product",
      start_date: effectiveStartDate,
      ...(expiryDate && { expiry_date: expiryDate }),
      buy: {
        type: "product",
        min_items: parseInt(tier.buy_quantity),
        products: [parseInt(bundleConfig.target_product_id)],
      },
      get: {
        discount_amount: totalDiscountAmount,
        products: allOfferProductIds, // All offer products that get the discount
      },
    };

    console.log(
      `[SpecialOffers]: 📦 CONSOLIDATED PAYLOAD FOR TIER ${tier.tier}:`
    );
    console.log(JSON.stringify(payload, null, 2));

    return payload;
  }

  /* ===============
   * Build offer payload for bundle (OLD METHOD - KEPT FOR BACKWARDS COMPATIBILITY)
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

    // Convert to Saudi Arabia time (UTC+3) and add 5 minutes buffer
    const saudiTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 hours for Saudi timezone
    const futureTime = new Date(saudiTime.getTime() + 5 * 60 * 1000); // +5 minutes buffer
    const effectiveStartDate = futureTime
      .toISOString()
      .replace("T", " ")
      .split(".")[0];

    const payload = {
      name: offerName,
      message: offerMessage,
      applied_channel: "browser_and_application",
      offer_type: "buy_x_get_y",
      applied_to: "product",
      start_date: effectiveStartDate,
      min_purchase_amount: 0, 
      min_items_count: 0, 
      min_items: 0, 
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


    let expiryDate;
    if (bundleConfig.expiry_date) {
      expiryDate = new Date(bundleConfig.expiry_date);
    } else {
      expiryDate = new Date(
        futureTime.getTime() + 5 * 365 * 24 * 60 * 60 * 1000
      ); // +5 years
    }

    const effectiveExpiryDate = expiryDate
      .toISOString()
      .replace("T", " ")
      .split(".")[0]; // YYYY-MM-DD HH:mm:ss format

    payload.expiry_date = effectiveExpiryDate;

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
   * Batch create offers for bundle - NEW CONSOLIDATED APPROACH
   * Creates ONE offer per tier with fixed-amount discount (total savings)
   * ===============*/
  async createBundleOffers(store_id, bundleConfig) {
    // Validate store scopes first
    await this.validateStoreScopes(store_id);

    const createdOffers = [];
    const errors = [];

    try {
      // Create ONE consolidated offer per tier
      for (const tier of bundleConfig.bundles) {

        let offerPayload = null;
        let allGiftProducts = [];
        let productDetails = [];

        try {
          let totalSavings = 0;
          let totalGiftProductsPrice = 0;

          for (const offer of tier.offers) {
            let productPrice = offer.product_data?.price || 0;
            if (!productPrice || productPrice === 0) {
              const productData = await this.fetchProductData(
                store_id,
                offer.product_id
              );
              if (productData) {
                productPrice = productData.price;
              }
            }

            const quantity = offer.quantity || 1;
            const totalProductPrice = productPrice * quantity;

            // Add to total price of gift products
            totalGiftProductsPrice += totalProductPrice;

            // Calculate savings for this product
            let productSaving = 0;
            if (offer.discount_type === "free") {
              productSaving = totalProductPrice;
            } else if (offer.discount_type === "percentage") {
              productSaving = (totalProductPrice * offer.discount_amount) / 100;
            } else if (offer.discount_type === "fixed_amount") {
              productSaving = offer.discount_amount;
            }

            totalSavings += productSaving;
            allGiftProducts.push(parseInt(offer.product_id));

            productDetails.push({
              product_id: offer.product_id,
              product_name: offer.product_name,
              price: productPrice,
              quantity: quantity,
              saving: productSaving,
            });
          }

          // Calculate single percentage discount that applies to ALL gift products
          // Percentage = (Total Savings / Total Price of Gift Products) × 100
          const discountPercentage = Math.min(
            100,
            Math.round((totalSavings / totalGiftProductsPrice) * 100)
          );
          const actualDiscount =
            (totalGiftProductsPrice * discountPercentage) / 100;

          // Build consolidated offer payload
          const bundleName = bundleConfig.name || "Bundle Offer";
          const uniqueSuffix = `T${tier.tier}-${Date.now()}`;
          const offerName = `${bundleName} - Tier ${tier.tier} [${uniqueSuffix}]`;
          const offerMessage =
            tier.tier_title || `اشترِ ${tier.buy_quantity} واحصل على خصم`;

          // Prepare dates
          const now = new Date();
          const saudiTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
          const futureTime = new Date(saudiTime.getTime() + 5 * 60 * 1000);
          const effectiveStartDate = futureTime
            .toISOString()
            .replace("T", " ")
            .split(".")[0];

          let expiryDate = null;
          if (bundleConfig.expiry_date) {
            const expirySaudiTime = new Date(
              bundleConfig.expiry_date.getTime() + 3 * 60 * 60 * 1000
            );
            expiryDate = expirySaudiTime
              .toISOString()
              .replace("T", " ")
              .split(".")[0];
          }

          offerPayload = {
            name: offerName.substring(0, 100),
            message: offerMessage,
            applied_channel: "browser_and_application",
            offer_type: "buy_x_get_y",
            applied_to: "product",
            start_date: effectiveStartDate,
            ...(expiryDate && { expiry_date: expiryDate }),
            buy: {
              type: "product",
              quantity: parseInt(tier.buy_quantity),
              products: [parseInt(bundleConfig.target_product_id)],
            },
            get: {
              type: "product",
              discount_type: "percentage",
              discount_amount: discountPercentage,
              quantity: tier.offers.reduce(
                (sum, o) => sum + (o.quantity || 1),
                0
              ),
              products: allGiftProducts,
            },
          };

          // Create the offer
          const offerResponse = await this.createOffer(store_id, offerPayload);

          // Activate the offer immediately
          await this.updateOfferStatus(
            store_id,
            offerResponse.data.id,
            "active"
          );

          createdOffers.push({
            offer_id: offerResponse.data.id,
            tier: tier.tier,
            gift_product_id: allGiftProducts.join(","),
            gift_product_name: productDetails
              .map((p) => p.product_name)
              .join(", "),
            buy_quantity: tier.buy_quantity,
            gift_quantity: tier.offers.reduce(
              (sum, o) => sum + (o.quantity || 1),
              0
            ),
            discount_type: "consolidated",
            discount_amount: actualDiscount,
            offer_type: "consolidated_bundle",
            salla_response: offerResponse.data,
            offer_config: offerPayload,
            product_details: productDetails,
          });

          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {

          const responseData =
            error.originalResponse?.data || error.response?.data;


          if (responseData?.error?.fields) {
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
            product_id: allGiftProducts?.join(",") || "unknown",
            product_name:
              productDetails?.map((p) => p.product_name).join(", ") ||
              "unknown",
            error: error.message,
            details: responseData,
            payload: offerPayload || "Payload creation failed",
          });
        }
      }

      if (createdOffers.length === 0 && errors.length > 0) {
        throw new AppError("Failed to create any offers", 500);
      }

      const totalDiscount = createdOffers.reduce(
        (sum, offer) => sum + offer.discount_amount,
        0
      );

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
