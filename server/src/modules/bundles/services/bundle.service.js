import crypto from "crypto";
import BundleConfig from "../model/bundleConfig.model.js";
import BundleOffer from "../model/bundleOffer.model.js";
import Store from "../../stores/model/store.model.js";
import specialOffersService from "./specialOffers.service.js";
import productService from "../../products/services/product.service.js";
import { AppError } from "../../../utils/errorHandler.js";

class BundleService {
  /* ===============
   * Create new bundle configuration with real product data
   * ===============*/
  async createBundle(store_id, bundleData) {
    // Validate store exists and is active
    const store = await Store.findOne({ store_id, status: "active" });
    if (!store) {
      throw new AppError("Store not found or inactive", 404);
    }

    // Check bundle limits based on plan
    const activeBundles = await BundleConfig.countDocuments({
      store_id,
      status: { $in: ["active", "draft"] },
    });

    const maxBundles = store.getBundleLimit();
    if (activeBundles >= maxBundles) {
      throw new AppError(
        `Bundle limit reached. Your plan allows ${maxBundles} bundles maximum.`,
        403
      );
    }

    // Fetch real product data from Salla API
    const productData = await this.fetchAndStoreProductData(store_id, bundleData);

    // Validate products exist and are available
    const validation = await this.validateBundleProducts(store_id, bundleData);
    if (!validation.valid) {
      throw new AppError(
        `Product validation failed: ${validation.errors.join(", ")}`,
        400
      );
    }

    // Generate config hash for idempotency
    const configHash = this.generateConfigHash(bundleData);

    // Check for existing bundle with same config
    const existingBundle = await BundleConfig.findOne({
      store_id,
      config_hash: configHash,
      status: { $in: ["active", "draft"] },
    });

    if (existingBundle) {
      return existingBundle;
    }

    // Create bundle configuration with real product data
    const bundle = await BundleConfig.create({
      store_id,
      name: bundleData.name,
      target_product_id: bundleData.target_product_id,
      target_product_name: productData.targetProduct.name,
      target_product_data: productData.targetProduct,
      bundles: productData.enhancedBundles,
      start_date: new Date(bundleData.start_date),
      expiry_date: bundleData.expiry_date
        ? new Date(bundleData.expiry_date)
        : null,
      config_hash: configHash,
      status: "draft",
      created_by: bundleData.created_by || "system",
    });

    console.log(`[Bundle]: Created bundle ${bundle._id} for store ${store_id} with real product data`);
    return bundle;
  }

  /* ===============
   * Fetch product data from Salla API and enhance bundle data
   * ===============*/
  async fetchAndStoreProductData(store_id, bundleData) {
    // Collect all unique product IDs
    const allProductIds = [bundleData.target_product_id];

    bundleData.bundles.forEach(tier => {
      tier.offers.forEach(offer => {
        if (!allProductIds.includes(offer.product_id)) {
          allProductIds.push(offer.product_id);
        }
      });
    });

    console.log(`[Bundle Service] Fetching product data for IDs: ${allProductIds.join(', ')}`);

    // Fetch all products from Salla API
    const { products, failed } = await productService.getMultipleProducts(store_id, allProductIds);

    if (failed.length > 0) {
      console.warn(`[Bundle Service] Failed to fetch products: ${failed.map(f => f.id).join(', ')}`);
    }

    // Create product lookup map
    const productMap = {};
    products.forEach(product => {
      productMap[product.id] = productService.extractProductData(product);
    });

    // Get target product data
    const targetProduct = productMap[bundleData.target_product_id];
    if (!targetProduct) {
      throw new AppError(`Target product ${bundleData.target_product_id} not found`, 404);
    }

    // Enhance bundle offers with real product data
    const enhancedBundles = bundleData.bundles.map(tier => ({
      tier: tier.tier,
      buy_quantity: tier.buy_quantity,
      offers: tier.offers.map(offer => {
        const productData = productMap[offer.product_id];
        if (!productData) {
          throw new AppError(`Offer product ${offer.product_id} not found`, 404);
        }

        return {
          product_id: offer.product_id,
          product_name: productData.name,
          quantity: offer.quantity,
          discount_type: offer.discount_type,
          discount_amount: offer.discount_amount,
          offer_type: offer.offer_type,
          arabic_message: offer.arabic_message,
          product_data: productData
        };
      })
    }));

    return {
      targetProduct,
      enhancedBundles,
      productMap
    };
  }

  /* ===============
   * Preview offers for bundle (for debugging)
   * ===============*/
  async previewOffers(bundle_id) {
    const bundle = await BundleConfig.findById(bundle_id);
    if (!bundle) {
      throw new AppError("Bundle not found", 404);
    }

    try {
      // Generate preview payloads without sending to Salla
      const previews = [];

      for (const tier of bundle.bundles) {
        const tierOffers = tier.offers || tier.gifts || [];
        for (const offer of tierOffers) {
          try {
            const offerPayload = specialOffersService.buildBundleOfferPayload(
              bundle,
              tier,
              offer
            );
            previews.push({
              tier: tier.tier,
              offer_product_id: offer.product_id,
              offer_product_name: offer.product_name,
              discount_type: offer.discount_type || "free",
              discount_amount: offer.discount_amount || 100,
              payload: offerPayload,
              validation: "PASSED",
            });
          } catch (error) {
            previews.push({
              tier: tier.tier,
              offer_product_id: offer.product_id,
              offer_product_name: offer.product_name,
              discount_type: offer.discount_type || "free",
              discount_amount: offer.discount_amount || 100,
              payload: null,
              validation: "FAILED",
              error: error.message,
            });
          }
        }
      }

      return {
        success: true,
        bundle_id,
        bundle_name: bundle.name,
        target_product_id: bundle.target_product_id,
        start_date: bundle.start_date,
        expiry_date: bundle.expiry_date,
        previews: previews,
        total_offers: previews.length,
        valid_offers: previews.filter((p) => p.validation === "PASSED").length,
        invalid_offers: previews.filter((p) => p.validation === "FAILED")
          .length,
      };
    } catch (error) {
      console.error(
        `[Bundle]: Preview generation failed for bundle ${bundle_id}:`,
        error
      );
      throw error;
    }
  }

  /* ===============
   * Generate offers for bundle
   * ===============*/
  async generateOffers(bundle_id) {
    const bundle = await BundleConfig.findById(bundle_id);
    if (!bundle) {
      throw new AppError("Bundle not found", 404);
    }

    if (bundle.status === "active") {
      throw new AppError("Bundle is already active with offers", 400);
    }

    try {
      // Create offers via Salla API
      const offerResult = await specialOffersService.createBundleOffers(
        bundle.store_id,
        bundle
      );

      // Save offer mappings in database
      const savedOffers = [];
      for (const offerData of offerResult.created_offers) {
        const bundleOffer = await BundleOffer.create({
          bundle_id: bundle._id,
          store_id: bundle.store_id,
          offer_id: offerData.offer_id,
          tier: offerData.tier,
          gift_product_id: offerData.gift_product_id,
          gift_product_name: offerData.gift_product_name,
          buy_quantity: offerData.buy_quantity,
          gift_quantity: offerData.gift_quantity,
          discount_type: offerData.discount_type || "free",
          discount_amount: offerData.discount_amount || 100,
          offer_type: offerData.offer_type || "gift",
          status: "active",
          salla_response: offerData.salla_response,
          offer_config: offerData.offer_config,
          sync_status: "synced",
          last_sync_at: new Date(),
        });

        savedOffers.push(bundleOffer);
      }

      // Update bundle status and offer count
      await BundleConfig.findByIdAndUpdate(bundle_id, {
        status: "active",
        activated_at: new Date(),
        offers_count: savedOffers.length,
      });

      console.log(
        `[Bundle]: Generated ${savedOffers.length} offers for bundle ${bundle_id}`
      );

      return {
        success: true,
        bundle_id,
        offers_created: savedOffers.length,
        offers: savedOffers,
        errors: offerResult.errors || [],
      };
    } catch (error) {
      console.error(
        `[Bundle]: Offer generation failed for bundle ${bundle_id}:`,
        error
      );

      // Mark bundle as failed if no offers were created
      await BundleConfig.findByIdAndUpdate(bundle_id, {
        status: "inactive",
        deactivated_at: new Date(),
      });

      throw error;
    }
  }

  /* ===============
   * Deactivate bundle and DELETE its offers from Salla
   * ===============*/
  async deactivateBundle(bundle_id) {
    const bundle = await BundleConfig.findById(bundle_id);
    if (!bundle) {
      throw new AppError("Bundle not found", 404);
    }

    // Get all active offers for this bundle
    const offers = await BundleOffer.find({
      bundle_id,
      status: "active",
    });

    const offer_ids = offers.map((offer) => offer.offer_id);

    if (offer_ids.length > 0) {
      // DELETE offers from Salla (not just deactivate)
      // This allows reactivation with the same offer names
      console.log(
        `[Bundle]: Deleting ${offer_ids.length} offers from Salla for bundle ${bundle_id}`
      );

      const deletionResults = await specialOffersService.deleteOffers(
        bundle.store_id,
        offer_ids
      );

      // Delete local offer records
      await BundleOffer.deleteMany({
        bundle_id,
        status: "active",
      });

      console.log(
        `[Bundle]: Deleted ${offer_ids.length} offers for bundle ${bundle_id}`
      );
    }

    // Update bundle status
    await BundleConfig.findByIdAndUpdate(bundle_id, {
      status: "inactive",
      deactivated_at: new Date(),
      offers_count: 0, // Reset offers count
    });

    return {
      success: true,
      bundle_id,
      offers_deleted: offer_ids.length,
    };
  }

  /* ===============
   * Delete bundle and cleanup offers
   * ===============*/
  async deleteBundle(bundle_id) {
    const bundle = await BundleConfig.findById(bundle_id);
    if (!bundle) {
      throw new AppError("Bundle not found", 404);
    }

    // Get all offers for this bundle
    const offers = await BundleOffer.find({ bundle_id });
    const offer_ids = offers.map((offer) => offer.offer_id);

    if (offer_ids.length > 0) {
      // Delete offers in Salla
      await specialOffersService.deleteOffers(bundle.store_id, offer_ids);

      // Delete local offer records
      await BundleOffer.deleteMany({ bundle_id });

      console.log(
        `[Bundle]: Deleted ${offer_ids.length} offers for bundle ${bundle_id}`
      );
    }

    // Delete bundle configuration
    await BundleConfig.findByIdAndDelete(bundle_id);

    return {
      success: true,
      bundle_id,
      offers_deleted: offer_ids.length,
    };
  }

  /* ===============
   * Get bundle details with offers
   * ===============*/
  async getBundleDetails(bundle_id) {
    const bundle = await BundleConfig.findById(bundle_id);
    if (!bundle) {
      throw new AppError("Bundle not found", 404);
    }

    const offers = await BundleOffer.find({ bundle_id });

    const store = await Store.findOne({ store_id: bundle.store_id });

    let productUrl = null;
    if (store?.domain) {
      if (bundle.target_product_name) {
        const encodedProductName = encodeURIComponent(
          bundle.target_product_name
        );
        productUrl = `https://${store.domain}/${encodedProductName}/p${bundle.target_product_id}`;
      } else {
        // Fallback format: https://domain/pID
        productUrl = `https://${store.domain}/p${bundle.target_product_id}`;
      }
    }

    return {
      ...bundle.toObject(),
      offers,
      total_offers: offers.length,
      active_offers: offers.filter((offer) => offer.status === "active").length,
      store_domain: store?.domain,
      product_url: productUrl,
    };
  }

  /* ===============
   * List bundles for store
   * ===============*/
  async listBundles(store_id, filters = {}) {
    const query = { store_id };

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.target_product_id) {
      query.target_product_id = filters.target_product_id;
    }

    const bundles = await BundleConfig.find(query)
      .sort({ created_at: -1 })
      .limit(filters.limit || 50);

    // Get store info for domain
    const store = await Store.findOne({ store_id });

    // Get offer counts for each bundle
    const bundlesWithOffers = await Promise.all(
      bundles.map(async (bundle) => {
        const offerCount = await BundleOffer.countDocuments({
          bundle_id: bundle._id,
          status: "active",
        });

        // Construct proper Salla product URL
        let productUrl = null;
        if (store?.domain) {
          if (bundle.target_product_name) {
            // Try format: https://domain/product-name/pID
            const encodedProductName = encodeURIComponent(
              bundle.target_product_name
            );
            productUrl = `https://${store.domain}/${encodedProductName}/p${bundle.target_product_id}`;
          } else {
            // Fallback format: https://domain/pID
            productUrl = `https://${store.domain}/p${bundle.target_product_id}`;
          }
        }

        return {
          ...bundle.toObject(),
          active_offers_count: offerCount,
          store_domain: store?.domain,
          product_url: productUrl,
        };
      })
    );

    return bundlesWithOffers;
  }

  /* ===============
   * Get bundles by product ID (for storefront)
   * ===============*/
  async getBundlesByProduct(store_id, product_id) {
    const bundles = await BundleConfig.findActiveByStore(store_id);

    const productBundles = bundles.filter(
      (bundle) => bundle.target_product_id === product_id
    );

    if (productBundles.length === 0) {
      return null;
    }

    // Return the most recent active bundle for this product
    return productBundles[0];
  }

  /* ===============
   * Get enhanced bundle data - fetches real-time product data from Salla API
   * ===============*/
  async getEnhancedBundleData(store_id, bundle) {
    try {
      // Collect all product IDs from the bundle
      const allProductIds = [bundle.target_product_id];
      bundle.bundles.forEach(tier => {
        tier.offers.forEach(offer => {
          if (!allProductIds.includes(offer.product_id)) {
            allProductIds.push(offer.product_id);
          }
        });
      });

      console.log(`[Bundle Service] Fetching fresh product data for: ${allProductIds.join(', ')}`);

      // Fetch fresh product data from Salla API
      const { products, failed } = await productService.getMultipleProducts(store_id, allProductIds);

      if (failed.length > 0) {
        console.warn(`[Bundle Service] Failed to fetch some products: ${failed.map(f => f.id).join(', ')}`);
      }

      // Create a map for quick lookup
      const productMap = {};
      products.forEach(product => {
        productMap[product.id] = productService.extractProductData(product);
      });

      // Get fresh target product data
      const targetProductData = productMap[bundle.target_product_id] || {
        id: bundle.target_product_id,
        name: bundle.target_product_name || 'منتج',
        price: 100.00,
        image: null,
        options: [],
        variants: [],
        has_variants: false
      };

      // Enhance bundles with fresh product data
      const enhancedBundles = bundle.bundles.map(tier => {
        const cleanTier = {
          tier: tier.tier,
          buy_quantity: tier.buy_quantity,
          // Tier UI Customization fields
          tier_title: tier.tier_title,
          tier_highlight_text: tier.tier_highlight_text,
          tier_bg_color: tier.tier_bg_color,
          tier_text_color: tier.tier_text_color,
          tier_highlight_bg_color: tier.tier_highlight_bg_color,
          tier_highlight_text_color: tier.tier_highlight_text_color,
          is_default: tier.is_default,
          offers: tier.offers.map(offer => ({
            product_id: offer.product_id,
            product_name: offer.product_name,
            quantity: offer.quantity,
            discount_type: offer.discount_type,
            discount_amount: offer.discount_amount,
            offer_type: offer.offer_type,
            arabic_message: offer.arabic_message,
            product_data: productMap[offer.product_id] || {
              id: offer.product_id,
              name: offer.product_name || 'منتج',
              price: 100.00,
              image: null,
              options: [],
              variants: [],
              has_variants: false
            }
          }))
        };
        return cleanTier;
      });

      const result = {
        id: bundle._id.toString(),
        name: bundle.name,
        target_product_id: bundle.target_product_id,
        target_product_name: targetProductData.name,
        target_product_data: targetProductData,
        bundles: enhancedBundles,
        start_date: bundle.start_date,
        expiry_date: bundle.expiry_date,
        is_active: bundle.is_currently_active,
        // UI Customization fields
        modal_title: bundle.modal_title,
        modal_subtitle: bundle.modal_subtitle,
        cta_button_text: bundle.cta_button_text,
        cta_button_bg_color: bundle.cta_button_bg_color,
        cta_button_text_color: bundle.cta_button_text_color,
      };

      // Log enhanced bundle with tier customization
      console.log('[Bundle Service] Enhanced bundle UI fields:', {
        modal_title: result.modal_title,
        modal_subtitle: result.modal_subtitle,
        cta_button_text: result.cta_button_text,
        cta_button_bg_color: result.cta_button_bg_color,
        cta_button_text_color: result.cta_button_text_color,
        tiers: result.bundles.map(t => ({
          tier: t.tier,
          is_default: t.is_default,
          tier_title: t.tier_title,
          tier_bg_color: t.tier_bg_color
        }))
      });

      return result;

    } catch (error) {
      console.error('[Bundle Service] Error enhancing bundle data:', error);
      throw error;
    }
  }

  /* ===============
   * Validate bundle products exist
   * ===============*/
  async validateBundleProducts(store_id, bundleData) {
    const errors = [];

    try {
      // Validate target product
      const targetProduct = await productService.getProduct(
        store_id,
        bundleData.target_product_id
      );
      if (!targetProduct) {
        errors.push(`Target product ${bundleData.target_product_id} not found`);
      }

      // Validate all offer products
      for (const tier of bundleData.bundles) {
        const tierOffers = tier.offers || tier.gifts || []; // Support both old and new format
        for (const offer of tierOffers) {
          try {
            const offerProduct = await productService.getProduct(
              store_id,
              offer.product_id
            );
            if (!offerProduct) {
              errors.push(`Offer product ${offer.product_id} not found`);
            }
          } catch (error) {
            errors.push(
              `Offer product ${offer.product_id} validation failed: ${error.message}`
            );
          }
        }
      }
    } catch (error) {
      errors.push(`Product validation failed: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /* ===============
   * Generate configuration hash for idempotency
   * ===============*/
  generateConfigHash(bundleData) {
    const hashContent = JSON.stringify({
      target_product_id: bundleData.target_product_id,
      bundles: bundleData.bundles.map((tier) => {
        const tierOffers = tier.offers || tier.gifts || [];
        return {
          tier: tier.tier,
          buy_quantity: tier.buy_quantity,
          offers: tierOffers.map((offer) => ({
            product_id: offer.product_id,
            quantity: offer.quantity,
            discount_type: offer.discount_type || "free",
            discount_amount: offer.discount_amount || 100,
            offer_type: offer.offer_type || "gift",
          })),
        };
      }),
    });

    return crypto.createHash("md5").update(hashContent).digest("hex");
  }

  /* ===============
   * Update bundle analytics
   * ===============*/
  async trackBundleView(bundle_id) {
    await BundleConfig.findByIdAndUpdate(bundle_id, {
      $inc: { total_views: 1 },
    });
  }

  async trackBundleClick(bundle_id) {
    await BundleConfig.findByIdAndUpdate(bundle_id, {
      $inc: { total_clicks: 1 },
    });
  }

  async trackBundleConversion(bundle_id, revenue = 0) {
    await BundleConfig.findByIdAndUpdate(bundle_id, {
      $inc: {
        total_conversions: 1,
        total_revenue: revenue,
      },
    });
  }

  /* ===============
   * Clean up expired bundles
   * ===============*/
  async cleanupExpiredBundles() {
    const now = new Date();

    const expiredBundles = await BundleConfig.find({
      status: "active",
      expiry_date: { $lt: now },
    });

    for (const bundle of expiredBundles) {
      try {
        await this.deactivateBundle(bundle._id);
        console.log(`[Bundle]: Auto-deactivated expired bundle ${bundle._id}`);
      } catch (error) {
        console.error(
          `[Bundle]: Failed to auto-deactivate bundle ${bundle._id}:`,
          error
        );
      }
    }

    return expiredBundles.length;
  }
}

export default new BundleService();
