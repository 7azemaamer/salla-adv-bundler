import axios from "axios";
import Store from "../../stores/model/store.model.js";

class ProductService {
  constructor() {
    this.baseURL = "https://api.salla.dev/admin/v2";
  }

  /* ===============
   * Get all products from Salla store
   * ===============*/
  async getProducts(store_id, page = 1, per_page = 50, search = null) {
    console.log(`[ProductService] Fetching products for store: ${store_id}`);

    try {
      const store = await Store.findOne({ store_id });
      if (!store) {
        console.error(`[ProductService] Store not found for ID: ${store_id}`);
        throw new Error("Store not found");
      }

      console.log(`[ProductService] Found store, making API call to Salla...`);

      const params = { page, per_page };
      if (search) {
        params.name = search;
      }

      const response = await axios.get(`${this.baseURL}/products`, {
        headers: {
          Authorization: `Bearer ${store.access_token}`,
          "Content-Type": "application/json",
        },
        params,
      });

      console.log(
        `[ProductService] Successfully fetched ${
          response.data?.data?.length || 0
        } products`
      );
      return response.data;
    } catch (error) {
      console.error(`[ProductService] Error fetching products:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        store_id,
      });

      if (error.response?.status === 401) {
        throw new Error(
          "Store authentication failed. Please reconnect your store."
        );
      } else if (error.response?.status === 403) {
        throw new Error(
          "Store access forbidden. Please check your permissions."
        );
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw error;
      }
    }
  }

  /* ===============
   * Get single product by ID
   * ===============*/
  async getProduct(store_id, product_id) {
    const store = await Store.findOne({ store_id });
    if (!store) throw new Error("Store not found");

    const response = await axios.get(`${this.baseURL}/products/${product_id}`, {
      headers: {
        Authorization: `Bearer ${store.access_token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  /* ===============
   * Get multiple products by IDs - for bundle creation
   * ===============*/
  async getMultipleProducts(store_id, product_ids) {
    const store = await Store.findOne({ store_id });
    if (!store) throw new Error("Store not found");

    const products = [];

    const productPromises = product_ids.map(async (product_id) => {
      try {
        const response = await axios.get(
          `${this.baseURL}/products/${product_id}`,
          {
            headers: {
              Authorization: `Bearer ${store.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        return {
          id: product_id,
          data: response.data.data,
          success: true,
        };
      } catch (error) {
        console.error(`Failed to fetch product ${product_id}:`, error.message);
        return {
          id: product_id,
          data: null,
          success: false,
          error: error.message,
        };
      }
    });

    const results = await Promise.all(productPromises);

    // Return both successful and failed results
    return {
      products: results
        .filter((r) => r.success)
        .map((r) => ({ id: r.id, ...r.data })),
      failed: results.filter((r) => !r.success),
    };
  }

  /* ===============
   * Extract essential product data for bundle storage
   * ===============*/
  extractProductData(sallaProduct) {
    return {
      id: sallaProduct.id,
      name: sallaProduct.name,
      price: sallaProduct.price ? parseFloat(sallaProduct.price.amount) : 0,
      currency: sallaProduct.price ? sallaProduct.price.currency : "SAR",
      image: sallaProduct.thumbnail || sallaProduct.images?.[0]?.url || null,
      sku: sallaProduct.sku || null,
      status: sallaProduct.status,
      // Include inventory tracking information
      quantity: sallaProduct.quantity || 0,
      track_quantity: sallaProduct.track_quantity || false,
      enable_stock: sallaProduct.enable_stock || false,
      inventory_tracking: sallaProduct.inventory_tracking || false,
      unlimited_quantity: sallaProduct.unlimited_quantity || false,
      is_available: sallaProduct.is_available !== false, // Default to true unless explicitly false
      // Include product options/variants with proper stock info
      options: sallaProduct.options
        ? sallaProduct.options.map((option) => ({
            ...option,
            values: option.values
              ? option.values.map((value) => ({
                  ...value,
                  // For variants, check stock status more carefully
                  is_out_of_stock: this.isVariantOutOfStock(
                    value,
                    sallaProduct
                  ),
                }))
              : [],
          }))
        : [],
      variants: sallaProduct.variants || [],
      has_variants: !!(sallaProduct.options && sallaProduct.options.length > 0),
    };
  }

  /* ===============
   * Determine if a variant is truly out of stock
   * ===============*/
  isVariantOutOfStock(variant, parentProduct) {
    if (parentProduct.unlimited_quantity === true) {
      return false;
    }

    if (variant.unlimited_quantity === true) {
      console.log(
        `[Product Service] Variant has unlimited_quantity=true, variant is available: ${variant.name}`
      );
      return false;
    }

    const noStockTracking =
      !parentProduct.track_quantity &&
      !parentProduct.enable_stock &&
      !parentProduct.inventory_tracking;

    if (noStockTracking) {
      // console.log(
      //   `[Product Service] ALL stock tracking disabled for ${parentProduct.name}, ignoring variant stock status - assuming unlimited`
      // );
      return false; // Assume unlimited stock when all tracking is disabled
    }

    if (variant.hasOwnProperty("is_out_of_stock")) {
      const result = variant.is_out_of_stock;
      console.log(
        `[Product Service] Using explicit is_out_of_stock=${result} for variant ${variant.name}`
      );
      return result;
    }

    if (variant.hasOwnProperty("is_available")) {
      const result = !variant.is_available;
      console.log(
        `[Product Service] Using is_available=${variant.is_available}, result=${result} for variant ${variant.name}`
      );
      return result;
    }

    if (variant.hasOwnProperty("quantity")) {
      if (
        parentProduct.track_quantity ||
        parentProduct.enable_stock ||
        parentProduct.inventory_tracking
      ) {
        const result = variant.quantity === 0;
        console.log(
          `[Product Service] Stock tracking enabled, quantity=${variant.quantity}, result=${result} for variant ${variant.name}`
        );
        return result;
      }
      // If stock tracking is disabled, ignore quantity and assume available
      console.log(
        `[Product Service] Stock tracking disabled, assuming available for variant ${variant.name}`
      );
      return false;
    }

    // Default to available if no stock indicators
    console.log(
      `[Product Service] No stock indicators found, defaulting to available for variant ${variant.name}`
    );
    return false;
  }
}

export default new ProductService();
