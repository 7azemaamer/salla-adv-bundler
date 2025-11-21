import axios from "axios";
import Store from "../../stores/model/store.model.js";
import {
  getValidAccessToken,
  refreshAccessToken,
} from "../../../utils/tokenHelper.js";

class ProductService {
  constructor() {
    this.baseURL = "https://api.salla.dev/admin/v2";
  }

  /* ===============
   * Get all products from Salla store
   * ===============*/
  async getProducts(store_id, page = 1, per_page = 200, search = null) {
    try {
      const store = await Store.findOne({ store_id });
      if (!store) {
        console.error(`[ProductService] Store not found for ID: ${store_id}`);
        throw new Error("Store not found");
      }

      const params = { page, per_page };

      // Salla API only supports 'name' search, so we'll fetch with name and filter SKU locally
      if (search) {
        params.name = search;
      }

      // Get valid access token (auto-refreshes if needed)
      const accessToken = await getValidAccessToken(store_id);

      try {
        const response = await axios.get(`${this.baseURL}/products`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          params,
        });

        return response.data;
      } catch (apiError) {
        if (apiError.response?.status === 401) {
          console.log(
            `[ProductService] 401 error, forcing token refresh for store ${store_id}`
          );
          const freshToken = await refreshAccessToken(store_id);

          const retryResponse = await axios.get(`${this.baseURL}/products`, {
            headers: {
              Authorization: `Bearer ${freshToken}`,
              "Content-Type": "application/json",
            },
            params,
          });

          if (search && retryResponse.data?.data) {
            const searchLower = search.toLowerCase();
            const allProducts = retryResponse.data.data;
            const filteredProducts = allProducts.filter(
              (product) =>
                product.name?.toLowerCase().includes(searchLower) ||
                product.sku?.toLowerCase().includes(searchLower)
            );
            return {
              ...retryResponse.data,
              data: filteredProducts,
              pagination: {
                ...retryResponse.data.pagination,
                total: filteredProducts.length,
              },
            };
          }

          return retryResponse.data;
        }
        throw apiError;
      }

      // If searching, filter results to include SKU matches as well
      if (search && response.data?.data) {
        const searchLower = search.toLowerCase();
        const allProducts = response.data.data;
        const filteredProducts = allProducts.filter(
          (product) =>
            product.name?.toLowerCase().includes(searchLower) ||
            product.sku?.toLowerCase().includes(searchLower)
        );
        return {
          ...response.data,
          data: filteredProducts,
          pagination: {
            ...response.data.pagination,
            total: filteredProducts.length,
          },
        };
      }

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

    // Get valid access token (auto-refreshes if needed)
    const accessToken = await getValidAccessToken(store_id);

    try {
      const response = await axios.get(
        `${this.baseURL}/products/${product_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      // Retry once on 401
      if (error.response?.status === 401) {
        const freshToken = await refreshAccessToken(store_id);

        const retryResponse = await axios.get(
          `${this.baseURL}/products/${product_id}`,
          {
            headers: {
              Authorization: `Bearer ${freshToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        return retryResponse.data;
      }
      throw error;
    }
  }

  /* ===============
   * Get multiple products by IDs - for bundle creation
   * ===============*/
  async getMultipleProducts(store_id, product_ids) {
    const store = await Store.findOne({ store_id });
    if (!store) throw new Error("Store not found");

    // Get valid access token once for all requests
    const accessToken = await getValidAccessToken(store_id);

    const productPromises = product_ids.map(async (product_id) => {
      try {
        const response = await axios.get(
          `${this.baseURL}/products/${product_id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
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
        // Retry once on 401
        if (error.response?.status === 401) {
          try {
            const { refreshAccessToken } = await import(
              "../../../utils/tokenHelper.js"
            );
            const freshToken = await refreshAccessToken(store_id);

            const retryResponse = await axios.get(
              `${this.baseURL}/products/${product_id}`,
              {
                headers: {
                  Authorization: `Bearer ${freshToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            return {
              id: product_id,
              data: retryResponse.data.data,
              success: true,
            };
          } catch (retryError) {
            console.error(
              `Failed to fetch product ${product_id} after retry:`,
              retryError.message
            );
            return {
              id: product_id,
              data: null,
              success: false,
              error: retryError.message,
            };
          }
        }

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
      return false;
    }

    const noStockTracking =
      !parentProduct.track_quantity &&
      !parentProduct.enable_stock &&
      !parentProduct.inventory_tracking;

    if (noStockTracking) {
      return false; // Assume unlimited stock when all tracking is disabled
    }

    if (variant.hasOwnProperty("is_out_of_stock")) {
      const result = variant.is_out_of_stock;

      return result;
    }

    if (variant.hasOwnProperty("is_available")) {
      const result = !variant.is_available;

      return result;
    }

    if (variant.hasOwnProperty("quantity")) {
      if (
        parentProduct.track_quantity ||
        parentProduct.enable_stock ||
        parentProduct.inventory_tracking
      ) {
        const result = variant.quantity === 0;

        return result;
      }

      return false;
    }

    return false;
  }
}

export default new ProductService();
