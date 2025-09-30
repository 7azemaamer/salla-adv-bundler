import BundleService from "../services/bundle.service.js";

/* ===============
 * Salla App Snippet Controller
 * Generates the JavaScript snippet to be injected via Salla App Snippets
 * ===============*/

class SnippetController {
  /* ===============
   * Generate App Snippet for Salla App Store
   * This is the code that gets automatically injected into all store pages
   * ===============*/
  async generateAppSnippet(req, res) {
    try {
      const { store_id } = req.query;

      res.set({
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      });

      // This is the snippet that Salla will inject automatically
      const snippet = `
// Salla Bundle System App Snippet
// This script is automatically injected by the Salla App
(function() {
  'use strict';

  // Only run on product pages - improved detection for Salla
  const isProductPage = window.location.pathname.includes('/p') ||
                        document.querySelector('form.product-form') ||
                        document.querySelector('salla-add-product-button') ||
                        document.querySelector('input[name="id"]') ||
                        document.querySelector('[data-product-id]') ||
                        document.querySelector('.product-details');

  if (!isProductPage) {
    console.log('[Salla Bundle] Not a product page, skipping');
    return;
  }

  const storeContext = window.sallaStoreContext || {};
  
  console.log('[Salla Bundle] Store context:', storeContext);
  console.log('[Salla Bundle] Current URL:', window.location.href);
  console.log('[Salla Bundle] Salla config:', window.Salla?.config);
  console.log('[Salla Bundle] Salla user:', window.Salla?.config?.user);
  console.log('[Salla Bundle] Salla store:', window.Salla?.config?.store);

  // Try to get store ID from Salla events script (most reliable method)
  let sallaStoreId = null;
  try {
    // Look for Salla events in scripts
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      if (script.textContent && (script.textContent.includes('salla.event.dispatchEvents') || script.textContent.includes('dispatchSallaEvents'))) {
        console.log('[Salla Bundle] Found Salla events script');

        // Multiple patterns to extract store ID
        const patterns = [
          /"store":\\s*\\{[^}]*?"id":\\s*(\\d+)/,           // "store":{"id":1711260943
          /"store":\\s*\\{[^}]*?"id":(\\d+)/,              // "store":{"id":1711260943 (no quotes around number)
          /\\\\"store\\\\":\\s*\\{[^}]*?\\\\"id\\\\":\\s*(\\d+)/, // escaped quotes
          /store.*?id.*?(\\d{10,})/,                       // fallback: any 10+ digit number near "store" and "id"
        ];

        for (const pattern of patterns) {
          const match = script.textContent.match(pattern);
          if (match && match[1] && match[1].length >= 10) { // Store IDs are typically 10+ digits
            sallaStoreId = match[1];
            console.log(\`[Salla Bundle] Extracted store ID: \${sallaStoreId}\`);
            break;
          }
        }

        if (sallaStoreId) break;
      }
    }
  } catch (error) {
    console.log('[Salla Bundle] Error parsing Salla events:', error);
  }

  // Fallback: Try to get store ID from URL path
  const urlMatch = window.location.pathname.match(/\\/([a-zA-Z0-9-_]+)\\//);
  const urlStoreId = urlMatch ? urlMatch[1] : null;

  console.log('[Salla Bundle] Salla Events Store ID:', sallaStoreId);
  console.log('[Salla Bundle] URL Store ID:', urlStoreId);
  
  // Extract actual values from Salla context, handling template variables
  const extractSallaValue = (value) => {
    if (typeof value === 'string' && value.includes('{{')) {
      // Template not interpolated, try to get from Salla objects
      if (value.includes('store.domain') && window.location.hostname) {
        return window.location.hostname;
      }
      if (value.includes('store.id') && window.Salla?.config?.store?.id) {
        return window.Salla.config.store.id;
      }
      if (value.includes('customer.id') && window.Salla?.config?.user?.id) {
        return window.Salla.config.user.id;
      }
      if (value.includes('customer.name') && window.Salla?.config?.user?.name) {
        return window.Salla.config.user.name;
      }
      if (value.includes('customer.email') && window.Salla?.config?.user?.email) {
        return window.Salla.config.user.email;
      }
      if (value.includes('customer.mobile') && window.Salla?.config?.user?.mobile) {
        return window.Salla.config.user.mobile;
      }
      return null; // Template not interpolated and no fallback available
    }
    return value;
  };

  const CONFIG = {
    apiUrl: 'https://${req.get(
      "host"
    )}/api/v1', // Force HTTPS for mixed content

    storeDomain: extractSallaValue(storeContext.storeDomain) || window.location.hostname.replace(/^www\./, ''),
    storeId: sallaStoreId || extractSallaValue(storeContext.storeId) || (window.Salla?.config?.store?.id) || '1711260943',
    storeUsername: extractSallaValue(storeContext.storeUsername) || (window.Salla?.config?.store?.username),
    storeEmail: extractSallaValue(storeContext.storeEmail) || (window.Salla?.config?.store?.email),

    customerId: extractSallaValue(storeContext.customerId) || (window.Salla?.config?.user?.id),
    customerName: extractSallaValue(storeContext.customerName) || (window.Salla?.config?.user?.name),
    customerEmail: extractSallaValue(storeContext.customerEmail) || (window.Salla?.config?.user?.email),
    customerMobile: extractSallaValue(storeContext.customerMobile) || (window.Salla?.config?.user?.mobile),

    userId: extractSallaValue(storeContext.userId) || (window.Salla?.config?.user?.id),
    userEmail: extractSallaValue(storeContext.userEmail) || (window.Salla?.config?.user?.email),
    userPhone: extractSallaValue(storeContext.userPhone) || (window.Salla?.config?.user?.mobile),
    productIdSelectors: [
      'input[name="id"]',                    // Salla product form
      '[data-product-id]',                  // Generic data attribute
      '[name="product_id"]',                // Alternative naming
      'salla-add-product-button[product-id]', // Salla component
      '.product-id',
      '#product-id',
      '[data-product]',
      '.product-details [data-id]'
    ],
    targetSelectors: [
      'salla-add-product-button',           // Main Salla component
      'form.product-form',                  // Salla product form
      '.s-add-product-button',              // Salla CSS classes
      '.product-form button[type="submit"]',
      '.add-to-cart-btn',
      '.btn-add-to-cart',
      '[data-add-to-cart]',
      '.salla-add-to-cart',
      '.product-actions button',
      '.buy-now-btn'
    ]
  };

  console.log('[Salla Bundle] Final CONFIG:', {
    storeDomain: CONFIG.storeDomain,
    storeId: CONFIG.storeId,
    customerId: CONFIG.customerId,
    customerName: CONFIG.customerName
  });

  console.log('[Salla Bundle] DEBUG - Values used for storeId:', {
    sallaStoreId: sallaStoreId,
    extractedStoreId: extractSallaValue(storeContext.storeId),
    sallaConfigStoreId: window.Salla?.config?.store?.id,
    finalStoreId: CONFIG.storeId
  });

  class SallaBundleSystem {
    constructor() {
      this.productId = null;
      this.isInjected = false;
      this.retryCount = 0;
      this.maxRetries = 10;
      this.modalScriptLoaded = false;
    }

    async initialize() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }

      if (window.salla) {
        window.salla.onReady(() => this.start());
      }

      this.observePageChanges();
    }

    observePageChanges() {

    let currentUrl = window.location.href;
      setInterval(() => {
        if (window.location.href !== currentUrl) {
          currentUrl = window.location.href;
          this.isInjected = false;
          this.retryCount = 0;
          setTimeout(() => this.start(), 500);
        }
      }, 1000);
    }

    async start() {
      try {
        if (this.isInjected || this.retryCount >= this.maxRetries) return;
        
        this.retryCount++;


        this.productId = this.extractProductId();
        
        if (!this.productId) {
          if (this.retryCount < this.maxRetries) {
            setTimeout(() => this.start(), 1000);
          }
          return;
        }

        console.log(\`[Salla Bundle] Found product ID: \${this.productId}\`);


        const hasBundle = await this.checkBundleExists();

        if (!hasBundle) {
          console.log(\`[Salla Bundle] No bundles found for product \${this.productId}\`);
          return;
        }

        this.injectBundleUI();

        // Load modal script asynchronously immediately after injection
        this.loadModalScriptAsync();

      } catch (error) {
        console.error('[Salla Bundle] Error:', error);
        if (this.retryCount < this.maxRetries) {
          setTimeout(() => this.start(), 2000);
        }
      }
    }

    extractProductId() {
      // Method 1: Check Salla-specific selectors first

      // Salla product form input
      const productInput = document.querySelector('input[name="id"]');
      if (productInput && productInput.value) {
        console.log('[Salla Bundle] Found product ID from form input:', productInput.value);
        return productInput.value;
      }

      // Salla add-product-button component
      const sallaButton = document.querySelector('salla-add-product-button[product-id]');
      if (sallaButton && sallaButton.getAttribute('product-id')) {
        console.log('[Salla Bundle] Found product ID from salla-button:', sallaButton.getAttribute('product-id'));
        return sallaButton.getAttribute('product-id');
      }

      // Generic selectors
      for (const selector of CONFIG.productIdSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const productId = element.value ||
                           element.getAttribute('product-id') ||
                           element.dataset.productId ||
                           element.dataset.product ||
                           element.dataset.id ||
                           element.textContent?.trim();
          if (productId) {
            console.log(\`[Salla Bundle] Found product ID from \${selector}:\`, productId);
            return productId;
          }
        }
      }

      // Method 2: Extract from URL patterns
      const urlPatterns = [
        /\\/product\\/([^/?#]+)/,     // /product/123
        /\\/products\\/([^/?#]+)/,   // /products/123
        /\\/p\\/([^/?#]+)/,          // /p/123
        /product[_-]?id[=:]([^&?#]+)/ // product_id=123
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
      if (metaProduct && metaProduct.content) {
        return metaProduct.content;
      }

      // Method 4: Check Salla window object
      if (window.salla && window.salla.product && window.salla.product.id) {
        return window.salla.product.id;
      }

      // Method 5: Check for product data in scripts
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        if (script.textContent && script.textContent.includes('product')) {
          const productMatch = script.textContent.match(/"product_id"\\s*:\\s*"?([^",\\s}]+)"?/);
          if (productMatch) {
            return productMatch[1];
          }
        }
      }

      return null;
    }

    async checkBundleExists() {
      try {
        // Build query parameters - prioritize store ID over domain
        const params = new URLSearchParams();

        if (CONFIG.storeId) {
          params.append('store', CONFIG.storeId);
        } else if (CONFIG.storeDomain) {
          params.append('store', CONFIG.storeDomain);
        }

        const response = await fetch(\`\${CONFIG.apiUrl}/storefront/bundles/\${this.productId}?\${params}\`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'X-Store-Domain': CONFIG.storeDomain || '',
            'X-Store-ID': CONFIG.storeId || '',
            'X-Customer-ID': CONFIG.customerId || ''
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

      // Priority 1: Try to inject above Salla add-product-button
      const sallaButton = document.querySelector('salla-add-product-button');
      if (sallaButton) {
        this.injectAboveSallaButton(sallaButton);
        return;
      }

      // Priority 2: Try to inject in product form
      const productForm = document.querySelector('form.product-form');
      if (productForm) {
        this.injectInProductForm(productForm);
        return;
      }

      // Priority 3: Find any suitable target
      let targetButton = null;
      for (const selector of CONFIG.targetSelectors) {
        targetButton = document.querySelector(selector);
        if (targetButton) break;
      }

      if (!targetButton) {
        console.log('[Salla Bundle] No suitable button found, trying alternative injection');
        this.injectAlternativeUI();
        return;
      }

      // Default injection method
      this.injectDefaultBundle(targetButton);
    }

    injectAboveSallaButton(sallaButton) {
      const bundleButton = this.createBundleButton();

      // Insert above the Salla button
      sallaButton.parentNode.insertBefore(bundleButton, sallaButton);

      this.isInjected = true;
      console.log('[Salla Bundle] UI injected above Salla button');
    }

    injectInProductForm(productForm) {
      const bundleButton = this.createBundleButton();

      // Look for the last section in the form to inject before it
      const lastSection = productForm.querySelector('section:last-of-type');
      if (lastSection) {
        productForm.insertBefore(bundleButton, lastSection);
      } else {
        // Fallback: append to form
        productForm.appendChild(bundleButton);
      }

      this.isInjected = true;
      console.log('[Salla Bundle] UI injected in product form');
    }

    injectDefaultBundle(targetButton) {
      const bundleButton = this.createBundleButton();

      // Insert before the target button
      targetButton.parentNode.insertBefore(bundleButton, targetButton);

      this.isInjected = true;
      console.log('[Salla Bundle] UI injected using default method');
    }

    createBundleButton() {
      // Create bundle button container
      const bundleContainer = document.createElement('div');
      bundleContainer.className = 'salla-bundle-container';
      bundleContainer.style.cssText = \`
        margin: 15px 0;
        position: relative;
        z-index: 10;
      \`;

      const bundleButton = document.createElement('button');
      bundleButton.type = 'button';
      bundleButton.className = 'salla-bundle-btn';

      // Personalize button text based on customer info
      let buttonText = '🔥 عروض حصرية متاحة - اختر باقتك';
      if (CONFIG.customerName) {
        buttonText = \`🔥 عروض خاصة لك \${CONFIG.customerName} - اختر باقتك\`;
      } else if (CONFIG.customerId) {
        buttonText = '🔥 عروض خاصة لعملائنا المميزين - اختر باقتك';
      }

      bundleButton.innerHTML = buttonText;

      bundleButton.style.cssText = \`
        width: 100%;
        background: linear-gradient(135deg, #fece0a 0%, #e6b800 100%);
        color: #000;
        border: none;
        padding: 16px 20px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 12px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(254, 206, 10, 0.3);
        font-family: inherit;
        text-align: center;
        position: relative;
        overflow: hidden;
      \`;

      // Add hover effects
      bundleButton.onmouseenter = () => {
        bundleButton.style.background = 'linear-gradient(135deg, #e6b800 0%, #cc9900 100%)';
        bundleButton.style.transform = 'translateY(-2px)';
        bundleButton.style.boxShadow = '0 8px 20px rgba(254, 206, 10, 0.5)';
      };

      bundleButton.onmouseleave = () => {
        bundleButton.style.background = 'linear-gradient(135deg, #fece0a 0%, #e6b800 100%)';
        bundleButton.style.transform = 'translateY(0)';
        bundleButton.style.boxShadow = '0 4px 12px rgba(254, 206, 10, 0.3)';
      };

      bundleButton.onclick = (e) => {
        e.preventDefault();
        this.openBundleModal();
      };

      bundleContainer.appendChild(bundleButton);
      return bundleContainer;
    }

    injectAlternativeUI() {
      const alternatives = [
        '.product-form',
        '.product-details',
        '.product-info',
        '.product-actions',
        '.product-price',
        '.product-meta',
        '.product-content'
      ];

      for (const selector of alternatives) {
        const container = document.querySelector(selector);
        if (container) {
          const notice = document.createElement('div');
          notice.className = 'salla-bundle-notice';
          notice.style.cssText = \`
            background: linear-gradient(135deg, #fece0a 0%, #e6b800 100%);
            color: #000;
            padding: 14px 18px;
            border-radius: 8px;
            margin: 15px 0;
            text-align: center;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(254, 206, 10, 0.3);
            transition: all 0.3s ease;
            font-size: 15px;
          \`;
          
          // Personalize notice text
          let noticeText = '🔥 عروض حصرية متاحة لهذا المنتج - انقر للاطلاع';
          if (CONFIG.customerName) {
            noticeText = \`🔥 عروض خاصة لك \${CONFIG.customerName} - انقر للاطلاع\`;
          } else if (CONFIG.customerId) {
            noticeText = '🔥 عروض خاصة لعملائنا المميزين - انقر للاطلاع';
          }
          
          notice.innerHTML = noticeText;
          notice.onclick = () => this.openBundleModal();
          
          notice.onmouseenter = () => {
            notice.style.background = 'linear-gradient(135deg, #e6b800 0%, #cc9900 100%)';
            notice.style.transform = 'translateY(-2px)';
          };
          
          notice.onmouseleave = () => {
            notice.style.background = 'linear-gradient(135deg, #fece0a 0%, #e6b800 100%)';
            notice.style.transform = 'translateY(0)';
          };
          
          container.appendChild(notice);
          this.isInjected = true;
          console.log('[Salla Bundle] Alternative UI injected');
          break;
        }
      }
    }

    async preloadModalScript() {
      try {
        if (!this.modalScriptLoaded && !window.SallaBundleModal) {
          console.log('[Salla Bundle] Preloading modal script...');
          await this.loadModalScript();
          this.modalScriptLoaded = true;
          console.log('[Salla Bundle] Modal script preloaded successfully');
        }
      } catch (error) {
        console.log('[Salla Bundle] Modal preload failed, will load on-demand:', error);
      }
    }

    loadModalScriptAsync() {
      // Load modal script asynchronously without waiting
      if (!this.modalScriptLoaded && !window.SallaBundleModal) {
        console.log('[Salla Bundle] Loading modal script asynchronously...');
        this.loadModalScript()
          .then(() => {
            this.modalScriptLoaded = true;
            console.log('[Salla Bundle] Modal script loaded asynchronously');
          })
          .catch(error => {
            console.log('[Salla Bundle] Async modal load failed, will fallback to on-demand:', error);
          });
      }
    }

    async openBundleModal() {
      try {
        // Load modal script if not already loaded (fallback)
        if (!window.SallaBundleModal) {
          console.log('[Salla Bundle] Modal not preloaded, loading on-demand...');
          await this.loadModalScript();
        }

        // Prepare context data using Salla store variables
        const contextData = {
          storeDomain: CONFIG.storeDomain,
          storeId: CONFIG.storeId,
          storeUsername: CONFIG.storeUsername,
          storeEmail: CONFIG.storeEmail,
          customerId: CONFIG.customerId,
          customerName: CONFIG.customerName,
          customerEmail: CONFIG.customerEmail,
          customerMobile: CONFIG.customerMobile,
          userId: CONFIG.userId,
          userEmail: CONFIG.userEmail,
          userPhone: CONFIG.userPhone
        };

        // Clear any existing modal instance
        if (window.sallaBundleModal) {
          window.sallaBundleModal.hide();
          window.sallaBundleModal = null;
        }

        // Initialize and show modal with full context
        const modal = new window.SallaBundleModal(this.productId, contextData);
        window.sallaBundleModal = modal; // Set global reference for button callbacks
        await modal.initialize();
        modal.show();

      } catch (error) {
        console.error('[Salla Bundle] Modal error:', error);
        // Show user-friendly error message instead of navigating
        alert('عذراً، حدث خطأ في تحميل العروض. يرجى المحاولة مرة أخرى.');
      }
    }

    async loadModalScript() {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        
        // Build modal script URL with store context
        const params = new URLSearchParams();

        if (CONFIG.storeId) {
          params.append('store', CONFIG.storeId);
        } else if (CONFIG.storeDomain) {
          params.append('store', CONFIG.storeDomain);
        }

        if (CONFIG.customerId) {
          params.append('customer_id', CONFIG.customerId);
        }
        
        script.src = \`\${CONFIG.apiUrl}/modal/modal.js?\${params}\`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  }

  // Initialize the system
  window.sallaBundleSystem = new SallaBundleSystem();
  window.sallaBundleSystem.initialize();

})();
`;

      res.send(snippet);
    } catch (error) {
      console.error("Error generating app snippet:", error);
      res.status(500).json({ error: "Failed to generate app snippet" });
    }
  }
}

export default new SnippetController();
