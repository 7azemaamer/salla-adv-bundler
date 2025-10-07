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
        "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching during development
        "Pragma": "no-cache",
        "Expires": "0",
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
    return;
  }

  const storeContext = window.sallaStoreContext || {};
  

  // Try to get store ID from Salla events script (most reliable method)
  let sallaStoreId = null;
  try {
   
  // Look for Salla events in scripts
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      if (script.textContent && (script.textContent.includes('salla.event.dispatchEvents') || script.textContent.includes('dispatchSallaEvents'))) {

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
            break;
          }
        }

        if (sallaStoreId) break;
      }
    }
  } catch (error) {
    console.error('[Salla Bundle] Error parsing Salla events:', error);
  }

  // Fallback: Try to get store ID from URL path
  const urlMatch = window.location.pathname.match(/\\/([a-zA-Z0-9-_]+)\\//);
  const urlStoreId = urlMatch ? urlMatch[1] : null;

  
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


  class SallaBundleSystem {
    constructor() {
      this.productId = null;
      this.isInjected = false;
      this.retryCount = 0;
      this.maxRetries = 10;
      this.modalScriptLoaded = false;
      this.isModalLoading = false;
      this.settings = {
        hide_default_buttons: false,
        hide_salla_offer_modal: false,
        hide_product_options: false
      };
      this.bundleData = {
        cta_button_text: 'اختر الباقة',
        cta_button_bg_color: '#0066ff',
        cta_button_text_color: '#ffffff'
      };
    }

    async initialize() {
      this.addModalPrefetch();

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

    addModalPrefetch() {

    try {
        const params = new URLSearchParams();
        
        if (CONFIG.storeId) {
          params.append('store', CONFIG.storeId);
        } else if (CONFIG.storeDomain) {
          params.append('store', CONFIG.storeDomain);
        }

        const prefetchUrl = \`\${CONFIG.apiUrl}/modal/modal.js?\${params}\`;
        

        if (!document.querySelector(\`link[href="\${prefetchUrl}"]\`)) {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = prefetchUrl;
          prefetchLink.as = 'script';
          document.head.appendChild(prefetchLink);
          
        }
      } catch (error) {
        console.log('[Salla Bundle] Prefetch failed:', error);
      }
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

        const hasBundle = await this.checkBundleExists();

        if (!hasBundle) {
          return;
        }


        this.preloadModalScript();
        this.injectBundleUI();
        this.hideSallaDefaultButtons();
        this.hideSallaOfferModal();
        this.hideProductOptions();
        this.hideQuantityInput();

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
        return productInput.value;
      }

      // Salla add-product-button component
      const sallaButton = document.querySelector('salla-add-product-button[product-id]');
      if (sallaButton && sallaButton.getAttribute('product-id')) {
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

        if (response.ok) {
          // Parse response to get settings and bundle data
          const data = await response.json();
          if (data.data) {
            // Store settings
            if (data.data.settings) {
              this.settings = data.data.settings;
            }
            
            // Store bundle data for UI customization
            this.bundleData = data.data;
          }
          return true;
        }

        return false;
      } catch (error) {
        console.error('[Salla Bundle] Bundle check failed:', error);
        return false;
      }
    }

    hideSallaDefaultButtons() {
      if (!this.settings.hide_default_buttons) {
        return;
      }


      // Add CSS to hide default buttons
      const style = document.createElement('style');
      style.id = 'salla-bundle-hide-defaults';
      style.textContent = \`
        /* Hide Salla default add-to-cart buttons */
        form.product-form salla-add-product-button,
        form.product-form .salla-add-product-button,
        form.product-form button[type="submit"]:not(.salla-bundle-btn),
        .product-form .add-to-cart-btn:not(.salla-bundle-btn),
        .product-actions .buy-now-btn:not(.salla-bundle-btn) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        /* Ensure bundle button remains visible */
        .salla-bundle-btn,
        .salla-bundle-container {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      \`;

      // Check if style already exists
      const existingStyle = document.getElementById('salla-bundle-hide-defaults');
      if (existingStyle) {
        existingStyle.remove();
      }

      document.head.appendChild(style);

      // Also hide buttons via JS (backup method)
      const selectors = [
        'form.product-form salla-add-product-button',
        'form.product-form .salla-add-product-button',
        '.product-form .add-to-cart-btn',
        '.product-actions .buy-now-btn',
        'form.product-form button[type="submit"]'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          // Don't hide if it's our bundle button
          if (!element.classList.contains('salla-bundle-btn')) {
            element.style.cssText = 'display: none !important; visibility: hidden !important;';
          }
        });
      });

    }

    hideSallaOfferModal() {
      if (!this.settings.hide_salla_offer_modal) {
        return;
      }


      // Add CSS to hide the specific Salla offer modal by CLASS
      const style = document.createElement('style');
      style.id = 'salla-bundle-hide-offer-modal';
      style.textContent = \`
        /* Hide Salla default offer modal (only s-offer-modal-type-products) */
        salla-modal.s-offer-modal-type-products {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      \`;

      // Check if style already exists
      const existingStyle = document.getElementById('salla-bundle-hide-offer-modal');
      if (existingStyle) {
        existingStyle.remove();
      }

      document.head.appendChild(style);

      // Also hide modal via JS (backup method) and observe for dynamically added modals
      const hideOfferModals = () => {
        const offerModals = document.querySelectorAll('salla-modal.s-offer-modal-type-products');
        offerModals.forEach(modal => {
          modal.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
        });
    
      };

      // Hide existing modals immediately
      hideOfferModals();

      // Keep checking every 500ms for new modals (Salla might add them dynamically)
      const intervalId = setInterval(hideOfferModals, 500);

      // Observe for new modals being added to DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.tagName === 'SALLA-MODAL' && node.classList.contains('s-offer-modal-type-products')) {
              node.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

    }

    hideProductOptions() {
      if (!this.settings.hide_product_options) {
        return;
      }

      // Add CSS to hide salla-product-options within product-form
      const style = document.createElement('style');
      style.id = 'salla-bundle-hide-product-options';
      style.textContent = \`
        /* Hide Salla product options in product form for target products with bundles */
        form.product-form salla-product-options {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      \`;

      // Check if style already exists
      const existingStyle = document.getElementById('salla-bundle-hide-product-options');
      if (existingStyle) {
        existingStyle.remove();
      }

      document.head.appendChild(style);

      // Also hide via JS (backup method)
      const hideProductOptionElements = () => {
        const productForms = document.querySelectorAll('form.product-form');
        productForms.forEach(form => {
          const optionsElements = form.querySelectorAll('salla-product-options');
          optionsElements.forEach(element => {
            element.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
          });
        });
      };

      // Hide existing elements immediately
      hideProductOptionElements();

      // Keep checking every 500ms for dynamically loaded elements
      setInterval(hideProductOptionElements, 500);

      // Observe for new elements being added to DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Check if the node itself is salla-product-options within product-form
              if (node.tagName === 'SALLA-PRODUCT-OPTIONS') {
                const productForm = node.closest('form.product-form');
                if (productForm) {
                  node.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
                }
              }
              // Check children
              if (node.querySelectorAll) {
                const optionsElements = node.querySelectorAll('form.product-form salla-product-options');
                optionsElements.forEach(element => {
                  element.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
                });
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    hideQuantityInput() {
      if (!this.settings.hide_quantity_input) {
        return;
      }

      // Add CSS to hide the parent section of salla-quantity-input within product-form
      const style = document.createElement('style');
      style.id = 'salla-bundle-hide-quantity-input';
      style.textContent = \`
        /* Hide quantity input section in product form for target products with bundles */
        form.product-form salla-quantity-input {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        /* Also hide the parent section if it contains salla-quantity-input */
        form.product-form section:has(> salla-quantity-input) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        /* ALWAYS keep bundle UI visible - override any hiding */
        .salla-bundle-container,
        .salla-bundle-ui,
        [data-salla-bundle="true"],
        .salla-bundle-btn {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }
      \`;

      // Check if style already exists
      const existingStyle = document.getElementById('salla-bundle-hide-quantity-input');
      if (existingStyle) {
        existingStyle.remove();
      }

      document.head.appendChild(style);

      // Also hide via JS (backup method)
      const hideQuantityElements = () => {
        const productForms = document.querySelectorAll('form.product-form');
        productForms.forEach(form => {
          // Find salla-quantity-input elements
          const quantityInputs = form.querySelectorAll('salla-quantity-input');
          quantityInputs.forEach(element => {
            element.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';

            // Also hide parent section BUT NOT if it contains bundle UI
            const parentSection = element.closest('section');
            if (parentSection && !parentSection.querySelector('[data-salla-bundle]')) {
              parentSection.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
            }
          });

          // Ensure bundle UI is always visible
          const bundleContainers = form.querySelectorAll('.salla-bundle-container, [data-salla-bundle="true"]');
          bundleContainers.forEach(container => {
            container.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; pointer-events: auto !important;';
          });
        });
      };

      // Hide existing elements immediately
      hideQuantityElements();

      // Keep checking every 500ms for dynamically loaded elements
      setInterval(hideQuantityElements, 500);

      // Observe for new elements being added to DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Check if the node itself is salla-quantity-input within product-form
              if (node.tagName === 'SALLA-QUANTITY-INPUT') {
                const productForm = node.closest('form.product-form');
                if (productForm) {
                  node.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';

                  // Hide parent section BUT NOT if it contains bundle UI
                  const parentSection = node.closest('section');
                  if (parentSection && !parentSection.querySelector('[data-salla-bundle]')) {
                    parentSection.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
                  }
                }
              }
              // Check children
              if (node.querySelectorAll) {
                const quantityInputs = node.querySelectorAll('form.product-form salla-quantity-input');
                quantityInputs.forEach(element => {
                  element.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';

                  // Hide parent section BUT NOT if it contains bundle UI
                  const parentSection = element.closest('section');
                  if (parentSection && !parentSection.querySelector('[data-salla-bundle]')) {
                    parentSection.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
                  }
                });
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
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
    }

    injectInProductForm(productForm) {
      const bundleButton = this.createBundleButton();

      // Inject at the END of the form (tail)
      productForm.appendChild(bundleButton);

      this.isInjected = true;
    }

    injectDefaultBundle(targetButton) {
      const bundleButton = this.createBundleButton();

      // Insert before the target button
      targetButton.parentNode.insertBefore(bundleButton, targetButton);

      this.isInjected = true;
    }

    createBundleButton() {

      // Create bundle button container
      const bundleContainer = document.createElement('div');
      bundleContainer.className = 'salla-bundle-container salla-bundle-ui';
      bundleContainer.setAttribute('data-salla-bundle', 'true');
      bundleContainer.style.cssText = \`
        margin: 15px 0;
        position: relative;
        z-index: 10;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      \`;

      const bundleButton = document.createElement('button');
      bundleButton.type = 'button';
      bundleButton.className = 'salla-bundle-btn';

      // Use dynamic button text from bundle configuration
      const buttonText = this.bundleData.cta_button_text || 'اختر الباقة';

      bundleButton.innerHTML = buttonText;

      // Use dynamic colors from bundle configuration
      const buttonBgColor = this.bundleData.cta_button_bg_color || '#0066ff';
      const buttonTextColor = this.bundleData.cta_button_text_color || '#ffffff';
      
      // Create a darker shade for hover effect
      const darkerBgColor = this.adjustColorBrightness(buttonBgColor, -20);

      bundleButton.style.cssText = \`
        width: 100%;
        background: \${buttonBgColor};
        color: \${buttonTextColor};
        border: none;
        padding: 16px 20px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 12px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        font-family: inherit;
        text-align: center;
        position: relative;
        overflow: hidden;
      \`;

      // Add hover effects with dynamic colors
      bundleButton.onmouseenter = () => {
        bundleButton.style.background = darkerBgColor;
        bundleButton.style.transform = 'translateY(-2px)';
        bundleButton.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
      };

      bundleButton.onmouseleave = () => {
        bundleButton.style.background = buttonBgColor;
        bundleButton.style.transform = 'translateY(0)';
        bundleButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      };

      bundleButton.onclick = (e) => {
        e.preventDefault();
        this.openBundleModal();
      };

      bundleContainer.appendChild(bundleButton);
      return bundleContainer;
    }

    // Helper function to adjust color brightness
    adjustColorBrightness(hex, percent) {
      // Remove # if present
      hex = hex.replace('#', '');
      
      // Parse r, g, b values
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Calculate new values
      const newR = Math.max(0, Math.min(255, r + (r * percent / 100)));
      const newG = Math.max(0, Math.min(255, g + (g * percent / 100)));
      const newB = Math.max(0, Math.min(255, b + (b * percent / 100)));
      
      // Convert back to hex
      return '#' + 
        Math.round(newR).toString(16).padStart(2, '0') +
        Math.round(newG).toString(16).padStart(2, '0') +
        Math.round(newB).toString(16).padStart(2, '0');
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
          
          // Use dynamic colors from bundle configuration
          const buttonBgColor = this.bundleData.cta_button_bg_color || '#0066ff';
          const buttonTextColor = this.bundleData.cta_button_text_color || '#ffffff';
          const darkerBgColor = this.adjustColorBrightness(buttonBgColor, -20);
          
          notice.style.cssText = \`
            background: \${buttonBgColor};
            color: \${buttonTextColor};
            padding: 14px 18px;
            border-radius: 8px;
            margin: 15px 0;
            text-align: center;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            font-size: 15px;
          \`;
          
          // Use dynamic button text from bundle configuration
          const noticeText = this.bundleData.cta_button_text || 'اختر الباقة';

          notice.innerHTML = noticeText;
          notice.onclick = () => this.openBundleModal();
          
          notice.onmouseenter = () => {
            notice.style.background = darkerBgColor;
            notice.style.transform = 'translateY(-2px)';
          };
          
          notice.onmouseleave = () => {
            notice.style.background = buttonBgColor;
            notice.style.transform = 'translateY(0)';
          };
          
          container.appendChild(notice);
          this.isInjected = true;
          break;
        }
      }
    }

    async preloadModalScript() {
      try {
        if (!this.modalScriptLoaded && !window.SallaBundleModal) {
          
          // Add loading indicator
          this.isModalLoading = true;
          
          await this.loadModalScript();
          this.modalScriptLoaded = true;
          this.isModalLoading = false;
          
        }
      } catch (error) {
        this.isModalLoading = false;
      }
    }

    loadModalScriptAsync() {
      if (!this.modalScriptLoaded && !window.SallaBundleModal) {
        this.loadModalScript()
          .then(() => {
            this.modalScriptLoaded = true;
          })
          .catch(error => {
            console.error('[Salla Bundle] Async modal load failed, will fallback to on-demand:', error);
          });
      }
    }

    async openBundleModal() {
      try {
        if (!window.SallaBundleModal) {
          this.showLoadingState();
          
          await this.loadModalScript();
          
          this.hideLoadingState();
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
        script.async = true;
        script.defer = true;
        script.onload = () => {
          resolve();
        };
        script.onerror = (error) => {
          console.error('[Salla Bundle] Modal script load failed:', error);
          reject(error);
        };
        document.head.appendChild(script);
      });
    }

    showLoadingState() {
      // Add loading state to all bundle buttons
      const bundleButtons = document.querySelectorAll('.salla-bundle-btn, .salla-bundle-notice');
      bundleButtons.forEach(button => {
        if (!button.dataset.originalText) {
          button.dataset.originalText = button.innerHTML;
        }
        button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-left: 8px; animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg> جاري التحميل...';
        button.style.opacity = '0.7';
        button.style.cursor = 'wait';
        button.disabled = true;
      });

      // Add spinner animation CSS if not already added
      if (!document.getElementById('salla-bundle-spinner-animation')) {
        const style = document.createElement('style');
        style.id = 'salla-bundle-spinner-animation';
        style.textContent = \`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        \`;
        document.head.appendChild(style);
      }
    }

    hideLoadingState() {
      // Remove loading state from all bundle buttons
      const bundleButtons = document.querySelectorAll('.salla-bundle-btn, .salla-bundle-notice');
      bundleButtons.forEach(button => {
        if (button.dataset.originalText) {
          button.innerHTML = button.dataset.originalText;
          delete button.dataset.originalText;
        }
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        button.disabled = false;
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
