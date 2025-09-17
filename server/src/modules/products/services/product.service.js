import axios from "axios";
import Store from "../../stores/model/store.model.js";

class ProductService {
  constructor() {
    this.baseURL = "https://api.salla.dev/admin/v2";
  }

  /* ===============
   * Get all products from Salla store
   * ===============*/
  async getProducts(store_id, page = 1, per_page = 50) {
    const store = await Store.findOne({ store_id });
    if (!store) throw new Error("Store not found");

    const response = await axios.get(`${this.baseURL}/products`, {
      headers: {
        Authorization: `Bearer ${store.access_token}`,
        "Content-Type": "application/json",
      },
      params: { page, per_page },
    });

    return response.data;
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
}

export default new ProductService();
