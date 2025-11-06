import { Router } from "express";

const router = Router();

router.get("/modal.js", (req, res) => {
  res.set({
    "Content-Type": "application/javascript",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Access-Control-Allow-Origin": "*",
  });

  const modalScript = `
(function() {
  'use strict';

  const loadModalCSS = () => {
    return new Promise((resolve, reject) => {
      const cssId = 'salla-bundle-modal-styles';
      const existing = document.getElementById(cssId);
      
      if (existing) {
        resolve(); // Already loaded
        return;
      }
      
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://${req.get("host")}/css/modal-bundle.css';
      
      link.onload = () => resolve();
      link.onerror = () => {
        console.error('Failed to load modal CSS from:', link.href);
        reject(new Error('CSS load failed'));
      };
      
      document.head.appendChild(link);
    });
  };

  loadModalCSS().catch(err => console.error('Modal CSS error:', err));

  const riyalSvgIcon = \`<svg width="12" height="14" viewBox="0 0 1124.14 1256.39" fill="currentColor" style="display: inline-block; vertical-align: middle; margin: 0 2px;">
    <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"/>
    <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"/>
  </svg>\`;

  function formatPrice(price) {
    const numPrice = parseFloat(price) || 0;
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numPrice);
    return formatted + '&nbsp;' + riyalSvgIcon;
  }

  class SallaBundleModal {
    static dataCache = {
      timerSettings: null,
      reviews: null,
      paymentMethods: null,
      bundleData: {} 
    };

    static isPreloading = false;
    static preloadPromise = null;

    static feedbackSystem = {
      audioContext: null,
      sounds: {
        click: null,
        progress: null,
        complete: null,
        success: null
      },
      initAudio() {
        if (this.audioContext) return;

        try {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          this.createSounds();
        } catch (e) {
          console.log('Audio not supported:', e);
        }
      },

      createSounds() {
        this.sounds.click = () => this.playTone(800, 0.05, 'sine', 0.1);

        this.sounds.progress = () => {
          this.playTone(600, 0.1, 'square', 0.05);
          setTimeout(() => this.playTone(800, 0.1, 'square', 0.05), 50);
        };

        this.sounds.complete = () => {
          this.playTone(523, 0.15, 'sine', 0.2); 
          setTimeout(() => this.playTone(659, 0.15, 'sine', 0.2), 100); // E5
          setTimeout(() => this.playTone(784, 0.2, 'sine', 0.3), 200); // G5
        };
        this.sounds.success = () => {
          this.playTone(523, 0.1, 'triangle', 0.15); 
          setTimeout(() => this.playTone(659, 0.1, 'triangle', 0.15), 75); // E5
          setTimeout(() => this.playTone(784, 0.1, 'triangle', 0.15), 150); // G5
          setTimeout(() => this.playTone(1047, 0.2, 'triangle', 0.25), 225); // C6
        };
      },

      playTone(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
      },
      triggerHaptic(type = 'light') {
        // iOS Haptic Engine API (iOS 10+)
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptic) {
          try {
            const hapticTypes = {
              light: 'impact-light',
              medium: 'impact-medium',
              heavy: 'impact-heavy',
              success: 'notification-success',
              progress: 'selection',
              click: 'selection',
              complete: 'notification-success'
            };
            window.webkit.messageHandlers.haptic.postMessage(hapticTypes[type] || 'impact-light');
          } catch (e) {
            console.log('iOS haptic not available:', e);
          }
        }
        
        // Try Haptic API for newer iOS devices
        if (window.navigator && typeof window.navigator.vibrate === 'function') {
          const patterns = {
            light: [10],
            medium: [50],
            heavy: [100],
            success: [50, 50, 50, 50, 100],
            progress: [20],
            click: [10],
            complete: [100, 50, 100]
          };

          try {
            window.navigator.vibrate(patterns[type] || patterns.light);
          } catch (e) {
            console.log('Vibration not supported:', e);
          }
        }
        
        // Try AudioContext for subtle haptic simulation on iOS Safari
        if (!window.navigator.vibrate && window.AudioContext) {
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 10;
            gainNode.gain.setValueAtTime(0.00001, audioContext.currentTime);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.01);
          } catch (e) {
            // Silent fail for haptic simulation
          }
        }
      },
      triggerFeedback(type) {
        // Audio removed - keeping haptic feedback only
        const actions = {
          click: () => {
            this.triggerHaptic('click');
          },
          progress: () => {
            this.triggerHaptic('progress');
          },
          complete: () => {
            this.triggerHaptic('complete');
          },
          success: () => {
            this.triggerHaptic('success');
          }
        };

        actions[type]?.();
      }
    };
    static preloadPromise = null;

    constructor(productId, contextData = {}) {
      this.productId = productId;
      this.contextData = contextData;
      this.storeDomain = contextData.storeDomain || contextData;
      this.apiUrl = 'https://${req.get("host")}/api/v1';
      this.bundleData = null;
      this.modalElement = null;
      this.selectedBundle = null;
      this.isInitializing = false; 

      this.feedbackInitialized = false;
      this.initializeFeedbackOnFirstInteraction();

      this.currentStep = 1;
      this.totalSteps = 5;
      this.stepLabels = [
        'اختر الباقة',
        'الخيارات',
        'إختر هداياك',
        'المنتجات المخفضة',
        'الفاتورة'
      ];

      this.initializeFeatureState();
    }

    initializeFeedbackOnFirstInteraction() {
      const initFeedback = (e) => {
        if (!this.feedbackInitialized) {
          SallaBundleModal.feedbackSystem.initAudio();
          this.feedbackInitialized = true;
          document.removeEventListener('click', initFeedback);
          document.removeEventListener('touchstart', initFeedback);
          document.removeEventListener('keydown', initFeedback);
        }
      };

      document.addEventListener('click', initFeedback, { once: true });
      document.addEventListener('touchstart', initFeedback, { once: true });
      document.addEventListener('keydown', initFeedback, { once: true });
    }

    triggerFeedback(type) {
      try {
        SallaBundleModal.feedbackSystem.triggerFeedback(type);
      } catch (e) {
        console.log('Feedback system error:', e);
      }
    }

    triggerHaptic(type = 'light') {
      // iOS Haptic Engine API (iOS 10+)
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptic) {
        try {
          const hapticTypes = {
            light: 'impact-light',
            medium: 'impact-medium',
            heavy: 'impact-heavy',
            success: 'notification-success',
            progress: 'selection',
            click: 'selection',
            complete: 'notification-success'
          };
          window.webkit.messageHandlers.haptic.postMessage(hapticTypes[type] || 'impact-light');
        } catch (e) {
          console.log('iOS haptic not available:', e);
        }
      }
      
      // Try Haptic API for newer iOS devices
      if (window.navigator && typeof window.navigator.vibrate === 'function') {
        const patterns = {
          light: [10],
          medium: [50],
          heavy: [100],
          success: [50, 50, 50, 50, 100],
          progress: [20],
          click: [10],
          complete: [100, 50, 100]
        };

        try {
          window.navigator.vibrate(patterns[type] || patterns.light);
        } catch (e) {
          console.log('Vibration not supported:', e);
        }
      }
      
      // Try AudioContext for subtle haptic simulation on iOS Safari
      if (!window.navigator.vibrate && window.AudioContext) {
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 10;
          gainNode.gain.setValueAtTime(0.00001, audioContext.currentTime);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.01);
        } catch (e) {
          // Silent fail for haptic simulation
        }
      }
    }

    setupGlobalFeedbackListeners() {
      if (!this.modalElement) return;

      const buttons = this.modalElement.querySelectorAll('button, .salla-bundle-button, .salla-step-btn, .salla-checkout-button');
      buttons.forEach(button => {
        if (!button.hasFeedbackListener) {
          button.addEventListener('click', (e) => {
            if (!e.target.classList.contains('salla-bundle-close')) {
              this.triggerFeedback('click');
            }
          });
          button.hasFeedbackListener = true;
        }
      });

      const bundleCards = this.modalElement.querySelectorAll('.salla-bundle-card, .salla-bundle-card-compact');
      bundleCards.forEach(card => {
        if (!card.hasFeedbackListener) {
          card.addEventListener('click', () => {
            this.triggerFeedback('click');
          });
          card.hasFeedbackListener = true;
        }
      });

      const selectableItems = this.modalElement.querySelectorAll('.salla-gift-card, .salla-discounted-card, .salla-review-dot');
      selectableItems.forEach(item => {
        if (!item.hasFeedbackListener) {
          item.addEventListener('click', () => {
            this.triggerFeedback('click');
          });
          item.hasFeedbackListener = true;
        }
      });

      const toggles = this.modalElement.querySelectorAll('.salla-summary-toggle, .salla-discount-header');
      toggles.forEach(toggle => {
        if (!toggle.hasFeedbackListener) {
          toggle.addEventListener('click', () => {
            this.triggerFeedback('click');
          });
          toggle.hasFeedbackListener = true;
        }
      });

      const navButtons = this.modalElement.querySelectorAll('button[aria-label]');
      navButtons.forEach(button => {
        if (!button.hasFeedbackListener) {
          button.addEventListener('click', () => {
            this.triggerFeedback('click');
          });
          button.hasFeedbackListener = true;
        }
      });
    }

    initializeFeatureState() {
      this.timerSettings = null;
      this.timerEndTime = null;
      this.timerInterval = null;
      this.reviews = [];
      this.paymentMethods = [];
      this.currentReviewIndex = 0;
      this.reviewsInterval = null;
      this.modernReviewsInterval = null;
      this.discountCode = '';
      this.appliedDiscount = null;
    }

    static async preloadGlobalData(storeId, storeDomain) {
      if (SallaBundleModal.isPreloading) {
        return SallaBundleModal.preloadPromise;
      }

      SallaBundleModal.isPreloading = true;
      SallaBundleModal.preloadPromise = (async () => {
        try {
          const apiUrl = 'https://${req.get("host")}/api/v1';
          const storeIdentifier = storeId || storeDomain;

          const [timerResult, reviewsResult, paymentResult] = await Promise.allSettled([
            fetch(\`\${apiUrl}/timer-settings/\${storeIdentifier}\`, {
              headers: { 'ngrok-skip-browser-warning': 'true' }
            }).then(r => r.ok ? r.json() : null),

            fetch(\`\${apiUrl}/storefront/stores/\${storeIdentifier}/reviews?limit=10\`, {
              headers: { 'ngrok-skip-browser-warning': 'true' }
            }).then(r => r.ok ? r.json() : null),

            fetch(\`\${apiUrl}/storefront/stores/\${storeIdentifier}/payment-methods\`, {
              headers: { 'ngrok-skip-browser-warning': 'true' }
            }).then(r => r.ok ? r.json() : null)
          ]);

          if (timerResult.status === 'fulfilled' && timerResult.value) {
            SallaBundleModal.dataCache.timerSettings = timerResult.value.data;
          }

          if (reviewsResult.status === 'fulfilled' && reviewsResult.value) {
            SallaBundleModal.dataCache.reviews = reviewsResult.value.data || [];
          }

          if (paymentResult.status === 'fulfilled' && paymentResult.value) {
            SallaBundleModal.dataCache.paymentMethods = paymentResult.value.data || [];
          }

        } catch (error) {
          console.error('[Bundle Modal] Preload failed:', error);
        } finally {
          SallaBundleModal.isPreloading = false;
        }
      })();

      return SallaBundleModal.preloadPromise;
    }

    static async preloadBundleData(productId, storeId, storeDomain, customerId) {
      try {
        if (SallaBundleModal.dataCache.bundleData[productId]) {
          return SallaBundleModal.dataCache.bundleData[productId];
        }

        const apiUrl = 'https://${req.get("host")}/api/v1';
        const params = new URLSearchParams();

        if (storeId) {
          params.append('store', storeId);
        } else if (storeDomain) {
          params.append('store', storeDomain);
        }

        if (customerId) {
          params.append('customer_id', customerId);
        }

        const response = await fetch(\`\${apiUrl}/storefront/bundles/\${productId}?\${params}\`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'X-Store-Domain': storeDomain || '',
            'X-Store-ID': storeId || '',
            'X-Customer-ID': customerId || ''
          }
        });

        if (response.ok) {
          const responseText = await response.text();
          const bundleData = JSON.parse(responseText);

          SallaBundleModal.dataCache.bundleData[productId] = bundleData;

          return bundleData;
        }

        return null;
      } catch (error) {
        console.error('[Bundle Modal] Bundle preload failed:', error);
        return null;
      }
    }

    async initialize() {
      try {
        
        if (SallaBundleModal.preloadPromise) {
          await SallaBundleModal.preloadPromise;
        }


        if (SallaBundleModal.dataCache.timerSettings) {
          this.timerSettings = SallaBundleModal.dataCache.timerSettings;
          if (this.timerSettings && this.timerSettings.enabled) {
            const duration = this.timerSettings.duration || 21600;
            this.timerEndTime = Date.now() + (duration * 1000);
          }
        }

        if (SallaBundleModal.dataCache.reviews && SallaBundleModal.dataCache.reviews.length > 0) {
          this.reviews = SallaBundleModal.dataCache.reviews;
        }

        if (SallaBundleModal.dataCache.paymentMethods && SallaBundleModal.dataCache.paymentMethods.length > 0) {
          this.paymentMethods = SallaBundleModal.dataCache.paymentMethods;
        }


        
        if (window.__SALLA_BUNDLE_CACHE__ && window.__SALLA_BUNDLE_CACHE__[\`product_\${this.productId}\`]) {
          this.bundleData = window.__SALLA_BUNDLE_CACHE__[\`product_\${this.productId}\`];
          SallaBundleModal.dataCache.bundleData[this.productId] = this.bundleData;
        } else if (SallaBundleModal.dataCache.bundleData[this.productId]) {
          this.bundleData = SallaBundleModal.dataCache.bundleData[this.productId];
        } else {
          const params = new URLSearchParams();

          if (this.contextData.storeId) {
            params.append('store', this.contextData.storeId);
          } else if (this.storeDomain) {
            params.append('store', this.storeDomain);
          }

          if (this.contextData.customerId) {
            params.append('customer_id', this.contextData.customerId);
          }

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
            
            // Check if bundle data is valid
            if (!this.bundleData || (!this.bundleData.data && !this.bundleData.bundles)) {
              throw new Error('No bundle offers found for this product');
            }
            
            SallaBundleModal.dataCache.bundleData[this.productId] = this.bundleData;
            console.log('[Modal] Bundle data fetched and cached');
          } catch (jsonError) {
            console.error('[Salla Bundle Modal] JSON parse error:', jsonError);
            console.error('[Salla Bundle Modal] Response text:', responseText);
            throw new Error(\`Invalid JSON response: \${jsonError.message}\`);
          }
        }

        const bundleConfig = this.bundleData.data || this.bundleData;
        
        // Validate that we have bundle offers
        if (!bundleConfig || !bundleConfig.bundles || bundleConfig.bundles.length === 0) {
          throw new Error('No active bundle offers available for this product');
        }
        if (bundleConfig.settings && bundleConfig.settings.timer) {
          this.timerSettings = {
            enabled: bundleConfig.settings.timer.enabled,
            duration: bundleConfig.settings.timer.duration || 21600,
            duration_type: bundleConfig.settings.timer.duration_type || '6h',
            auto_restart: bundleConfig.settings.timer.auto_restart ?? true,
            effect: bundleConfig.settings.timer.effect || 'pulse',
            style: {
              text_color: bundleConfig.settings.timer.text_color || '#0E1012',
              bg_color: bundleConfig.settings.timer.bg_color || '#FFFFFF',
              border_color: bundleConfig.settings.timer.border_color || '#E5E8EC',
              border_radius: bundleConfig.settings.timer.border_radius || 12,
              label: bundleConfig.settings.timer.label || 'عرض محدود ينتهي خلال',
              label_color: bundleConfig.settings.timer.label_color || '#60646C',
              font_size: bundleConfig.settings.timer.font_size || 14,
            }
          };

          if (this.timerSettings && this.timerSettings.enabled) {
            const duration = this.timerSettings.duration || 21600;
            this.timerEndTime = Date.now() + (duration * 1000);
          }
        }

        this.createModal();

      } catch (error) {
        console.error('[Salla Bundle Modal] Initialization failed:', error);
        console.error('[Salla Bundle Modal] Error details:', {
          message: error.message,
          productId: this.productId,
          storeDomain: this.storeDomain,
          storeId: this.contextData?.storeId,
          hasCache: !!SallaBundleModal.dataCache.bundleData[this.productId]
        });
        throw error;
      }
    }

    async fetchTimerSettings() {
      try {
        const storeId = this.contextData.storeId || this.storeDomain;
        const response = await fetch(\`\${this.apiUrl}/timer-settings/\${storeId}\`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        
        if (response.ok) {
          const result = await response.json();
          this.timerSettings = result.data;
          
          if (this.timerSettings && this.timerSettings.enabled) {
            const duration = this.timerSettings.duration || 21600; // Default 6 hours
            this.timerEndTime = Date.now() + (duration * 1000);
          }
        }
      } catch (error) {
        console.error('[Timer] Fetch failed:', error);
      }
    }

    async fetchReviews() {
      try {
        const storeId = this.contextData.storeId || this.storeDomain;
        const productId = this.productId || '';
        const productParam = productId ? \`&product_id=\${productId}\` : '';
        const response = await fetch(\`\${this.apiUrl}/storefront/stores/\${storeId}/reviews?limit=10\${productParam}\`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        
        if (response.ok) {
          const result = await response.json();
          this.reviews = result.data || [];
        }
      } catch (error) {
        console.error('[Reviews] Fetch failed:', error);
      }
    }

    hideSwalToasts() {
      // Remove Swal body classes
      document.body.classList.remove('swal2-shown', 'swal2-toast-shown', 'swal2-height-auto');
      document.documentElement.classList.remove('swal2-shown', 'swal2-toast-shown', 'swal2-height-auto');
      
      // Hide SweetAlert2 toasts
      if (window.Swal && typeof window.Swal.close === 'function') {
        window.Swal.close();
      }
      
      // Hide any visible Swal toast containers
      const swalContainers = document.querySelectorAll('.swal2-container, .swal2-popup, .swal2-toast');
      swalContainers.forEach(container => {
        if (container) {
          container.style.display = 'none';
          container.style.opacity = '0';
          container.style.visibility = 'hidden';
          container.remove(); // Completely remove from DOM
        }
      });
      
      // Hide Salla's toast notifications as well
      const sallaToasts = document.querySelectorAll('.s-alert, .s-toast, [class*="toast"], [class*="notification"]');
      sallaToasts.forEach(toast => {
        if (toast && toast.classList.contains('swal2-show')) {
          toast.style.display = 'none';
          toast.style.opacity = '0';
          toast.style.visibility = 'hidden';
        }
      });
      
      // Store original Swal fire method
      if (window.Swal && window.Swal.fire && !this.originalSwalFire) {
        this.originalSwalFire = window.Swal.fire.bind(window.Swal);
        
        // Override Swal.fire to prevent toasts while modal is open
        window.Swal.fire = (...args) => {
          // Remove body classes immediately if Swal tries to add them
          setTimeout(() => {
            document.body.classList.remove('swal2-shown', 'swal2-toast-shown', 'swal2-height-auto');
            document.documentElement.classList.remove('swal2-shown', 'swal2-toast-shown', 'swal2-height-auto');
          }, 0);
          return Promise.resolve({ isConfirmed: false, isDismissed: true });
        };
      }
      
      if (window.salla && window.salla.notify && !this.originalSallaNotify) {
        this.originalSallaNotify = {
          success: window.salla.notify.success?.bind(window.salla.notify),
          error: window.salla.notify.error?.bind(window.salla.notify),
          warning: window.salla.notify.warning?.bind(window.salla.notify),
          info: window.salla.notify.info?.bind(window.salla.notify)
        };
        
        const blockNotify = () => {
          // Remove body classes immediately
          setTimeout(() => {
            document.body.classList.remove('swal2-shown', 'swal2-toast-shown', 'swal2-height-auto');
            document.documentElement.classList.remove('swal2-shown', 'swal2-toast-shown', 'swal2-height-auto');
          }, 0);
        };
        
        if (window.salla.notify.success) window.salla.notify.success = blockNotify;
        if (window.salla.notify.error) window.salla.notify.error = blockNotify;
        if (window.salla.notify.warning) window.salla.notify.warning = blockNotify;
        if (window.salla.notify.info) window.salla.notify.info = blockNotify;
      }
      
      // Monitor body classes and remove Swal classes continuously
      if (!this.swalClassObserver) {
        this.swalClassObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            // Handle class attribute changes
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
              if (document.body.classList.contains('swal2-shown') || 
                  document.body.classList.contains('swal2-toast-shown')) {
                document.body.classList.remove('swal2-shown', 'swal2-toast-shown', 'swal2-height-auto');
                document.documentElement.classList.remove('swal2-shown', 'swal2-toast-shown', 'swal2-height-auto');
              }
            }
            
            // Handle new nodes being added (Swal containers)
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                  // Check if it's a Swal container
                  if (node.classList && (
                    node.classList.contains('swal2-container') ||
                    node.classList.contains('swal2-popup') ||
                    node.classList.contains('swal2-toast') ||
                    node.classList.contains('s-alert') ||
                    node.classList.contains('s-toast')
                  )) {
                    node.style.display = 'none';
                    node.style.opacity = '0';
                    node.style.visibility = 'hidden';
                    node.style.pointerEvents = 'none';
                    // Remove it after a short delay to prevent flicker
                    setTimeout(() => {
                      if (node.parentNode) {
                        node.parentNode.removeChild(node);
                      }
                    }, 50);
                  }
                  
                  // Also check child elements
                  const swalChildren = node.querySelectorAll && node.querySelectorAll('.swal2-container, .swal2-popup, .swal2-toast, .s-alert, .s-toast');
                  if (swalChildren && swalChildren.length > 0) {
                    swalChildren.forEach(child => {
                      child.style.display = 'none';
                      child.style.opacity = '0';
                      child.style.visibility = 'hidden';
                      child.style.pointerEvents = 'none';
                      setTimeout(() => {
                        if (child.parentNode) {
                          child.parentNode.removeChild(child);
                        }
                      }, 50);
                    });
                  }
                }
              });
            }
          });
        });
        
        // Observe both class changes and child additions
        this.swalClassObserver.observe(document.body, {
          attributes: true,
          attributeFilter: ['class'],
          childList: true,
          subtree: true // Monitor all descendants
        });
        
        this.swalClassObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class'],
          childList: true,
          subtree: true
        });
      }
      
      // Also set up a continuous interval to catch any Swal that slips through
      if (!this.swalBlockInterval) {
        this.swalBlockInterval = setInterval(() => {
          // Remove body classes
          document.body.classList.remove('swal2-shown', 'swal2-toast-shown', 'swal2-height-auto');
          document.documentElement.classList.remove('swal2-shown', 'swal2-toast-shown', 'swal2-height-auto');
          
          // Hide any visible Swal containers
          const containers = document.querySelectorAll('.swal2-container, .swal2-popup, .swal2-toast, .s-alert, .s-toast');
          containers.forEach(container => {
            if (container && container.style.display !== 'none') {
              container.style.display = 'none';
              container.style.opacity = '0';
              container.style.visibility = 'hidden';
              container.style.pointerEvents = 'none';
              if (container.parentNode) {
                container.parentNode.removeChild(container);
              }
            }
          });
        }, 100); // Check every 100ms
      }
    }
    
    restoreSwalToasts() {
      // Disconnect class observer
      if (this.swalClassObserver) {
        this.swalClassObserver.disconnect();
        this.swalClassObserver = null;
      }
      
      // Clear the blocking interval
      if (this.swalBlockInterval) {
        clearInterval(this.swalBlockInterval);
        this.swalBlockInterval = null;
      }
      
      // Restore original Swal.fire method
      if (this.originalSwalFire && window.Swal) {
        window.Swal.fire = this.originalSwalFire;
        this.originalSwalFire = null;
      }
      
      // Restore original Salla notify methods
      if (this.originalSallaNotify && window.salla && window.salla.notify) {
        if (this.originalSallaNotify.success) window.salla.notify.success = this.originalSallaNotify.success;
        if (this.originalSallaNotify.error) window.salla.notify.error = this.originalSallaNotify.error;
        if (this.originalSallaNotify.warning) window.salla.notify.warning = this.originalSallaNotify.warning;
        if (this.originalSallaNotify.info) window.salla.notify.info = this.originalSallaNotify.info;
        this.originalSallaNotify = null;
      }
    }

    async fetchPaymentMethods() {
      try {
        const storeId = this.contextData.storeId || this.storeDomain;
        const response = await fetch(\`\${this.apiUrl}/storefront/stores/\${storeId}/payment-methods\`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        
        if (response.ok) {
          const result = await response.json();
          this.paymentMethods = result.data || [];
        }
      } catch (error) {
        console.error('[Payment Methods] Fetch failed:', error);
      }
    }

    createModal() {
      if (this.modalElement && document.body.contains(this.modalElement)) {
        this.show();
        return;
      }

      this.modalElement = document.createElement('div');
      this.modalElement.className = 'salla-bundle-modal';

      const bundleConfig = this.bundleData.data || this.bundleData;
      const modalTitle = bundleConfig.modal_title || bundleConfig.name || 'اختر باقتك';
      
      const isMobile = window.innerWidth <= 640;

      const timerStyles = this.timerSettings && this.timerSettings.enabled ? \`
        --timer-text-color: \${this.timerSettings.style.text_color};
        --timer-bg-color: \${this.timerSettings.style.bg_color};
        --timer-border-color: \${this.timerSettings.style.border_color};
        --timer-border-radius: \${this.timerSettings.style.border_radius}px;
        --timer-label-color: \${this.timerSettings.style.label_color};
        --timer-font-size: \${this.timerSettings.style.font_size}px;
      \` : '';

      this.modalElement.innerHTML = \`
        <div class="salla-bundle-panel" style="\${timerStyles}">
          <div class="salla-bundle-header">
            <div class="salla-bundle-header-row">
              <h2 class="salla-bundle-title">\${modalTitle}</h2>
              <div style="display: flex; align-items: center; gap: 12px;">
                \${!isMobile ? this.renderTimer('all') : ''}
                <button class="salla-bundle-close">&times;</button>
              </div>
            </div>
            \${isMobile ? \`
              <div class="salla-mobile-progress">
                \${Array.from({length: this.totalSteps}, (_, i) =>
                  \`<div class="salla-progress-step"></div>\`
                ).join('')}
              </div>
            \` : ''}
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

      window.sallaBundleModal = this;

      this.modalElement.onclick = (e) => {
        if (e.target === this.modalElement) {
          this.hide();
        }
      };

      const closeBtn = this.modalElement.querySelector('.salla-bundle-close');
      closeBtn.onclick = () => {
        this.triggerFeedback('click');
        this.hide();
      };

      this.setupGlobalFeedbackListeners();

      if (isMobile) {
        this.renderContentMobile();
      } else {
        this.renderContent();
      }
    }

    renderContent() {
      const body = this.modalElement.querySelector('.salla-bundle-body');
      const summary = this.modalElement.querySelector('.salla-sticky-summary');

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

      const targetProductData = bundleConfig.target_product_data;
      const baseProductPrice = targetProductData?.price || 100.00;

      const bundleDisplayData = bundles.map((tier, index) => {
        const buyQuantity = tier.buy_quantity || 1;
        const subtotal = buyQuantity * baseProductPrice;

        const unavailableProducts = this.getUnavailableProducts(bundleConfig, tier);
        const hasUnavailableProducts = unavailableProducts.length > 0;
        const targetProductUnavailable = bundleConfig.target_product_data ? 
          this.isProductCompletelyUnavailable(bundleConfig.target_product_data) : false;

        let giftValue = 0;
        let offersCost = 0;
        
        if (tier.offers) {
          tier.offers.forEach(offer => {
            if (offer.product_data && this.isProductCompletelyUnavailable(offer.product_data)) {
              return;
            }

            const productPrice = offer.product_data?.price || 100.00;

            if (offer.discount_type === 'free') {
              giftValue += productPrice;
              offersCost += 0;
            } else if (offer.discount_type === 'percentage') {
              const discountAmount = productPrice * (offer.discount_amount / 100);
              const customerPays = productPrice - discountAmount;
              giftValue += discountAmount;
              offersCost += customerPays;
            } else if (offer.discount_type === 'fixed_amount') {
              const customerPays = Math.max(0, productPrice - offer.discount_amount);
              giftValue += offer.discount_amount;
              offersCost += customerPays;
            } else {
              offersCost += productPrice;
            }
          });
        }

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

        const totalCustomerPays = subtotal + offersCost;


        return {
          id: \`tier-\${tier.tier}\`,
          name: tier.tier_title || \`العرض \${tier.tier}\`,
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
          bgColor: tier.tier_bg_color || '#f8f9fa',
          textColor: tier.tier_text_color || '#212529',
          highlightBgColor: tier.tier_highlight_bg_color || '#ffc107',
          highlightTextColor: tier.tier_highlight_text_color || '#000000',
          isDefault: tier.is_default || false
        };
      });

      if (!this.selectedBundle && bundleDisplayData.length > 0) {
        const defaultBundle = bundleDisplayData.find(bundle => bundle.isDefault === true);
        if (defaultBundle) {
          this.selectedBundle = defaultBundle.id;
        } else {
          const availableBundle = bundleDisplayData.find(bundle => !bundle.hasUnavailableProducts);
          if (availableBundle) {
            this.selectedBundle = availableBundle.id;
          } else {
            this.selectedBundle = bundleDisplayData[0].id;
          }
        }
      }

      const selectedBundleData = bundleDisplayData.find(b => b.id === this.selectedBundle);
      const selectedTier = selectedBundleData ? selectedBundleData.tier : bundles[0];

      const selectedBundle = selectedBundleData || bundleDisplayData[0];
      const totalPrice = selectedBundle.price; // This is what customer actually pays
      const originalValue = selectedBundle.originalPrice || selectedBundle.price; // Target product price
      const offersPrice = selectedBundle.offersCost || 0; // What customer pays for offers
      const bundleSavings = selectedBundle.savings || 0; // What customer saves

      const hasAnyUnavailableProducts = bundleDisplayData.some(bundle => bundle.hasUnavailableProducts);
      const allBundlesUnavailable = bundleDisplayData.every(bundle => bundle.hasUnavailableProducts);

      const modalSubtitle = bundleConfig.modal_subtitle || bundleConfig.modalSubtitle || bundleConfig.subtitle || '';

      let html = \`
        <!-- Bundles Section -->
        <div class="salla-bundle-section">
          <h3>\${bundleConfig.section_title || bundleConfig.sectionTitle || 'باقاتنا'}</h3>
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
                   style="background-color: \${bundle.bgColor}; border-color: \${this.selectedBundle === bundle.id ? bundle.textColor : bundle.bgColor}; cursor: pointer;"
                   onclick="if(window.sallaBundleModal && !\${bundle.hasUnavailableProducts}) window.sallaBundleModal.selectBundle('\${bundle.id}');"
                   \${bundle.hasUnavailableProducts ? 'title="تحتوي هذه الباقة على منتجات غير متوفرة"' : ''}>
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
                  <div class="salla-bundle-radio-desktop" style="border-color: \${bundle.textColor};">
                    \${this.selectedBundle === bundle.id ? \`<div class="salla-bundle-radio-inner" style="background-color: \${bundle.textColor};"></div>\` : ''}
                  </div>
                </div>
              </div>
            \`).join('')}
          </div>
        </div>

        <!-- Target Product Variants Section -->
        \${targetProductData && targetProductData.has_variants ? \`
          <div class="salla-bundle-section">
            <div class="salla-product-header">
              <img src="\${targetProductData.image || 'https://cdn.assets.salla.network/prod/admin/defaults/images/placeholder-logo.png'}" alt="\${targetProductData.name}" class="salla-product-image" />
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

        <!-- Reviews Section (Show on both mobile and desktop) -->
        \${this.renderReviews('all')}

        <!-- Offers Section -->
        \${this.renderOffersSection(selectedTier, selectedBundleData)}
        
        <!-- Free Shipping Banner (Show on both mobile and desktop) -->
        \${this.renderFreeShippingBanner(totalPrice, 'all')}
      \`;

      body.innerHTML = html;

      // Desktop summary matches mobile step 5 review exactly
      const originalPriceBeforeDiscount = originalValue + bundleSavings;
      const productsPrice = totalPrice;
      
      let summaryDetailsHtml = \`
        <!-- السعر الأصلي - Red color -->
        <div class="salla-summary-row">
          <span class="salla-summary-label">السعر الأصلي</span>
          <span class="salla-summary-value" style="color: #dc2626; text-decoration: line-through;">\${formatPrice(originalPriceBeforeDiscount)}</span>
        </div>
        
        <!-- سعر المنتجات - Black color -->
        <div class="salla-summary-row">
          <span class="salla-summary-label">السعر المخفض</span>
          <span class="salla-summary-value">\${formatPrice(productsPrice)}</span>
        </div>
        
        <!-- تكلفة الشحن - Black color -->
        <div class="salla-summary-row">
          <span class="salla-summary-label">تكلفة الشحن</span>
          <span class="salla-summary-value">تُحسب في الخطوة القادمة</span>
        </div>
      \`;

      // مبلغ الخصم - Green color (negative sign)
      if (bundleSavings > 0) {
        summaryDetailsHtml += \`
          <div class="salla-summary-row">
            <span class="salla-summary-label">خصم الباقة</span>
            <span class="salla-summary-value" style="color: #16a34a;">-\${formatPrice(bundleSavings)}</span>
          </div>
        \`;
      }

      // خصم الكوبون - Green color if applied
      if (this.discountCode && this.appliedDiscount) {
        const couponAmount = this.appliedDiscount.discount_amount || 0;
        summaryDetailsHtml += \`
          <div class="salla-summary-row">
            <span class="salla-summary-label">كود الخصم (\${this.discountCode})</span>
            <span class="salla-summary-value" style="color: #16a34a;">-\${formatPrice(couponAmount)}</span>
          </div>
        \`;
      }
      
      // إجمالي الطلب - Black color with border
      const finalTotal = this.appliedDiscount ? totalPrice - (this.appliedDiscount.discount_amount || 0) : totalPrice;
      summaryDetailsHtml += \`
        <div class="salla-summary-row" style="border-top: 1px solid var(--border); padding-top: 6px; margin-top: 6px;">
          <span class="salla-summary-label" style="font-weight: 600;">إجمالي الطلب</span>
          <span class="salla-summary-value" style="font-weight: 600; font-size: 16px;">\${formatPrice(finalTotal)}</span>
        </div>
      \`;



      let summaryHtml = \`
        <button class="salla-summary-toggle" onclick="if(window.sallaBundleModal) window.sallaBundleModal.toggleSummary();">
          <span class="salla-summary-toggle-icon">▼</span>
          <span class="salla-summary-total">\${formatPrice(finalTotal)}</span>
        </button>
        <div class="salla-summary-details">
          \${summaryDetailsHtml}
        </div>
        <button class="salla-checkout-button"
                style="background-color: \${bundleConfig.checkout_button_bg_color || bundleConfig.cta_button_bg_color || '#0066ff'}; color: \${bundleConfig.checkout_button_text_color || bundleConfig.cta_button_text_color || '#ffffff'};"
                onclick="if(window.sallaBundleModal) window.sallaBundleModal.handleCheckout(); else console.error('Modal instance not found for checkout');">
          <span>\${(bundleConfig.checkout_button_text || 'إتمام الطلب — {total_price}').replace('{total_price}', formatPrice(finalTotal))}</span>
        </button>
        \${this.renderPaymentMethods()}
      \`;

      summary.innerHTML = summaryHtml;
    }


    renderContentMobile() {
      const body = this.modalElement.querySelector('.salla-bundle-body');
      const summary = this.modalElement.querySelector('.salla-sticky-summary');
      
      const bundleConfig = this.bundleData.data || this.bundleData;
      const bundles = bundleConfig.bundles || [];
      
      if (bundles.length === 0) {
        body.innerHTML = \`<div class="salla-bundle-section">لا توجد عروض متاحة</div>\`;
        return;
      }
      
      const targetProductData = bundleConfig.target_product_data;
      const baseProductPrice = targetProductData?.price || 100.00;
      
      const bundleDisplayData = bundles.map((tier, index) => {
        const buyQuantity = tier.buy_quantity || 1;
        const subtotal = buyQuantity * baseProductPrice;
        const unavailableProducts = this.getUnavailableProducts(bundleConfig, tier);
        const hasUnavailableProducts = unavailableProducts.length > 0;
        const targetProductUnavailable = bundleConfig.target_product_data ? 
          this.isProductCompletelyUnavailable(bundleConfig.target_product_data) : false;

        let giftValue = 0;
        let offersCost = 0;
        
        if (tier.offers) {
          tier.offers.forEach(offer => {
            if (offer.product_data && this.isProductCompletelyUnavailable(offer.product_data)) {
              return;
            }

            const productPrice = offer.product_data?.price || 100.00;

            if (offer.discount_type === 'free') {
              giftValue += productPrice;
              offersCost += 0;
            } else if (offer.discount_type === 'percentage') {
              const discountAmount = productPrice * (offer.discount_amount / 100);
              const customerPays = productPrice - discountAmount;
              giftValue += discountAmount;
              offersCost += customerPays;
            } else if (offer.discount_type === 'fixed_amount') {
              const customerPays = Math.max(0, productPrice - offer.discount_amount);
              giftValue += offer.discount_amount;
              offersCost += customerPays;
            } else {
              offersCost += productPrice;
            }
          });
        }

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
              return \`\${productName} — خصم \${offer.discount_amount} ر.س\${unavailableText}\`;
            }
            return \`\${productName} — خصم\${unavailableText}\`;
          })
        ];

        const totalCustomerPays = subtotal + offersCost;

        return {
          id: \`tier-\${tier.tier}\`,
          name: tier.tier_title || \`العرض \${tier.tier}\`,
          price: totalCustomerPays,
          originalPrice: subtotal,
          offersCost: offersCost,
          jugCount: buyQuantity,
          value: subtotal + giftValue + offersCost,
          badge: hasUnavailableProducts || targetProductUnavailable ?
            'منتجات غير متوفرة' :
            (tier.tier_highlight_text || ''),
          items: items,
          tier: tier,
          savings: giftValue,
          hasUnavailableProducts: hasUnavailableProducts || targetProductUnavailable,
          unavailableProducts: unavailableProducts,
          bgColor: tier.tier_bg_color || '#f8f9fa',
          textColor: tier.tier_text_color || '#212529',
          highlightBgColor: tier.tier_highlight_bg_color || '#ffc107',
          highlightTextColor: tier.tier_highlight_text_color || '#000000',
          isDefault: tier.is_default || false
        };
      });
      
      if (!this.selectedBundle && bundleDisplayData.length > 0) {
        const defaultBundle = bundleDisplayData.find(b => b.isDefault === true);
        if (defaultBundle) {
          this.selectedBundle = defaultBundle.id;
        } else {
          const availableBundle = bundleDisplayData.find(b => !b.hasUnavailableProducts);
          this.selectedBundle = availableBundle ? availableBundle.id : bundleDisplayData[0].id;
        }
      }
      
      const selectedBundleData = bundleDisplayData.find(b => b.id === this.selectedBundle);
      const selectedTier = selectedBundleData ? selectedBundleData.tier : bundles[0];
      
      const freeGifts = selectedTier.offers ? selectedTier.offers.filter(o => o.discount_type === 'free') : [];
      const discountedProducts = selectedTier.offers ? selectedTier.offers.filter(o => o.discount_type !== 'free') : [];
      const hasTargetVariants = targetProductData && targetProductData.has_variants;
      
      const steps = [];
      let stepNumber = 1;
      
      steps.push({
        number: stepNumber++,
        label: 'اختر الباقة',
        html: this.renderStep1BundleSelection(bundleDisplayData, bundleConfig),
        type: 'bundles'
      });
      
      if (hasTargetVariants) {
        steps.push({
          number: stepNumber++,
          label: 'الخيارات',
          html: this.renderStep2TargetVariants(targetProductData, selectedTier),
          type: 'target_variants'
        });
      }
      
      if (freeGifts.length > 0) {
        steps.push({
          number: stepNumber++,
          label: 'إختر هداياك',
          html: this.renderStep3FreeGifts(selectedTier, selectedBundleData),
          type: 'free_gifts'
        });
      }
      
      if (discountedProducts.length > 0) {
        steps.push({
          number: stepNumber++,
          label: 'منتجات مخفضة',
          html: this.renderStep4DiscountedProducts(selectedTier, selectedBundleData),
          type: 'discounted'
        });
      }
      
      steps.push({
        number: stepNumber++,
        label: 'الفاتورة',
        html: this.renderStep5Review(selectedBundleData),
        type: 'review'
      });
      
      this.totalSteps = steps.length;
      this.stepLabels = steps.map(s => s.label);
      this.stepTypes = steps.map(s => s.type);
      
      let mobileContent = steps.map((step, index) => {
        return step.html.replace(/data-step="\d+"/g, \`data-step="\${step.number}"\`);
      }).join('');

      body.innerHTML = mobileContent;
      
      this.renderMobileFooter(summary, selectedBundleData, bundleConfig);
      
      this.updateStepUI();
      
      setTimeout(() => {
        this.autoSelectSingleVariants();
        this.initializeVariantListeners();
      }, 100);
    }

    renderStep1BundleSelection(bundleDisplayData, bundleConfig) {
      const modalSubtitle = bundleConfig.modal_subtitle || bundleConfig.modalSubtitle || bundleConfig.subtitle || '';

      return \`
        <div class="salla-step-container" data-step="1">
          <div class="salla-bundle-section">
            <h3>\${bundleConfig.section_title || bundleConfig.sectionTitle || this.stepLabels[0]}</h3>
            \${modalSubtitle ? \`<div class="subtitle">\${modalSubtitle}</div>\` : ''}
            <div class="salla-bundle-grid">
              \${bundleDisplayData.map((bundle, index) => {
                const isSelected = this.selectedBundle === bundle.id;
                const summaryText = bundle.items.slice(0, 2).join(' + ') + (bundle.items.length > 2 ? \` +\${bundle.items.length - 2}\` : '');

                return \`
                  <div class="salla-bundle-card \${isSelected ? 'active' : ''} \${bundle.hasUnavailableProducts ? 'unavailable' : ''}"
                       style="background-color: \${bundle.bgColor};"
                       onclick="window.sallaBundleModal.selectBundle('\${bundle.id}')">
                    <div class="salla-bundle-radio"></div>
                    <div class="salla-bundle-card-compact">
                      <div class="salla-bundle-card-title" style="color: \${bundle.textColor}; font-size: 15px; font-weight: 600; margin-bottom: 4px;">\${bundle.name}</div>
                      <div class="salla-bundle-card-summary" style="font-size: 12px; color: var(--text-2); margin-bottom: 6px;">\${summaryText}</div>
                      <div class="salla-bundle-card-pricing">
                        <span>\${formatPrice(bundle.price)}</span>
                        \${bundle.savings > 0 ? \`<span class="salla-bundle-savings-badge">وفر \${formatPrice(bundle.savings)}</span>\` : ''}
                      </div>
                      <ul class="salla-bundle-items \${isSelected ? 'expanded' : ''}" id="bundle-items-\${bundle.id}">
                        \${bundle.items.map(item => \`<li>\${item}</li>\`).join('')}
                      </ul>
                    </div>
                  </div>
                \`;
              }).join('')}
            </div>
          </div>
          \${this.renderReviews('bundles')}
          \${this.renderFreeShippingBanner(this.calculateCurrentTotal(), 'bundles')}
        </div>
      \`;
    }

    renderStep2TargetVariants(targetProductData, selectedTier) {
      if (!targetProductData || !targetProductData.has_variants) {
        return \`
          <div class="salla-step-container" data-step="2">
            <div class="salla-bundle-section">
              <h3>\${this.stepLabels[1]}</h3>
              <div class="subtitle">لا توجد خيارات للمنتج الأساسي</div>
            </div>
          </div>
        \`;
      }
      
      return \`
        <div class="salla-step-container" data-step="2">
          <div class="salla-bundle-section">
            <h3>المنتج الأساسي</h3>
            <div class="salla-product-header">
              <img src="\${targetProductData.image || 'https://cdn.assets.salla.network/prod/admin/defaults/images/placeholder-logo.png'}" alt="\${targetProductData.name}" class="salla-product-image" />
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
            \${this.renderReviews('target_variants')}
        </div>
      \`;
    }

    renderStep3FreeGifts(selectedTier, selectedBundleData) {
      const freeGifts = selectedTier.offers ? selectedTier.offers.filter(o => o.discount_type === 'free') : [];
      
      if (freeGifts.length === 0) {
        return \`
          <div class="salla-step-container" data-step="3">
            <div class="salla-bundle-section">
              <h3>\${this.stepLabels[2]}</h3>
              <div class="subtitle">لا توجد هدايا في هذه الباقة</div>
            </div>
          </div>
        \`;
      }
      
      const totalSavings = freeGifts.reduce((sum, o) => sum + (o.product_data?.price || 100), 0);
      const isLastStep = this.currentStep === this.totalSteps;
      
      return \`
        <div class="salla-step-container" data-step="3">
          <div class="salla-bundle-section">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
              <h3 style="margin: 0;">\${this.stepLabels[2]}</h3>
              <span style="
                background: #10b981;
                color: #ffffff;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
                white-space: nowrap;
              ">وفرت \${formatPrice(totalSavings)}</span>
            </div>
            <div class="salla-gifts-grid">
              \${freeGifts.map(offer => this.renderMobileFreeGiftCard(offer)).join('')}
            </div>
          </div>
          \${!isLastStep ? this.renderFreeShippingBanner(this.calculateCurrentTotal(), 'free_gifts') : ''}
        </div>
      \`;
    }

    renderMobileFreeGiftCard(offer) {
      const productData = offer.product_data;
      const productName = productData?.name || offer.product_name;
      const productImage = productData?.image || 'https://cdn.assets.salla.network/prod/admin/defaults/images/placeholder-logo.png';
      const productPrice = productData?.price || 100;
      const isUnavailable = productData ? this.isProductCompletelyUnavailable(productData) : false;

      return \`
        <div class="salla-gift-card \${isUnavailable ? 'salla-gift-unavailable' : ''}">
          <div class="salla-gift-image" style="background-image: url('\${productImage}')">
            \${isUnavailable ? \`
              <div class="salla-gift-overlay">
                <span style="font-size: 11px; color: white; font-weight: 600;">نفد المخزون</span>
              </div>
            \` : ''}
          </div>
          <div class="salla-gift-content">
            <div class="salla-gift-badges">
              <span class="salla-gift-badge" style="\${isUnavailable ? 'background: #fee2e2; color: #dc2626; border-color: #fecaca;' : ''}">هدية مجانية</span>
              <span class="salla-gift-free" style="\${isUnavailable ? 'color: #dc2626;' : ''}">مجاناً</span>
            </div>
            <div class="salla-gift-title" style="\${isUnavailable ? 'color: #9ca3af;' : ''}">\${productName}</div>
            <div class="salla-gift-value">\${formatPrice(productPrice)}</div>
            \${this.renderCompactVariantSelectors(offer.product_data, offer.product_id, true)}
          </div>
        </div>
      \`;
    }

    renderStep4DiscountedProducts(selectedTier, selectedBundleData) {
      const discountedProducts = selectedTier.offers ? selectedTier.offers.filter(o => o.discount_type !== 'free') : [];

      if (discountedProducts.length === 0) {
        return \`
          <div class="salla-step-container" data-step="4">
            <div class="salla-bundle-section">
              <h3>منتجات مخفضة</h3>
              <div class="subtitle">لا توجد منتجات مخفضة في هذه الباقة</div>
            </div>
          </div>
        \`;
      }

      const discountSavings = discountedProducts.reduce((sum, offer) => {
        const productPrice = offer.product_data?.price || 100;
        if (offer.discount_type === 'percentage') {
          return sum + (productPrice * (offer.discount_amount / 100));
        } else if (offer.discount_type === 'fixed_amount') {
          return sum + offer.discount_amount;
        }
        return sum;
      }, 0);

      const isLastStep = this.currentStep === this.totalSteps;

      return \`
        <div class="salla-step-container" data-step="4">
          <div class="salla-bundle-section">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
              <h3 style="margin: 0;">منتجات مخفضة</h3>
              <span style="
                background: #10b981;
                color: #ffffff;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
                white-space: nowrap;
              ">وفرت \${formatPrice(discountSavings)} إضافية</span>
            </div>
            <div class="salla-discounted-scroll">
              \${discountedProducts.map(offer => this.renderMobileDiscountedCard(offer)).join('')}
            </div>
          </div>
          \${!isLastStep ? this.renderFreeShippingBanner(this.calculateCurrentTotal(), 'discounted') : ''}
        </div>
      \`;
    }

    renderMobileDiscountedCard(offer) {
      const productData = offer.product_data;
      const productName = productData?.name || offer.product_name;
      const productImage = productData?.image || 'https://cdn.assets.salla.network/prod/admin/defaults/images/placeholder-logo.png';
      const originalPrice = productData?.price || 100;
      
      let discountedPrice = originalPrice;
      if (offer.discount_type === 'percentage') {
        discountedPrice = originalPrice * (1 - offer.discount_amount / 100);
      } else if (offer.discount_type === 'fixed_amount') {
        discountedPrice = originalPrice - offer.discount_amount;
      }
      
      return \`
        <div class="salla-discounted-card">
          <div class="salla-discounted-image" style="background-image: url('\${productImage}')"></div>
          <div class="salla-discounted-title">\${productName}</div>
          <div class="salla-discounted-pricing">
            <span class="final">\${formatPrice(discountedPrice)}</span>
            <span class="original">\${formatPrice(originalPrice)}</span>
          </div>
          \${this.renderCompactVariantSelectors(productData, offer.product_id, true)}
        </div>
      \`;
    }

    renderStep5Review(selectedBundleData) {
      if (!selectedBundleData) return '';

      const totalPrice = selectedBundleData.price;
      const originalValue = selectedBundleData.originalPrice;
      const productsPrice = selectedBundleData.price;
      const bundleSavings = selectedBundleData.savings;
      const originalPriceBeforeDiscount = originalValue + bundleSavings;

      return \`
        <div class="salla-step-container" data-step="5">
          <div class="salla-bundle-section">
            <h3>\${this.stepLabels[4]}</h3>
            <div class="subtitle">تأكد من طلبك قبل الإتمام</div>

            <div class="salla-review-static">
              <h3 style="font-size: 14px; margin-bottom: 10px;">تفاصيل الفاتورة</h3>
              <div class="salla-review-content">
                <!-- السعر الأصلي - Red color -->
                <div class="salla-summary-row">
                  <span class="salla-summary-label">السعر الأصلي</span>
                  <span class="salla-summary-value" style="color: #dc2626;text-decoration: line-through;">\${formatPrice(originalPriceBeforeDiscount)}</span>
                </div>
                
                <!-- سعر المنتجات - Black color -->
                <div class="salla-summary-row">
                  <span class="salla-summary-label">السعر المخفض</span>
                  <span class="salla-summary-value">\${formatPrice(productsPrice)}</span>
                </div>
                
                <!-- تكلفة الشحن - Black color -->
                <div class="salla-summary-row">
                  <span class="salla-summary-label">تكلفة الشحن</span>
                  <span class="salla-summary-value">تُحسب في الخطوة القادمة</span>
                </div>
                
                <!-- مبلغ الخصم - Green color (negative sign) -->
                \${bundleSavings > 0 ? \`
                  <div class="salla-summary-row">
                    <span class="salla-summary-label">مبلغ الخصم</span>
                    <span class="salla-summary-value" style="color: #16a34a;">-\${formatPrice(bundleSavings)}</span>
                  </div>
                \` : ''}
                
                <!-- إجمالي الطلب - Black color with border -->
                <div class="salla-summary-row" style="border-top: 1px solid var(--border); padding-top: 6px; margin-top: 6px;">
                  <span class="salla-summary-label" style="font-weight: 600;">إجمالي الطلب</span>
                  <span class="salla-summary-value" style="font-weight: 600; font-size: 16px;">\${formatPrice(totalPrice)}</span>
                </div>
              </div>
              
              <!-- كود الخصم - Discount Code Section -->
              \${this.renderDiscountCode()}
              
              <!-- Timer at the end after discount code -->
              \${this.renderTimer('review') ? \`
                <div style="margin-top: 16px; display: flex; justify-content: center;">
                  \${this.renderTimer('review')}
                </div>
              \` : ''}
            </div>
          </div>
          \${this.renderReviews('review')}
          \${this.renderFreeShippingBanner(totalPrice, 'review')}
        </div>
      \`;
    }

    renderMobileFooter(summary, selectedBundleData, bundleConfig) {


      const currentSelectedBundleData = selectedBundleData || this.getSelectedBundleDisplayData();


      const totalPrice = currentSelectedBundleData ? currentSelectedBundleData.price : 0;
      const originalTotal = currentSelectedBundleData ? (currentSelectedBundleData.price + (currentSelectedBundleData.savings || 0)) : 0;
      const hasSavings = currentSelectedBundleData && currentSelectedBundleData.savings > 0;
      
      // Apply coupon discount if exists
      const couponDiscount = (this.discountCode && this.appliedDiscount) ? (this.appliedDiscount.discount_amount || 0) : 0;
      const finalTotal = totalPrice - couponDiscount;

      summary.innerHTML = \`
        <div class="salla-footer-compact">
          <div>
            <div class="salla-footer-total">المجموع</div>
            \${hasSavings ? \`
              <div style="font-size: 11px; color: #ef4444; text-decoration: line-through; margin-bottom: 2px;">
                \${formatPrice(originalTotal)}
              </div>
            \` : ''}
            \${couponDiscount > 0 ? \`
              <div style="font-size: 10px; color: #16a34a; margin-bottom: 2px;">
                كود الخصم (\${this.discountCode}): -\${formatPrice(couponDiscount)}
              </div>
            \` : ''}
            <div class="salla-footer-price">\${formatPrice(finalTotal)}</div>
          </div>
        </div>
        <div class="salla-step-navigation">
          <button id="salla-step-prev" class="salla-step-btn" onclick="window.sallaBundleModal.goPrev()">
            السابق
          </button>
          <button id="salla-step-next" class="salla-step-btn primary" onclick="window.sallaBundleModal.goNext()">
            التالي
          </button>
        </div>
        \${this.renderPaymentMethods()}
      \`;
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

      const freeGifts = selectedTier.offers.filter(offer => offer.discount_type === 'free');
      const discountedProducts = selectedTier.offers.filter(offer => offer.discount_type !== 'free');

      const totalSavings = selectedBundleData ? selectedBundleData.savings : 0;

      let sectionsHtml = '';

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
      const productImage = offer.product_data?.image || 'https://cdn.assets.salla.network/prod/admin/defaults/images/placeholder-logo.png';
      
      const isUnavailable = offer.product_data ? this.isProductCompletelyUnavailable(offer.product_data) : false;

      let badgeText = 'هدية متضمنة';
      let statusText = 'مجاناً';
      let priceDisplay = \`<div class="salla-gift-value" style="text-decoration: line-through; color: var(--text-2);">\${formatPrice(productPrice)}</div>\`;

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

      this.triggerFeedback('click');

      if (this.paymentSliderAnimationFrame) {
        cancelAnimationFrame(this.paymentSliderAnimationFrame);
        this.paymentSliderAnimationFrame = null;
      }

      const paymentSlider = document.getElementById('salla-payment-slider');
      const paymentMethodsHTML = paymentSlider ? paymentSlider.parentElement.outerHTML : null;

      const isMobile = window.innerWidth <= 640;
      if (isMobile) {
        this.renderContentMobile();
      } else {
        this.renderContent();
      }

      if (paymentMethodsHTML) {
        const newPaymentSection = document.querySelector('.salla-payment-methods');
        if (newPaymentSection && newPaymentSection.outerHTML !== paymentMethodsHTML) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = paymentMethodsHTML;
          newPaymentSection.replaceWith(tempDiv.firstChild);

          setTimeout(() => this.startPaymentSliderAutoScroll(), 100);
        }
      }

      setTimeout(() => {
        const itemsList = document.querySelector(\`#bundle-items-\${bundleId}\`);
        if (itemsList && !itemsList.classList.contains('expanded')) {
          itemsList.classList.add('expanded');
        }
      }, 50);

      if (isMobile && this.currentStep === 1) {
        setTimeout(() => {
          if (this.canProceedToNextStep()) {
            this.updateNavigationButtons();
          }
        }, 100);
      }
    }

    isUserLoggedIn() {
      if (window.salla && window.salla.config && window.salla.config.get) {
        const isGuest = window.salla.config.get('user.guest');
        return !isGuest; // User is logged in if not a guest
      }
      return false;
    }


    async handleCheckout() {
      try {
        const isMobile = window.innerWidth <= 640;
        if (!isMobile) {
          const summaryDetails = document.querySelector('.salla-summary-details');
          if (summaryDetails && !summaryDetails.classList.contains('expanded')) {
            this.showSallaToast('يرجى مراجعة الملخص قبل إتمام الطلب', 'info');
            this.toggleSummary();
            return;
          }
        }

        if (!window.salla) {
          alert('عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى.');
          return;
        }

     

        const selectedBundleData = this.getSelectedBundleData();
        if (!selectedBundleData) {
          alert('يرجى اختيار باقة أولاً');
          return;
        }
        const bundleConfig = this.bundleData.data || this.bundleData;
        const targetProductData = bundleConfig.target_product_data;

        const unavailableProducts = this.getUnavailableProducts(bundleConfig, selectedBundleData.tier);
        if (unavailableProducts.length > 0) {
          
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
          return false; 
        }

        
        const missingVariants = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData);

        if (missingVariants.length > 0) {

          const missingDetails = missingVariants.map(mv => \`\${mv.productName}: \${mv.optionName}\`).join('، ');
          const errorMessage = \`يجب اختيار الخيارات التالية أولاً: \${missingDetails}\`;

          this.showSallaToast(errorMessage, 'error');

          this.highlightMissingVariants(missingVariants);

          const firstMissing = missingVariants[0];
          this.scrollToVariantInputAggressively(firstMissing.selectorProductId || firstMissing.productId, firstMissing.optionId);
          this.flashMissingVariant(firstMissing.selectorProductId || firstMissing.productId, firstMissing.optionId);

          return false;
        }


        this.trackBundleSelection(selectedBundleData);

        // Set flag to prevent cart clearing during checkout
        window.__SALLA_BUNDLE_CHECKOUT_IN_PROGRESS__ = true;

        try {
          const existingCart = await window.salla.cart.details();
          const existingItems = existingCart?.data?.cart?.items || [];
          
          if (existingItems.length > 0) {
            console.log(\`[Bundle Checkout] Silently clearing \${existingItems.length} existing cart items...\`);
            const clearOperations = existingItems.map(item => 
              window.salla.cart.deleteItem({ id: item.id }).catch(err => {
                console.error('[Bundle Checkout] Failed to delete item:', item.id, err);
              })
            );
            await Promise.allSettled(clearOperations);
            console.log('[Bundle Checkout] Cart cleared successfully');
          } else {
            console.log('[Bundle Checkout] Cart was already empty');
          }
        } catch (clearError) {
          console.error('[Bundle Checkout] Cart clearing failed:', clearError);
          // Continue anyway - not critical if cart clearing fails
        }

          this.showLoadingIndicator('جاري إضافة المنتجات...');

        try {
          const addedProducts = []; 
          
          const targetQuantity = selectedBundleData.buy_quantity || 1;

          const targetOptions = bundleConfig.target_product_data && bundleConfig.target_product_data.has_variants ?
            this.getSelectedVariantOptions(this.productId) : {};


          if (bundleConfig.target_product_data && this.isProductCompletelyUnavailable(bundleConfig.target_product_data)) {
            throw new Error(\`Target product \${bundleConfig.target_product_data.name} is completely out of stock\`);
          }

          for (let i = 0; i < targetQuantity; i++) {
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

            try {
              await window.salla.cart.addItem(targetCartItem);
              console.log('[Bundle Checkout] Target product added:', targetCartItem);
              addedProducts.push({
                name: bundleConfig.target_product_data.name,
                type: 'target',
                quantity: 1
              });
            } catch (addError) {
              console.error('[Bundle Checkout] Failed to add target product:', targetCartItem, addError);
              throw addError;
            }
          }
          

          const successfulOffers = [];
          const failedOffers = [];

     
          if (selectedBundleData.offers && selectedBundleData.offers.length > 0) {

            for (const offer of selectedBundleData.offers) {

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


                const addToCartParams = {
                  id: offer.product_id,
                  quantity: offer.quantity || 1,
                  options: offerOptions
                };


                await window.salla.cart.addItem(addToCartParams);
                console.log('[Bundle Checkout] Offer product added:', addToCartParams);

                successfulOffers.push(offer);
                addedProducts.push({
                  name: offer.product_name,
                  type: 'discounted',
                  quantity: offer.quantity || 1,
                  discount: offer.discount_type,
                  discountAmount: offer.discount_amount
                });

              } catch (offerError) {
                console.error('[Bundle Checkout] Failed to add offer product:', offer.product_id, offerError);
                failedOffers.push({
                  ...offer,
                  reason: 'add_to_cart_failed',
                  error: offerError.message
                });
              }
            }

          } else {
          }

          // Update loading message
          this.showLoadingIndicator('جاري التوجه للدفع...');

        } catch (error) {
          this.hideLoadingIndicator();
          
          if (error.message && (error.message.includes('options') || error.message.includes('variant') || error.message.includes('required'))) {
            const missingVariants = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData);
            if (missingVariants.length > 0) {
              this.showSallaToast('يجب اختيار جميع الخيارات المطلوبة قبل المتابعة', 'error');
              this.highlightMissingVariants(missingVariants);
              const firstMissing = missingVariants[0];
              this.scrollToVariantInput(firstMissing.selectorProductId || firstMissing.productId, firstMissing.optionId);
              return; 
            }
          }

          this.showSallaToast('حدث خطأ في إضافة بعض المنتجات', 'error');
          return;
        }

        const finalVariantCheck = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData);
        if (finalVariantCheck.length > 0) {
          this.hideLoadingIndicator();
          this.showSallaToast('لا يمكن المتابعة بدون اختيار جميع الخيارات', 'error');
          this.highlightMissingVariants(finalVariantCheck);
          return;
        }

        // Close modal and hide sticky button
        const modal = document.getElementById('salla-product-modal');
        const stickyButton = document.querySelector('.salla-bundle-sticky-button');
        
        if (modal) {
          modal.classList.remove('show');
          modal.style.zIndex = '20'; // Less than Salla modals (z-index: 30)
        }
        if (stickyButton) {
          stickyButton.style.display = 'none';
          stickyButton.style.zIndex = '20';
        }

        try {
          await window.salla.cart.submit();
          this.hideLoadingIndicator();
          // Clear flag after successful checkout
          window.__SALLA_BUNDLE_CHECKOUT_IN_PROGRESS__ = false;
        } catch (submitError) {
          console.error('[Bundle Checkout] Cart submit failed:', submitError);
          this.hideLoadingIndicator();
          // Clear flag before redirect
          window.__SALLA_BUNDLE_CHECKOUT_IN_PROGRESS__ = false;
          const currentPath = window.location.pathname;
          const pathMatch = currentPath.match(/^(\\/[^/]+\\/)/);
          const basePath = pathMatch ? pathMatch[1] : '/';
          window.location.href = \`\${window.location.origin}\${basePath}checkout\`;
        }

      } catch (error) {
        console.error('[Bundle Checkout] Complete error:', error);
        this.hideLoadingIndicator();
        // Clear flag on error
        window.__SALLA_BUNDLE_CHECKOUT_IN_PROGRESS__ = false;
        this.showSallaToast(\`حدث خطأ: \${error.message || 'يرجى المحاولة مرة أخرى'}\`, 'error');
        return; 
      }
    }

    getSelectedBundleData() {
      const bundleConfig = this.bundleData.data || this.bundleData;
      const bundles = bundleConfig.bundles || [];

      const tierNumber = this.selectedBundle ? parseInt(this.selectedBundle.replace('tier-', '')) : 1;
      const selectedTier = bundles.find(tier => tier.tier === tierNumber);


      return selectedTier;
    }

    getSelectedBundleDisplayData() {
      const bundleConfig = this.bundleData.data || this.bundleData;
      const bundles = bundleConfig.bundles || [];
      const targetProductData = bundleConfig.target_product_data;
      const baseProductPrice = targetProductData?.price || 0;



      if (!this.selectedBundle) return null;

      const tierNumber = parseInt(this.selectedBundle.replace('tier-', ''));
      const selectedTier = bundles.find(tier => tier.tier === tierNumber);

      if (!selectedTier) return null;

      const buyQuantity = selectedTier.buy_quantity || 1;
      const subtotal = buyQuantity * baseProductPrice;

      let giftValue = 0;
      let offersCost = 0;

      if (selectedTier.offers) {
        selectedTier.offers.forEach(offer => {
          if (offer.product_data && this.isProductCompletelyUnavailable(offer.product_data)) {
            return;
          }

          const productPrice = offer.product_data?.price || 0;
          const discountValue = offer.discount_value || offer.discount_amount || 0;

          if (offer.discount_type === 'free') {
            giftValue += productPrice;
            offersCost += 0;
          } else if (offer.discount_type === 'percentage') {
            const discountAmount = productPrice * (discountValue / 100);
            const customerPays = productPrice - discountAmount;
            giftValue += discountAmount;
            offersCost += customerPays;
          } else if (offer.discount_type === 'fixed' || offer.discount_type === 'fixed_amount') {
            const customerPays = Math.max(0, productPrice - discountValue);
            giftValue += discountValue;
            offersCost += customerPays;
          } else {
            offersCost += productPrice;
          }
        });
      }

      const totalCustomerPays = subtotal + offersCost;


      return {
        id: 'tier-' + selectedTier.tier,
        name: selectedTier.tier_title || 'العرض ' + selectedTier.tier,
        price: totalCustomerPays,
        originalPrice: subtotal,
        offersCost: offersCost,
        savings: giftValue,
        tier: selectedTier
      };
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


      for (const option of productData.options) {
        
        const availableValues = option.values ? option.values.filter(value => {

          if (value.is_out_of_stock === true) {
            return false;
          }
          
          if (value.is_available === false) {
            return false;
          }
          
          if (value.hasOwnProperty('quantity')) {
            if (productData.track_quantity || productData.enable_stock || productData.inventory_tracking) {
              return value.quantity > 0;
            }
            return true;
          }
          
          return true;
        }) : [];
        
        const allOutOfStock = option.values && option.values.length > 0 && availableValues.length === 0;

        if (allOutOfStock) {
          continue;
        }

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

      const input = document.querySelector(inputId);

      if (!input) {
        return;
      }


      const modalBody = document.querySelector('.salla-bundle-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
      }

      setTimeout(() => {
        input.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });

        setTimeout(() => {
          input.focus();

          if (input.tagName === 'SELECT') {
            try {
              input.showPicker(); 
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
        const originalBorder = input.style.border;
        const originalOutline = input.style.outline;
        
        let flashCount = 0;
        const maxFlashes = 6;
        
        const flashInterval = setInterval(() => {
          if (flashCount % 2 === 0) {
            input.style.border = '3px solid #ef4444';
            input.style.outline = '2px solid rgba(239, 68, 68, 0.5)';
            input.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.8)';
          } else {
            input.style.border = '1px solid #ef4444';
            input.style.outline = 'none';
            input.style.boxShadow = 'none';
          }
          
          flashCount++;
          
          if (flashCount >= maxFlashes) {
            clearInterval(flashInterval);
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
                selectorProductId: productIdWithIndex,
                optionId: missingOption.id,
                optionName: missingOption.name,
                productName: bundleConfig.target_product_data.name + \` (رقم \${i})\`,
                isOffer: false
              });
            }
          }
        } else {
          const targetOptions = this.getSelectedVariantOptions(bundleConfig.target_product_id);

          const missingOption = this.findMissingRequiredVariant(bundleConfig.target_product_data, targetOptions);
          if (missingOption) {
            missing.push({
              productId: bundleConfig.target_product_id,
              selectorProductId: bundleConfig.target_product_id,
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
                selectorProductId: selectorProductId, 
                optionId: missingOption.id,
                optionName: missingOption.name,
                productName: offer.product_data.name,
                isOffer: true
              });
            } else {
              }
          } else {
          }
        }
      } else {
      }

      return missing;
    }

    highlightMissingVariants(missingVariants) {
      document.querySelectorAll('.salla-variant-select').forEach(select => {
        if (!select.classList.contains('all-out-of-stock')) {
          select.style.outline = '';
          select.style.borderColor = '';
          select.classList.remove('variant-error');
        }
      });

      missingVariants.forEach(missing => {
        const selectorId = missing.selectorProductId || missing.productId;
        const input = document.querySelector(\`#variant-\${selectorId}-\${missing.optionId}\`);
        if (input && !input.hasAttribute('data-all-out-of-stock') && !input.disabled) {
          input.classList.add('variant-error');

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

      if (bundleConfig.target_product_data && this.isProductCompletelyUnavailable(bundleConfig.target_product_data)) {
        unavailable.push({
          id: bundleConfig.target_product_id,
          name: bundleConfig.target_product_data.name,
          type: 'target'
        });
      }

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
      
      if (bundleConfig.target_product_data && !this.isProductCompletelyUnavailable(bundleConfig.target_product_data)) {
        alternatives.push({
          type: 'target_only',
          title: 'شراء المنتج الأساسي فقط',
          description: \`يمكنك شراء \${bundleConfig.target_product_data.name} بدون العروض الإضافية\`,
          action: 'proceed_target_only'
        });
      }
      
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
      if (productData.is_available === false || productData.status === 'out_of_stock') {
        return true;
      }

      if (!productData.has_variants || !productData.options || productData.options.length === 0) {
        if (productData.track_quantity || productData.enable_stock || productData.inventory_tracking) {
          return productData.quantity === 0;
        }
        return false;
      }

      for (const option of productData.options) {
        if (option.values && option.values.length > 0) {
          const hasAvailableVariant = option.values.some(value => {
            if (value.is_out_of_stock === true) {
              return false;
            }
            
            if (value.is_available === false) {
              return false;
            }
            
            if (value.hasOwnProperty('quantity')) {
              if (productData.track_quantity || productData.enable_stock || productData.inventory_tracking) {
                return value.quantity > 0;
              }
              return true;
            }
            
            return true;
          });
          
          if (hasAvailableVariant) {
            return false; 
          }
        }
      }

      return true;
    }

    showSallaToast(message, type = 'info') {
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

      setTimeout(() => {
        toast.style.animation = 'slideOutToast 0.3s ease-out';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, 4000);

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

  
    showLoadingIndicator(message = 'جاري المعالجة...') {
      this.hideLoadingIndicator();
      
      const loader = document.createElement('div');
      loader.id = 'hazem-bundle-loader';
      loader.innerHTML = \`
        <style>
          #hazem-bundle-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 199;
            animation: fadeIn 0.2s ease;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          .salla-loader-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(255, 255, 255, 0.2);
            border-top: 4px solid #ffffff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 20px;
          }
          
          .salla-loader-text {
            color: #ffffff;
            font-size: 16px;
            font-weight: 600;
            animation: pulse 1.5s ease-in-out infinite;
          }
        </style>
        <div class="salla-loader-spinner"></div>
        <div class="salla-loader-text">\${message}</div>
      \`;
      
      document.body.appendChild(loader);
      
      this.triggerHaptic('progress');
    }




    hideLoadingIndicator() {
      const loader = document.getElementById('hazem-bundle-loader');
      if (loader) {
        loader.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
          if (loader.parentNode) {
            loader.parentNode.removeChild(loader);
          }
        }, 300);
      }
    }

    renderVariantSelectors(productData, productId, isOffer = false) {
      if (!productData || !productData.has_variants || !productData.options || productData.options.length === 0) {
        return '';
      }

      const selectorsHtml = productData.options.map((option, optionIndex) => {
        const optionLabel = option.name || \`الخيار \${optionIndex + 1}\`;

        const isRequired = option.required || option.purpose === 'variants' || (option.values && option.values.length > 0);

        const availableValues = option.values ? option.values.filter(value => {
          if (value.is_out_of_stock === true) {
            return false;
          }
          
          if (value.is_available === false) {
            return false;
          }
          
          if (value.hasOwnProperty('quantity')) {
            if (productData.track_quantity || productData.enable_stock || productData.inventory_tracking) {
              return value.quantity > 0;
            }
            return true;
          }
          
          return true;
        }) : [];
        
        const allOutOfStock = option.values && option.values.length > 0 && availableValues.length === 0;
        
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
                let isValueOutOfStock = false;
                
                if (value.is_out_of_stock === true || value.is_available === false) {
                  isValueOutOfStock = true;
                } else if (value.hasOwnProperty('quantity')) {
                  if (productData.track_quantity || productData.enable_stock || productData.inventory_tracking) {
                    isValueOutOfStock = value.quantity === 0;
                  }
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

      if (buyQuantity === 1) {
        return this.renderCompactVariantSelectors(productData, this.productId, false);
      }

      const quantitySelectorsHtml = Array.from({ length: buyQuantity }, (_, index) => {
        const quantityNum = index + 1;
        const productIdWithIndex = \`\${this.productId}-qty\${quantityNum}\`;

        return \`
          <div class="salla-quantity-direct">
            <div class="salla-quantity-direct-header">
              <span class="salla-quantity-badge">#\${quantityNum}</span>
            </div>
            <div class="salla-quantity-direct-variants">
              \${this.renderCompactVariantSelectors(productData, productIdWithIndex, false)}
            </div>
          </div>
        \`;
      }).join('');

      return quantitySelectorsHtml;
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
      if (typeof gtag === 'function') {
        gtag('event', 'select_promotion', {
          creative_name: this.bundleData.name || 'Bundle Offer',
          creative_slot: \`tier-\${bundleData.tier}\`,
          promotion_id: this.bundleData.id,
          promotion_name: this.bundleData.name
        });
      }

      if (typeof fbq === 'function') {
        fbq('track', 'AddToCart', {
          content_name: this.bundleData.name || 'Bundle Offer',
          content_category: 'Bundle',
          content_ids: [this.productId],
          currency: 'SAR',
          value: bundleData.buy_quantity * 174 
        });
      }

      if (typeof snaptr === 'function') {
        snaptr('track', 'ADD_CART', {
          'currency': 'SAR',
          'price': bundleData.buy_quantity * 174
        });
      }

    }

    
    goNext() {
      if (!this.canProceedToNextStep()) {
        this.showStepValidationError();
        return;
      }

      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.updateStepUI();
        this.scrollToTop();
        this.triggerFeedback('click');
      } else if (this.currentStep === this.totalSteps) {
        this.handleCheckout();
        this.triggerFeedback('success');
      }
    }

    goPrev() {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.updateStepUI();
        this.scrollToTop();
        this.triggerFeedback('click');
      }
    }

    canProceedToNextStep() {
      const bundleConfig = this.bundleData.data || this.bundleData;
      const selectedBundleData = this.getSelectedBundleData();
      
      if (!selectedBundleData && this.currentStep !== 1) {
        return false;
      }
      
      const currentStepType = this.stepTypes ? this.stepTypes[this.currentStep - 1] : null;
      
      if (!currentStepType) {
        return this.currentStep === 1 && this.selectedBundle !== null;
      }
      
      switch (currentStepType) {
        case 'bundles': 
          return this.selectedBundle !== null;
          
        case 'target_variants': 
          if (!bundleConfig.target_product_data || !bundleConfig.target_product_data.has_variants) {
            return true;
          }
          const targetMissing = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData)
            .filter(m => !m.isOffer);
          return targetMissing.length === 0;
          
        case 'free_gifts':
          if (!selectedBundleData || !selectedBundleData.tier || !selectedBundleData.tier.offers) {
            return true;
          }
          const freeGifts = selectedBundleData.tier.offers.filter(o => o.discount_type === 'free');
          if (freeGifts.length === 0) {
            return true; 
          }

          const freeGiftsWithVariants = freeGifts.filter(g =>
            g.product_data && g.product_data.has_variants
          );

          if (freeGiftsWithVariants.length === 0) {
            return true;
          }

          const freeGiftMissing = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData)
            .filter(m => m.isOffer && freeGifts.some(o => o.product_id === m.productId));

          return freeGiftMissing.length === 0;
          
        case 'discounted':
          return true; 
          
        case 'review': 
          return this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData).length === 0;
          
        default:
          return true;
      }
    }

    showStepValidationError() {
      const bundleConfig = this.bundleData.data || this.bundleData;
      const selectedBundleData = this.getSelectedBundleData();
      const currentStepType = this.stepTypes ? this.stepTypes[this.currentStep - 1] : null;
      
      switch (currentStepType) {
        case 'bundles':
          this.showSallaToast('يرجى اختيار باقة أولاً', 'error');
          break;
          
        case 'target_variants':
        case 'free_gifts':
          const missing = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData);
          if (missing.length > 0) {
            const missingDetails = missing.map(m => \`\${m.productName}: \${m.optionName}\`).join('، ');
            this.showSallaToast(\`يجب اختيار: \${missingDetails}\`, 'error');
            this.highlightMissingVariants(missing);
            const first = missing[0];
            this.scrollToVariantInputAggressively(first.selectorProductId || first.productId, first.optionId);
          }
          break;
          
        default:
          this.showSallaToast('يرجى إكمال الخطوة الحالية', 'error');
      }
    }

    updateStepUI() {
      this.updateProgressUI();

      const allSteps = document.querySelectorAll('.salla-step-container');
      allSteps.forEach((step, index) => {
        if (index + 1 === this.currentStep) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });
      
      setTimeout(() => {
        this.initializeVariantListeners();
      }, 50);
      
      this.updateNavigationButtons();
      
      const summary = document.querySelector('.salla-sticky-summary');
      const selectedBundleData = this.getSelectedBundleDisplayData();
      const bundleConfig = this.bundleData.data || this.bundleData;
      if (summary && selectedBundleData) {
        this.renderMobileFooter(summary, selectedBundleData, bundleConfig);
      }

      if (this.currentStep === this.totalSteps) {
        setTimeout(() => {
          this.startModernReviewsAutoScroll();
        }, 500);
      }

      setTimeout(() => {
        this.animateFreeShippingProgress();
      }, 100);
    }

    updateProgressUI() {
      const progressSteps = document.querySelectorAll('.salla-progress-step');
      let hasProgressChange = false;

      progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        const wasCompleted = step.classList.contains('completed');
        const wasActive = step.classList.contains('active');

        step.classList.remove('active', 'completed');

        if (stepNumber < this.currentStep) {
          if (!wasCompleted) {
            hasProgressChange = true;
            step.style.transform = 'scale(1.2)';
            setTimeout(() => {
              step.style.transform = 'scale(1)';
            }, 200);
          }
          step.classList.add('completed');
        } else if (stepNumber === this.currentStep) {
          if (!wasActive) {
            hasProgressChange = true;
            step.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
              step.style.animation = '';
            }, 600);
          }
          step.classList.add('active');
        }
      });

      if (hasProgressChange) {
        this.triggerFeedback('progress');
      }

      this.updateStepCounter();

      if (hasProgressChange) {
        setTimeout(() => {
          this.refreshFreeShippingAnimation();
        }, 200);
      }
    }

    updateStepCounter() {
      const stepCounter = document.querySelector('.salla-step-counter');
      if (stepCounter) {
        const progress = (this.currentStep / this.totalSteps) * 100;

        stepCounter.style.transform = 'scale(1.1)';
        stepCounter.style.transition = 'transform 0.3s ease';

        setTimeout(() => {
          stepCounter.style.transform = 'scale(1)';
        }, 300);

        const counterText = stepCounter.querySelector('.counter-text');
        if (counterText) {
          counterText.style.opacity = '0';
          setTimeout(() => {
            counterText.textContent = this.currentStep + ' من ' + this.totalSteps;
            counterText.style.opacity = '1';
          }, 150);
        }
      }
    }

    animateFreeShippingProgress() {
      const freeShippingBanners = document.querySelectorAll('.salla-free-shipping-banner');

      freeShippingBanners.forEach(banner => {
        if (banner.hasProgressAnimated) return;

        banner.style.animation = 'bannerSlideIn 0.6s ease-out';

        const progressBars = banner.querySelectorAll('[style*="width:"]');

        progressBars.forEach(progressBar => {
          const widthMatch = progressBar.style.width.match(/(\d+(?:\.\d+)?)%/);
          if (widthMatch) {
            const targetWidth = widthMatch[1];

            progressBar.style.setProperty('--target-width', targetWidth + '%');

            progressBar.style.width = '0%';
            progressBar.style.animation = 'progressSlideIn 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards';

            const progress = parseFloat(targetWidth);
            setTimeout(() => {
              if (progress >= 100) {
                this.triggerFeedback('complete');
              } else if (progress >= 75) {
                this.triggerFeedback('progress');
              }
            }, 900);
          }
        });

        const percentageBadges = banner.querySelectorAll('span');
        percentageBadges.forEach(badge => {
          if (badge.textContent.includes('%')) {
            badge.style.animation = 'popIn 0.8s ease-out 0.6s both';
          }
        });

        banner.hasProgressAnimated = true;
      });
    }

    refreshFreeShippingAnimation() {
      const freeShippingBanners = document.querySelectorAll('.salla-free-shipping-banner');

      freeShippingBanners.forEach(banner => {
        banner.hasProgressAnimated = false;

        const progressBars = banner.querySelectorAll('[style*="width:"]');
        progressBars.forEach(progressBar => {
          const widthMatch = progressBar.style.width.match(/(\d+(?:\.\d+)?)%/);
          if (widthMatch) {
            const targetWidth = widthMatch[1];

            progressBar.style.animation = 'pulse 0.8s ease-in-out';
            setTimeout(() => {
              progressBar.style.animation = progressBar.style.animation.includes('progressBarGlow') ?
                'progressBarGlow 2s ease-in-out infinite' : '';
            }, 800);
          }
        });

        setTimeout(() => {
          this.animateFreeShippingProgress();
        }, 100);
      });
    }

    updateNavigationButtons() {
      const prevBtn = document.getElementById('salla-step-prev');
      const nextBtn = document.getElementById('salla-step-next');
      
      if (prevBtn) {
        prevBtn.disabled = this.currentStep === 1;
        prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
      }
      
      if (nextBtn) {
        const canProceed = this.canProceedToNextStep();
        nextBtn.disabled = !canProceed;
        nextBtn.textContent = 'التالي';
        nextBtn.classList.add('primary');
      }
    }

    scrollToTop() {
      const modalBody = document.querySelector('.salla-bundle-body');
      if (modalBody) {
        modalBody.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }

    toggleBundleDetails(bundleId) {
      const itemsList = document.querySelector(\`#bundle-items-\${bundleId}\`);
      const toggleBtn = document.querySelector(\`#toggle-\${bundleId}\`);

      if (itemsList) {
        const isExpanded = itemsList.classList.toggle('expanded');

        if (toggleBtn) {
          toggleBtn.textContent = isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل';
        }
      }
    }

    toggleDiscountedSection() {
      const header = document.querySelector('.salla-discounted-header');
      const body = document.querySelector('.salla-discounted-body');
      
      if (header && body) {
        header.classList.toggle('expanded');
        body.classList.toggle('expanded');
      }
    }

    autoSelectSingleVariants() {
      const selects = document.querySelectorAll('.salla-variant-compact-select, .salla-variant-select');
      
      selects.forEach(select => {
        if (select.value || select.disabled) return;
        
        const availableOptions = Array.from(select.options).filter(opt => 
          opt.value && !opt.disabled
        );
        
        if (availableOptions.length === 1) {
          select.value = availableOptions[0].value;
          select.dispatchEvent(new Event('change'));
        }
      });
      
      setTimeout(() => this.updateNavigationButtons(), 50);
    }
    
    initializeVariantListeners() {
      const selects = document.querySelectorAll('.salla-variant-compact-select, .salla-variant-select');
      
      selects.forEach(select => {
        if (select._variantChangeHandler) {
          select.removeEventListener('change', select._variantChangeHandler);
        }
        
        select._variantChangeHandler = () => {
          setTimeout(() => this.updateNavigationButtons(), 50);
        };
        
        select.addEventListener('change', select._variantChangeHandler);
      });
    }



    shouldShowInStep(featureName, currentStepType) {
      const bundleConfig = this.bundleData?.data || this.bundleData;
      const settings = bundleConfig?.settings || {};
      
      if (currentStepType === 'all') return true;
      
      let showInStep = 'bundles'; 
      
      if (featureName === 'timer' && settings.timer) {
        showInStep = settings.timer.show_in_step || 'bundles';
      } else if (featureName === 'reviews' && settings.review_count) {
        showInStep = settings.review_count.show_in_step || 'bundles';
      } else if (featureName === 'free_shipping' && settings.free_shipping) {
        showInStep = settings.free_shipping.show_in_step || 'review';
      }
      
      if (showInStep === 'all') return true;
      
      return showInStep === currentStepType;
    }

    renderTimer(currentStepType = 'bundles') {
      if (!this.timerSettings || !this.timerSettings.enabled) return '';
      if (!this.shouldShowInStep('timer', currentStepType)) return '';
      
      const effectClass = this.timerSettings.effect !== 'none' ? this.timerSettings.effect : '';
      
      return \`
        <div class="salla-timer-container" id="salla-timer">
          <div class="salla-timer-label">\${this.timerSettings.style.label}</div>
          <div class="salla-timer-display \${effectClass}" id="salla-timer-display">00:00:00</div>
        </div>
      \`;
    }

    startTimer() {
      if (!this.timerEndTime) return;
      
      this.updateTimerDisplay();
      
      this.timerInterval = setInterval(() => {
        this.updateTimerDisplay();
      }, 1000);
    }

    updateTimerDisplay() {
      const display = document.getElementById('salla-timer-display');
      if (!display) return;
      
      const now = Date.now();
      const remaining = Math.max(0, this.timerEndTime - now);
      
      if (remaining === 0) {
        if (this.timerSettings.auto_restart) {
          const duration = this.timerSettings.duration || 21600;
          this.timerEndTime = Date.now() + (duration * 1000);
        } else {
          clearInterval(this.timerInterval);
          display.textContent = '00:00:00';
          return;
        }
      }
      
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      
      display.textContent = \`\${String(hours).padStart(2, '0')}:\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')}\`;
    }

    calculateCurrentTotal() {
      if (!this.selectedBundleData || !this.selectedBundleData.price) {
        return 0;
      }
      return this.selectedBundleData.price;
    }

    getContrastColor(bgColor, defaultColor) {
      const rgb = this.hexToRgb(bgColor);
      if (!rgb) return defaultColor;

      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

      if (brightness > 128) {
        return this.getDarkerColor(bgColor, 0.6);
      } else {
        return defaultColor === '#ffffff' ? '#ffffff' : this.getLighterColor(bgColor, 0.3);
      }
    }

    getDarkerColor(color, factor) {
      const rgb = this.hexToRgb(color);
      if (!rgb) return color;

      const r = Math.floor(rgb.r * (1 - factor));
      const g = Math.floor(rgb.g * (1 - factor));
      const b = Math.floor(rgb.b * (1 - factor));

      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    getLighterColor(color, factor) {
      const rgb = this.hexToRgb(color);
      if (!rgb) return color;

      const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * factor));
      const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * factor));
      const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * factor));

      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    hexToRgb(hex) {
      if (!hex) return null;

      hex = hex.replace('#', '');

      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }

      const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }

    renderFreeShippingBanner(currentTotal = 0, currentStepType = 'review') {
      const bundleConfig = this.bundleData.data || this.bundleData;
      const settings = bundleConfig.settings || {};
      const freeShipping = settings.free_shipping || {};

      if (!freeShipping.enabled || freeShipping.mode === 'hidden') {
        return '';
      }
      
      if (!this.shouldShowInStep('free_shipping', currentStepType)) {
        return '';
      }

      const minPrice = freeShipping.min_price || 0;
      const showProgress = freeShipping.mode === 'min_price' && minPrice > 0;
      const isEligible = currentTotal >= minPrice;

      const bgColor = freeShipping.bg_color || '#10b981';
      const textColor = freeShipping.text_color || '#ffffff';
      const truckIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>';
      const checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
      const icon = freeShipping.icon || truckIcon;
      const text = freeShipping.text || 'شحن مجاني لهذه الباقة';
      const progressText = freeShipping.progress_text || 'أضف {amount} ريال للحصول على شحن مجاني';

      const progressColor = freeShipping.progress_color || '#ffffff';
      const progressBgColor = freeShipping.progress_bg_color || 'rgba(255, 255, 255, 0.3)';
      const borderRadius = freeShipping.border_radius || 12;

      const animateProgress = (percentage) => {
        if (percentage >= 25 && percentage < 26) this.triggerFeedback('progress');
        if (percentage >= 50 && percentage < 51) this.triggerFeedback('progress');
        if (percentage >= 75 && percentage < 76) this.triggerFeedback('progress');
        if (percentage >= 100) this.triggerFeedback('complete');
      };

      if (freeShipping.mode === 'always' || isEligible) {
        if (isEligible && minPrice > 0) {
          setTimeout(() => this.triggerFeedback('success'), 100);
        }

        const percentage = 100;
        const progressText = isEligible ? '🎉 مبروك! لقد حصلت على الشحن المجاني!' : ' شحن مجاني متاح دائماً لهذه الباقة!';

        return \`
          <div class="salla-free-shipping-banner salla-free-shipping-success salla-progress-complete" style="
            background: \${bgColor};
            color: \${textColor};
            flex-direction: column;
            gap: 12px;
            padding: 18px;
            border-radius: \${borderRadius}px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: successPulse 2s ease-in-out infinite;
          ">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%;">
              <span style="display: flex; align-items: center; animation: checkmarkBounce 1s ease-in-out;">\${checkIcon}</span>
              <span style="flex: 1; text-align: center; font-weight: 600; animation: fadeInSlide 0.6s ease-out;">\${text}</span>
            </div>

            <!-- ALWAYS show progress bar at 100% for visual consistency -->
            <div style="position: relative; width: 100%;">
              <div style="
                width: 100%;
                background: \${progressBgColor};
                border-radius: 25px;
                height: 14px;
                overflow: hidden;
                position: relative;
                box-shadow: inset 0 2px 6px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2);
                border: 1px solid rgba(0,0,0,0.2);
              ">
              <!-- Background segments -->
              <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                overflow: hidden;
              ">
                <div style="flex: 1; border-left: 2px solid rgba(0,0,0,0.1);"></div>
                <div style="flex: 1; border-left: 2px solid rgba(0,0,0,0.1);"></div>
                <div style="flex: 1; border-left: 2px solid rgba(0,0,0,0.1);"></div>
                <div style="flex: 1;"></div>
              </div>

              <!-- Progress fill at 100% with special success gradient -->
              <div style="
                width: 100%;
                background: linear-gradient(90deg, \${progressColor}, rgba(255,255,255,0.6), \${progressColor});
                height: 100%;
                transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                border-radius: 25px;
                position: relative;
                box-shadow: 0 2px 12px rgba(255,255,255,0.4), inset 0 1px 2px rgba(255,255,255,0.5);
                border: 1px solid rgba(255,255,255,0.3);
                animation: progressBarGlow 2s ease-in-out infinite;
              ">
                <!-- Enhanced shimmer for success state -->
                <div style="
                  position: absolute;
                  top: 0;
                  left: -100%;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
                  animation: progressShimmer 2s ease-in-out infinite;
                "></div>
              </div>

              <!-- Milestone markers (all completed) -->
              <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 2px;
                pointer-events: none;
              ">
                <div style="width: 4px; height: 4px; background: #ffffff; border-radius: 50%; box-shadow: 0 0 8px rgba(255,255,255,0.8);"></div>
                <div style="width: 4px; height: 4px; background: #ffffff; border-radius: 50%; box-shadow: 0 0 8px rgba(255,255,255,0.8);"></div>
                <div style="width: 4px; height: 4px; background: #ffffff; border-radius: 50%; box-shadow: 0 0 8px rgba(255,255,255,0.8);"></div>
                <div style="width: 4px; height: 4px; background: #ffffff; border-radius: 50%; box-shadow: 0 0 8px rgba(255,255,255,0.8);"></div>
              </div>
              
              <!-- 100% Badge positioned at the right end of progress bar (RTL) -->
              <span style="
                position: absolute;
                right: -55px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255,255,255,0.3);
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                min-width: 45px;
                text-align: center;
                animation: popIn 0.6s ease-out;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              ">100%</span>
            </div>
          </div>

            <!-- Success motivation text -->
            <div style="
              font-size: 12px;
              text-align: center;
              opacity: 0.95;
              font-weight: 600;
              animation: fadeInSlide 0.8s ease-out 0.2s both;
            ">
              \${progressText}
            </div>

            <!-- Overall shimmer overlay -->
            <div style="
              position: absolute;
              top: -2px;
              left: -100%;
              width: 100%;
              height: calc(100% + 4px);
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
              animation: shimmer 3s ease-in-out infinite;
            "></div>
          </div>
        \`;
      }

      if (showProgress && !isEligible) {
        const remaining = minPrice - currentTotal;
        const percentage = Math.min(100, (currentTotal / minPrice) * 100);
        const formattedRemaining = remaining.toFixed(2);
        const message = progressText.replace('{amount}', formattedRemaining);

        let progressLevel = 'low';
        if (percentage >= 75) progressLevel = 'high';
        else if (percentage >= 50) progressLevel = 'medium';
        else if (percentage >= 25) progressLevel = 'low-medium';

        animateProgress(percentage);

        return \`
          <div class="salla-free-shipping-banner salla-free-shipping-progress salla-progress-\${progressLevel}" style="
            background: \${bgColor};
            color: \${textColor};
            flex-direction: column;
            gap: 12px;
            padding: 18px;
            border-radius: \${borderRadius}px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
          ">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%;">
              <span style="display: flex; align-items: center; animation: truckBounce 2s ease-in-out infinite;">\${icon}</span>
              <span style="flex: 1; text-align: center; font-weight: 500; animation: fadeInSlide 0.4s ease-out;">\${message}</span>
              <span style="
                background: rgba(255,255,255,0.2);
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                min-width: 45px;
                text-align: center;
                animation: popIn 0.6s ease-out;
              ">\${Math.round(percentage)}%</span>
            </div>

            <!-- Enhanced progress bar with segments -->
            <div style="
              width: 100%;
              background: \${progressBgColor};
              border-radius: 25px;
              height: 14px;
              overflow: hidden;
              position: relative;
              box-shadow: inset 0 2px 6px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2);
              border: 1px solid rgba(0,0,0,0.2);
            ">
              <!-- Background segments -->
              <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                overflow: hidden;
              ">
                <div style="flex: 1; border-left: 2px solid rgba(0,0,0,0.1);"></div>
                <div style="flex: 1; border-left: 2px solid rgba(0,0,0,0.1);"></div>
                <div style="flex: 1; border-left: 2px solid rgba(0,0,0,0.1);"></div>
                <div style="flex: 1;"></div>
              </div>

              <!-- Progress fill with gradient -->
              <div style="
                width: \${percentage}%;
                background: linear-gradient(90deg, \${progressColor}, rgba(255,255,255,0.4));
                height: 100%;
                transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                border-radius: 25px;
                position: relative;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3);
                border: 1px solid rgba(255,255,255,0.2);
              ">
                <div style="
                  position: absolute;
                  top: 0;
                  left: -100%;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                  animation: progressShimmer 2s ease-in-out infinite;
                "></div>
              </div>
              <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 2px;
                pointer-events: none;
              ">
                <div style="width: 3px; height: 3px; background: rgba(255,255,255,0.6); border-radius: 50%;"></div>
                <div style="width: 3px; height: 3px; background: rgba(255,255,255,0.6); border-radius: 50%;"></div>
                <div style="width: 3px; height: 3px; background: rgba(255,255,255,0.6); border-radius: 50%;"></div>
                <div style="width: 3px; height: 3px; background: rgba(255,255,255,0.6); border-radius: 50%;"></div>
              </div>
            </div>

            <div style="
              font-size: 11px;
              text-align: center;
              opacity: 0.9;
              font-weight: 500;
              animation: fadeInSlide 0.8s ease-out 0.2s both;
            ">
              ' + (percentage < 25 ? (freeShipping.motivation_0_25 || ' ابدأ رحلتك نحو الشحن المجاني!') :
                percentage < 50 ? (freeShipping.motivation_25_50 || ' أحسنت! واصل التقدم...') :
                percentage < 75 ? (freeShipping.motivation_50_75 || 'رائع! اقتربت جداً من الهدف!') :
                percentage < 100 ? (freeShipping.motivation_75_100 || ' ممتاز! خطوة أخيرة فقط!') : '') + '
            </div>
          </div>
        \`;
      }
      
      return '';
    }

    renderReviewsCarousel() {
      if (!this.reviews || this.reviews.length === 0) return '';
      
      const totalRating = this.reviews.reduce((sum, r) => sum + (r.rating || 5), 0);
      const avgRating = (totalRating / this.reviews.length).toFixed(1);
      
      return \`
        <div class="salla-reviews-modern" style="margin-top: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <h3 style="font-size: 15px; font-weight: 600; margin: 0;">آراء العملاء</h3>
            <div style="font-size: 13px; color: var(--text-2);">\${avgRating} ★ متوسط</div>
          </div>
          <div style="position: relative;">
            <div class="salla-reviews-track-modern" id="salla-reviews-track-modern" style="display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 4px; -webkit-overflow-scrolling: touch; scrollbar-width: none;">
              \${this.reviews.map((review, index) => \`
                <article style="min-width: 80%; max-width: 320px; flex-shrink: 0; scroll-snap-align: center; border-radius: 14px; border: 1px solid var(--border); background: var(--bg-card); padding: 16px; box-shadow: 0 1px 2px rgba(16,24,40,.06), 0 1px 1px rgba(16,24,40,.04);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <div style="font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 12px;">\${review.customerName}</div>
                    <div style="font-size: 12px; color: var(--text-2); white-space: nowrap;">\${review.timeAgo}</div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
                    \${Array.from({ length: 5 }).map((_, i) => \`
                      <svg width="14" height="14" viewBox="0 0 24 24" style="\${i < review.rating ? 'fill: var(--text-1);' : 'fill: none;'}">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="var(--text-1)" stroke-width="1" />
                      </svg>
                    \`).join('')}
                  </div>
                  <p style="font-size: 14px; color: var(--text-1); line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;">\${review.content}</p>
                </article>
              \`).join('')}
            </div>
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: space-between; pointer-events: none;">
              <button onclick="window.sallaBundleModal.scrollReviewBy(-1)" aria-label="السابق" style="pointer-events: auto; margin-left: -4px; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card); box-shadow: 0 1px 2px rgba(16,24,40,.06); cursor: pointer;">
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
              </button>
              <button onclick="window.sallaBundleModal.scrollReviewBy(1)" aria-label="التالي" style="pointer-events: auto; margin-right: -4px; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card); box-shadow: 0 1px 2px rgba(16,24,40,.06); cursor: pointer;">
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
              </button>
            </div>
          </div>

        </div>
        <style>
          .salla-reviews-track-modern::-webkit-scrollbar {
            display: none;
          }
        </style>
      \`;
    }

    renderReviews(currentStepType = 'bundles') {
      if (!this.reviews || this.reviews.length === 0) return '';
      if (!this.shouldShowInStep('reviews', currentStepType)) return '';
      
      const totalRating = this.reviews.reduce((sum, r) => sum + (r.rating || 5), 0);
      const avgRating = (totalRating / this.reviews.length).toFixed(1);
      
      return \`
        <div class="salla-reviews-section">
          <div class="salla-reviews-header">
            <span>آراء العملاء (\${this.reviews.length})</span>
            <span style="
              display: inline-flex;
              align-items: center;
              gap: 4px;
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              color: #fff;
              padding: 4px 10px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
              box-shadow: 0 2px 6px rgba(251, 191, 36, 0.4);
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block;">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              \${avgRating}
            </span>
          </div>
          <div class="salla-reviews-carousel">
            <div class="salla-reviews-track" id="salla-reviews-track">
              \${this.reviews.map(review => {
                const stars = Array.from({length: 5}, (_, i) => i < review.rating ? '★' : '☆').join('');
                const verified = review.isVerified ? \`
                  <div style="
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    color: #10b981;
                    background: #d1fae5;
                    padding: 3px 8px;
                    border-radius: 12px;
                    margin-top: 4px;
                    font-weight: 500;
                  ">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    عميل موثق
                  </div>
                \` : '';
                return \`
                <div class="salla-review-card" style="
                  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
                  border: 1px solid #e5e7eb;
                  border-radius: 16px;
                  padding: 16px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                  transition: transform 0.2s, box-shadow 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.12)';" onmouseout="this.style.transform=''; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)';">
                  <div class="salla-review-header" style="margin-bottom: 12px;">
                    <img src="\${review.customerAvatar || 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png'}" 
                         alt="\${review.customerName}" 
                         class="salla-review-avatar"
                         style="
                           width: 48px;
                           height: 48px;
                           border-radius: 50%;
                           object-fit: cover;
                           border: 2px solid #e5e7eb;
                           box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                         "
                         onerror="this.src='https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png'" />
                    <div class="salla-review-customer" style="flex: 1;">
                      <div class="salla-review-name" style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">\${review.customerName}</div>
                      <div class="salla-review-rating" style="color: #fbbf24; font-size: 16px; letter-spacing: 2px;">\${stars}</div>
                      \${verified}
                    </div>
                  </div>
                  <div class="salla-review-content" style="
                    color: #4b5563;
                    line-height: 1.6;
                    font-size: 14px;
                    margin-bottom: 8px;
                    max-height: 4.8em;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                  ">\${review.content}</div>
                  <div class="salla-review-time" style="
                    font-size: 12px;
                    color: #9ca3af;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                  ">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    \${review.timeAgo}
                  </div>
                </div>
              \`;
              }).join('')}
            </div>
          </div>
        </div>
      \`;
    }

    startReviewsAutoScroll() {
      if (!this.reviews || this.reviews.length <= 1) return;

      const track = document.getElementById('salla-reviews-track');
      if (!track) return;

      if (this.reviewsInterval) {
        clearInterval(this.reviewsInterval);
      }

      let userIsInteracting = false;
      let interactionTimeout;
      let scrollSyncTimeout;

      const syncDotsWithScroll = () => {
        const dots = document.querySelectorAll('.salla-review-dot');
        if (!dots.length) return;

        const scrollLeft = track.scrollLeft;
        const cardWidth = track.scrollWidth / this.reviews.length;
        const scrollIndex = Math.round(scrollLeft / cardWidth);

        const currentIndex = this.reviews.length - 1 - scrollIndex;

        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });

        this.currentReviewIndex = currentIndex;
      };

      track.addEventListener('scroll', () => {
        clearTimeout(scrollSyncTimeout);
        scrollSyncTimeout = setTimeout(syncDotsWithScroll, 100);
      }, { passive: true });

      const pauseAutoScroll = () => {
        userIsInteracting = true;
        clearTimeout(interactionTimeout);

        interactionTimeout = setTimeout(() => {
          userIsInteracting = false;
        }, 3000);
      };

      track.addEventListener('touchstart', pauseAutoScroll, { passive: true, once: false });
      track.addEventListener('mousedown', pauseAutoScroll, { passive: true, once: false });
      track.addEventListener('wheel', pauseAutoScroll, { passive: true, once: false });

      const autoScroll = () => {
        if (!userIsInteracting && track && document.body.contains(track)) {
          this.scrollToNextReview();
        }
      };

      this.reviewsInterval = setInterval(autoScroll, 4000);
    }

    scrollToNextReview() {
      this.currentReviewIndex = (this.currentReviewIndex - 1 + this.reviews.length) % this.reviews.length;
      this.scrollToReview(this.currentReviewIndex);
    }

    scrollToReview(index) {
      const track = document.getElementById('salla-reviews-track');
      const dots = document.querySelectorAll('.salla-review-dot');

      if (!track || !dots.length || !this.reviews) return;

      const totalScrollWidth = track.scrollWidth;
      const cardWidth = totalScrollWidth / this.reviews.length;

      const scrollPosition = (this.reviews.length - 1 - index) * cardWidth;

      track.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });

      this.currentReviewIndex = index;
    }

    scrollReviewBy(step) {
      if (!this.reviews || this.reviews.length === 0) return;

      const track = document.getElementById('salla-reviews-track-modern');
      const dots = document.querySelectorAll('[data-dot-index]');

      if (!track) return;

      const scrollLeft = track.scrollLeft;
      const cardWidth = track.scrollWidth / this.reviews.length;
      let scrollIndex = Math.round(scrollLeft / cardWidth);

      let currentIndex = this.reviews.length - 1 - scrollIndex;

      let nextIndex = currentIndex - step;
      if (nextIndex < 0) nextIndex = this.reviews.length - 1;
      if (nextIndex >= this.reviews.length) nextIndex = 0;

      const nextScrollIndex = this.reviews.length - 1 - nextIndex;

      const child = track.children[nextScrollIndex];
      if (child) {
        const containerWidth = track.clientWidth;
        const childLeft = child.offsetLeft;
        const childWidth = child.clientWidth;
        const centerLeft = childLeft - (containerWidth - childWidth) / 2;

        track.scrollTo({
          left: Math.max(0, centerLeft),
          behavior: 'smooth'
        });

        dots.forEach((dot, i) => {
          const dotIndex = parseInt(dot.getAttribute('data-dot-index'));
          if (dotIndex === nextIndex) {
            dot.style.width = '24px';
            dot.style.background = 'var(--text-1)';
          } else {
            dot.style.width = '8px';
            dot.style.background = 'var(--border)';
          }
        });
      }
    }

    startModernReviewsAutoScroll() {
      if (!this.reviews || this.reviews.length <= 1) return;

      const track = document.getElementById('salla-reviews-track-modern');
      if (!track) return;

      if (this.modernReviewsInterval) {
        clearInterval(this.modernReviewsInterval);
      }

      let userIsInteracting = false;
      let interactionTimeout;
      let scrollSyncTimeout;

      const syncDotsWithScroll = () => {
        const dots = document.querySelectorAll('[data-dot-index]');
        if (!dots.length) return;

        const scrollLeft = track.scrollLeft;
        const cardWidth = track.scrollWidth / this.reviews.length;
        const scrollIndex = Math.round(scrollLeft / cardWidth);

        const currentIndex = this.reviews.length - 1 - scrollIndex;

        dots.forEach((dot, i) => {
          const dotIndex = parseInt(dot.getAttribute('data-dot-index'));
          if (dotIndex === currentIndex) {
            dot.style.width = '24px';
            dot.style.background = 'var(--text-1)';
          } else {
            dot.style.width = '8px';
            dot.style.background = 'var(--border)';
          }
        });
      };

      track.addEventListener('scroll', () => {
        clearTimeout(scrollSyncTimeout);
        scrollSyncTimeout = setTimeout(syncDotsWithScroll, 100);
      }, { passive: true });

      const pauseAutoScroll = () => {
        userIsInteracting = true;
        clearTimeout(interactionTimeout);

        interactionTimeout = setTimeout(() => {
          userIsInteracting = false;
        }, 3000);
      };

      track.addEventListener('touchstart', pauseAutoScroll, { passive: true, once: false });
      track.addEventListener('mousedown', pauseAutoScroll, { passive: true, once: false });
      track.addEventListener('wheel', pauseAutoScroll, { passive: true, once: false });

      const autoScroll = () => {
        if (!userIsInteracting && track && document.body.contains(track)) {
          this.scrollReviewBy(1);
        }
      };

      this.modernReviewsInterval = setInterval(autoScroll, 4000);
    }

    renderDiscountCode() {
      return \`
        <div class="salla-discount-section">
          <div class="salla-discount-header" onclick="window.sallaBundleModal.toggleDiscountSection()">
            <div class="salla-discount-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="display: inline-block; vertical-align: middle; margin-left: 6px;">
                <path d="M9 2L7 6H3C2.45 6 2 6.45 2 7V9C3.1 9 4 9.9 4 11C4 12.1 3.1 13 2 13V15C2 15.55 2.45 16 3 16H7L9 20L15 22L17 18H21C21.55 18 22 17.55 22 17V15C20.9 15 20 14.1 20 13C20 11.9 20.9 11 22 11V9C22 8.45 21.55 8 21 8H17L15 4L9 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 8L15 14M15 8L9 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              لديك كود خصم؟
            </div>
            <span class="salla-discount-toggle" id="salla-discount-toggle">▼</span>
          </div>
          <div class="salla-discount-body" id="salla-discount-body">
            <div class="salla-discount-input-group">
              <input type="text" 
                     class="salla-discount-input" 
                     id="salla-discount-input"
                     placeholder="أدخل كود الخصم"
                     value="\${this.discountCode}"
                     autocomplete="off"
                     autocorrect="off"
                     autocapitalize="off"
                     spellcheck="false" />
              <button class="salla-discount-apply-btn" 
                      onclick="window.sallaBundleModal.applyDiscountCode()">
                تطبيق
              </button>
            </div>
            <div id="salla-discount-message"></div>
          </div>
        </div>
      \`;
    }

    toggleDiscountSection() {
      const body = document.getElementById('salla-discount-body');
      const toggle = document.getElementById('salla-discount-toggle');
      
      if (body && toggle) {
        body.classList.toggle('expanded');
        toggle.classList.toggle('expanded');
      }
    }

    toggleSummary() {
      const toggle = document.querySelector('.salla-summary-toggle');
      const details = document.querySelector('.salla-summary-details');
      
      if (toggle && details) {
        toggle.classList.toggle('expanded');
        details.classList.toggle('expanded');
      }
    }

    async applyDiscountCode() {
      const input = document.getElementById('salla-discount-input');
      const messageEl = document.getElementById('salla-discount-message');
      
      if (!input || !messageEl) return;
      
      
      const code = input.value.trim();
      
      if (!code) {
        messageEl.innerHTML = '<div class="salla-discount-message error">الرجاء إدخل كود الخصم</div>';
        return;
      }
      
      try {
        const selectedBundleData = this.getSelectedBundleData();
        if (!selectedBundleData) {
          messageEl.innerHTML = '<div class="salla-discount-message error">يرجى اختيار باقة أولاً</div>';
          return;
        }
        
        const bundleConfig = this.bundleData.data || this.bundleData;
        
        // Check for missing variants
        const missingVariants = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData);
        if (missingVariants.length > 0) {
          const missingDetails = missingVariants.map(mv => \`\${mv.productName}: \${mv.optionName}\`).join('، ');
          messageEl.innerHTML = \`<div class="salla-discount-message error">يجب اختيار الخيارات أولاً: \${missingDetails}</div>\`;
          this.highlightMissingVariants(missingVariants);
          return;
        }
        
        // Show loading indicator immediately before any cart operations
        this.showLoadingIndicator('جاري إضافة المنتجات...');
        
        // Add items to cart (same logic as handleCheckout)
        const addedProducts = [];
        const targetQuantity = selectedBundleData.buy_quantity || 1;
        const targetOptions = bundleConfig.target_product_data && bundleConfig.target_product_data.has_variants ?
          this.getSelectedVariantOptions(this.productId) : {};
        
        // Add target products
        for (let i = 0; i < targetQuantity; i++) {
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
        
        // Add offer products
        if (selectedBundleData.offers && selectedBundleData.offers.length > 0) {
          for (const offer of selectedBundleData.offers) {
            const isUnavailable = offer.product_data && this.isProductCompletelyUnavailable(offer.product_data);
            if (isUnavailable) continue;
            
            try {
              const offerOptions = offer.product_data && offer.product_data.has_variants ?
                this.getSelectedOfferVariantOptions(offer.product_id) : {};
              
              const addToCartParams = {
                id: offer.product_id,
                quantity: offer.quantity || 1,
                options: offerOptions
              };
              
              await window.salla.cart.addItem(addToCartParams);
              addedProducts.push({
                name: offer.product_name,
                type: 'discounted',
                quantity: offer.quantity || 1
              });
            } catch (offerError) {
              console.error('[Coupon] Failed to add offer:', offerError);
            }
          }
        }
        
        // Now apply the coupon to the cart
        // Update loading message
        this.showLoadingIndicator('جاري تطبيق كود الخصم...');
        
        try {
          const couponResponse = await window.salla.cart.addCoupon(code);
          console.log('[Coupon] Applied successfully:', couponResponse);
          
          this.discountCode = code;
          
          // Fetch the updated cart to get actual discount amount
          try {
            const cartDetails = await window.salla.cart.details();
            
            // Extract discount from cart response
            // The discount can be in cart.discount or calculated from cart.sub_total - cart.total
            const cartData = cartDetails?.data?.cart;
            if (cartData) {
              const actualDiscount = cartData.discount || (cartData.sub_total - cartData.total) || 0;
              
              this.appliedDiscount = {
                code: code,
                discount_type: couponResponse?.data?.discount_type || 'fixed',
                discount_amount: actualDiscount
              };
            } else {
              // Fallback to coupon response
              this.appliedDiscount = {
                code: code,
                discount_type: couponResponse?.data?.discount_type || 'fixed',
                discount_amount: couponResponse?.data?.discount_amount || couponResponse?.data?.amount || 0
              };
            }
          } catch (cartError) {
            console.error('[Coupon] Failed to fetch cart details:', cartError);
            // Fallback to coupon response
            this.appliedDiscount = {
              code: code,
              discount_type: couponResponse?.data?.discount_type || 'fixed',
              discount_amount: couponResponse?.data?.discount_amount || couponResponse?.data?.amount || 0
            };
          }
          
          // Update the summary to reflect the coupon discount
          this.updateSummaryWithDiscount();
          
          // Track the bundle selection
          this.trackBundleSelection(selectedBundleData);

          // Update loading to checkout message
          this.showLoadingIndicator('جاري التوجه للدفع...');

          // Close modal and hide sticky button
          const modal = document.getElementById('salla-product-modal');
          const stickyButton = document.querySelector('.salla-bundle-sticky-button');
          
          if (modal) {
            modal.classList.remove('show');
            modal.style.zIndex = '20'; // Less than Salla modals (z-index: 30)
          }
          if (stickyButton) {
            stickyButton.style.display = 'none';
            stickyButton.style.zIndex = '20';
          }

          try {
            await window.salla.cart.submit();
            // Hide loading before Salla redirects
            this.hideLoadingIndicator();
          } catch (submitError) {
            console.error('[Coupon] Cart submit error:', submitError);
            this.hideLoadingIndicator();
            // Fallback to checkout page
            const currentPath = window.location.pathname;
            const pathMatch = currentPath.match(/^(\\/[^/]+\\/)/);
            const basePath = pathMatch ? pathMatch[1] : '/';
            window.location.href = \`\${window.location.origin}\${basePath}checkout\`;
          }
          
        } catch (couponError) {
          console.error('[Coupon] Failed to apply coupon:', couponError);
          this.hideLoadingIndicator();
          messageEl.innerHTML = \`<div class="salla-discount-message error">فشل تطبيق الكود. جاري التوجه للسلة...</div>\`;
          
          // Still go to cart even if coupon fails
          setTimeout(() => {
            const currentPath = window.location.pathname;
            const pathMatch = currentPath.match(/^(\\/[^/]+\\/)/);
            const basePath = pathMatch ? pathMatch[1] : '/';
            window.location.href = \`\${window.location.origin}\${basePath}cart\`;
          }, 1000);
        }
        
      } catch (error) {
        console.error('[Discount] Apply error:', error);
        this.hideLoadingIndicator();
        messageEl.innerHTML = '<div class="salla-discount-message error">حدث خطأ، حاول مرة أخرى</div>';
      }
    }

    updateSummaryWithDiscount() {
      try {
        // Find the summary section in the modal
        const summaryContainer = document.querySelector('.salla-summary-container');
        if (!summaryContainer) {
          console.warn('[Summary] Summary container not found');
          return;
        }

        // Calculate totals
        const formatPrice = (price) => {
          const formattedPrice = Number(price).toFixed(2);
          return formattedPrice + ' ' + (this.currency_code || 'ر.س');
        };

        // Calculate bundle total and savings
        let totalPrice = 0;
        let originalPrice = 0;
        
        this.selectedProducts.forEach(product => {
          const price = parseFloat(product.price) || 0;
          const original = parseFloat(product.regular_price) || price;
          const quantity = parseInt(product.quantity) || 1;
          
          totalPrice += price * quantity;
          originalPrice += original * quantity;
        });

        const bundleSavings = originalPrice - totalPrice;
        const couponDiscount = this.appliedDiscount ? (this.appliedDiscount.discount_amount || 0) : 0;
        const finalTotal = totalPrice - couponDiscount;

        // Build summary details HTML
        let summaryDetailsHtml = '';

        // سعر المنتجات
        summaryDetailsHtml += '<div class="salla-summary-row">' +
          '<span class="salla-summary-label">سعر المنتجات</span>' +
          '<span class="salla-summary-value">' + formatPrice(originalPrice) + '</span>' +
          '</div>';

        // خصم الباقة
        if (bundleSavings > 0) {
          summaryDetailsHtml += '<div class="salla-summary-row">' +
            '<span class="salla-summary-label">خصم الباقة</span>' +
            '<span class="salla-summary-value" style="color: #16a34a;">-' + formatPrice(bundleSavings) + '</span>' +
            '</div>';
        }

        // خصم الكوبون
        if (this.discountCode && couponDiscount > 0) {
          summaryDetailsHtml += '<div class="salla-summary-row">' +
            '<span class="salla-summary-label">كود الخصم (' + this.discountCode + ')</span>' +
            '<span class="salla-summary-value" style="color: #16a34a;">-' + formatPrice(couponDiscount) + '</span>' +
            '</div>';
        }

        // إجمالي الطلب
        summaryDetailsHtml += '<div class="salla-summary-row" style="border-top: 1px solid var(--border); padding-top: 6px; margin-top: 6px;">' +
          '<span class="salla-summary-label" style="font-weight: 600;">إجمالي الطلب</span>' +
          '<span class="salla-summary-value" style="font-weight: 600; font-size: 16px;">' + formatPrice(finalTotal) + '</span>' +
          '</div>';

        // Update the summary details
        const summaryDetails = summaryContainer.querySelector('.salla-summary-details');
        if (summaryDetails) {
          summaryDetails.innerHTML = summaryDetailsHtml;
        }

        // Update the summary toggle total
        const summaryTotal = summaryContainer.querySelector('.salla-summary-total');
        if (summaryTotal) {
          summaryTotal.textContent = formatPrice(finalTotal);
        }
      } catch (error) {
        console.error('[Summary] Update failed:', error);
      }
    }

    renderPaymentMethods() {
      if (!this.paymentMethods || this.paymentMethods.length === 0) return '';

      const iconMap = {
        'cod': 'cod.svg',
        'apple_pay': 'apple.svg',
        'stc_pay': 'stc.svg',
        'tamara_installment': 'tamara.svg',
        'tabby_installment': 'tabby.svg',
        'knet': 'knet.png',
        'mispay_installment': 'mispay.svg',
        'google_pay': 'google.svg',
        'mokafaa_alrajhi_loyalty': 'rajhy.svg',
        'madfu_installment': 'madfu.svg',
        'emkan_installment': 'emkan.svg',
        'mada': 'mada.svg'
      };

      const validMethods = this.paymentMethods.filter(method =>
        method && method.slug && iconMap.hasOwnProperty(method.slug)
      );

      if (validMethods.length === 0) return '';

      const baseUrl = this.apiUrl.replace('/api/v1', '');
      const paymentBadges = validMethods.map(method => {
        const iconFile = iconMap[method.slug];
        const iconPath = baseUrl + '/icons/' + iconFile;

        return \`
          <div class="salla-payment-badge" title="\${method.name || ''}">
            <img src="\${iconPath}" alt="\${method.name || method.slug}" class="salla-payment-logo" />
          </div>
        \`;
      }).join('');

      const duplicatedBadges = paymentBadges + paymentBadges + paymentBadges;

      return \`
        <div class="salla-payment-methods">
          <div class="salla-payment-slider" id="salla-payment-slider">
            \${duplicatedBadges}
          </div>
        </div>
      \`;
    }

    getPaymentIconSVG(slug) {
      if (!slug) return '';

      const baseUrl = this.apiUrl.replace('/api/v1', '');
      const iconMap = {
        'cod': 'cod.svg',
        'apple_pay': 'apple.svg',
        'stc_pay': 'stc.svg',
        'tamara_installment': 'tamara.svg',
        'tabby_installment': 'tabby.svg',
        'knet': 'knet.png',
        'mispay_installment': 'mispay.svg',
        'google_pay': 'google.svg',
        'mokafaa_alrajhi_loyalty': 'rajhy.svg',
        'madfu_installment': 'madfu.svg',
        'emkan_installment': 'emkan.svg',
        'mada': 'mada.svg'
      };

      if (!iconMap.hasOwnProperty(slug)) {
        return '';
      }

      const iconFile = iconMap[slug];
      const iconPath = baseUrl + '/icons/' + iconFile;

      return '<img src="' + iconPath + '" alt="' + slug + '" class="salla-payment-logo" />';
    }

    startPaymentSliderAutoScroll() {
      if (this.paymentSliderAnimationFrame) {
        cancelAnimationFrame(this.paymentSliderAnimationFrame);
        this.paymentSliderAnimationFrame = null;
      }

      const slider = document.getElementById('salla-payment-slider');
      if (!slider) {
        return;
      }

      if (slider.scrollWidth <= slider.clientWidth) {
        return;
      }

      slider.style.scrollBehavior = 'auto';

      const oneSetWidth = slider.scrollWidth / 3;

      let lastTime = performance.now();
      const scrollSpeed = 15;
      let isPaused = false;
      let interactionTimeout;

      const pauseScroll = () => {
        isPaused = true;
        clearTimeout(interactionTimeout);

        interactionTimeout = setTimeout(() => {
          isPaused = false;
          lastTime = performance.now(); 
        }, 2000);
      };

      slider.addEventListener('touchstart', pauseScroll, { passive: true, once: false });
      slider.addEventListener('mousedown', pauseScroll, { passive: true, once: false });
      slider.addEventListener('wheel', pauseScroll, { passive: true, once: false });

      slider.addEventListener('mouseenter', () => { isPaused = true; });
      slider.addEventListener('mouseleave', () => {
        isPaused = false;
        lastTime = performance.now();
      });

      const animate = (currentTime) => {
        if (!slider || !document.body.contains(slider)) {
          if (this.paymentSliderAnimationFrame) {
            cancelAnimationFrame(this.paymentSliderAnimationFrame);
            this.paymentSliderAnimationFrame = null;
          }
          return;
        }

        if (!isPaused) {
          const deltaTime = (currentTime - lastTime) / 1000;
          lastTime = currentTime;

          slider.scrollLeft += scrollSpeed * deltaTime;

          if (slider.scrollLeft >= oneSetWidth) {
            slider.scrollLeft = slider.scrollLeft - oneSetWidth;
          }
        } else {
          lastTime = currentTime;
        }

        this.paymentSliderAnimationFrame = requestAnimationFrame(animate);
      };

      this.paymentSliderAnimationFrame = requestAnimationFrame(animate);
    }


    show() {
      if (this.modalElement) {
        this.hideSwalToasts();
        
        this.modalElement.classList.add('show');
        
        // Prevent body scroll on all platforms
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = \`-\${window.scrollY}px\`;
        
        // Store current scroll position
        this.scrollPosition = window.scrollY;
        
        // Add touch event listener to prevent scroll on modal overlay
        this.preventScrollHandler = (e) => {
          // Only prevent if touching the overlay (not the scrollable content)
          if (e.target.classList.contains('salla-bundle-modal')) {
            e.preventDefault();
          }
        };
        
        this.modalElement.addEventListener('touchmove', this.preventScrollHandler, { passive: false });
        
        this.triggerFeedback('success');
        setTimeout(() => {
          this.startTimer();
          this.startReviewsAutoScroll();
          this.startPaymentSliderAutoScroll();
        }, 300);
      }
    }

    hide() {
      if (this.modalElement) {
        this.modalElement.classList.remove('show');
        
        // Restore body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        
        // Restore scroll position
        if (this.scrollPosition !== undefined) {
          window.scrollTo(0, this.scrollPosition);
          this.scrollPosition = undefined;
        }
        
        // Remove touch event listener
        if (this.preventScrollHandler) {
          this.modalElement.removeEventListener('touchmove', this.preventScrollHandler);
          this.preventScrollHandler = null;
        }
        
        // Restore Swal and Salla notifications
        this.restoreSwalToasts();
        
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }

        if (this.reviewsInterval) {
          clearInterval(this.reviewsInterval);
          this.reviewsInterval = null;
        }

        if (this.modernReviewsInterval) {
          clearInterval(this.modernReviewsInterval);
          this.modernReviewsInterval = null;
        }

        if (this.paymentSliderAnimationFrame) {
          cancelAnimationFrame(this.paymentSliderAnimationFrame);
          this.paymentSliderAnimationFrame = null;
        }
        if (window.sallaBundleModal === this) {
          window.sallaBundleModal = null;
        }
        setTimeout(() => {
          if (this.modalElement && this.modalElement.parentNode) {
            this.modalElement.parentNode.removeChild(this.modalElement);
          }
        }, 300);
      }
    }
  }

  window.SallaBundleModal = SallaBundleModal;

  window.sallaBundleModal = null;

})();
`;

  res.send(modalScript);
});

export default router;
