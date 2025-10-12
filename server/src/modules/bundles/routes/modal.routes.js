import { Router } from "express";

const router = Router();

// Bundle modal script - loaded on demand when bundle button is clicked
router.get("/modal.js", (req, res) => {
  const { store } = req.query;

  // Enable aggressive caching for better performance
  const version = "v1.0.1"; // Increment to bust cache on updates
  res.set({
    "Content-Type": "application/javascript",
    "Cache-Control": "public, max-age=3600, s-maxage=86400", // 1 hour browser, 24 hours CDN
    "ETag": `"${version}"`,
    "Access-Control-Allow-Origin": "*",
  });

  const modalScript = `
(function() {
  'use strict';

  // Load external CSS file for better caching and smaller JS bundle
  if (!document.getElementById('salla-bundle-modal-styles')) {
    const link = document.createElement('link');
    link.id = 'salla-bundle-modal-styles';
    link.rel = 'stylesheet';
    link.href = 'https://${req.get("host")}/bundle-modal.css?v=1.0.1';
    document.head.appendChild(link);
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


        const responseText = await response.text();

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
        } else {
          // Fallback: Select first bundle without unavailable products
          const availableBundle = bundleDisplayData.find(bundle => !bundle.hasUnavailableProducts);
          if (availableBundle) {
            this.selectedBundle = availableBundle.id;
          } else {
            // Last resort: Select the first bundle
            this.selectedBundle = bundleDisplayData[0].id;
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
                'جميع الباقات تحتوي على منتجات غير متوفرة حالياً. يمكنك شراء المنتج الأساسي فقط.' :
                'بعض الباقات تحتوي على منتجات غير متوفرة. ننصح باختيار الباقات المتوفرة بالكامل.'
              }
            </div>
          \` : ''}
          \${bundleDisplayData.filter(b => !b.hasUnavailableProducts).length > 0 && hasAnyUnavailableProducts ? \`
            <div style="background: #d1fae5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; margin-bottom: 12px; color: #065f46;">
              الباقات المتوفرة بالكامل: 
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
                        بعض المنتجات غير متوفرة
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
            <div class="salla-product-header">
              <img src="\${targetProductData.image || 'https://via.placeholder.com/56'}" alt="\${targetProductData.name}" class="salla-product-image" />
              <div class="salla-product-info">
                <h3 class="salla-product-name">\${targetProductData.name}</h3>
                <div class="salla-product-meta">
                  <span>الكمية: \${selectedTier.buy_quantity}</span>
                  <span>•</span>
                  <span>\${formatPrice(targetProductData.price)}</span>
                </div>
              </div>
            </div>
            \${this.renderTargetProductVariantSelectors(targetProductData, selectedTier.buy_quantity)}
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
            <h3>هداياك المجانية</h3>
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
            <span style="font-size: 12px; color: white; font-weight: 600; margin-top: 4px;">نفد المخزون</span>
          </div>
        </div>
      \` : '';

      return \`
        <div class="\${cardClass}">
          <div class="salla-gift-image" style="background-image: url('\${productImage}'); background-size: cover; background-position: center; min-height: 120px; position: relative;">
            <!-- <img src="\${productImage}" alt="\${productName}" style="width: 100%; height: 120px; object-fit: cover; display: block; \${isUnavailable ? 'filter: grayscale(100%) opacity(0.5);' : ''}" /> -->
            \${overlayElement}
          </div>
          <div class="salla-gift-content">
            <div class="salla-gift-badges">
              <span class="salla-gift-badge" style="\${isUnavailable ? 'background: #fee2e2; color: #dc2626; border-color: #fecaca;' : ''}">\${badgeText}</span>
              <span class="salla-gift-free" style="\${isUnavailable ? 'color: #dc2626;' : ''}">\${statusText}</span>
            </div>
            <div class="salla-gift-title" style="\${isUnavailable ? 'color: #9ca3af;' : ''}">\${productName}</div>
            \${priceDisplay}
            \${this.renderCompactVariantSelectors(offer.product_data, offer.product_id, true)}
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

        // Validate Salla SDK is available
        if (!window.salla) {
          alert('عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى.');
          return;
        }

        // Get selected bundle data
        const selectedBundleData = this.getSelectedBundleData();
        if (!selectedBundleData) {
          alert('يرجى اختيار باقة أولاً');
          return;
        }
        // Validate required variants are selected
        const bundleConfig = this.bundleData.data || this.bundleData;
        const targetProductData = bundleConfig.target_product_data;

        // Check for products that are completely unavailable (all variants out of stock)
        const unavailableProducts = this.getUnavailableProducts(bundleConfig, selectedBundleData.tier);
        if (unavailableProducts.length > 0) {
          
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

        
        // Force a complete re-validation - selectedBundleData IS the tier object
        const missingVariants = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData);

        if (missingVariants.length > 0) {

          // Create detailed error message listing missing variants
          const missingDetails = missingVariants.map(mv => \`\${mv.productName}: \${mv.optionName}\`).join('، ');
          const errorMessage = \`يجب اختيار الخيارات التالية أولاً: \${missingDetails}\`;

          // Show error toast
          this.showSallaToast(errorMessage, 'error');

          // Highlight all missing variants with persistent red outline
          this.highlightMissingVariants(missingVariants);

          // Scroll to and flash the first missing variant
          const firstMissing = missingVariants[0];
          this.scrollToVariantInputAggressively(firstMissing.selectorProductId || firstMissing.productId, firstMissing.optionId);
          this.flashMissingVariant(firstMissing.selectorProductId || firstMissing.productId, firstMissing.optionId);

          // ABSOLUTELY NO CART NAVIGATION OR API CALLS
          return false; // Block everything
        }


        // Track analytics before checkout
        this.trackBundleSelection(selectedBundleData);

        // Show loading state
        this.showSallaToast('جارٍ إضافة المنتجات إلى السلة...', 'info');

        try {
          const addedProducts = []; 
          
          // Add target products (main product) - these are the products user is buying
          const targetQuantity = selectedBundleData.buy_quantity || 1;

          const targetOptions = bundleConfig.target_product_data && bundleConfig.target_product_data.has_variants ?
            this.getSelectedVariantOptions(this.productId) : {};


          // Double-check target product availability before adding
          if (bundleConfig.target_product_data && this.isProductCompletelyUnavailable(bundleConfig.target_product_data)) {
            throw new Error(\`Target product \${bundleConfig.target_product_data.name} is completely out of stock\`);
          }

          // Add target product(s) to cart
          for (let i = 0; i < targetQuantity; i++) {
            // If multiple quantities, get options for each specific quantity selector
            let targetOptionsForThisQuantity;
            if (targetQuantity > 1 && bundleConfig.target_product_data && bundleConfig.target_product_data.has_variants) {
              const productIdWithIndex = \`\${this.productId}-qty\${i+1}\`;
              targetOptionsForThisQuantity = this.getSelectedVariantOptions(productIdWithIndex);
            } else {
              targetOptionsForThisQuantity = targetOptions;
            }

            const targetCartItem = {
              id: this.productId,
              quantity: 1,
              options: targetOptionsForThisQuantity
            };

            await window.salla.cart.addItem(targetCartItem);
            addedProducts.push({
              name: bundleConfig.target_product_data.name,
              type: 'target',
              quantity: 1
            });
          }
          

          // Track successful and failed offer additions
          const successfulOffers = [];
          const failedOffers = [];

     
          if (selectedBundleData.offers && selectedBundleData.offers.length > 0) {

            for (const offer of selectedBundleData.offers) {

              // Check if product is completely unavailable
              const isUnavailable = offer.product_data && this.isProductCompletelyUnavailable(offer.product_data);

              if (isUnavailable) {
                failedOffers.push({
                  ...offer,
                  reason: 'out_of_stock'
                });
                continue;
              }

              try {

                const offerOptions = offer.product_data && offer.product_data.has_variants ?
                  this.getSelectedOfferVariantOptions(offer.product_id) : {};


                // Add ALL offer products to cart (including FREE ones)
                const addToCartParams = {
                  id: offer.product_id,
                  quantity: offer.quantity || 1,
                  options: offerOptions
                };


                await window.salla.cart.addItem(addToCartParams);

                successfulOffers.push(offer);
                addedProducts.push({
                  name: offer.product_name,
                  type: 'discounted',
                  quantity: offer.quantity || 1,
                  discount: offer.discount_type,
                  discountAmount: offer.discount_amount
                });

              } catch (offerError) {
                failedOffers.push({
                  ...offer,
                  reason: 'add_to_cart_failed',
                  error: offerError.message
                });
              }
            }

          } else {
            //console.log(\`[Salla Bundle] No offers found in selected tier\`);
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

          this.showSallaToast(successMessage, failedOffers.length > 0 ? 'warning' : 'success');

        } catch (error) {

          if (error.message && (error.message.includes('options') || error.message.includes('variant') || error.message.includes('required'))) {
            const missingVariants = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData);
            if (missingVariants.length > 0) {
              this.showSallaToast('يجب اختيار جميع الخيارات المطلوبة قبل المتابعة', 'error');
              this.highlightMissingVariants(missingVariants);
              const firstMissing = missingVariants[0];
              this.scrollToVariantInput(firstMissing.selectorProductId || firstMissing.productId, firstMissing.optionId);
              return; // BLOCK - NO CART NAVIGATION
            }
          }

          this.showSallaToast('حدث خطأ في إضافة بعض المنتجات', 'error');
          return; // BLOCK - Don't navigate to cart on error
        }

        // FINAL CHECK before navigation
        const finalVariantCheck = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData);
        if (finalVariantCheck.length > 0) {
          this.showSallaToast('لا يمكن المتابعة بدون اختيار جميع الخيارات', 'error');
          this.highlightMissingVariants(finalVariantCheck);
          return;
        }

        const currentPath = window.location.pathname;
        const pathMatch = currentPath.match(/^(\\/[^/]+\\/)/);
        const basePath = pathMatch ? pathMatch[1] : '/';
        const cartUrl = \`\${window.location.origin}\${basePath}cart\`;

         // console.log('[Salla Bundle] Navigating to cart:', cartUrl);
        window.location.href = cartUrl;

      } catch (error) {
        this.showSallaToast('حدث خطأ. يرجى المحاولة مرة أخرى.', 'error');
        return; 
      }
    }

    getSelectedBundleData() {
      const bundleConfig = this.bundleData.data || this.bundleData;
      const bundles = bundleConfig.bundles || [];

      // Find selected tier
      const tierNumber = this.selectedBundle ? parseInt(this.selectedBundle.replace('tier-', '')) : 1;
      const selectedTier = bundles.find(tier => tier.tier === tierNumber);
      
 
      return selectedTier;
    }

    getSelectedVariantOptions(productId) {
      const options = {};
      const selectors = document.querySelectorAll(\`[data-variant-product="\${productId}"]\`);

      
      const allSelectors = document.querySelectorAll('select[data-variant-product], select[data-option-id]');

      selectors.forEach((selector, index) => {
        const optionId = selector.getAttribute('data-option-id');
        const value = selector.value;
        
        if (value && value !== '') {
          options[optionId] = value;
        }
      });

      return options;
    }

    getSelectedOfferVariantOptions(productId) {
      const options = {};

      // Check if this is the same product as target (needs offer-specific selectors)
      const isSameAsTarget = productId === this.productId;
      const selectorProductId = isSameAsTarget ? \`\${productId}-offer\` : productId;

    

      const selectors = document.querySelectorAll(\`[data-variant-product="\${selectorProductId}"]\`);


      selectors.forEach((selector, index) => {
        const optionId = selector.getAttribute('data-option-id');
        const value = selector.value;
        const selectId = selector.id;

    
        if (value && value !== '') {
          options[optionId] = value;
        }
      });

      return options;
    }

    validateRequiredVariants(productData, selectedOptions) {
      if (!productData || !productData.options) return true;

      for (const option of productData.options) {
        if (option.required && (!selectedOptions[option.id] || selectedOptions[option.id] === '')) {
          return false;
        }
      }

      return true;
    }

    findMissingRequiredVariant(productData, selectedOptions) {
      if (!productData || !productData.options) {
        return null;
      }


      // Find the first missing required option
      for (const option of productData.options) {
        
        // Check if all variants are truly out of stock (using proper stock logic)
        const availableValues = option.values ? option.values.filter(value => {

          if (value.is_out_of_stock === true) {
            return false;
          }
          
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

        // Skip validation for options that are completely out of stock
        if (allOutOfStock) {
          continue;
        }

        // ALWAYS consider variant options as required - this is key for Salla products
        const isRequired = option.required ||
                          option.purpose === 'variants' ||
                          (option.values && option.values.length > 0);


        const isOptionMissing = !selectedOptions[option.id] || selectedOptions[option.id] === '' || selectedOptions[option.id] === null;
        
        if (isRequired && isOptionMissing) {
          return option;
        }
      }

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
      const inputId = \`#variant-\${productId}-\${optionId}\`;
      console.log(\`[Scroll] Looking for element: \${inputId}\`);

      const input = document.querySelector(inputId);

      if (!input) {
        console.error(\`[Scroll] Element not found: \${inputId}\`);
        console.log('[Scroll] Available variant selects:',
          Array.from(document.querySelectorAll('[data-variant-product]')).map(el => ({
            id: el.id,
            productId: el.getAttribute('data-variant-product'),
            optionId: el.getAttribute('data-option-id')
          }))
        );
        return;
      }

      console.log(\`[Scroll] Found element, scrolling to: \${inputId}\`);

      // First scroll to top of modal to ensure we scroll to the right position
      const modalBody = document.querySelector('.salla-bundle-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
      }

      // Wait a bit then scroll to the input
      setTimeout(() => {
        input.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });

        // Focus after scrolling
        setTimeout(() => {
          input.focus();
          console.log(\`[Scroll] Focused on element: \${inputId}\`);

          // Also try to open the select dropdown
          if (input.tagName === 'SELECT') {
            try {
              input.showPicker(); // Modern browsers
              console.log('[Scroll] Opened select dropdown');
            } catch (e) {
              console.log('[Scroll] Could not open dropdown (browser limitation)');
            }
          }
        }, 600);
      }, 200);
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


      if (bundleConfig.target_product_data && bundleConfig.target_product_data.has_variants) {

        if (selectedTier.buy_quantity > 1) {
          for (let i = 1; i <= selectedTier.buy_quantity; i++) {
            const productIdWithIndex = \`\${bundleConfig.target_product_id}-qty\${i}\`;
            const targetOptions = this.getSelectedVariantOptions(productIdWithIndex);

            const missingOption = this.findMissingRequiredVariant(bundleConfig.target_product_data, targetOptions);
            if (missingOption) {
              missing.push({
                productId: bundleConfig.target_product_id,
                selectorProductId: productIdWithIndex, // The actual selector ID in DOM
                optionId: missingOption.id,
                optionName: missingOption.name,
                productName: bundleConfig.target_product_data.name + \` (رقم \${i})\`,
                isOffer: false
              });
            }
          }
        } else {
          // Single quantity - check normally
          const targetOptions = this.getSelectedVariantOptions(bundleConfig.target_product_id);

          const missingOption = this.findMissingRequiredVariant(bundleConfig.target_product_data, targetOptions);
          if (missingOption) {
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
      }

      
      if (selectedTier.offers && selectedTier.offers.length > 0) {
        
        for (const offer of selectedTier.offers) {
          
          if (offer.product_data && offer.product_data.has_variants) {
            const offerOptions = this.getSelectedOfferVariantOptions(offer.product_id);
            
            const missingOption = this.findMissingRequiredVariant(offer.product_data, offerOptions);
            if (missingOption) {
              
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
              //nth
              }
          } else {
            //nth
          }
        }
      } else {
          //nth
      }

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
      const icon = type === 'error' ? '×' : type === 'success' ? '✓' : 'i';

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

    renderTargetProductVariantSelectors(productData, buyQuantity) {
      if (!productData || !productData.has_variants || !productData.options || productData.options.length === 0) {
        return '';
      }

      // If buying only 1, render compact inline selectors
      if (buyQuantity === 1) {
        return this.renderCompactVariantSelectors(productData, this.productId, false);
      }

      // If buying multiple, render accordion-style selectors for each quantity
      const quantitySelectorsHtml = Array.from({ length: buyQuantity }, (_, index) => {
        const quantityNum = index + 1;
        const productIdWithIndex = \`\${this.productId}-qty\${quantityNum}\`;
        const accordionId = \`accordion-\${productIdWithIndex}\`;
        const isFirst = index === 0;

        return \`
          <div class="salla-quantity-accordion">
            <div class="salla-quantity-header \${isFirst ? 'active' : ''}" onclick="window.sallaBundleModal.toggleAccordion('\${accordionId}')">
              <div class="salla-quantity-header-title">
                <span class="salla-quantity-badge">#\${quantityNum}</span>
                <span>المنتج رقم \${quantityNum}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="salla-quantity-status incomplete" id="status-\${accordionId}">لم يُختر</span>
                <span class="salla-quantity-arrow">▼</span>
              </div>
            </div>
            <div class="salla-quantity-body \${isFirst ? 'active' : ''}" id="\${accordionId}">
              \${this.renderCompactVariantSelectors(productData, productIdWithIndex, false)}
            </div>
          </div>
        \`;
      }).join('');

      // Add accordion toggle script
      setTimeout(() => {
        if (window.sallaBundleModal) {
          window.sallaBundleModal.initializeAccordionValidation(buyQuantity);
        }
      }, 100);

      return quantitySelectorsHtml;
    }

    toggleAccordion(accordionId) {
      const header = document.querySelector(\`[onclick*="\${accordionId}"]\`);
      const body = document.getElementById(accordionId);

      if (header && body) {
        const isActive = body.classList.contains('active');

        // Toggle active state
        if (isActive) {
          header.classList.remove('active');
          body.classList.remove('active');
        } else {
          header.classList.add('active');
          body.classList.add('active');
        }
      }
    }

    initializeAccordionValidation(buyQuantity) {
      // Monitor variant selection changes and update accordion status
      for (let i = 1; i <= buyQuantity; i++) {
        const productIdWithIndex = \`\${this.productId}-qty\${i}\`;
        const accordionId = \`accordion-\${productIdWithIndex}\`;
        const selectors = document.querySelectorAll(\`[data-variant-product="\${productIdWithIndex}"]\`);

        selectors.forEach(select => {
          select.addEventListener('change', () => {
            this.updateAccordionStatus(accordionId, productIdWithIndex);
          });
        });

        // Initial status check
        this.updateAccordionStatus(accordionId, productIdWithIndex);
      }
    }

    updateAccordionStatus(accordionId, productId) {
      const statusEl = document.getElementById(\`status-\${accordionId}\`);
      if (!statusEl) return;

      const selectors = document.querySelectorAll(\`[data-variant-product="\${productId}"]\`);
      const allSelected = Array.from(selectors).every(s => s.value && s.value !== '');

      if (allSelected && selectors.length > 0) {
        statusEl.textContent = '✓ تم الاختيار';
        statusEl.classList.remove('incomplete');
      } else {
        statusEl.textContent = 'لم يُختر';
        statusEl.classList.add('incomplete');
      }
    }

    renderCompactVariantSelectors(productData, productId, isOffer = false) {
      if (!productData || !productData.has_variants || !productData.options || productData.options.length === 0) {
        return '';
      }

      const isSameAsTarget = isOffer && productId === this.productId;
      const selectorProductId = isSameAsTarget ? \`\${productId}-offer\` : productId;

      const selectorsHtml = productData.options.map((option, optionIndex) => {
        const optionLabel = option.name || \`الخيار \${optionIndex + 1}\`;
        const isRequired = option.required || option.purpose === 'variants' || (option.values && option.values.length > 0);

        const availableValues = option.values ? option.values.filter(value => {
          if (value.is_out_of_stock === true || value.is_available === false) return false;
          if (value.hasOwnProperty('quantity')) {
            if (productData.track_quantity || productData.enable_stock || productData.inventory_tracking) {
              return value.quantity > 0;
            }
            return true;
          }
          return true;
        }) : [];

        const allOutOfStock = option.values && option.values.length > 0 && availableValues.length === 0;

        return \`
          <div class="salla-variant-compact-group">
            <label class="salla-variant-compact-label \${isRequired && !allOutOfStock ? 'required' : ''}" for="variant-\${selectorProductId}-\${option.id}">
              \${optionLabel}
            </label>
            <select
              id="variant-\${selectorProductId}-\${option.id}"
              class="salla-variant-compact-select \${allOutOfStock ? 'all-out-of-stock' : ''}"
              data-variant-product="\${selectorProductId}"
              data-option-id="\${option.id}"
              data-all-out-of-stock="\${allOutOfStock}"
              data-is-offer="\${isOffer}"
              data-original-product-id="\${productId}"
              \${isRequired && !allOutOfStock ? 'required' : ''}
              \${allOutOfStock ? 'disabled' : ''}
            >
              <option value="">\${allOutOfStock ? 'غير متوفر' : \`اختر \${optionLabel}\`}</option>
              \${option.values ? option.values.map(value => {
                let isValueOutOfStock = false;

                if (value.is_out_of_stock === true || value.is_available === false) {
                  isValueOutOfStock = true;
                } else if (value.hasOwnProperty('quantity')) {
                  if (productData.track_quantity || productData.enable_stock || productData.inventory_tracking) {
                    isValueOutOfStock = value.quantity === 0;
                  }
                }

                return \`<option value="\${value.id}" \${isValueOutOfStock ? 'disabled' : ''}>\${value.name}\${isValueOutOfStock ? ' (نفد)' : ''}</option>\`;
              }).join('') : ''}
            </select>
          </div>
        \`;
      }).join('');

      return \`<div class="salla-variant-compact">\${selectorsHtml}</div>\`;
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
