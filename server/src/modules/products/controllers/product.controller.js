import { asyncWrapper } from "../../../utils/errorHandler.js";
import productService from "../services/product.service.js";

/* ===============================================
 * Get products for bundle creation
 * =============================================== */
export const getProducts = asyncWrapper(async (req, res) => {
  const { store_id } = req.user;
  const { page = 1, per_page = 50, search } = req.query;

  try {
    const products = await productService.getProducts(
      store_id,
      page,
      per_page,
      search
    );

    // Transform response for frontend
    const transformedProducts = products.data.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku || null,
      price: product.price?.amount || 0,
      currency: product.price?.currency || "SAR",
      image: product.thumbnail || product.images?.[0]?.url || null,
      status: product.status,
      quantity: product.quantity,
      unlimited_quantity: product.unlimited_quantity,
      has_options: product.options && product.options.length > 0,
      options: product.options || [],
      description: product.description || null,
    }));

    res.status(200).json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: products.pagination || {
          current_page: parseInt(page),
          per_page: parseInt(per_page),
          total: transformedProducts.length,
        },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
});

/* ===============================================
 * Get single product details
 * =============================================== */
export const getProductDetails = asyncWrapper(async (req, res) => {
  const { store_id } = req.user;
  const { product_id } = req.params;

  try {
    const product = await productService.getProduct(store_id, product_id);

    // Transform response for frontend
    const transformedProduct = {
      id: product.data.id,
      name: product.data.name,
      sku: product.data.sku || null,
      price: product.data.price?.amount || 0,
      currency: product.data.price?.currency || "SAR",
      image: product.data.thumbnail || product.data.images?.[0]?.url || null,
      images: product.data.images || [],
      status: product.data.status,
      quantity: product.data.quantity,
      unlimited_quantity: product.data.unlimited_quantity,
      has_options: product.data.options && product.data.options.length > 0,
      options: product.data.options || [],
      description: product.data.description || null,
      categories: product.data.categories || [],
    };

    res.status(200).json({
      success: true,
      data: transformedProduct,
    });
  } catch (error) {
    console.error("Get product details error:", error);
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
});

/* ===============================================
 * Search products by name/sku
 * =============================================== */
export const searchProducts = asyncWrapper(async (req, res) => {
  const { store_id } = req.user;
  const { q: searchQuery, page = 1, per_page = 20 } = req.query;

  if (!searchQuery || searchQuery.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Search query must be at least 2 characters",
    });
  }

  try {
    const products = await productService.getProducts(
      store_id,
      page,
      per_page,
      searchQuery
    );

    // Transform and filter products
    const transformedProducts = products.data
      .filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.sku &&
            product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku || null,
        price: product.price?.amount || 0,
        currency: product.price?.currency || "SAR",
        image: product.thumbnail || product.images?.[0]?.url || null,
        status: product.status,
        has_options: product.options && product.options.length > 0,
      }));

    res.status(200).json({
      success: true,
      data: {
        products: transformedProducts,
        total: transformedProducts.length,
        query: searchQuery,
      },
    });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search products",
    });
  }
});
