import { Router } from "express";

const router = Router();

// Bundle modal script - loaded on demand when bundle button is clicked
router.get("/modal.js", (req, res) => {
  const { store } = req.query;

  res.set({
    "Content-Type": "application/javascript",
    "Cache-Control": "public, max-age=3600",
    "Access-Control-Allow-Origin": "*",
  });

  const modalScript = `
(function() {
  'use strict';

  // Modern Boxy Modal Styles - Based on popup.style.jsx
  const modalStyles = \`
    /* Design tokens */
    :root {
      --bg-page:  #FAFBFC;
      --bg-soft:  #F6F8FA;
      --bg-elev:  #F4F6F8;
      --bg-panel: #F2F4F7;
      --bg-card:  #FFFFFF;
      --bg-thumb: #EEF1F4;
      --border:   #E5E8EC;
      --text-1:   #0E1012;
      --text-2:   #60646C;
      --ok:       #2F3136;
      --brand:    #0E1012;
      --shadow-1: 0 1px 2px rgba(16,24,40,.06), 0 1px 1px rgba(16,24,40,.04);
      --shadow-2: 0 10px 28px rgba(15,17,19,.08);
    }

    .salla-bundle-modal {
      font-family: system-ui, -apple-system, sans-serif !important;
      direction: rtl;
      display: none;
      position: fixed;
      z-index: 999999;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
    }

    .salla-bundle-modal.show {
      display: block;
    }

    .salla-bundle-panel {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 100%;
      max-width: 720px;
      background: var(--bg-panel);
      box-shadow: var(--shadow-2);
      border-left: 1px solid var(--border);
      border-radius: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: slideIn 0.3s ease-out;
    }

    @media (min-width: 640px) {
      .salla-bundle-panel {
        border-radius: 16px 0 0 16px;
      }
    }

    .salla-bundle-header {
      padding: 16px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-panel);
    }

    .salla-bundle-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .salla-bundle-title {
      font-size: 15px;
      font-weight: 600;
      margin: 0;
      color: var(--text-1);
    }

    .salla-bundle-close {
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: white;
      color: var(--text-1);
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
    }

    .salla-bundle-close:hover {
      background: var(--bg-elev);
    }

    .salla-bundle-body {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 16px;
      background: var(--bg-soft);
    }

    .salla-bundle-section {
      border-radius: 14px;
      border: 1px solid var(--border);
      background: var(--bg-card);
      padding: 12px;
      margin-bottom: 12px;
    }

    .salla-bundle-section h3 {
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 6px 0;
      color: var(--text-1);
    }

    .salla-bundle-section .subtitle {
      font-size: 12px;
      color: var(--text-2);
      margin-bottom: 12px;
    }

    .salla-bundle-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    @media (min-width: 640px) {
      .salla-bundle-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .salla-bundle-card {
      border-radius: 14px;
      border: 1px solid #e5e7eb;
      background: var(--bg-card);
      padding: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      transition: all 0.2s ease;
      position: relative;
    }

    .salla-bundle-card.active {
      border: 1px solid var(--text-1);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .salla-bundle-card:not(.active) {
      opacity: 0.85;
      background: rgba(255, 255, 255, 0.5) !important;
    }

    .salla-bundle-card:not(.active):hover {
      opacity: 0.95;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .salla-bundle-card-header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .salla-bundle-card-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.3;
      color: var(--text-1);
    }

    .salla-bundle-card-value {
      font-size: 12px;
      color: var(--text-2);
    }

    .salla-bundle-badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 50px;
      border: 1px solid var(--border);
      background: var(--bg-soft);
      color: var(--text-2);
    }

    .salla-bundle-items {
      list-style: disc;
      list-style-position: inside;
      font-size: 13px;
      color: var(--text-1);
      margin: 0 0 12px 0;
      padding: 0;
    }

    .salla-bundle-items li {
      margin-bottom: 4px;
    }

    .salla-bundle-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .salla-bundle-price {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-1);
    }

    .salla-bundle-button {
      height: 44px;
      padding: 0 12px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: white;
      color: var(--text-1);
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    @media (min-width: 640px) {
      .salla-bundle-button {
        height: 36px;
      }
    }

    .salla-bundle-button:hover {
      background: var(--bg-elev);
    }

    .salla-bundle-button.active {
      background: transparent !important;
      color: var(--text-1) !important;
      border-color: var(--text-1);
    }

    .salla-gifts-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    @media (min-width: 640px) {
      .salla-gifts-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .salla-gift-card {
      border-radius: 14px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      overflow: hidden;
    }

    .salla-gift-image {
      aspect-ratio: 1;
      background: var(--bg-soft);
    }

    .salla-gift-content {
      padding: 12px;
    }

    .salla-gift-badges {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .salla-gift-badge {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 50px;
      border: 1px solid var(--border);
      background: var(--bg-soft);
    }

    .salla-gift-free {
      font-size: 12px;
      font-weight: 500;
      color: var(--ok);
    }

    .salla-gift-title {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
      margin-bottom: 4px;
      color: var(--text-1);
    }

    .salla-gift-value {
      font-size: 13px;
      color: var(--text-2);
      text-decoration: line-through;
    }

    .salla-sticky-summary {
      padding: 12px;
      background: var(--bg-panel);
      border-top: 1px solid var(--border);
      box-shadow: var(--shadow-1);
    }

    .salla-summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }

    .salla-summary-label {
      color: var(--text-2);
    }

    .salla-summary-value {
      font-weight: 600;
      color: var(--text-1);
    }

    .salla-summary-savings {
      color: #10b981;
      font-weight: 600;
      text-decoration: line-through;
      position: relative;
    }

    .salla-summary-savings:before {
      content: '−';
      margin-left: 4px;
      text-decoration: none;
      font-weight: 700;
    }

    .salla-checkout-button {
      width: 100%;
      height: 56px;
      border-radius: 14px;
      background: var(--brand);
      color: white;
      border: none;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: var(--shadow-2);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    @media (min-width: 640px) {
      .salla-checkout-button {
        height: 48px;
      }
    }

    .salla-checkout-button:hover {
      opacity: 0.95;
    }

    .salla-checkout-button:active {
      opacity: 0.9;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .no-scrollbar {
      scrollbar-width: none;
    }

    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }

    /* Variant Selector Styles */
    .salla-variant-section {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }

    .salla-variant-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-1);
      margin-bottom: 6px;
    }

    .salla-variant-label.required:after {
      content: " *";
      color: #ef4444;
    }

    .salla-variant-select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-card);
      color: var(--text-1);
      font-size: 13px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .salla-variant-select:focus {
      border-color: var(--text-1);
    }

    .salla-variant-select.variant-error {
      border: 2px solid #ef4444 !important;
      outline: 3px solid rgba(239, 68, 68, 0.3) !important;
      outline-offset: 1px !important;
      background: rgba(239, 68, 68, 0.05) !important;
      box-shadow: 0 0 0 1px #ef4444, 0 0 8px rgba(239, 68, 68, 0.2) !important;
    }

    .salla-variant-select.variant-error:focus {
      outline: 3px solid rgba(239, 68, 68, 0.5) !important;
      box-shadow: 0 0 0 2px #ef4444, 0 0 12px rgba(239, 68, 68, 0.3) !important;
    }

    .salla-variant-select.all-out-of-stock {
      background: rgba(156, 163, 175, 0.1);
      border-color: #9ca3af;
      color: #6b7280;
      cursor: not-allowed;
    }

    .salla-variant-select.all-out-of-stock:focus {
      outline: none;
      box-shadow: 0 0 0 2px #9ca3af;
    }

    .salla-variant-group {
      margin-bottom: 12px;
    }

    .salla-variant-error {
      font-size: 12px;
      color: #ef4444;
      margin-top: 4px;
    }

    /* Out of Stock Product Styles */
    .salla-gift-unavailable {
      opacity: 0.7;
      position: relative;
    }

    .salla-gift-unavailable .salla-gift-image {
      position: relative;
    }

    .salla-gift-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px 14px 0 0;
    }

    .salla-gift-overlay-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    /* Bundle card styling for unavailable products */
    .salla-bundle-card.unavailable {
      opacity: 0.6;
      background: #f8f9fa;
      border-color: #e9ecef;
      position: relative;
    }

    .salla-bundle-card.unavailable::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(156, 163, 175, 0.1) 10px,
        rgba(156, 163, 175, 0.1) 20px
      );
      border-radius: 14px;
      pointer-events: none;
    }

    .salla-bundle-card.unavailable .salla-bundle-button {
      background: #e5e7eb;
      color: #9ca3af;
      cursor: not-allowed;
      border-color: #d1d5db;
    }

    .salla-bundle-card.unavailable .salla-bundle-button:hover {
      background: #e5e7eb;
      transform: none;
      box-shadow: none;
    }
  \`;

  // Inject styles
  if (!document.getElementById('salla-bundle-modal-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'salla-bundle-modal-styles';
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);
  }

  // Riyal SVG icon (inline)
  const riyalSvgIcon = \`<svg width="12" height="14" viewBox="0 0 1124.14 1256.39" fill="currentColor" style="display: inline-block; vertical-align: middle; margin: 0 2px;">
    <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"/>
    <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"/>
  </svg>\`;

  // Price formatting utility
  function formatPrice(price) {
    const formatted = new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
    return formatted + ' ' + riyalSvgIcon;
  }

  // Bundle Modal Class - Modern Boxy Design
  class SallaBundleModal {
    constructor(productId, contextData = {}) {
      this.productId = productId;
      this.contextData = contextData;
      this.storeDomain = contextData.storeDomain || contextData;
      this.apiUrl = 'https://${req.get("host")}/api/v1';
      this.bundleData = null;
      this.modalElement = null;
      this.selectedBundle = null;
    }

    async initialize() {
      try {
        // Build query parameters with context - prioritize store ID over domain
        const params = new URLSearchParams();

        if (this.contextData.storeId) {
          params.append('store', this.contextData.storeId);
        } else if (this.storeDomain) {
          params.append('store', this.storeDomain);
        }

        if (this.contextData.customerId) {
          params.append('customer_id', this.contextData.customerId);
        }

        // Fetch bundle data with context headers
        const response = await fetch(\`\${this.apiUrl}/storefront/bundles/\${this.productId}?\${params}\`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'X-Store-Domain': this.storeDomain,
            'X-Store-ID': this.contextData.storeId || '',
            'X-Customer-ID': this.contextData.customerId || ''
          }
        });

        // Better error handling and debugging
        console.log('[Salla Bundle Modal] API Response status:', response.status);
        console.log('[Salla Bundle Modal] API URL:', \`\${this.apiUrl}/storefront/bundles/\${this.productId}?\${params}\`);

        const responseText = await response.text();
        console.log('[Salla Bundle Modal] Raw response:', responseText.substring(0, 200));

        if (!response.ok) {
          throw new Error(\`Bundle API error: \${response.status} - \${responseText}\`);
        }

        try {
          this.bundleData = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('[Salla Bundle Modal] JSON parse error:', jsonError);
          console.error('[Salla Bundle Modal] Response text:', responseText);
          throw new Error(\`Invalid JSON response: \${jsonError.message}\`);
        }

        // Create modal element
        this.createModal();

      } catch (error) {
        console.error('[Salla Bundle Modal] Initialization failed:', error);
        throw error;
      }
    }

    createModal() {
      this.modalElement = document.createElement('div');
      this.modalElement.className = 'salla-bundle-modal';

      const bundleConfig = this.bundleData.data || this.bundleData;
      const modalTitle = bundleConfig.modal_title || 'اختر باقتك';

      this.modalElement.innerHTML = \`
        <div class="salla-bundle-panel">
          <div class="salla-bundle-header">
            <div class="salla-bundle-header-row">
              <h2 class="salla-bundle-title">\${modalTitle}</h2>
              <button class="salla-bundle-close">&times;</button>
            </div>
          </div>
          <div class="salla-bundle-body">
            <!-- Content will be rendered here -->
          </div>
          <div class="salla-sticky-summary">
            <!-- Summary will be rendered here -->
          </div>
        </div>
      \`;

      document.body.appendChild(this.modalElement);

      // Set global reference immediately
      window.sallaBundleModal = this;

      // Event handlers
      this.modalElement.onclick = (e) => {
        if (e.target === this.modalElement) {
          this.hide();
        }
      };

      const closeBtn = this.modalElement.querySelector('.salla-bundle-close');
      closeBtn.onclick = () => this.hide();

      // Render content
      this.renderContent();
    }

    renderContent() {
      const body = this.modalElement.querySelector('.salla-bundle-body');
      const summary = this.modalElement.querySelector('.salla-sticky-summary');

      // Get bundle data (use data.bundles from API response)
      const bundleConfig = this.bundleData.data || this.bundleData;
      const bundles = bundleConfig.bundles || [];

      if (bundles.length === 0) {
        body.innerHTML = \`
          <div class="salla-bundle-section">
            <div style="text-align: center; color: var(--text-2); padding: 20px;">
              لا توجد عروض متاحة حالياً.
            </div>
          </div>
        \`;
        return;
      }

      // Calculate bundle values and create bundle display data using real product data
      const targetProductData = bundleConfig.target_product_data;
      const baseProductPrice = targetProductData?.price || 100.00;

      const bundleDisplayData = bundles.map((tier, index) => {
        // Ensure buy_quantity is defined
        const buyQuantity = tier.buy_quantity || 1;
        const subtotal = buyQuantity * baseProductPrice;

        // Check for unavailable products in this tier
        const unavailableProducts = this.getUnavailableProducts(bundleConfig, tier);
        const hasUnavailableProducts = unavailableProducts.length > 0;
        const targetProductUnavailable = bundleConfig.target_product_data ? 
          this.isProductCompletelyUnavailable(bundleConfig.target_product_data) : false;

        // Calculate gift/discount value and actual cost more precisely using real product data
        let giftValue = 0;
        let offersCost = 0;
        
        if (tier.offers) {
          tier.offers.forEach(offer => {
            // Skip unavailable products
            if (offer.product_data && this.isProductCompletelyUnavailable(offer.product_data)) {
              return;
            }

            const productPrice = offer.product_data?.price || 100.00;

            if (offer.discount_type === 'free') {
              // Free product: customer pays 0, saves full price
              giftValue += productPrice;
              offersCost += 0;
            } else if (offer.discount_type === 'percentage') {
              // Percentage discount: customer pays discounted price
              const discountAmount = productPrice * (offer.discount_amount / 100);
              const customerPays = productPrice - discountAmount;
              giftValue += discountAmount;
              offersCost += customerPays;
            } else if (offer.discount_type === 'fixed_amount') {
              // Fixed discount: customer pays price minus fixed amount
              const customerPays = Math.max(0, productPrice - offer.discount_amount);
              giftValue += offer.discount_amount;
              offersCost += customerPays;
            } else {
              // No discount: customer pays full price
              offersCost += productPrice;
            }
          });
        }

        // Generate item list with availability indicators
        const items = [
          \`\${buyQuantity} × \${targetProductData?.name || 'منتج'}\${targetProductUnavailable ? ' (غير متوفر)' : ''}\`,
          ...(tier.offers || []).map(offer => {
            const productName = offer.product_data?.name || offer.product_name;
            const isUnavailable = offer.product_data ? this.isProductCompletelyUnavailable(offer.product_data) : false;
            const unavailableText = isUnavailable ? ' (غير متوفر)' : '';
            
            if (offer.discount_type === 'free') {
              return \`\${productName} — مجاناً\${unavailableText}\`;
            } else if (offer.discount_type === 'percentage') {
              return \`\${productName} — خصم \${offer.discount_amount}%\${unavailableText}\`;
            } else if (offer.discount_type === 'fixed_amount') {
              return \`\${productName} — خصم \${offer.discount_amount} \${riyalSvgIcon}\${unavailableText}\`;
            }
            return \`\${productName} — خصم\${unavailableText}\`;
          })
        ];

        // Calculate actual total price customer pays
        const totalCustomerPays = subtotal + offersCost;

        // Debug logging for price calculations
        console.log(\`[Bundle Pricing] Tier \${tier.tier} - Target: \${subtotal}, Offers: \${offersCost}, Total: \${totalCustomerPays}, Savings: \${giftValue}\`);

        return {
          id: \`tier-\${tier.tier}\`,
          name: tier.tier_title || \`المستوى \${tier.tier}\`,
          price: totalCustomerPays, // What customer actually pays
          originalPrice: subtotal, // Just the target product price
          offersCost: offersCost, // What customer pays for offers
          jugCount: buyQuantity,
          value: subtotal + giftValue + offersCost, // Total value of everything
          badge: hasUnavailableProducts || targetProductUnavailable ?
            'منتجات غير متوفرة' :
            (tier.tier_highlight_text || ''),
          items: items,
          tier: tier,
          savings: giftValue,
          hasUnavailableProducts: hasUnavailableProducts || targetProductUnavailable,
          unavailableProducts: unavailableProducts,
          // Add customization data
          bgColor: tier.tier_bg_color || '#f8f9fa',
          textColor: tier.tier_text_color || '#212529',
          highlightBgColor: tier.tier_highlight_bg_color || '#ffc107',
          highlightTextColor: tier.tier_highlight_text_color || '#000000',
          isDefault: tier.is_default || false
        };
      });

      // Set default bundle based on admin configuration or first available
      if (!this.selectedBundle && bundleDisplayData.length > 0) {
        // First priority: Find bundle marked as default (is_default = true)
        const defaultBundle = bundleDisplayData.find(bundle => bundle.isDefault === true);
        if (defaultBundle) {
          this.selectedBundle = defaultBundle.id;
          console.log('[Bundle Selection] Selected default bundle:', defaultBundle.name);
        } else {
          // Fallback: Select first bundle without unavailable products
          const availableBundle = bundleDisplayData.find(bundle => !bundle.hasUnavailableProducts);
          if (availableBundle) {
            this.selectedBundle = availableBundle.id;
            console.log('[Bundle Selection] Selected first available bundle:', availableBundle.name);
          } else {
            // Last resort: Select the first bundle
            this.selectedBundle = bundleDisplayData[0].id;
            console.log('[Bundle Selection] Selected first bundle (all have issues):', bundleDisplayData[0].name);
          }
        }
      }

      const selectedBundleData = bundleDisplayData.find(b => b.id === this.selectedBundle);
      const selectedTier = selectedBundleData ? selectedBundleData.tier : bundles[0];

      // Check if any bundles have unavailable products
      const hasAnyUnavailableProducts = bundleDisplayData.some(bundle => bundle.hasUnavailableProducts);
      const allBundlesUnavailable = bundleDisplayData.every(bundle => bundle.hasUnavailableProducts);

      // Get modal subtitle from bundle config (optional)
      const modalSubtitle = bundleConfig.modal_subtitle || '';

      let html = \`
        <!-- Bundles Section -->
        <div class="salla-bundle-section">
          <h3>باقاتنا</h3>
          \${modalSubtitle ? \`<div class="subtitle">\${modalSubtitle}</div>\` : ''}
          \${hasAnyUnavailableProducts ? \`
            <div style="background: #fef3cd; border: 1px solid #f6d55c; border-radius: 8px; padding: 12px; margin-bottom: 12px; color: #d97706;">
              \${allBundlesUnavailable ? 
                '⚠️ جميع الباقات تحتوي على منتجات غير متوفرة حالياً. يمكنك شراء المنتج الأساسي فقط.' : 
                '⚠️ بعض الباقات تحتوي على منتجات غير متوفرة. ننصح باختيار الباقات المتوفرة بالكامل.'
              }
            </div>
          \` : ''}
          \${bundleDisplayData.filter(b => !b.hasUnavailableProducts).length > 0 && hasAnyUnavailableProducts ? \`
            <div style="background: #d1fae5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; margin-bottom: 12px; color: #065f46;">
              ✅ الباقات المتوفرة بالكامل: 
              \${bundleDisplayData.filter(b => !b.hasUnavailableProducts).map(b => b.name).join('، ')}
            </div>
          \` : ''}
          <div class="salla-bundle-grid">
            \${bundleDisplayData.map(bundle => \`
              <div class="salla-bundle-card \${this.selectedBundle === bundle.id ? 'active' : ''} \${bundle.hasUnavailableProducts ? 'unavailable' : ''}"
                   style="background-color: \${bundle.bgColor}; border-color: \${this.selectedBundle === bundle.id ? bundle.textColor : bundle.bgColor};">
                <div class="salla-bundle-card-header">
                  <div>
                    <div class="salla-bundle-card-title" style="color: \${bundle.textColor};">\${bundle.name}</div>
                    <div class="salla-bundle-card-value" style="color: \${bundle.textColor};">قيمة \${formatPrice(bundle.value)}</div>
                    \${bundle.hasUnavailableProducts ? \`
                      <div style="font-size: 11px; color: #ef4444; margin-top: 2px;">
                        ⚠️ بعض المنتجات غير متوفرة
                      </div>
                    \` : ''}
                  </div>
                  \${bundle.badge ? \`
                    <span class="salla-bundle-badge" style="background: \${bundle.hasUnavailableProducts ? '#fee2e2' : bundle.highlightBgColor}; color: \${bundle.hasUnavailableProducts ? '#dc2626' : bundle.highlightTextColor}; border-color: \${bundle.hasUnavailableProducts ? '#fecaca' : bundle.highlightBgColor};">\${bundle.badge}</span>
                  \` : ''}
                </div>
                <ul class="salla-bundle-items">
                  \${bundle.items.map(item => \`<li style="color: \${item.includes('(غير متوفر)') ? '#9ca3af' : bundle.textColor}; \${item.includes('(غير متوفر)') ? 'text-decoration: line-through;' : ''}">\${item}</li>\`).join('')}
                </ul>
                <div class="salla-bundle-card-footer">
                  <div class="salla-bundle-price" style="color: \${bundle.textColor};">\${formatPrice(bundle.price)}</div>
                  <button class="salla-bundle-button \${this.selectedBundle === bundle.id ? 'active' : ''} \${bundle.hasUnavailableProducts ? 'unavailable' : ''}"
                          onclick="if(window.sallaBundleModal) window.sallaBundleModal.selectBundle('\${bundle.id}'); else console.error('Modal instance not found');"
                          style="background-color: \${bundleConfig.cta_button_bg_color || '#0066ff'}; color: \${bundleConfig.cta_button_text_color || '#ffffff'};"
                          \${bundle.hasUnavailableProducts ? 'title="تحتوي هذه الباقة على منتجات غير متوفرة"' : ''}>
                    \${this.selectedBundle === bundle.id ? 'محدد' : (bundleConfig.cta_button_text || 'اختر الباقة')}
                  </button>
                </div>
              </div>
            \`).join('')}
          </div>
        </div>

        <!-- Target Product Variants Section -->
        \${targetProductData && targetProductData.has_variants ? \`
          <div class="salla-bundle-section">
            <h3>اختر مواصفات \${targetProductData.name}</h3>
            <div class="subtitle">مطلوب لإضافة المنتج للسلة</div>
            \${this.renderVariantSelectors(targetProductData, this.productId)}
          </div>
        \` : ''}

        <!-- Offers Section -->
        \${this.renderOffersSection(selectedTier, selectedBundleData)}
      \`;

      body.innerHTML = html;

      // Render summary with accurate calculations
      const selectedBundle = selectedBundleData || bundleDisplayData[0];
      const totalPrice = selectedBundle.price; // This is what customer actually pays
      const originalValue = selectedBundle.originalPrice || selectedBundle.price; // Target product price
      const offersPrice = selectedBundle.offersCost || 0; // What customer pays for offers
      const bundleSavings = selectedBundle.savings || 0; // What customer saves

      // Debug logging for summary calculations
      console.log('[Summary Debug] Selected bundle:', selectedBundle);
      console.log(\`[Summary Debug] Total: \${totalPrice}, Original: \${originalValue}, Offers: \${offersPrice}, Savings: \${bundleSavings}\`);

      let summaryHtml = \`
        <div class="salla-summary-row">
          <span class="salla-summary-label">المنتج الأساسي</span>
          <span class="salla-summary-value">\${formatPrice(originalValue)}</span>
        </div>
      \`;

      if (offersPrice > 0) {
        summaryHtml += \`
          <div class="salla-summary-row">
            <span class="salla-summary-label">المنتجات الإضافية</span>
            <span class="salla-summary-value">\${formatPrice(offersPrice)}</span>
          </div>
        \`;
      }

      summaryHtml += \`
        <div class="salla-summary-row" style="border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px;">
          <span class="salla-summary-label" style="font-weight: 600;">المجموع الفرعي</span>
          <span class="salla-summary-value" style="font-weight: 600; font-size: 16px;">\${formatPrice(totalPrice)}</span>
        </div>
      \`;

      if (bundleSavings > 0) {
        summaryHtml += \`
          <div class="salla-summary-row">
            <span class="salla-summary-label">توفير الباقة</span>
            <span class="salla-summary-value salla-summary-savings">\${formatPrice(bundleSavings)}</span>
          </div>
        \`;
      }

      summaryHtml += \`
        <button class="salla-checkout-button"
                style="background-color: \${bundleConfig.cta_button_bg_color || '#0066ff'}; color: \${bundleConfig.cta_button_text_color || '#ffffff'};"
                onclick="if(window.sallaBundleModal) window.sallaBundleModal.handleCheckout(); else console.error('Modal instance not found for checkout');">
          <span>🛒</span>
          <span>إتمام الطلب — \${formatPrice(totalPrice)}</span>
        </button>
      \`;

      summary.innerHTML = summaryHtml;
    }

    renderOffersSection(selectedTier, selectedBundleData) {
      if (!selectedTier || !selectedTier.offers || selectedTier.offers.length === 0) {
        return \`
          <div class="salla-bundle-section">
            <h3>العروض المتضمنة</h3>
            <div class="subtitle">اختر باقة لرؤية العروض المتضمنة</div>
            <div style="color: var(--text-2); padding: 20px; text-align: center;">اختر باقة لرؤية العروض المتضمنة.</div>
          </div>
        \`;
      }

      // Separate offers by type
      const freeGifts = selectedTier.offers.filter(offer => offer.discount_type === 'free');
      const discountedProducts = selectedTier.offers.filter(offer => offer.discount_type !== 'free');

      const totalSavings = selectedBundleData ? selectedBundleData.savings : 0;

      let sectionsHtml = '';

      // Free gifts section
      if (freeGifts.length > 0) {
        sectionsHtml += \`
          <div class="salla-bundle-section">
            <h3>🎁 هداياك المجانية</h3>
            <div class="subtitle">توفر \${formatPrice(freeGifts.reduce((sum, offer) => sum + (offer.product_data?.price || 100), 0))}</div>
            <div class="salla-gifts-grid">
              \${freeGifts.map(offer => this.renderOfferCard(offer, 'gift')).join('')}
            </div>
          </div>
        \`;
      }

      // Discounted products section
      if (discountedProducts.length > 0) {
        const discountSavings = discountedProducts.reduce((sum, offer) => {
          const productPrice = offer.product_data?.price || 100;
          if (offer.discount_type === 'percentage') {
            return sum + (productPrice * (offer.discount_amount / 100));
          } else if (offer.discount_type === 'fixed_amount') {
            return sum + offer.discount_amount;
          }
          return sum;
        }, 0);

        sectionsHtml += \`
          <div class="salla-bundle-section">
            <h3> منتجات مخفضة</h3>
            <div class="subtitle">وفر \${formatPrice(discountSavings)} إضافية</div>
            <div class="salla-gifts-grid">
              \${discountedProducts.map(offer => this.renderOfferCard(offer, 'discount')).join('')}
            </div>
          </div>
        \`;
      }

      // Combined section if only one type
      if (sectionsHtml === '') {
        sectionsHtml = \`
          <div class="salla-bundle-section">
            <h3>العروض المتضمنة</h3>
            <div class="subtitle">توفر \${formatPrice(totalSavings)}</div>
            <div class="salla-gifts-grid">
              \${selectedTier.offers.map(offer => this.renderOfferCard(offer, 'combined')).join('')}
            </div>
          </div>
        \`;
      }

      return sectionsHtml;
    }

    renderOfferCard(offer, type) {
      const productPrice = offer.product_data?.price || 100;
      const productName = offer.product_data?.name || offer.product_name;
      const productImage = offer.product_data?.image || 'https://via.placeholder.com/400x400/f0f0f0/666?text=' + encodeURIComponent(productName);
      
      // Check if product is completely unavailable
      const isUnavailable = offer.product_data ? this.isProductCompletelyUnavailable(offer.product_data) : false;

      let badgeText = 'هدية متضمنة';
      let statusText = 'مجاناً';
      let priceDisplay = \`<div class="salla-gift-value" style="text-decoration: line-through; color: var(--text-2);">\${formatPrice(productPrice)}</div>\`;

      // Override styling and messaging for unavailable products
      if (isUnavailable) {
        badgeText = 'غير متوفر';
        statusText = 'نفد المخزون';
        priceDisplay = \`<div class="salla-gift-value" style="color: #ef4444; font-weight: 500;">غير متوفر حالياً</div>\`;
      } else if (offer.discount_type === 'percentage') {
        badgeText = 'منتج مخفض';
        statusText = \`خصم \${offer.discount_amount}%\`;
        const discountedPrice = productPrice * (1 - offer.discount_amount / 100);
        priceDisplay = \`
          <div class="salla-gift-value">
            <span style="text-decoration: line-through; color: var(--text-2); font-size: 12px;">\${formatPrice(productPrice)}</span>
            <span style="font-weight: 600; color: var(--text-1);">\${formatPrice(discountedPrice)}</span>
          </div>
        \`;
      } else if (offer.discount_type === 'fixed_amount') {
        badgeText = 'منتج مخفض';
        statusText = \`خصم \${offer.discount_amount} \${riyalSvgIcon}\`;
        const discountedPrice = productPrice - offer.discount_amount;
        priceDisplay = \`
          <div class="salla-gift-value">
            <span style="text-decoration: line-through; color: var(--text-2); font-size: 12px;">\${formatPrice(productPrice)}</span>
            <span style="font-weight: 600; color: var(--text-1);">\${formatPrice(discountedPrice)}</span>
          </div>
        \`;
      }

      // Apply disabled styling for unavailable products
      const cardClass = isUnavailable ? 'salla-gift-card salla-gift-unavailable' : 'salla-gift-card';
      const overlayElement = isUnavailable ? \`
        <div class="salla-gift-overlay">
          <div class="salla-gift-overlay-content">
            <span style="font-size: 24px;">❌</span>
            <span style="font-size: 12px; color: white; font-weight: 600; margin-top: 4px;">نفد المخزون</span>
          </div>
        </div>
      \` : '';

      return \`
        <div class="\${cardClass}">
          <div class="salla-gift-image" style="background-image: url('\${productImage}'); background-size: cover; background-position: center; min-height: 120px; position: relative;">
            <img src="\${productImage}" alt="\${productName}" style="width: 100%; height: 120px; object-fit: cover; display: block; \${isUnavailable ? 'filter: grayscale(100%) opacity(0.5);' : ''}" />
            \${overlayElement}
          </div>
          <div class="salla-gift-content">
            <div class="salla-gift-badges">
              <span class="salla-gift-badge" style="\${isUnavailable ? 'background: #fee2e2; color: #dc2626; border-color: #fecaca;' : ''}">\${badgeText}</span>
              <span class="salla-gift-free" style="\${isUnavailable ? 'color: #dc2626;' : ''}">\${statusText}</span>
            </div>
            <div class="salla-gift-title" style="\${isUnavailable ? 'color: #9ca3af;' : ''}">\${productName}</div>
            \${priceDisplay}
            \${this.renderVariantSelectors(offer.product_data, offer.product_id, true)}
          </div>
        </div>
      \`;
    }

    selectBundle(bundleId) {
      this.selectedBundle = bundleId;
      this.renderContent();
    }

    async handleCheckout() {
      try {
        console.log('[Salla Bundle] Starting checkout process...');

        // Validate Salla SDK is available
        if (!window.salla) {
          console.error('[Salla Bundle] Salla SDK not available');
          alert('عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى.');
          return;
        }

        // Get selected bundle data
        const selectedBundleData = this.getSelectedBundleData();
        if (!selectedBundleData) {
          alert('يرجى اختيار باقة أولاً');
          return;
        }

        console.log('[Salla Bundle] Selected bundle:', selectedBundleData);
        console.log('[Salla Bundle] Selected bundle tier object:', selectedBundleData.tier);
        console.log('[Salla Bundle] Selected bundle tier offers:', selectedBundleData.tier ? selectedBundleData.tier.offers : 'NO TIER OBJECT');

        // Validate required variants are selected
        const bundleConfig = this.bundleData.data || this.bundleData;
        const targetProductData = bundleConfig.target_product_data;

        // Check for products that are completely unavailable (all variants out of stock)
        const unavailableProducts = this.getUnavailableProducts(bundleConfig, selectedBundleData.tier);
        if (unavailableProducts.length > 0) {
          console.log('[Salla Bundle] BLOCKED: Products unavailable (all variants out of stock):', unavailableProducts);
          
          // Create detailed error message based on product types
          const targetProducts = unavailableProducts.filter(p => p.type === 'target');
          const offerProducts = unavailableProducts.filter(p => p.type === 'offer');
          
          let errorMessage = '';
          if (targetProducts.length > 0) {
            errorMessage = \`عذراً، المنتج الأساسي "\${targetProducts[0].name}" غير متوفر حالياً. لا يمكن إتمام الطلب.\`;
          } else if (offerProducts.length > 0) {
            const offerNames = offerProducts.map(p => p.name).join('، ');
            errorMessage = \`عذراً، المنتجات التالية من العرض غير متوفرة حالياً: \${offerNames}.\`;
            
            if (offerProducts.length === 1) {
              errorMessage += ' يمكنك اختيار باقة أخرى أو المتابعة دون هذا المنتج.';
            } else {
              errorMessage += ' يرجى اختيار باقة أخرى.';
            }
          }
          
          this.showSallaToast(errorMessage, 'error');
          return false; // Block checkout
        }

        // TRIPLE CHECK: Make sure ALL variants are selected before ANY cart operations
        console.log('[Salla Bundle] =================== VARIANT VALIDATION START ===================');
        
        // Force a complete re-validation - selectedBundleData IS the tier object
        const missingVariants = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData);

        if (missingVariants.length > 0) {
          console.log('[Salla Bundle] ❌ VALIDATION FAILED - BLOCKING CHECKOUT COMPLETELY');
          console.log('[Salla Bundle] Missing variants:', missingVariants);

          // Create detailed error message listing missing variants
          const missingDetails = missingVariants.map(mv => \`\${mv.productName}: \${mv.optionName}\`).join('، ');
          const errorMessage = \`❌ يجب اختيار الخيارات التالية أولاً: \${missingDetails}\`;

          // Show error toast
          this.showSallaToast(errorMessage, 'error');

          // Highlight all missing variants with persistent red outline
          this.highlightMissingVariants(missingVariants);

          // Scroll to the first missing variant more aggressively
          const firstMissing = missingVariants[0];
          this.scrollToVariantInputAggressively(firstMissing.selectorProductId || firstMissing.productId, firstMissing.optionId);

          // Flash the missing variant selector to draw attention
          this.flashMissingVariant(firstMissing.selectorProductId || firstMissing.productId, firstMissing.optionId);

          console.log('[Salla Bundle] =================== CHECKOUT BLOCKED ===================');
          // ABSOLUTELY NO CART NAVIGATION OR API CALLS
          return false; // Block everything
        }

        console.log('[Salla Bundle] ✅ ALL VARIANTS VALIDATED - PROCEEDING WITH CHECKOUT');
        console.log('[Salla Bundle] =================== VARIANT VALIDATION END ===================');

        // Track analytics before checkout
        this.trackBundleSelection(selectedBundleData);

        // Show loading state
        this.showSallaToast('جارٍ إضافة المنتجات إلى السلة...', 'info');

        try {
          const addedProducts = []; // Track all products added to cart
          
          // Add target products (main product) - these are the products user is buying
          const targetQuantity = selectedBundleData.buy_quantity || 1;
          console.log(\`[Salla Bundle] Adding \${targetQuantity} × target product \${this.productId}\`);

          const targetOptions = bundleConfig.target_product_data && bundleConfig.target_product_data.has_variants ?
            this.getSelectedVariantOptions(this.productId) : {};

          console.log(\`[Salla Bundle] Target product options:\`, targetOptions);

          // Double-check target product availability before adding
          if (bundleConfig.target_product_data && this.isProductCompletelyUnavailable(bundleConfig.target_product_data)) {
            throw new Error(\`Target product \${bundleConfig.target_product_data.name} is completely out of stock\`);
          }

          // Add target product(s) to cart
          for (let i = 0; i < targetQuantity; i++) {
            const targetCartItem = {
              id: this.productId,
              quantity: 1,
              options: targetOptions
            };
            
            console.log(\`[Salla Bundle] Adding target product #\${i+1} with params:\`, targetCartItem);
            await window.salla.cart.addItem(targetCartItem);
            addedProducts.push({
              name: bundleConfig.target_product_data.name,
              type: 'target',
              quantity: 1
            });
          }
          
          console.log(\`[Salla Bundle] Successfully added \${targetQuantity} × target product\`);

          // Track successful and failed offer additions
          const successfulOffers = [];
          const failedOffers = [];

          // Manually add gift/discounted products since automatic offers aren't working
          console.log(\`[Salla Bundle] Processing offers...\`);
          console.log(\`[Salla Bundle] Selected tier:\`, selectedBundleData);
          console.log(\`[Salla Bundle] Tier offers:\`, selectedBundleData.offers);
          
          if (selectedBundleData.offers && selectedBundleData.offers.length > 0) {
            console.log(\`[Salla Bundle] Found \${selectedBundleData.offers.length} offers to process\`);
            
            for (const offer of selectedBundleData.offers) {
              console.log(\`[Salla Bundle] Processing offer:\`, offer);
              
              // Check if product is completely unavailable
              const isUnavailable = offer.product_data && this.isProductCompletelyUnavailable(offer.product_data);
              console.log(\`[Salla Bundle] Offer product \${offer.product_name} is unavailable: \${isUnavailable}\`);
              
              if (isUnavailable) {
                console.log(\`[Salla Bundle] ❌ Skipping unavailable offer product: \${offer.product_id} (\${offer.product_name})\`);
                failedOffers.push({
                  ...offer,
                  reason: 'out_of_stock'
                });
                continue;
              }

              try {
                console.log(\`[Salla Bundle] Adding offer product: \${offer.product_id} (\${offer.product_name}) - \${offer.discount_type}\`);

                const offerOptions = offer.product_data && offer.product_data.has_variants ?
                  this.getSelectedOfferVariantOptions(offer.product_id) : {};

                console.log(\`[Salla Bundle] Offer options for \${offer.product_name}:\`, offerOptions);

                // Add the gift/discounted product to cart
                const addToCartParams = {
                  id: offer.product_id,
                  quantity: offer.quantity || 1,
                  options: offerOptions
                };

                console.log(\`[Salla Bundle] Adding to cart with params:\`, addToCartParams);

                await window.salla.cart.addItem(addToCartParams);

                console.log(\`[Salla Bundle] Successfully added offer product: \${offer.product_name}\`);
                successfulOffers.push(offer);
                addedProducts.push({
                  name: offer.product_name,
                  type: offer.discount_type === 'free' ? 'gift' : 'discounted',
                  quantity: offer.quantity || 1,
                  discount: offer.discount_type,
                  discountAmount: offer.discount_amount
                });

                // If it's a discounted product (not free), we need to handle the discount separately
                // For free products, they're added at full price initially
                // Salla's Special Offers should apply the discount, but if not working,
                // the products are still in the cart for manual adjustment
              } catch (offerError) {
                console.error(\`[Salla Bundle] Failed to add offer product \${offer.product_id}:\`, offerError);
                failedOffers.push({
                  ...offer,
                  reason: 'add_to_cart_failed',
                  error: offerError.message
                });
              }
            }
            
            console.log(\`[Salla Bundle] Finished processing \${selectedBundleData.offers.length} offers\`);
          } else {
            console.log(\`[Salla Bundle] No offers found in selected tier\`);
          }

          // Show comprehensive success message based on results
          const totalAdded = addedProducts.length; 
          let successMessage = '';
          
          if (successfulOffers.length > 0 && failedOffers.length === 0) {
            successMessage = \`تمت إضافة جميع المنتجات بنجاح! (\${totalAdded} منتج)\`;
          } else if (successfulOffers.length > 0 && failedOffers.length > 0) {
            successMessage = \`تمت إضافة \${totalAdded} منتج. \${failedOffers.length} منتجات لم تتم إضافتها.\`;
          } else if (failedOffers.length > 0) {
            successMessage = \`تمت إضافة المنتج الأساسي. \${failedOffers.length} منتجات إضافية غير متوفرة.\`;
          } else {
            successMessage = \`تمت إضافة المنتج الأساسي بنجاح!\`;
          }

          console.log(\`[Salla Bundle] Final cart summary: \${totalAdded} products added, \${failedOffers.length} failed\`);
          console.log(\`[Salla Bundle] Added products:\`, addedProducts);
          console.log(\`[Salla Bundle] Successful offers:\`, successfulOffers);
          console.log(\`[Salla Bundle] Failed offers:\`, failedOffers);

          this.showSallaToast(successMessage, failedOffers.length > 0 ? 'warning' : 'success');

        } catch (error) {
          console.error('[Salla Bundle] Failed to add products:', error);

          // Check if it's a variant validation error
          if (error.message && (error.message.includes('options') || error.message.includes('variant') || error.message.includes('required'))) {
            // Double-check variants and block navigation
            const missingVariants = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData.tier);
            if (missingVariants.length > 0) {
              console.log('[Salla Bundle] VARIANT ERROR DETECTED - BLOCKING NAVIGATION');
              this.showSallaToast('يجب اختيار جميع الخيارات المطلوبة قبل المتابعة', 'error');
              this.highlightMissingVariants(missingVariants);
              const firstMissing = missingVariants[0];
              this.scrollToVariantInput(firstMissing.productId, firstMissing.optionId);
              return; // BLOCK - NO CART NAVIGATION
            }
          }

          this.showSallaToast('حدث خطأ في إضافة بعض المنتجات', 'error');
          return; // BLOCK - Don't navigate to cart on error
        }

        // FINAL CHECK before navigation
        const finalVariantCheck = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData.tier);
        if (finalVariantCheck.length > 0) {
          console.log('[Salla Bundle] FINAL CHECK FAILED - BLOCKING CART NAVIGATION');
          this.showSallaToast('لا يمكن المتابعة بدون اختيار جميع الخيارات', 'error');
          this.highlightMissingVariants(finalVariantCheck);
          return; // ABSOLUTE BLOCK
        }

        console.log('[Salla Bundle] All products added successfully. Navigating to cart...');

        // Navigate to cart ONLY after successful validation and product addition
        //window.location.href = \`https://\${this.storeDomain}/cart\`;

      } catch (error) {
        console.error('[Salla Bundle] Checkout failed:', error);

        // Any error = NO cart navigation
        this.showSallaToast('حدث خطأ. يرجى المحاولة مرة أخرى.', 'error');
        return; // BLOCK navigation
      }
    }

    getSelectedBundleData() {
      const bundleConfig = this.bundleData.data || this.bundleData;
      const bundles = bundleConfig.bundles || [];

      // Find selected tier
      const tierNumber = this.selectedBundle ? parseInt(this.selectedBundle.replace('tier-', '')) : 1;
      const selectedTier = bundles.find(tier => tier.tier === tierNumber);
      
      console.log(\`[Bundle Selection] Selected bundle ID: \${this.selectedBundle}\`);
      console.log(\`[Bundle Selection] Tier number: \${tierNumber}\`);
      console.log(\`[Bundle Selection] Available bundles:\`, bundles);
      console.log(\`[Bundle Selection] Selected tier:\`, selectedTier);
      
      return selectedTier;
    }

    getSelectedVariantOptions(productId) {
      const options = {};
      const selectors = document.querySelectorAll(\`[data-variant-product="\${productId}"]\`);

      console.log(\`[Variant Options] Looking for selectors for product \${productId}\`);
      console.log(\`[Variant Options] Selector query: [data-variant-product="\${productId}"]\`);
      console.log(\`[Variant Options] Found \${selectors.length} selectors\`);

      // Also check if selectors exist with different attributes
      const allSelectors = document.querySelectorAll('select[data-variant-product], select[data-option-id]');
      console.log(\`[Variant Options] All variant selectors in DOM:\`, allSelectors);
      
      allSelectors.forEach((sel, i) => {
        console.log(\`[Variant Options] Selector \${i}: product=\${sel.getAttribute('data-variant-product')}, option=\${sel.getAttribute('data-option-id')}, value=\${sel.value}\`);
      });

      selectors.forEach((selector, index) => {
        const optionId = selector.getAttribute('data-option-id');
        const value = selector.value;
        console.log(\`[Variant Options] Selector \${index+1}: optionId=\${optionId}, value='\${value}'\`);
        
        if (value && value !== '') {
          options[optionId] = value;
        }
      });

      console.log(\`[Variant Options] Final options for product \${productId}:\`, options);
      return options;
    }

    getSelectedOfferVariantOptions(productId) {
      const options = {};
      
      // Check if this is the same product as target (needs offer-specific selectors)
      const isSameAsTarget = productId === this.productId;
      const selectorProductId = isSameAsTarget ? \`\${productId}-offer\` : productId;
      
      const selectors = document.querySelectorAll(\`[data-variant-product="\${selectorProductId}"]\`);
      
      console.log(\`[Offer Variant Options] Looking for offer selectors for product \${productId}\`);
      console.log(\`[Offer Variant Options] Using selector ID: \${selectorProductId}\`);
      console.log(\`[Offer Variant Options] Found \${selectors.length} selectors\`);

      selectors.forEach((selector, index) => {
        const optionId = selector.getAttribute('data-option-id');
        const value = selector.value;
        console.log(\`[Offer Variant Options] Selector \${index+1}: optionId=\${optionId}, value='\${value}'\`);
        
        if (value && value !== '') {
          options[optionId] = value;
        }
      });

      console.log(\`[Offer Variant Options] Final offer options for product \${productId}:\`, options);
      return options;
    }

    validateRequiredVariants(productData, selectedOptions) {
      if (!productData || !productData.options) return true;

      // Check if all required options are selected
      for (const option of productData.options) {
        if (option.required && (!selectedOptions[option.id] || selectedOptions[option.id] === '')) {
          return false;
        }
      }

      return true;
    }

    findMissingRequiredVariant(productData, selectedOptions) {
      if (!productData || !productData.options) {
        console.log(\`[Variant Check] No product data or options for product\`);
        return null;
      }

      console.log(\`[Variant Check] Checking product: \${productData.name}\`);
      console.log(\`[Variant Check] Product options:\`, productData.options);
      console.log(\`[Variant Check] Selected options:\`, selectedOptions);

      // Find the first missing required option
      for (const option of productData.options) {
        console.log(\`[Variant Check] Checking option: \${option.name} (ID: \${option.id})\`);
        
        // Check if all variants are truly out of stock (using proper stock logic)
        const availableValues = option.values ? option.values.filter(value => {
          // If explicitly marked as out of stock
          if (value.is_out_of_stock === true) {
            return false;
          }
          
          // If explicitly marked as unavailable
          if (value.is_available === false) {
            return false;
          }
          
          // If variant has quantity info
          if (value.hasOwnProperty('quantity')) {
            // If stock tracking is enabled and quantity is 0, it's out of stock
            if (productData.track_quantity || productData.enable_stock || productData.inventory_tracking) {
              return value.quantity > 0;
            }
            // If stock tracking is disabled, any quantity (including 0) means available
            return true;
          }
          
          // Default to available if no clear stock indicators suggest otherwise
          return true;
        }) : [];
        
        const allOutOfStock = option.values && option.values.length > 0 && availableValues.length === 0;
        console.log(\`[Variant Check] Option \${option.name}: Available values: \${availableValues.length}, All out of stock: \${allOutOfStock}\`);

        // Skip validation for options that are completely out of stock
        if (allOutOfStock) {
          console.log(\`[Variant Check] Skipping option \${option.name} - all variants out of stock\`);
          continue;
        }

        // ALWAYS consider variant options as required - this is key for Salla products
        const isRequired = option.required ||
                          option.purpose === 'variants' ||
                          (option.values && option.values.length > 0);

        console.log(\`[Variant Check] Option \${option.name} is required: \${isRequired}\`);
        console.log(\`[Variant Check] Selected value for option \${option.id}:\`, selectedOptions[option.id]);

        const isOptionMissing = !selectedOptions[option.id] || selectedOptions[option.id] === '' || selectedOptions[option.id] === null;
        
        if (isRequired && isOptionMissing) {
          console.log(\`[Variant Check] MISSING REQUIRED VARIANT: \${option.name} for product \${productData.name}\`);
          return option;
        }
      }

      console.log(\`[Variant Check] All required variants selected for product \${productData.name}\`);
      return null;
    }

    scrollToVariantInput(productId, optionId) {
      const input = document.querySelector(\`#variant-\${productId}-\${optionId}\`);
      if (input) {
        input.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        input.focus();
      }
    }

    scrollToVariantInputAggressively(productId, optionId) {
      const input = document.querySelector(\`#variant-\${productId}-\${optionId}\`);
      if (input) {
        // First scroll to top of modal to ensure we scroll to the right position
        const modalBody = document.querySelector('.salla-bundle-body');
        if (modalBody) {
          modalBody.scrollTop = 0;
        }
        
        // Wait a bit then scroll to the input
        setTimeout(() => {
          input.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
          
          // Focus after scrolling
          setTimeout(() => {
            input.focus();
            // Also try to open the select dropdown
            if (input.tagName === 'SELECT') {
              try {
                input.showPicker(); // Modern browsers
              } catch (e) {
                // Fallback for older browsers
                const event = new MouseEvent('mousedown', {
                  view: window,
                  bubbles: true,
                  cancelable: true
                });
                input.dispatchEvent(event);
              }
            }
          }, 500);
        }, 100);
      }
    }

    flashMissingVariant(productId, optionId) {
      const input = document.querySelector(\`#variant-\${productId}-\${optionId}\`);
      if (input) {
        // Add flashing animation
        const originalBorder = input.style.border;
        const originalOutline = input.style.outline;
        
        let flashCount = 0;
        const maxFlashes = 6; // 3 cycles of on/off
        
        const flashInterval = setInterval(() => {
          if (flashCount % 2 === 0) {
            // Flash on
            input.style.border = '3px solid #ef4444';
            input.style.outline = '2px solid rgba(239, 68, 68, 0.5)';
            input.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.8)';
          } else {
            // Flash off
            input.style.border = '1px solid #ef4444';
            input.style.outline = 'none';
            input.style.boxShadow = 'none';
          }
          
          flashCount++;
          
          if (flashCount >= maxFlashes) {
            clearInterval(flashInterval);
            // Keep the error styling but stop flashing
            input.style.border = '2px solid #ef4444';
            input.style.outline = '2px solid rgba(239, 68, 68, 0.3)';
            input.style.boxShadow = '0 0 8px rgba(239, 68, 68, 0.4)';
          }
        }, 200);
      }
    }

    getAllMissingRequiredVariants(bundleConfig, selectedTier) {
      const missing = [];

      console.log('[Variant Validation] Checking all products for missing variants...');

      // Check target product variants
      if (bundleConfig.target_product_data && bundleConfig.target_product_data.has_variants) {
        console.log(\`[Variant Validation] Checking target product: \${bundleConfig.target_product_data.name}\`);
        const targetOptions = this.getSelectedVariantOptions(bundleConfig.target_product_id);
        console.log(\`[Variant Validation] Target product selected options:\`, targetOptions);
        
        const missingOption = this.findMissingRequiredVariant(bundleConfig.target_product_data, targetOptions);
        if (missingOption) {
          console.log(\`[Variant Validation] Missing target variant: \${missingOption.name}\`);
          missing.push({
            productId: bundleConfig.target_product_id,
            selectorProductId: bundleConfig.target_product_id, // Target uses original product ID
            optionId: missingOption.id,
            optionName: missingOption.name,
            productName: bundleConfig.target_product_data.name,
            isOffer: false
          });
        }
      }

      // Check offer products variants - IMPORTANT: Check ALL offer products
      console.log(\`[Variant Validation] Selected tier offers:\`, selectedTier.offers);
      
      if (selectedTier.offers && selectedTier.offers.length > 0) {
        console.log(\`[Variant Validation] Found \${selectedTier.offers.length} offers to validate\`);
        
        for (const offer of selectedTier.offers) {
          console.log(\`[Variant Validation] Processing offer:\`, offer);
          
          if (offer.product_data && offer.product_data.has_variants) {
            console.log(\`[Variant Validation] Checking offer product: \${offer.product_data.name} (ID: \${offer.product_id})\`);
            const offerOptions = this.getSelectedOfferVariantOptions(offer.product_id);
            console.log(\`[Variant Validation] Offer product \${offer.product_data.name} selected options:\`, offerOptions);
            
            const missingOption = this.findMissingRequiredVariant(offer.product_data, offerOptions);
            if (missingOption) {
              console.log(\`[Variant Validation] ❌ Missing offer variant: \${offer.product_data.name} - \${missingOption.name}\`);
              
              // Check if this offer product is the same as target (needs special selector ID)
              const isSameAsTarget = offer.product_id === this.productId;
              const selectorProductId = isSameAsTarget ? \`\${offer.product_id}-offer\` : offer.product_id;
              
              missing.push({
                productId: offer.product_id,
                selectorProductId: selectorProductId, // The actual selector ID in DOM
                optionId: missingOption.id,
                optionName: missingOption.name,
                productName: offer.product_data.name,
                isOffer: true
              });
            } else {
              console.log(\`[Variant Validation] ✅ All variants selected for offer: \${offer.product_data.name}\`);
            }
          } else {
            console.log(\`[Variant Validation] Offer product \${offer.product_name} has no variants or no product data\`);
          }
        }
      } else {
        console.log(\`[Variant Validation] No offers found in selected tier\`);
      }

      console.log(\`[Variant Validation] Total missing variants: \${missing.length}\`, missing);
      return missing;
    }

    highlightMissingVariants(missingVariants) {
      // Clear any existing highlights
      document.querySelectorAll('.salla-variant-select').forEach(select => {
        if (!select.classList.contains('all-out-of-stock')) {
          select.style.outline = '';
          select.style.borderColor = '';
          select.classList.remove('variant-error');
        }
      });

      // Highlight missing variants with visible red outline - but only if they can be selected
      missingVariants.forEach(missing => {
        const selectorId = missing.selectorProductId || missing.productId;
        const input = document.querySelector(\`#variant-\${selectorId}-\${missing.optionId}\`);
        if (input && !input.hasAttribute('data-all-out-of-stock') && !input.disabled) {
          input.classList.add('variant-error');

          // Remove highlight when user selects an option
          input.addEventListener('change', function onVariantChange() {
            if (input.value) {
              input.classList.remove('variant-error');
              input.removeEventListener('change', onVariantChange);
            }
          });
        }
      });
    }

    getUnavailableProducts(bundleConfig, selectedTier) {
      const unavailable = [];

      // Check target product
      if (bundleConfig.target_product_data && this.isProductCompletelyUnavailable(bundleConfig.target_product_data)) {
        unavailable.push({
          id: bundleConfig.target_product_id,
          name: bundleConfig.target_product_data.name,
          type: 'target'
        });
      }

      // Check offer products
      if (selectedTier && selectedTier.offers) {
        for (const offer of selectedTier.offers) {
          if (offer.product_data && this.isProductCompletelyUnavailable(offer.product_data)) {
            unavailable.push({
              id: offer.product_id,
              name: offer.product_data.name || offer.product_name,
              type: 'offer'
            });
          }
        }
      }

      return unavailable;
    }

    getAlternativeShoppingOptions(bundleConfig, selectedTier) {
      const alternatives = [];
      
      // Option 1: Buy just the target product
      if (bundleConfig.target_product_data && !this.isProductCompletelyUnavailable(bundleConfig.target_product_data)) {
        alternatives.push({
          type: 'target_only',
          title: 'شراء المنتج الأساسي فقط',
          description: \`يمكنك شراء \${bundleConfig.target_product_data.name} بدون العروض الإضافية\`,
          action: 'proceed_target_only'
        });
      }
      
      // Option 2: Find available bundles
      const availableBundles = bundleConfig.bundles.filter(tier => {
        const unavailable = this.getUnavailableProducts(bundleConfig, tier);
        return unavailable.length === 0;
      });
      
      if (availableBundles.length > 0) {
        alternatives.push({
          type: 'alternative_bundles',
          title: 'باقات متوفرة بديلة',
          description: \`لدينا \${availableBundles.length} باقة متوفرة بالكامل\`,
          bundles: availableBundles,
          action: 'select_alternative'
        });
      }
      
      // Option 3: Partial bundle (target + available offers only)
      if (selectedTier && selectedTier.offers) {
        const availableOffers = selectedTier.offers.filter(offer => 
          !offer.product_data || !this.isProductCompletelyUnavailable(offer.product_data)
        );
        
        if (availableOffers.length > 0 && availableOffers.length < selectedTier.offers.length) {
          alternatives.push({
            type: 'partial_bundle',
            title: 'عرض جزئي',
            description: \`متوفر: المنتج الأساسي + \${availableOffers.length} من \${selectedTier.offers.length} منتجات العرض\`,
            availableOffers: availableOffers,
            action: 'proceed_partial'
          });
        }
      }
      
      return alternatives;
    }

    isProductCompletelyUnavailable(productData) {
      // Check if product is explicitly marked as unavailable
      if (productData.is_available === false || productData.status === 'out_of_stock') {
        return true;
      }

      // If product has no variants, check inventory properly
      if (!productData.has_variants || !productData.options || productData.options.length === 0) {
        // For simple products: only consider out of stock if inventory tracking is enabled AND quantity is 0
        if (productData.track_quantity || productData.enable_stock || productData.inventory_tracking) {
          // Stock tracking is enabled, so 0 quantity means out of stock
          return productData.quantity === 0;
        }
        // Stock tracking is disabled, so 0 quantity means unlimited stock
        return false;
      }

      // For products with variants, check if ALL variants are truly out of stock
      for (const option of productData.options) {
        if (option.values && option.values.length > 0) {
          // Check if any variant value is available (considering proper stock logic)
          const hasAvailableVariant = option.values.some(value => {
            // If explicitly marked as out of stock
            if (value.is_out_of_stock === true) {
              return false;
            }
            
            // If explicitly marked as available
            if (value.is_available === false) {
              return false;
            }
            
            // If variant has quantity info
            if (value.hasOwnProperty('quantity')) {
              // If stock tracking is enabled and quantity is 0, it's out of stock
              if (productData.track_quantity || productData.enable_stock || productData.inventory_tracking) {
                return value.quantity > 0;
              }
              // If stock tracking is disabled, any quantity (including 0) means available
              return true;
            }
            
            // Default to available if no clear stock indicators suggest otherwise
            return true;
          });
          
          if (hasAvailableVariant) {
            return false; // Product has at least one available variant
          }
        }
      }

      // All variants are out of stock
      return true;
    }

    showSallaToast(message, type = 'info') {
      // Use our custom toast that looks great and works reliably
      this.showCustomToast(message, type);
    }

    showCustomToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = \`salla-custom-toast salla-toast-\${type}\`;
      const bgColor = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6';
      const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';

      toast.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000000;
        background: \${bgColor};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 28px rgba(0,0,0,0.3);
        font-family: inherit;
        font-size: 14px;
        font-weight: 500;
        max-width: 350px;
        word-wrap: break-word;
        animation: slideInToast 0.3s ease-out;
        direction: rtl;
        display: flex;
        align-items: center;
        gap: 8px;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.1);
      \`;

      toast.innerHTML = \`<span style="font-size: 16px;">\${icon}</span><span>\${message}</span>\`;
      document.body.appendChild(toast);

      // Auto remove after 4 seconds
      setTimeout(() => {
        toast.style.animation = 'slideOutToast 0.3s ease-out';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, 4000);

      // Add CSS animations if not already added
      if (!document.getElementById('toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = \`
          @keyframes slideInToast {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes slideOutToast {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        \`;
        document.head.appendChild(style);
      }
    }

    renderVariantSelectors(productData, productId, isOffer = false) {
      if (!productData || !productData.has_variants || !productData.options || productData.options.length === 0) {
        return '';
      }

      const selectorsHtml = productData.options.map((option, optionIndex) => {
        // Use the option name exactly as configured in Salla
        const optionLabel = option.name || \`الخيار \${optionIndex + 1}\`;

        // Mark variant options as required (they usually are for cart operations)
        const isRequired = option.required || option.purpose === 'variants' || (option.values && option.values.length > 0);

        // Check if all variants are truly out of stock (using proper stock logic)
        const availableValues = option.values ? option.values.filter(value => {
          // If explicitly marked as out of stock
          if (value.is_out_of_stock === true) {
            return false;
          }
          
          // If explicitly marked as unavailable
          if (value.is_available === false) {
            return false;
          }
          
          // If variant has quantity info
          if (value.hasOwnProperty('quantity')) {
            // If stock tracking is enabled and quantity is 0, it's out of stock
            if (productData.track_quantity || productData.enable_stock || productData.inventory_tracking) {
              return value.quantity > 0;
            }
            // If stock tracking is disabled, any quantity (including 0) means available
            return true;
          }
          
          // Default to available if no clear stock indicators suggest otherwise
          return true;
        }) : [];
        
        const allOutOfStock = option.values && option.values.length > 0 && availableValues.length === 0;
        
        // Create unique selectors for offer products when same as target
        const isSameAsTarget = isOffer && productId === this.productId;
        const selectorProductId = isSameAsTarget ? \`\${productId}-offer\` : productId;
        const labelSuffix = isSameAsTarget ? ' (للهدية)' : '';

        return \`
          <div class="salla-variant-group">
            <label class="salla-variant-label \${isRequired && !allOutOfStock ? 'required' : ''}" for="variant-\${selectorProductId}-\${option.id}">
              \${optionLabel}\${labelSuffix}
              \${allOutOfStock ? '<span style="color: #ef4444; font-size: 12px;"> (جميع الخيارات نفدت)</span>' : ''}
            </label>
            <select
              id="variant-\${selectorProductId}-\${option.id}"
              class="salla-variant-select \${allOutOfStock ? 'all-out-of-stock' : ''}"
              data-variant-product="\${selectorProductId}"
              data-option-id="\${option.id}"
              data-all-out-of-stock="\${allOutOfStock}"
              data-is-offer="\${isOffer}"
              data-original-product-id="\${productId}"
              \${isRequired && !allOutOfStock ? 'required' : ''}
              \${allOutOfStock ? 'disabled' : ''}
            >
              <option value="">\${allOutOfStock ? 'غير متوفر حالياً' : \`اختر \${optionLabel}\`}</option>
              \${option.values ? option.values.map(value => {
                // Determine if this specific value is out of stock
                let isValueOutOfStock = false;
                
                if (value.is_out_of_stock === true || value.is_available === false) {
                  isValueOutOfStock = true;
                } else if (value.hasOwnProperty('quantity')) {
                  // If stock tracking is enabled and quantity is 0, it's out of stock
                  if (productData.track_quantity || productData.enable_stock || productData.inventory_tracking) {
                    isValueOutOfStock = value.quantity === 0;
                  }
                  // If stock tracking is disabled, 0 quantity means unlimited stock
                }
                
                return \`<option value="\${value.id}" \${isValueOutOfStock ? 'disabled' : ''}>\${value.name}\${isValueOutOfStock ? ' (نفد المخزون)' : ''}</option>\`;
              }).join('') : ''}
            </select>
          </div>
        \`;
      }).join('');

      return \`
        <div class="salla-variant-section">
          \${selectorsHtml}
        </div>
      \`;
    }

    trackBundleSelection(bundleData) {
      // Google Analytics 4
      if (typeof gtag === 'function') {
        gtag('event', 'select_promotion', {
          creative_name: this.bundleData.name || 'Bundle Offer',
          creative_slot: \`tier-\${bundleData.tier}\`,
          promotion_id: this.bundleData.id,
          promotion_name: this.bundleData.name
        });
      }

      // Facebook Pixel
      if (typeof fbq === 'function') {
        fbq('track', 'AddToCart', {
          content_name: this.bundleData.name || 'Bundle Offer',
          content_category: 'Bundle',
          content_ids: [this.productId],
          currency: 'SAR',
          value: bundleData.buy_quantity * 174 // Base price calculation
        });
      }

      // Snapchat Pixel
      if (typeof snaptr === 'function') {
        snaptr('track', 'ADD_CART', {
          'currency': 'SAR',
          'price': bundleData.buy_quantity * 174
        });
      }

      console.log('[Salla Bundle] Analytics tracked for bundle selection');
    }

    show() {
      if (this.modalElement) {
        this.modalElement.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    }

    hide() {
      if (this.modalElement) {
        this.modalElement.classList.remove('show');
        document.body.style.overflow = '';

        // Clear global reference
        if (window.sallaBundleModal === this) {
          window.sallaBundleModal = null;
        }

        // Remove modal after animation
        setTimeout(() => {
          if (this.modalElement && this.modalElement.parentNode) {
            this.modalElement.parentNode.removeChild(this.modalElement);
          }
        }, 300);
      }
    }
  }

  // Export to global scope
  window.SallaBundleModal = SallaBundleModal;

  // Global reference for modal instance
  window.sallaBundleModal = null;

})();
`;

  res.send(modalScript);
});

export default router;
