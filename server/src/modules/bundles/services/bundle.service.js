import crypto from "crypto";
import BundleConfig from "../model/bundleConfig.model.js";
import BundleOffer from "../model/bundleOffer.model.js";
import BundleAnalytics from "../model/bundleAnalytics.model.js";
import Store from "../../stores/model/store.model.js";
import specialOffersService from "./specialOffers.service.js";
import productService from "../../products/services/product.service.js";
import { AppError } from "../../../utils/errorHandler.js";
import {
  stripBundleStylingInput,
  stripBundleStylingUpdate,
  enrichBundleForPlanResponse,
} from "../../stores/constants/planConfig.js";

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

    const planConfig = store.getPlanConfig();
    const sanitizedPayload = stripBundleStylingInput(
      bundleData,
      planConfig.key
    );

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
    const productData = await this.fetchAndStoreProductData(
      store_id,
      sanitizedPayload
    );

    // Validate products exist and are available
    const validation = await this.validateBundleProducts(
      store_id,
      sanitizedPayload
    );
    if (!validation.valid) {
      throw new AppError(
        `Product validation failed: ${validation.errors.join(", ")}`,
        400
      );
    }

    // Generate config hash for idempotency
    const configHash = this.generateConfigHash(sanitizedPayload);

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
      name: sanitizedPayload.name,
      description: sanitizedPayload.description || "",
      target_product_id: sanitizedPayload.target_product_id,
      target_product_name: productData.targetProduct.name,
      target_product_data: productData.targetProduct,
      bundles: productData.enhancedBundles,
      start_date: new Date(sanitizedPayload.start_date),
      expiry_date: sanitizedPayload.expiry_date
        ? new Date(sanitizedPayload.expiry_date)
        : null,
      modal_title: sanitizedPayload.modal_title || "اختر باقتك",
      modal_subtitle: sanitizedPayload.modal_subtitle || "",
      cta_button_text: sanitizedPayload.cta_button_text || "اختر الباقة",
      cta_button_bg_color: sanitizedPayload.cta_button_bg_color || "#000",
      cta_button_text_color:
        sanitizedPayload.cta_button_text_color || "#ffffff",
      checkout_button_text:
        sanitizedPayload.checkout_button_text ||
        "الإنتقال الى الدفع — {total_price}",
      checkout_button_bg_color:
        sanitizedPayload.checkout_button_bg_color || "#000",
      checkout_button_text_color:
        sanitizedPayload.checkout_button_text_color || "#ffffff",
      config_hash: configHash,
      status: "draft",
      created_by: sanitizedPayload.created_by || "system",
    });

    return bundle;
  }

  /* ===============
   * Fetch product data from Salla API and enhance bundle data
   * ===============*/
  async fetchAndStoreProductData(store_id, bundleData) {
    // Collect all unique product IDs
    const allProductIds = [bundleData.target_product_id];

    bundleData.bundles.forEach((tier) => {
      tier.offers.forEach((offer) => {
        if (!allProductIds.includes(offer.product_id)) {
          allProductIds.push(offer.product_id);
        }
      });
    });

    const { products, failed } = await productService.getMultipleProducts(
      store_id,
      allProductIds
    );

    if (failed.length > 0) {
      console.warn(
        `[Bundle Service] Failed to fetch products: ${failed
          .map((f) => f.id)
          .join(", ")}`
      );
    }

    // Create product lookup map
    const productMap = {};
    products.forEach((product) => {
      productMap[product.id] = productService.extractProductData(product);
    });

    // Get target product data
    const targetProduct = productMap[bundleData.target_product_id];
    if (!targetProduct) {
      throw new AppError(
        `Target product ${bundleData.target_product_id} not found`,
        404
      );
    }

    // Enhance bundle offers with real product data
    const enhancedBundles = bundleData.bundles.map((tier) => ({
      tier: tier.tier,
      buy_quantity: tier.buy_quantity,
      offers: tier.offers.map((offer) => {
        const productData = productMap[offer.product_id];
        if (!productData) {
          throw new AppError(
            `Offer product ${offer.product_id} not found`,
            404
          );
        }

        return {
          product_id: offer.product_id,
          product_name: productData.name,
          quantity: offer.quantity,
          discount_type: offer.discount_type,
          discount_amount: offer.discount_amount,
          offer_type: offer.offer_type,
          arabic_message: offer.arabic_message,
          product_data: productData,
        };
      }),
    }));

    return {
      targetProduct,
      enhancedBundles,
      productMap,
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
      const deletionResults = await specialOffersService.deleteOffers(
        bundle.store_id,
        offer_ids
      );

      // Delete local offer records
      await BundleOffer.deleteMany({
        bundle_id,
        status: "active",
      });
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
  async getBundleDetails(bundle_id, store_id = null) {
    const query = { _id: bundle_id };
    if (store_id) {
      query.store_id = store_id;
    }

    const bundle = await BundleConfig.findOne(query);
    if (!bundle) {
      throw new AppError("Bundle not found or access denied", 404);
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

    const planKey = store?.plan || "basic";

    const bundlePayload = {
      ...bundle.toObject(),
      offers,
      total_offers: offers.length,
      active_offers: offers.filter((offer) => offer.status === "active").length,
      store_domain: store?.domain,
      product_url: productUrl,
    };

    return enrichBundleForPlanResponse(bundlePayload, planKey);
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
    const planKey = store?.plan || "basic";

    const bundlesWithOffers = await Promise.all(
      bundles.map(async (bundle) => {
        const offerCount = await BundleOffer.countDocuments({
          bundle_id: bundle._id,
          status: "active",
        });

        // Get current month analytics for this bundle
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const currentMonthAnalytics = await BundleAnalytics.findOne({
          bundle_id: bundle._id,
          month: currentMonth,
          year: currentYear,
        }).lean();

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

        const bundleObject = {
          ...bundle.toObject(),
          active_offers_count: offerCount,
          store_domain: store?.domain,
          product_url: productUrl,
          current_month_analytics: currentMonthAnalytics
            ? {
                views: currentMonthAnalytics.views || 0,
                clicks: currentMonthAnalytics.clicks || 0,
                conversions: currentMonthAnalytics.conversions || 0,
                revenue: currentMonthAnalytics.revenue || 0,
              }
            : {
                views: 0,
                clicks: 0,
                conversions: 0,
                revenue: 0,
              },
        };

        return enrichBundleForPlanResponse(bundleObject, planKey);
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
      const store = await Store.findOne({ store_id });

      // Collect all product IDs from the bundle
      const allProductIds = [bundle.target_product_id];
      bundle.bundles.forEach((tier) => {
        tier.offers.forEach((offer) => {
          if (!allProductIds.includes(offer.product_id)) {
            allProductIds.push(offer.product_id);
          }
        });
      });

      // Fetch fresh product data from Salla API
      const { products, failed } = await productService.getMultipleProducts(
        store_id,
        allProductIds
      );

      if (failed.length > 0) {
        console.warn(
          `[Bundle Service] Failed to fetch some products: ${failed
            .map((f) => f.id)
            .join(", ")}`
        );
      }

      // Create a map for quick lookup
      const productMap = {};
      products.forEach((product) => {
        productMap[product.id] = productService.extractProductData(product);
      });

      // Get fresh target product data
      const targetProductData = productMap[bundle.target_product_id] || {
        id: bundle.target_product_id,
        name: bundle.target_product_name || "منتج",
        price: 100.0,
        image: null,
        options: [],
        variants: [],
        has_variants: false,
      };

      // Enhance bundles with fresh product data
      const enhancedBundles = bundle.bundles.map((tier) => {
        const cleanTier = {
          tier: tier.tier,
          buy_quantity: tier.buy_quantity,
          // Tier UI Customization fields
          tier_title: tier.tier_title,
          tier_summary_text: tier.tier_summary_text,
          tier_highlight_text: tier.tier_highlight_text,
          tier_bg_color: tier.tier_bg_color,
          tier_text_color: tier.tier_text_color,
          tier_highlight_bg_color: tier.tier_highlight_bg_color,
          tier_highlight_text_color: tier.tier_highlight_text_color,
          is_default: tier.is_default,
          offers: tier.offers.map((offer) => ({
            product_id: offer.product_id,
            product_name: offer.product_name,
            quantity: offer.quantity,
            discount_type: offer.discount_type,
            discount_amount: offer.discount_amount,
            offer_type: offer.offer_type,
            arabic_message: offer.arabic_message,
            product_data: productMap[offer.product_id] || {
              id: offer.product_id,
              name: offer.product_name || "منتج",
              price: 100.0,
              image: null,
              options: [],
              variants: [],
              has_variants: false,
            },
          })),
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
        // Checkout Button Customization fields
        checkout_button_text: bundle.checkout_button_text,
        checkout_button_bg_color: bundle.checkout_button_bg_color,
        checkout_button_text_color: bundle.checkout_button_text_color,
      };

      const planKey = store?.plan || "basic";
      return enrichBundleForPlanResponse(result, planKey);
    } catch (error) {
      console.error("[Bundle Service] Error enhancing bundle data:", error);
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
   * Update bundle analytics - Now with monthly tracking and IP-based unique visitors
   * ===============*/
  async trackBundleView(bundle_id, visitorIp = null) {
    const bundle = await BundleConfig.findById(bundle_id).select(
      "store_id name"
    );

    if (!bundle) {
      return { limitReached: false, skipped: true };
    }

    const store = await Store.findOne({ store_id: bundle.store_id });

    if (!store) {
      return { limitReached: false, skipped: true };
    }

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1; // 1-12
    const period = `${year}-${String(month).padStart(2, "0")}`;

    const viewLimit = store.getMonthlyViewLimit();
    let limitReached = false;
    let usageUpdated = false;

    // Check and update store-level plan usage (for plan limit enforcement)
    if (viewLimit !== null && viewLimit !== undefined) {
      if (!store.plan_usage) {
        store.plan_usage = {};
      }

      if (!store.plan_usage.monthly_views) {
        store.plan_usage.monthly_views = {
          period,
          count: 0,
        };
        usageUpdated = true;
      }

      if (store.plan_usage.monthly_views.period !== period) {
        store.plan_usage.monthly_views.period = period;
        store.plan_usage.monthly_views.count = 0;
        usageUpdated = true;
      }

      if (store.plan_usage.monthly_views.count >= viewLimit) {
        limitReached = true;
      } else {
        store.plan_usage.monthly_views.count += 1;
        usageUpdated = true;
      }

      if (usageUpdated) {
        await store.save();
      }
    }

    // Always track bundle-level analytics in monthly records, even if limit reached
    try {
      // Get or create monthly analytics record
      const analytics = await BundleAnalytics.getOrCreate(
        bundle_id,
        bundle.name,
        bundle.store_id,
        year,
        month
      );

      // Increment view count (counts all requests, even over-limit)
      analytics.views += 1;

      // Track if this view exceeded the plan limit
      // This helps merchants understand how much demand they're missing
      if (limitReached) {
        if (!analytics.over_limit_views) {
          analytics.over_limit_views = 0;
        }
        analytics.over_limit_views += 1;
      }

      // Track unique visitor by IP if provided
      if (visitorIp) {
        analytics.addUniqueVisitor(visitorIp);
      }

      await analytics.save();
    } catch (error) {
      console.error(
        `[Bundle Service] Failed to track monthly analytics for bundle ${bundle_id}:`,
        error
      );
    }

    // Analytics are tracked in BundleAnalytics collection only
    // No need to update bundle document

    return { limitReached };
  }

  async trackBundleClick(bundle_id) {
    // Update monthly analytics
    try {
      const bundle = await BundleConfig.findById(bundle_id).select(
        "store_id name"
      );
      if (bundle) {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth() + 1;

        const analytics = await BundleAnalytics.getOrCreate(
          bundle_id,
          bundle.name,
          bundle.store_id,
          year,
          month
        );

        analytics.clicks += 1;
        await analytics.save();
      }
    } catch (error) {
      console.error(
        `[Bundle Service] Failed to track monthly click for bundle ${bundle_id}:`,
        error
      );
    }
  }

  async trackBundleConversion(bundle_id, revenue = 0) {
    // Update monthly analytics
    try {
      const bundle = await BundleConfig.findById(bundle_id).select(
        "store_id name"
      );
      if (bundle) {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth() + 1;

        const analytics = await BundleAnalytics.getOrCreate(
          bundle_id,
          bundle.name,
          bundle.store_id,
          year,
          month
        );

        analytics.conversions += 1;
        analytics.revenue += revenue;
        await analytics.save();
      }
    } catch (error) {
      console.error(
        `[Bundle Service] Failed to track monthly conversion for bundle ${bundle_id}:`,
        error
      );
    }
  }

  async trackTierSelection(bundle_id, tier_id) {
    // Increment tier_selections for the specific tier in bundle
    await BundleConfig.findOneAndUpdate(
      { _id: bundle_id, "bundles.tier": tier_id },
      { $inc: { "bundles.$.tier_selections": 1 } }
    );

    // Update monthly analytics tier stats
    try {
      const bundle = await BundleConfig.findById(bundle_id).select(
        "store_id name bundles"
      );
      if (bundle) {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth() + 1;

        const analytics = await BundleAnalytics.getOrCreate(
          bundle_id,
          bundle.name,
          bundle.store_id,
          year,
          month
        );

        // Find or create tier stat
        let tierStat = analytics.tier_stats.find((t) => t.tier === tier_id);
        if (!tierStat) {
          const tierData = bundle.bundles.find((t) => t.tier === tier_id);
          analytics.tier_stats.push({
            tier: tier_id,
            tier_name: tierData?.tier_title || `العرض ${tier_id}`,
            selections: 1,
            checkouts: 0,
            conversion_rate: 0,
          });
        } else {
          tierStat.selections += 1;
        }

        await analytics.save();
      }
    } catch (error) {
      console.error(
        `[Bundle Service] Failed to track monthly tier selection for bundle ${bundle_id}:`,
        error
      );
    }
  }

  async trackTierCheckout(bundle_id, tier_id) {
    // Increment tier_checkouts for the specific tier in bundle
    await BundleConfig.findOneAndUpdate(
      { _id: bundle_id, "bundles.tier": tier_id },
      { $inc: { "bundles.$.tier_checkouts": 1 } }
    );

    // Update monthly analytics tier stats
    try {
      const bundle = await BundleConfig.findById(bundle_id).select(
        "store_id name bundles"
      );
      if (bundle) {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth() + 1;

        const analytics = await BundleAnalytics.getOrCreate(
          bundle_id,
          bundle.name,
          bundle.store_id,
          year,
          month
        );

        // Find or create tier stat
        let tierStat = analytics.tier_stats.find((t) => t.tier === tier_id);
        if (!tierStat) {
          const tierData = bundle.bundles.find((t) => t.tier === tier_id);
          analytics.tier_stats.push({
            tier: tier_id,
            tier_name: tierData?.tier_title || `العرض ${tier_id}`,
            selections: 0,
            checkouts: 1,
            conversion_rate: 0,
          });
        } else {
          tierStat.checkouts += 1;
        }

        await analytics.save();
      }
    } catch (error) {
      console.error(
        `[Bundle Service] Failed to track monthly tier checkout for bundle ${bundle_id}:`,
        error
      );
    }
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
