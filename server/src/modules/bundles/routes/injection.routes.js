import { Router } from "express";
import BundleService from "../services/bundle.service.js";

const router = Router();

// Salla App Installation Script - automatically injected into all product pages
router.get("/salla-injection.js", async (req, res) => {
  const { store } = req.query;

  res.set({
    "Content-Type": "application/javascript",
    "Cache-Control": "public, max-age=3600",
    "Access-Control-Allow-Origin": "*",
  });

  const injectionScript = `
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiUrl: '${req.protocol}://${req.get("host")}/api/v1',
    storeDomain: '${store || ""}',
    targetSelector: '.product-form button[type="submit"], .add-to-cart-btn, .btn-add-to-cart, [data-add-to-cart]',
    productIdSelectors: [
      '[name="product_id"]',
      '[data-product-id]',
      '.product-id',
      '#product-id'
    ]
  };

  class SallaBundleInjector {
    constructor() {
      this.productId = null;
      this.originalButton = null;
      this.bundleButton = null;
      this.bundleExists = false;
      this.isInjected = false;
    }

    async initialize() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    }

    async start() {
      try {
        // Extract product ID from current page
        this.productId = this.extractProductId();
        
        if (!this.productId) {
          console.log('[Salla Bundle] No product ID found on this page');
          return;
        }

        console.log(\`[Salla Bundle] Found product ID: \${this.productId}\`);

        // Check if bundles exist for this product
        this.bundleExists = await this.checkBundleExists();
        
        if (!this.bundleExists) {
          console.log(\`[Salla Bundle] No bundles found for product \${this.productId}\`);
          return;
        }

        console.log(\`[Salla Bundle] Bundles found for product \${this.productId}, injecting UI\`);

        // Inject bundle UI
        this.injectBundleUI();

      } catch (error) {
        console.error('[Salla Bundle] Initialization failed:', error);
      }
    }

    extractProductId() {
      // Method 1: Check form inputs and data attributes
      for (const selector of CONFIG.productIdSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const productId = element.value || element.dataset.productId || element.textContent;
          if (productId && productId.trim()) {
            return productId.trim();
          }
        }
      }

      // Method 2: Extract from URL patterns
      const urlPatterns = [
        /\\/products?\\/([^/?#]+)/,  // /product/123 or /products/123
        /\\/p\\/([^/?#]+)/,          // /p/123
        /product[_-]id[=:]([^&?#]+)/, // product_id=123 or product-id:123
        /id[=:]([^&?#]+)/            // id=123 or id:123
      ];

      const url = window.location.href;
      for (const pattern of urlPatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      // Method 3: Check meta tags
      const metaProduct = document.querySelector('meta[property="product:id"], meta[name="product-id"]');
      if (metaProduct) {
        return metaProduct.content;
      }

      // Method 4: Check page structure for Salla-specific elements
      const sallaProduct = document.querySelector('[data-product], .product-details [data-id]');
      if (sallaProduct) {
        return sallaProduct.dataset.product || sallaProduct.dataset.id;
      }

      return null;
    }

    async checkBundleExists() {
      try {
        const response = await fetch(\`\${CONFIG.apiUrl}/storefront/bundles/\${this.productId}?store=\${CONFIG.storeDomain}\`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': '1'
          }
        });

        return response.ok;
      } catch (error) {
        console.error('[Salla Bundle] Bundle check failed:', error);
        return false;
      }
    }

    injectBundleUI() {
      if (this.isInjected) return;

      // Find the add to cart button
      this.originalButton = document.querySelector(CONFIG.targetSelector);
      
      if (!this.originalButton) {
        console.warn('[Salla Bundle] Add to cart button not found');
        // Try alternative injection methods
        this.injectAlternativeUI();
        return;
      }

      // Create bundle button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'salla-bundle-container';
      buttonContainer.style.cssText = \`
        margin: 15px 0;
        position: relative;
      \`;

      // Create bundle trigger button
      this.bundleButton = document.createElement('button');
      this.bundleButton.className = 'salla-bundle-trigger-btn';
      this.bundleButton.innerHTML = '🔥 عروض حصرية متاحة - اختر باقتك';
      this.bundleButton.type = 'button';
      
      this.bundleButton.style.cssText = \`
        width: 100%;
        background: linear-gradient(135deg, #fece0a 0%, #e6b800 100%);
        color: #000;
        border: none;
        padding: 14px 20px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 10px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(254, 206, 10, 0.3);
        font-family: inherit;
        text-align: center;
        position: relative;
        overflow: hidden;
      \`;

      // Add hover effects
      this.bundleButton.addEventListener('mouseenter', () => {
        this.bundleButton.style.background = 'linear-gradient(135deg, #e6b800 0%, #cc9900 100%)';
        this.bundleButton.style.transform = 'translateY(-2px)';
        this.bundleButton.style.boxShadow = '0 8px 20px rgba(254, 206, 10, 0.5)';
      });

      this.bundleButton.addEventListener('mouseleave', () => {
        this.bundleButton.style.background = 'linear-gradient(135deg, #fece0a 0%, #e6b800 100%)';
        this.bundleButton.style.transform = 'translateY(0)';
        this.bundleButton.style.boxShadow = '0 4px 12px rgba(254, 206, 10, 0.3)';
      });

      // Add click handler
      this.bundleButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.openBundleModal();
      });

      // Append to container
      buttonContainer.appendChild(this.bundleButton);

      // Insert before original button
      this.originalButton.parentNode.insertBefore(buttonContainer, this.originalButton);

      // Mark as injected
      this.isInjected = true;

      console.log('[Salla Bundle] Bundle UI injected successfully');
    }

    injectAlternativeUI() {
      // Try to inject in product form or product details section
      const alternatives = [
        '.product-form',
        '.product-details',
        '.product-info',
        '.product-actions',
        '.product-price'
      ];

      for (const selector of alternatives) {
        const container = document.querySelector(selector);
        if (container) {
          const bundleNotice = document.createElement('div');
          bundleNotice.className = 'salla-bundle-notice';
          bundleNotice.innerHTML = \`
            <div style="
              background: linear-gradient(135deg, #fece0a 0%, #e6b800 100%);
              color: #000;
              padding: 12px 16px;
              border-radius: 8px;
              margin: 10px 0;
              text-align: center;
              font-weight: 600;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(254, 206, 10, 0.3);
              transition: all 0.3s ease;
            " onclick="window.sallaBundle.openBundleModal()">
              🔥 عروض حصرية متاحة لهذا المنتج - انقر للاطلاع
            </div>
          \`;
          
          container.appendChild(bundleNotice);
          this.isInjected = true;
          break;
        }
      }
    }

    async openBundleModal() {
      try {
        // Load bundle modal script if not already loaded
        if (!window.SallaBundleModal) {
          await this.loadBundleModalScript();
        }

        // Initialize and show modal
        const modal = new window.SallaBundleModal(this.productId, CONFIG.storeDomain);
        await modal.initialize();
        modal.show();

      } catch (error) {
        console.error('[Salla Bundle] Failed to open modal:', error);
        // Fallback: redirect to bundle page
        window.open(\`\${CONFIG.apiUrl}/storefront/bundles/\${this.productId}?store=\${CONFIG.storeDomain}\`, '_blank');
      }
    }

    async loadBundleModalScript() {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = \`\${CONFIG.apiUrl}/modal/modal.js?store=\${CONFIG.storeDomain}\`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  }

  // Global instance
  window.sallaBundle = new SallaBundleInjector();
  
  // Auto-initialize
  window.sallaBundle.initialize();

})();
`;

  res.send(injectionScript);
});

export default router;
