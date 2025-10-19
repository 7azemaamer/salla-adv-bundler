import { Router } from "express";

const router = Router();

router.get("/modal.js", (req, res) => {
  res.set({
    "Content-Type": "application/javascript",
    "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching during development
    Pragma: "no-cache",
    Expires: "0",
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

    button, .salla-bundle-button, .salla-step-btn, .salla-checkout-button,
    .salla-bundle-card, .salla-review-dot, .salla-bundle-details-toggle,
    [onclick], .salla-bundle-close {
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      -webkit-user-select: none;
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

    /* Mobile-first responsive design */
    @media (max-width: 640px) {
      .salla-bundle-panel {
        position: fixed;
        top: 16px;
        left: 16px;
        right: 16px;
        bottom: 16px;
        transform: none;
        width: auto;
        max-width: none;
        height: auto;
        max-height: none;
        border-radius: 16px;
        border: none;
        animation: slideInMobile 0.3s ease-out;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
    }

    @media (min-width: 641px) {
      .salla-bundle-panel {
        border-radius: 16px 0 0 16px;
      }
    }

    .salla-bundle-header {
      padding: 16px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-panel);
    }

    /* Mobile header adjustments */
    @media (max-width: 640px) {
      .salla-bundle-header {
        padding: 16px;
        background: var(--bg-panel);
        border-bottom: 1px solid var(--border);
        border-radius: 16px 16px 0 0;
      }
      
      .salla-bundle-header-row {
        flex-wrap: wrap;
      }
      
      .salla-bundle-title {
        font-size: 14px;
        flex: 1;
        min-width: 0;
      }
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

    /* Mobile body adjustments */
    @media (max-width: 640px) {
      .salla-bundle-body {
        padding: 12px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
    }

    .salla-bundle-section {
      border-radius: 14px;
      border: 1px solid var(--border);
      background: var(--bg-card);
      padding: 12px;
      margin-bottom: 12px;
    }

    /* Mobile section adjustments */
    @media (max-width: 640px) {
      .salla-bundle-section {
        border-radius: 12px;
        padding: 12px;
        margin-bottom: 8px;
      }
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

    /* Product header with image */
    .salla-product-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding: 12px;
      background: var(--bg-card);
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .salla-product-image {
      width: 56px;
      height: 56px;
      border-radius: 10px;
      object-fit: cover;
      background: var(--bg-soft);
      flex-shrink: 0;
    }

    .salla-product-info {
      flex: 1;
      min-width: 0;
    }

    .salla-product-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-1);
      margin: 0 0 4px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .salla-product-meta {
      font-size: 12px;
      color: var(--text-2);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Compact variant selectors */
    .salla-variant-compact {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .salla-variant-compact-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .salla-variant-compact-label {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-2);
      white-space: nowrap;
      min-width: 50px;
    }

    .salla-variant-compact-label.required:after {
      content: " *";
      color: #ef4444;
    }

    .salla-variant-compact-select {
      flex: 1;
      padding: 5px 8px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: white;
      color: var(--text-1);
      font-size: 12px;
      font-weight: 500;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
      cursor: pointer;
      min-width: 0;
    }

    .salla-variant-compact-select:hover {
      border-color: var(--text-1);
    }

    .salla-variant-compact-select:focus {
      border-color: var(--text-1);
      box-shadow: 0 0 0 2px rgba(14, 16, 18, 0.08);
    }

    /* Multiple quantity accordion */
    /* Direct Variant Display - Clean & Minimal */
    .salla-quantity-direct {
      margin-bottom: 12px;
    }

    .salla-quantity-direct-header {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
    }

    .salla-quantity-badge {
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 4px;
      background: var(--brand);
      color: white;
      font-weight: 600;
    }

    .salla-quantity-direct-variants {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .salla-bundle-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    /* Responsive grid layout */
    @media (max-width: 640px) {
      .salla-bundle-grid {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }

    @media (min-width: 641px) {
      .salla-bundle-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
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
      display: flex;
      flex-direction: column;
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
      margin-top: auto;
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

    /* Mobile bundle button adjustments */
    @media (max-width: 640px) {
      .salla-bundle-button {
        height: 48px;
        font-size: 15px;
        font-weight: 600;
        border-radius: 10px;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
    }

    @media (min-width: 641px) {
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

    /* Desktop Summary - Collapsible */
    .salla-summary-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      padding: 12px;
      background: var(--bg-panel);
      border: none;
      width: 100%;
      text-align: right;
      transition: background 0.2s;
    }

    .salla-summary-toggle:hover {
      background: var(--bg-card);
    }

    .salla-summary-toggle-icon {
      display: inline-block;
      transition: transform 0.3s ease;
      font-size: 16px;
      color: var(--text-2);
    }

    .salla-summary-toggle.expanded .salla-summary-toggle-icon {
      transform: rotate(180deg);
    }

    .salla-summary-total {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-1);
    }

    .salla-summary-details {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, opacity 0.3s ease;
      opacity: 0;
    }

    .salla-summary-details.expanded {
      max-height: 1000px;
      opacity: 1;
      padding: 12px;
    }

    /* Mobile sticky summary adjustments */
    @media (max-width: 640px) {
      .salla-sticky-summary {
        padding: 16px;
        background: var(--bg-panel);
        border-top: 1px solid var(--border);
        border-radius: 0 0 16px 16px;
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
      }

      /* Mobile: Hide toggle button - summary always expanded */
      .salla-summary-toggle {
        display: none !important;
      }

      .salla-summary-details {
        max-height: none !important;
        opacity: 1 !important;
        overflow: visible !important;
        padding: 12px !important;
      }
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

    /* Mobile checkout button adjustments */
    @media (max-width: 640px) {
      .salla-checkout-button {
        height: 56px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 12px;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
    }

    @media (min-width: 641px) {
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

    @keyframes slideInMobile {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
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

    /* ============================================
       MOBILE-ONLY STEPPER REDESIGN (≤640px)
       ============================================ */

    @media (max-width: 640px) {
      
      /* ===== HEADER: Sticky with Progress Bar ===== */
      .salla-bundle-header {
        position: sticky;
        top: 0;
        z-index: 10;
        padding: 12px 16px 8px;
      }

      .salla-bundle-title {
        font-size: 16px;
        margin-bottom: 8px;
      }

      .salla-mobile-progress {
        display: flex;
        gap: 4px;
        margin-top: 8px;
      }

      .salla-progress-step {
        flex: 1;
        height: 3px;
        background: var(--border);
        border-radius: 2px;
        transition: background 0.3s;
      }

      .salla-progress-step.active {
        background: var(--brand);
      }

      .salla-progress-step.completed {
        background: #10b981;
      }

      /* ===== BODY: Scrollable Steps ===== */
      .salla-bundle-body {
        padding: 8px 12px 16px;
      }

      .salla-bundle-section {
        padding: 10px;
        margin-bottom: 8px;
        border-radius: 10px;
      }

      .salla-bundle-section h3 {
        font-size: 16px;
        margin-bottom: 4px;
      }

      .salla-bundle-section .subtitle {
        font-size: 12px;
        margin-bottom: 8px;
      }

      /* ===== STEP 1: Compact Bundle Radio List ===== */
      .salla-bundle-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .salla-bundle-card {
        display: flex;
        align-items: flex-start;
        padding: 10px 12px;
        border-radius: 10px;
        gap: 10px;
        position: relative;
        min-height: auto;
        cursor: pointer;
        transition: all 0.2s;
        flex-direction: row-reverse; /* RTL: Radio on right */
      }

      .salla-bundle-card:active {
        transform: scale(0.98);
      }

      .salla-bundle-card.active {
        border-color: var(--brand);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      }

      /* Radio indicator - on RIGHT side for RTL */
      .salla-bundle-radio {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid var(--border);
        flex-shrink: 0;
        position: relative;
        transition: all 0.2s;
        margin-top: 2px;
      }

      .salla-bundle-card.active .salla-bundle-radio {
        border-color: var(--brand);
        background: var(--brand);
      }

      .salla-bundle-card.active .salla-bundle-radio::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      }

      /* Compact content */
      .salla-bundle-card-compact {
        flex: 1;
        min-width: 0;
      }

      .salla-bundle-card-summary {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-1);
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .salla-bundle-card-pricing {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-1);
      }

      .salla-bundle-savings-badge {
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 4px;
        background: #d1fae5;
        color: #065f46;
        font-weight: 600;
      }

      .salla-bundle-details-toggle {
        font-size: 11px;
        color: var(--text-2);
        text-decoration: underline;
        margin-top: 4px;
        cursor: pointer;
      }

      /* Collapsible full list */
      .salla-bundle-items {
        display: none;
        font-size: 12px;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--border);
      }

      .salla-bundle-items.expanded {
        display: block;
      }

      .salla-bundle-items li {
        margin-bottom: 3px;
      }

      /* Hide desktop-only elements in mobile cards */
      .salla-bundle-card .salla-bundle-card-header,
      .salla-bundle-card .salla-bundle-card-footer,
      
      .salla-bundle-card .salla-bundle-card-value,
      .salla-bundle-card .salla-bundle-badge,
      .salla-bundle-card .salla-bundle-price,
      .salla-bundle-card .salla-bundle-button {
        display: none;
      }

      /* ===== STEP 2: Target Product Variants (Compressed) ===== */
      .salla-product-header {
        padding: 8px;
        margin-bottom: 8px;
        border-radius: 8px;
      }

      .salla-product-image {
        width: 56px;
        height: 56px;
        border-radius: 8px;
      }

      .salla-product-name {
        font-size: 14px;
      }

      .salla-product-meta {
        font-size: 11px;
      }

      /* Quantity direct display - mobile */
      .salla-quantity-direct {
        margin-bottom: 8px;
      }

      .salla-quantity-direct-variants {
        gap: 4px;
      }

      /* Compact variant selectors - mobile */
      .salla-variant-compact {
        gap: 4px;
      }

      .salla-variant-compact-select {
        padding: 6px 8px;
        font-size: 12px;
      }

      /* ===== STEP 3: Free Gifts (Compact Grid) ===== */
      .salla-gifts-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
        margin-bottom:10px;
      }

      .salla-gift-card {
        display: flex;
        gap: 10px;
        padding: 10px;
        border-radius: 10px;
      }

      .salla-gift-image {
        width: 64px;
        height: 64px;
        min-width: 64px;
        border-radius: 8px;
        background-size: cover;
        background-position: center;
      }

      .salla-gift-content {
        flex: 1;
        padding: 0;
        min-width: 0;
      }

      .salla-gift-badges {
        gap: 4px;
        margin-bottom: 3px;
      }

      .salla-gift-badge {
        font-size: 10px;
        padding: 2px 6px;
      }

      .salla-gift-free {
        font-size: 11px;
      }

      .salla-gift-title {
        font-size: 13px;
        margin-bottom: 3px;
        line-height: 1.3;
      }

      .salla-gift-value {
        font-size: 11px;
        margin-bottom: 6px;
      }

      /* ===== Free Shipping Banner (Dynamically styled) ===== */

      .salla-free-shipping-banner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 16px;
        margin: 0 0 12px 0;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .salla-free-shipping-banner span {
        line-height: 1.4;
      }

      .salla-discounted-scroll {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        padding: 4px 2px 8px;
        scrollbar-width: none;
      }

      .salla-discounted-scroll::-webkit-scrollbar {
        display: none;
      }

      .salla-discounted-card {
        min-width: 160px;
        max-width: 160px;
        border-radius: 10px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        padding: 8px;
        display: flex;
        flex-direction: column;
      }

      .salla-discounted-image {
        width: 100%;
        height: 120px;
        border-radius: 8px;
        background-size: cover;
        background-position: center;
        margin-bottom: 6px;
      }

      .salla-discounted-title {
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 4px;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .salla-discounted-pricing {
        font-size: 11px;
        margin-bottom: 6px;
      }

      .salla-discounted-pricing .original {
        text-decoration: line-through;
        color: var(--text-2);
      }

      .salla-discounted-pricing .final {
        font-weight: 600;
        color: var(--text-1);
        margin-right: 4px;
      }

      /* ===== STEP 5: Review Summary (Collapsible Invoice) ===== */
      /* Mobile Review Summary - Always Expanded */
      .salla-review-static {
        background: var(--bg-soft);
        border-radius: 8px;
        margin-bottom: 12px;
        padding: 12px;
      }

      .salla-review-content {
        /* Content always visible */
      }

      .salla-summary-row {
        margin-bottom: 6px;
        font-size: 13px;
      }

      /* ===== STICKY FOOTER: Minimal Total + CTA ===== */
      .salla-sticky-summary {
        position: sticky;
        bottom: 0;
        z-index: 10;
        padding: 12px 16px;
      }

      .salla-footer-compact {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .salla-footer-total {
        font-size: 13px;
      }

      .salla-footer-price {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-1);
      }

      .salla-checkout-button {
        height: 48px;
        font-size: 15px;
        font-weight: 600;
        border-radius: 10px;
        margin-top: 0;
      }

      .salla-checkout-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Navigation buttons */
      .salla-step-navigation {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }

      .salla-step-btn {
        flex: 1;
        height: 40px;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .salla-step-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .salla-step-btn.primary {
        background: var(--brand);
        color: white;
        border-color: var(--brand);
      }

      /* ===== STEP VISIBILITY ===== */
      .salla-step-container {
        display: none;
      }

      .salla-step-container.active {
        display: block;
      }

      /* ===== RESPONSIVE TWEAKS ===== */
      .salla-bundle-body {
        font-size: 13px;
      }

      .salla-bundle-price {
        font-size: 18px;
      }

      /* Hide currency icons on mobile for cleaner look */
      .salla-hide-icon-mobile svg {
        display: none;
      }
    }
    /* ============================================
       END MOBILE-ONLY STEPPER REDESIGN
       ============================================ */

    /* ============================================
       TIMER, REVIEWS, DISCOUNT & PAYMENT STYLES
       ============================================ */
    
    /* Timer Component - Compact (Always in header) */
    .salla-timer-container {
      background: var(--timer-bg-color, var(--bg-card));
      border: 1px solid var(--timer-border-color, var(--border));
      border-radius: var(--timer-border-radius, 8px);
      padding: 6px 12px;
      margin: 0;
      text-align: center;
      transition: all 0.3s ease;
      display: flex;
      width: 100%;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    .salla-timer-label {
      font-size: var(--timer-font-size, 11px);
      color: var(--timer-label-color, var(--text-2));
      font-weight: 500;
      white-space: nowrap;
    }

    .salla-timer-display {
      font-size: 16px;
      font-weight: 700;
      color: var(--timer-text-color, var(--brand));
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
      direction: ltr;
    }

    .salla-timer-display.pulse {
      animation: timerPulse 2s infinite;
    }

    .salla-timer-display.glow {
      animation: timerGlow 2s infinite;
    }

    /* Mobile timer adjustments - show on smaller screens */
    @media (max-width: 640px) {
      .salla-timer-container {
        padding: 8px 12px;
        margin: 0;
      }
      
      .salla-timer-label {
        font-size: 10px;
      }
      
      .salla-timer-display {
        font-size: 16px;
      }
    }

    @keyframes timerPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    @keyframes timerGlow {
      0%, 100% { filter: drop-shadow(0 0 0px currentColor); }
      50% { filter: drop-shadow(0 0 8px currentColor); }
    }

    /* Enhanced Progress and Feedback Animations */
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
    }

    @keyframes successPulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      50% {
        transform: scale(1.02);
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
      }
    }

    @keyframes checkmarkBounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-8px); }
      60% { transform: translateY(-4px); }
    }

    @keyframes fadeInSlide {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes shimmer {
      0% { left: -100%; }
      100% { left: 200%; }
    }

    @keyframes progressShimmer {
      0% { left: -100%; }
      100% { left: 200%; }
    }

    @keyframes truckBounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-3px); }
      60% { transform: translateY(-2px); }
    }

    @keyframes popIn {
      0% {
        opacity: 0;
        transform: scale(0.8);
      }
      80% {
        opacity: 1;
        transform: scale(1.05);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes progressBarGlow {
      0%, 100% {
        filter: brightness(1) drop-shadow(0 0 8px rgba(255,255,255,0.3));
      }
      50% {
        filter: brightness(1.1) drop-shadow(0 0 16px rgba(255,255,255,0.6));
      }
    }

    @keyframes progressSlideIn {
      0% {
        width: 0%;
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      100% {
        width: var(--target-width, 100%);
        opacity: 1;
      }
    }

    @keyframes bannerSlideIn {
      0% {
        transform: translateY(20px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* Reviews Carousel */
    .salla-reviews-section {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }

    .salla-reviews-header {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-1);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .salla-reviews-carousel {
      position: relative;
      overflow: hidden;
      padding: 12px 0;
    }

    .salla-reviews-track {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      scroll-behavior: smooth;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .salla-reviews-track::-webkit-scrollbar {
      display: none;
    }

    .salla-review-card {
      flex: 0 0 280px;
      background: var(--bg-soft);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .salla-review-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-1);
    }

    .salla-review-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .salla-review-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--bg-thumb);
      object-fit: cover;
    }

    .salla-review-customer {
      flex: 1;
    }

    .salla-review-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-1);
      margin-bottom: 2px;
    }

    .salla-review-rating {
      color: #f59e0b;
      font-size: 12px;
    }

    .salla-review-content {
      font-size: 13px;
      color: var(--text-2);
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .salla-review-time {
      font-size: 11px;
      color: var(--text-2);
      opacity: 0.7;
    }

    .salla-reviews-dots {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin-top: 12px;
    }

    .salla-review-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--border);
      cursor: pointer;
      transition: all 0.3s;
    }

    .salla-review-dot.active {
      background: var(--brand);
      width: 24px;
      border-radius: 4px;
    }

    /* Discount Code Section */
    .salla-discount-section {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      margin: 16px 0;
    }

    .salla-discount-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }

    .salla-discount-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-1);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .salla-discount-toggle {
      font-size: 12px;
      color: var(--text-2);
      transition: transform 0.3s;
    }

    .salla-discount-toggle.expanded {
      transform: rotate(180deg);
    }

    .salla-discount-body {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .salla-discount-body.expanded {
      max-height: 200px;
      margin-top: 12px;
    }

    /* Desktop: Discount always visible */
    @media (min-width: 641px) {
      .salla-discount-header {
        pointer-events: none;
        cursor: default;
      }

      .salla-discount-toggle {
        display: none;
      }

      .salla-discount-body {
        max-height: none;
        overflow: visible;
        margin-top: 12px;
      }
    }

    .salla-discount-input-group {
      display: flex;
      gap: 8px;
    }

    .salla-discount-input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 14px;
      direction: ltr;
      text-align: right;
      transition: all 0.2s;
    }

    .salla-discount-input:focus {
      outline: none;
      border-color: var(--brand);
      box-shadow: 0 0 0 3px rgba(14, 16, 18, 0.1);
    }

    .salla-discount-apply-btn {
      padding: 10px 20px;
      background: var(--brand);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .salla-discount-apply-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .salla-discount-apply-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .salla-discount-message {
      margin-top: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
    }

    .salla-discount-message.success {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }

    .salla-discount-message.error {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    /* Payment Methods - Minimal Gray Slider */
    .salla-payment-methods {
      margin-top: 12px;
      padding: 0;
    }

    .salla-payment-slider {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 6px 2px;
      align-items: center;
      will-change: scroll-position;
      -webkit-overflow-scrolling: touch;
    }

    .salla-payment-slider::-webkit-scrollbar {
      display: none;
    }

    .salla-payment-badge {
      flex: 0 0 auto;
      width: 40px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      transition: opacity 0.2s;
      opacity: 0.6;
    }

    .salla-payment-badge:hover {
      opacity: 1;
    }

    .salla-payment-logo,
    .salla-payment-icon {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: grayscale(100%);
      transition: filter 0.2s;
    }

    .salla-payment-badge:hover .salla-payment-logo,
    .salla-payment-badge:hover .salla-payment-icon {
      filter: grayscale(0%);
    }

    .salla-payment-icon {
      font-size: 24px;
    }

    /* Mobile responsive adjustments */
    @media (max-width: 640px) {
      .salla-timer-container {
        margin: 12px 0;
        padding: 12px;
      }

      .salla-timer-display {
        font-size: 20px;
      }

      .salla-review-card {
        flex: 0 0 240px;
      }

      .salla-reviews-section {
        padding: 16px;
        margin: 16px 0;
      }

      .salla-discount-input-group {
        flex-direction: column;
      }

      .salla-discount-apply-btn {
        width: 100%;
      }
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
    // Ensure price is a valid number
    const numPrice = parseFloat(price) || 0;
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numPrice);
    return formatted + '&nbsp;' + riyalSvgIcon;
  }

  // Bundle Modal Class - Modern Boxy Design
  class SallaBundleModal {
    // Static cache for preloaded data (shared across all instances)
    static dataCache = {
      timerSettings: null,
      reviews: null,
      paymentMethods: null,
      bundleData: {}  // keyed by productId
    };

    // Static flag to track if preloading is in progress
    static isPreloading = false;
    static preloadPromise = null;

    // Haptic feedback, sound, and vibration system
    static feedbackSystem = {
      // Audio context for sound effects
      audioContext: null,
      sounds: {
        click: null,
        progress: null,
        complete: null,
        success: null
      },

      // Initialize audio context and sounds
      initAudio() {
        if (this.audioContext) return;

        try {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          this.createSounds();
        } catch (e) {
          console.log('Audio not supported:', e);
        }
      },

      // Create procedural sound effects
      createSounds() {
        // Click sound - short and satisfying
        this.sounds.click = () => this.playTone(800, 0.05, 'sine', 0.1);

        // Progress sound - ascending tone
        this.sounds.progress = () => {
          this.playTone(600, 0.1, 'square', 0.05);
          setTimeout(() => this.playTone(800, 0.1, 'square', 0.05), 50);
        };

        // Complete sound - celebration
        this.sounds.complete = () => {
          this.playTone(523, 0.15, 'sine', 0.2); // C5
          setTimeout(() => this.playTone(659, 0.15, 'sine', 0.2), 100); // E5
          setTimeout(() => this.playTone(784, 0.2, 'sine', 0.3), 200); // G5
        };

        // Success sound - triumphant
        this.sounds.success = () => {
          this.playTone(523, 0.1, 'triangle', 0.15); // C5
          setTimeout(() => this.playTone(659, 0.1, 'triangle', 0.15), 75); // E5
          setTimeout(() => this.playTone(784, 0.1, 'triangle', 0.15), 150); // G5
          setTimeout(() => this.playTone(1047, 0.2, 'triangle', 0.25), 225); // C6
        };
      },

      // Play a tone with given parameters
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

      // Haptic feedback for mobile devices
      triggerHaptic(type = 'light') {
        if (!window.navigator.vibrate) return;

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
      },

      // Trigger combined feedback
      triggerFeedback(type) {
        this.initAudio();

        const actions = {
          click: () => {
            this.sounds.click?.();
            this.triggerHaptic('click');
          },
          progress: () => {
            this.sounds.progress?.();
            this.triggerHaptic('progress');
          },
          complete: () => {
            this.sounds.complete?.();
            this.triggerHaptic('complete');
          },
          success: () => {
            this.sounds.success?.();
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
      this.isInitializing = false; // Prevent duplicate initialization

      // Initialize feedback system on first user interaction
      this.feedbackInitialized = false;
      this.initializeFeedbackOnFirstInteraction();

      // Mobile stepper state
      this.currentStep = 1;
      this.totalSteps = 5;
      this.stepLabels = [
        'اختر الباقة',
        'الخيارات',
        'إختر هداياك',
        'المنتجات المخفضة',
        'الفاتورة'
      ];

      // Initialize feature state
      this.initializeFeatureState();
    }

    // Initialize feedback system on first user interaction (to avoid browser audio restrictions)
    initializeFeedbackOnFirstInteraction() {
      const initFeedback = (e) => {
        if (!this.feedbackInitialized) {
          SallaBundleModal.feedbackSystem.initAudio();
          this.feedbackInitialized = true;
          // Remove listeners after initialization
          document.removeEventListener('click', initFeedback);
          document.removeEventListener('touchstart', initFeedback);
          document.removeEventListener('keydown', initFeedback);
        }
      };

      // Add listeners for first user interaction
      document.addEventListener('click', initFeedback, { once: true });
      document.addEventListener('touchstart', initFeedback, { once: true });
      document.addEventListener('keydown', initFeedback, { once: true });
    }

    // Trigger feedback with error handling
    triggerFeedback(type) {
      try {
        SallaBundleModal.feedbackSystem.triggerFeedback(type);
      } catch (e) {
        console.log('Feedback system error:', e);
      }
    }

    // Setup global feedback listeners for all interactive elements
    setupGlobalFeedbackListeners() {
      if (!this.modalElement) return;

      // Add feedback to button clicks
      const buttons = this.modalElement.querySelectorAll('button, .salla-bundle-button, .salla-step-btn, .salla-checkout-button');
      buttons.forEach(button => {
        if (!button.hasFeedbackListener) {
          button.addEventListener('click', (e) => {
            // Don't trigger feedback for close button since it's handled separately
            if (!e.target.classList.contains('salla-bundle-close')) {
              this.triggerFeedback('click');
            }
          });
          button.hasFeedbackListener = true;
        }
      });

      // Add feedback to bundle card selections
      const bundleCards = this.modalElement.querySelectorAll('.salla-bundle-card, .salla-bundle-card-compact');
      bundleCards.forEach(card => {
        if (!card.hasFeedbackListener) {
          card.addEventListener('click', () => {
            this.triggerFeedback('click');
          });
          card.hasFeedbackListener = true;
        }
      });

      // Add feedback to gift and product selections
      const selectableItems = this.modalElement.querySelectorAll('.salla-gift-card, .salla-discounted-card, .salla-review-dot');
      selectableItems.forEach(item => {
        if (!item.hasFeedbackListener) {
          item.addEventListener('click', () => {
            this.triggerFeedback('click');
          });
          item.hasFeedbackListener = true;
        }
      });

      // Add feedback to toggle elements
      const toggles = this.modalElement.querySelectorAll('.salla-summary-toggle, .salla-discount-header');
      toggles.forEach(toggle => {
        if (!toggle.hasFeedbackListener) {
          toggle.addEventListener('click', () => {
            this.triggerFeedback('click');
          });
          toggle.hasFeedbackListener = true;
        }
      });

      // Add feedback to navigation buttons
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

    // Initialize new features state
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

    // Static method to preload all common data (called from snippet on page load)
    static async preloadGlobalData(storeId, storeDomain) {
      // If already preloading, return the existing promise
      if (SallaBundleModal.isPreloading) {
        return SallaBundleModal.preloadPromise;
      }

      SallaBundleModal.isPreloading = true;
      SallaBundleModal.preloadPromise = (async () => {
        try {
          const apiUrl = 'https://${req.get("host")}/api/v1';
          const storeIdentifier = storeId || storeDomain;

          // Fetch all common data in parallel (non-product-specific)
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

          // Store results in cache
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

    // Static method to preload bundle data for a specific product
    static async preloadBundleData(productId, storeId, storeDomain, customerId) {
      try {
        // Check if already cached
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

          // Cache the bundle data
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
            // Cache it for future use
            SallaBundleModal.dataCache.bundleData[this.productId] = this.bundleData;
            console.log('[Modal] ✅ Bundle data fetched and cached');
          } catch (jsonError) {
            console.error('[Salla Bundle Modal] JSON parse error:', jsonError);
            console.error('[Salla Bundle Modal] Response text:', responseText);
            throw new Error(\`Invalid JSON response: \${jsonError.message}\`);
          }
        }

        // Extract timer settings from bundleData.settings
        const bundleConfig = this.bundleData.data || this.bundleData;
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

          // Initialize timer if enabled
          if (this.timerSettings && this.timerSettings.enabled) {
            const duration = this.timerSettings.duration || 21600;
            this.timerEndTime = Date.now() + (duration * 1000);
          }
        }

        // Create modal element
        this.createModal();

      } catch (error) {
        console.error('[Salla Bundle Modal] Initialization failed:', error);
        throw error;
      }
    }

    // Fetch timer settings
    async fetchTimerSettings() {
      try {
        const storeId = this.contextData.storeId || this.storeDomain;
        const response = await fetch(\`\${this.apiUrl}/timer-settings/\${storeId}\`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        
        if (response.ok) {
          const result = await response.json();
          this.timerSettings = result.data;
          
          // Initialize timer if enabled
          if (this.timerSettings && this.timerSettings.enabled) {
            const duration = this.timerSettings.duration || 21600; // Default 6 hours
            this.timerEndTime = Date.now() + (duration * 1000);
          }
        }
      } catch (error) {
        console.error('[Timer] Fetch failed:', error);
      }
    }

    // Fetch store reviews
    async fetchReviews() {
      try {
        const storeId = this.contextData.storeId || this.storeDomain;
        const response = await fetch(\`\${this.apiUrl}/storefront/stores/\${storeId}/reviews?limit=10\`, {
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

    // Fetch payment methods
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
      
      // Detect mobile
      const isMobile = window.innerWidth <= 640;

      // Apply timer CSS variables if timer is enabled
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
                \${!isMobile ? this.renderTimer() : ''}
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

      // Set global reference immediately
      window.sallaBundleModal = this;

      // Event handlers
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

      // Add global feedback listeners for interactive elements
      this.setupGlobalFeedbackListeners();

      // Render content (mobile or desktop)
      if (isMobile) {
        this.renderContentMobile();
      } else {
        this.renderContent();
      }
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

      // Get modal subtitle from bundle config (check multiple possible fields)
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

      // Desktop: Collapsible summary (collapsed by default)
      let summaryDetailsHtml = \`
        <div class="salla-summary-row">
          <span class="salla-summary-label">المنتج الأساسي</span>
          <span class="salla-summary-value">\${formatPrice(originalValue)}</span>
        </div>
      \`;

      if (offersPrice > 0) {
        summaryDetailsHtml += \`
          <div class="salla-summary-row">
            <span class="salla-summary-label">المنتجات الإضافية</span>
            <span class="salla-summary-value">\${formatPrice(offersPrice)}</span>
          </div>
        \`;
      }

      summaryDetailsHtml += \`
        <div class="salla-summary-row" style="border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px;">
          <span class="salla-summary-label" style="font-weight: 600;">المجموع الفرعي</span>
          <span class="salla-summary-value" style="font-weight: 600; font-size: 16px;">\${formatPrice(totalPrice)}</span>
        </div>
      \`;

      if (bundleSavings > 0) {
        summaryDetailsHtml += \`
          <div class="salla-summary-row">
            <span class="salla-summary-label">توفير الباقة</span>
            <span class="salla-summary-value salla-summary-savings">\${formatPrice(bundleSavings)}</span>
          </div>
        \`;
      }

      // Add discount code section (always visible on desktop)
      // summaryDetailsHtml += this.renderDiscountCode();

      // Build full summary with collapsible structure
      let summaryHtml = \`
        <button class="salla-summary-toggle" onclick="if(window.sallaBundleModal) window.sallaBundleModal.toggleSummary();">
          <span class="salla-summary-toggle-icon">▼</span>
          <span class="salla-summary-total">\${formatPrice(totalPrice)}</span>
        </button>
        <div class="salla-summary-details">
          \${summaryDetailsHtml}
        </div>
        <button class="salla-checkout-button"
                style="background-color: \${bundleConfig.cta_button_bg_color || '#0066ff'}; color: \${bundleConfig.cta_button_text_color || '#ffffff'};"
                onclick="if(window.sallaBundleModal) window.sallaBundleModal.handleCheckout(); else console.error('Modal instance not found for checkout');">
          <span>إتمام الطلب — \${formatPrice(totalPrice)}</span>
        </button>
        \${this.renderPaymentMethods()}
      \`;

      summary.innerHTML = summaryHtml;
    }

    // ===== MOBILE-SPECIFIC RENDER METHODS =====

    renderContentMobile() {
      const body = this.modalElement.querySelector('.salla-bundle-body');
      const summary = this.modalElement.querySelector('.salla-sticky-summary');
      
      const bundleConfig = this.bundleData.data || this.bundleData;
      const bundles = bundleConfig.bundles || [];
      
      if (bundles.length === 0) {
        body.innerHTML = \`<div class="salla-bundle-section">لا توجد عروض متاحة</div>\`;
        return;
      }
      
      // Calculate bundle data (same as desktop)
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
          name: tier.tier_title || \`المستوى \${tier.tier}\`,
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
      
      // Set default bundle
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
      
      // ===== DETERMINE WHICH STEPS TO SHOW =====
      const freeGifts = selectedTier.offers ? selectedTier.offers.filter(o => o.discount_type === 'free') : [];
      const discountedProducts = selectedTier.offers ? selectedTier.offers.filter(o => o.discount_type !== 'free') : [];
      const hasTargetVariants = targetProductData && targetProductData.has_variants;
      
      // Build step array dynamically
      const steps = [];
      let stepNumber = 1;
      
      // Step 1: Bundle selection (always present)
      steps.push({
        number: stepNumber++,
        label: 'اختر الباقة',
        html: this.renderStep1BundleSelection(bundleDisplayData, bundleConfig),
        type: 'bundles'
      });
      
      // Step 2: Target variants (only if has variants)
      if (hasTargetVariants) {
        steps.push({
          number: stepNumber++,
          label: 'الخيارات',
          html: this.renderStep2TargetVariants(targetProductData, selectedTier),
          type: 'target_variants'
        });
      }
      
      // Step 3: Free gifts (only if has free gifts)
      if (freeGifts.length > 0) {
        steps.push({
          number: stepNumber++,
          label: 'إختر هداياك',
          html: this.renderStep3FreeGifts(selectedTier, selectedBundleData),
          type: 'free_gifts'
        });
      }
      
      // Step 4: Discounted products (only if has discounted products)
      if (discountedProducts.length > 0) {
        steps.push({
          number: stepNumber++,
          label: 'منتجات مخفضة',
          html: this.renderStep4DiscountedProducts(selectedTier, selectedBundleData),
          type: 'discounted'
        });
      }
      
      // Step 5: Review (always present)
      steps.push({
        number: stepNumber++,
        label: 'الفاتورة',
        html: this.renderStep5Review(selectedBundleData),
        type: 'review'
      });
      
      // Update total steps and labels
      this.totalSteps = steps.length;
      this.stepLabels = steps.map(s => s.label);
      this.stepTypes = steps.map(s => s.type);
      
      // Render all steps with corrected data-step numbers
      let mobileContent = steps.map((step, index) => {
        // Replace ALL occurrences of data-step, not just the first one
        return step.html.replace(/data-step="\d+"/g, \`data-step="\${step.number}"\`);
      }).join('');

      body.innerHTML = mobileContent;
      
      // Render footer with navigation (includes discount code & payment methods)
      this.renderMobileFooter(summary, selectedBundleData, bundleConfig);
      
      // Initialize stepper UI
      this.updateStepUI();
      
      // Auto-select single variants and initialize listeners
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
            \${this.renderReviews()}
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
            <h3>\${this.stepLabels[2]}</h3>
            <div class="subtitle">توفر \${formatPrice(totalSavings)}</div>
            <div class="salla-gifts-grid">
              \${freeGifts.map(offer => this.renderMobileFreeGiftCard(offer)).join('')}
            </div>
          </div>
          \${!isLastStep ? this.renderFreeShippingBanner(this.calculateCurrentTotal()) : ''}
        </div>
      \`;
    }

    renderMobileFreeGiftCard(offer) {
      const productData = offer.product_data;
      const productName = productData?.name || offer.product_name;
      const productImage = productData?.image || 'https://via.placeholder.com/64';
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
            <h3>منتجات مخفضة</h3>
            <div class="subtitle">وفر \${formatPrice(discountSavings)} إضافية</div>
            <div class="salla-discounted-scroll">
              \${discountedProducts.map(offer => this.renderMobileDiscountedCard(offer)).join('')}
            </div>
          </div>
          \${!isLastStep ? this.renderFreeShippingBanner(this.calculateCurrentTotal()) : ''}
        </div>
      \`;
    }

    renderMobileDiscountedCard(offer) {
      const productData = offer.product_data;
      const productName = productData?.name || offer.product_name;
      const productImage = productData?.image || 'https://via.placeholder.com/160x120';
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
              \${this.renderTimer() ? \`
                <div style="margin-top: 16px; display: flex; justify-content: center;">
                  \${this.renderTimer()}
                </div>
              \` : ''}
            </div>
          </div>
        </div>
      \`;
    }

    renderMobileFooter(summary, selectedBundleData, bundleConfig) {


      const currentSelectedBundleData = selectedBundleData || this.getSelectedBundleDisplayData();


      const totalPrice = currentSelectedBundleData ? currentSelectedBundleData.price : 0;
      const originalTotal = currentSelectedBundleData ? (currentSelectedBundleData.price + (currentSelectedBundleData.savings || 0)) : 0;
      const hasSavings = currentSelectedBundleData && currentSelectedBundleData.savings > 0;

      summary.innerHTML = \`
        <div class="salla-footer-compact">
          <div>
            <div class="salla-footer-total">المجموع</div>
            \${hasSavings ? \`
              <div style="font-size: 11px; color: #ef4444; text-decoration: line-through; margin-bottom: 2px;">
                \${formatPrice(originalTotal)}
              </div>
            \` : ''}
            <div class="salla-footer-price">\${formatPrice(totalPrice)}</div>
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

    // ===== END MOBILE-SPECIFIC RENDER METHODS =====

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

      // Trigger satisfying feedback for bundle selection
      this.triggerFeedback('click');

      // Stop payment slider animation before re-rendering
      if (this.paymentSliderAnimationFrame) {
        cancelAnimationFrame(this.paymentSliderAnimationFrame);
        this.paymentSliderAnimationFrame = null;
      }

      // Store payment methods HTML before re-render to prevent reload
      const paymentSlider = document.getElementById('salla-payment-slider');
      const paymentMethodsHTML = paymentSlider ? paymentSlider.parentElement.outerHTML : null;

      // Detect mobile and render accordingly
      const isMobile = window.innerWidth <= 640;
      if (isMobile) {
        this.renderContentMobile();
      } else {
        this.renderContent();
      }

      // Restore payment methods HTML if it existed (prevents image reload)
      if (paymentMethodsHTML) {
        const newPaymentSection = document.querySelector('.salla-payment-methods');
        if (newPaymentSection && newPaymentSection.outerHTML !== paymentMethodsHTML) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = paymentMethodsHTML;
          newPaymentSection.replaceWith(tempDiv.firstChild);

          // Restart auto-scroll after restoration
          setTimeout(() => this.startPaymentSliderAutoScroll(), 100);
        }
      }

      // 🔥 NEW: Automatically expand the selected bundle's details
      setTimeout(() => {
        const itemsList = document.querySelector(\`#bundle-items-\${bundleId}\`);
        if (itemsList && !itemsList.classList.contains('expanded')) {
          itemsList.classList.add('expanded');
        }
      }, 50);

      // Auto-advance on mobile if step 1 complete
      if (isMobile && this.currentStep === 1) {
        setTimeout(() => {
          if (this.canProceedToNextStep()) {
            this.updateNavigationButtons();
          }
        }, 100);
      }
    }

    // Check if user is logged in
    isUserLoggedIn() {
      // Check if Salla is available and customer is logged in
      if (window.salla && window.salla.config && window.salla.config.get) {
        const isGuest = window.salla.config.get('user.guest');
        return !isGuest; // User is logged in if not a guest
      }
      return false;
    }

    // Trigger Salla login modal
    showLoginModal() {
      if (window.salla && window.salla.event) {
        // Trigger Salla's login event
        window.salla.event.emit('login::open');
      } else {
        // Fallback: redirect to login page
        window.location.href = '/login';
      }
    }

    async handleCheckout() {
      try {
        // Check if summary is collapsed on desktop - expand it first
        const isMobile = window.innerWidth <= 640;
        if (!isMobile) {
          const summaryDetails = document.querySelector('.salla-summary-details');
          if (summaryDetails && !summaryDetails.classList.contains('expanded')) {
            this.showSallaToast('يرجى مراجعة الملخص قبل إتمام الطلب', 'info');
            this.toggleSummary();
            return; // Stop checkout, user needs to review and click again
          }
        }

        // Validate Salla SDK is available
        if (!window.salla) {
          alert('عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى.');
          return;
        }

        // Check if user is logged in
        if (!this.isUserLoggedIn()) {
          this.showSallaToast('يجب تسجيل الدخول أولاً لإتمام الطلب', 'warning');
          this.showLoginModal();
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

    getSelectedBundleDisplayData() {
      const bundleConfig = this.bundleData.data || this.bundleData;
      const bundles = bundleConfig.bundles || [];
      const targetProductData = bundleConfig.target_product_data;
      const baseProductPrice = targetProductData?.price || 0;



      if (!this.selectedBundle) return null;

      // Find the selected tier
      const tierNumber = parseInt(this.selectedBundle.replace('tier-', ''));
      const selectedTier = bundles.find(tier => tier.tier === tierNumber);

      if (!selectedTier) return null;

      // Calculate the same way as in renderContentMobile
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
        name: selectedTier.tier_title || 'المستوى ' + selectedTier.tier,
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
              input.showPicker(); // Modern browsers
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

      // Show variants directly - clean, minimal, line by line
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

    // ===== MOBILE STEPPER NAVIGATION METHODS =====
    
    goNext() {
      if (!this.canProceedToNextStep()) {
        this.showStepValidationError();
        return;
      }

      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.updateStepUI();
        this.scrollToTop();
        // Trigger click feedback for navigation
        this.triggerFeedback('click');
      } else if (this.currentStep === this.totalSteps) {
        // Final step: trigger checkout
        this.handleCheckout();
        // Trigger success feedback for checkout
        this.triggerFeedback('success');
      }
    }

    goPrev() {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.updateStepUI();
        this.scrollToTop();
        // Trigger click feedback for navigation
        this.triggerFeedback('click');
      }
    }

    canProceedToNextStep() {
      const bundleConfig = this.bundleData.data || this.bundleData;
      const selectedBundleData = this.getSelectedBundleData();
      
      if (!selectedBundleData && this.currentStep !== 1) {
        return false;
      }
      
      // Get current step type
      const currentStepType = this.stepTypes ? this.stepTypes[this.currentStep - 1] : null;
      
      if (!currentStepType) {
        // Fallback: if no step types defined yet, allow first step
        return this.currentStep === 1 && this.selectedBundle !== null;
      }
      
      // Validate based on step type (not hardcoded step number)
      switch (currentStepType) {
        case 'bundles': // Bundle selection
          return this.selectedBundle !== null;
          
        case 'target_variants': // Target product variants
          if (!bundleConfig.target_product_data || !bundleConfig.target_product_data.has_variants) {
            return true; // No variants, auto-pass
          }
          const targetMissing = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData)
            .filter(m => !m.isOffer);
          return targetMissing.length === 0;
          
        case 'free_gifts': // Free gifts variants
          if (!selectedBundleData || !selectedBundleData.tier || !selectedBundleData.tier.offers) {
            return true;
          }
          const freeGifts = selectedBundleData.tier.offers.filter(o => o.discount_type === 'free');
          if (freeGifts.length === 0) {
            return true; // No free gifts, auto-pass
          }

          // Check if free gifts have variants
          const freeGiftsWithVariants = freeGifts.filter(g =>
            g.product_data && g.product_data.has_variants
          );

          if (freeGiftsWithVariants.length === 0) {
            return true; // No variants in free gifts, auto-pass
          }

          // Get all missing variants and filter only for free gifts
          const freeGiftMissing = this.getAllMissingRequiredVariants(bundleConfig, selectedBundleData)
            .filter(m => m.isOffer && freeGifts.some(o => o.product_id === m.productId));

          return freeGiftMissing.length === 0;
          
        case 'discounted': // Discounted products (optional)
          return true; // Always allow skip
          
        case 'review': // Review
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
      // Update progress bar
      this.updateProgressUI();

      // Show/hide step containers based on data-step attribute, not DOM index
      const allSteps = document.querySelectorAll('.salla-step-container');
      allSteps.forEach((step, index) => {
        // Use index + 1 to match step number (steps are 1-indexed)
        if (index + 1 === this.currentStep) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });
      
      // Re-initialize variant listeners for the current step
      setTimeout(() => {
        this.initializeVariantListeners();
      }, 50);
      
      // Update navigation buttons
      this.updateNavigationButtons();
      
      // Re-render footer to show/hide reviews based on current step
      const summary = document.querySelector('.salla-sticky-summary');
      const selectedBundleData = this.getSelectedBundleDisplayData();
      const bundleConfig = this.bundleData.data || this.bundleData;
      if (summary && selectedBundleData) {
        this.renderMobileFooter(summary, selectedBundleData, bundleConfig);
      }

      // Start modern reviews auto-scroll if on final step
      if (this.currentStep === this.totalSteps) {
        setTimeout(() => {
          this.startModernReviewsAutoScroll();
        }, 500);
      }

      // Animate free shipping progress bar when step appears
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
            // Add animation for newly completed steps
            step.style.transform = 'scale(1.2)';
            setTimeout(() => {
              step.style.transform = 'scale(1)';
            }, 200);
          }
          step.classList.add('completed');
        } else if (stepNumber === this.currentStep) {
          if (!wasActive) {
            hasProgressChange = true;
            // Add pulse animation for active step
            step.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
              step.style.animation = '';
            }, 600);
          }
          step.classList.add('active');
        }
      });

      // Trigger feedback if progress changed
      if (hasProgressChange) {
        this.triggerFeedback('progress');
      }

      // Update step counter animation
      this.updateStepCounter();

      // Re-animate free shipping progress when progress changes
      if (hasProgressChange) {
        setTimeout(() => {
          this.refreshFreeShippingAnimation();
        }, 200);
      }
    }

    // Enhanced step counter with animation
    updateStepCounter() {
      const stepCounter = document.querySelector('.salla-step-counter');
      if (stepCounter) {
        const progress = (this.currentStep / this.totalSteps) * 100;

        // Animate the counter
        stepCounter.style.transform = 'scale(1.1)';
        stepCounter.style.transition = 'transform 0.3s ease';

        setTimeout(() => {
          stepCounter.style.transform = 'scale(1)';
        }, 300);

        // Update counter text with animation
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

    // Animate free shipping progress bars when they appear
    animateFreeShippingProgress() {
      const freeShippingBanners = document.querySelectorAll('.salla-free-shipping-banner');

      freeShippingBanners.forEach(banner => {
        // Only animate if not already animated
        if (banner.hasProgressAnimated) return;

        // Add banner slide-in animation
        banner.style.animation = 'bannerSlideIn 0.6s ease-out';

        // Find progress bars within the banner
        const progressBars = banner.querySelectorAll('[style*="width:"]');

        progressBars.forEach(progressBar => {
          const widthMatch = progressBar.style.width.match(/(\d+(?:\.\d+)?)%/);
          if (widthMatch) {
            const targetWidth = widthMatch[1];

            // Set CSS variable for animation
            progressBar.style.setProperty('--target-width', targetWidth + '%');

            // Start with 0 width and animate to target
            progressBar.style.width = '0%';
            progressBar.style.animation = 'progressSlideIn 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards';

            // Trigger feedback based on progress
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

        // Animate percentage badges
        const percentageBadges = banner.querySelectorAll('span');
        percentageBadges.forEach(badge => {
          if (badge.textContent.includes('%')) {
            badge.style.animation = 'popIn 0.8s ease-out 0.6s both';
          }
        });

        // Mark as animated
        banner.hasProgressAnimated = true;
      });
    }

    // Refresh free shipping animation when content changes
    refreshFreeShippingAnimation() {
      const freeShippingBanners = document.querySelectorAll('.salla-free-shipping-banner');

      freeShippingBanners.forEach(banner => {
        // Reset animation flag
        banner.hasProgressAnimated = false;

        // Find progress bars and add subtle animation
        const progressBars = banner.querySelectorAll('[style*="width:"]');
        progressBars.forEach(progressBar => {
          const widthMatch = progressBar.style.width.match(/(\d+(?:\.\d+)?)%/);
          if (widthMatch) {
            const targetWidth = widthMatch[1];

            // Add pulse animation to show progress change
            progressBar.style.animation = 'pulse 0.8s ease-in-out';
            setTimeout(() => {
              progressBar.style.animation = progressBar.style.animation.includes('progressBarGlow') ?
                'progressBarGlow 2s ease-in-out infinite' : '';
            }, 800);
          }
        });

        // Re-trigger animation after a brief delay
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
        
        if (this.currentStep === this.totalSteps) {
          // Get custom checkout button text from settings
          const bundleConfig = this.bundleData.data || this.bundleData;
          const checkoutButtonText = bundleConfig.checkout_button_text || 'إتمام الطلب';
          nextBtn.textContent = checkoutButtonText;
          nextBtn.classList.add('primary');
        } else {
          nextBtn.textContent = 'التالي';
          nextBtn.classList.add('primary');
        }
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

        // Update button text
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
        // Skip if already selected or disabled
        if (select.value || select.disabled) return;
        
        // Count available options (excluding placeholder)
        const availableOptions = Array.from(select.options).filter(opt => 
          opt.value && !opt.disabled
        );
        
        // Auto-select if only one option available
        if (availableOptions.length === 1) {
          select.value = availableOptions[0].value;
          select.dispatchEvent(new Event('change'));
        }
      });
      
      // Update navigation buttons after auto-selection
      setTimeout(() => this.updateNavigationButtons(), 50);
    }
    
    initializeVariantListeners() {
      // Add change listeners to all variant selects to update navigation state
      const selects = document.querySelectorAll('.salla-variant-compact-select, .salla-variant-select');
      
      selects.forEach(select => {
        // Remove old listener if exists (prevent duplicates)
        if (select._variantChangeHandler) {
          select.removeEventListener('change', select._variantChangeHandler);
        }
        
        // Create and store the handler
        select._variantChangeHandler = () => {
          // Update navigation buttons when variants change
          setTimeout(() => this.updateNavigationButtons(), 50);
        };
        
        // Add the listener
        select.addEventListener('change', select._variantChangeHandler);
      });
    }

    // ===== END MOBILE STEPPER METHODS =====

    // ===== NEW FEATURE COMPONENTS =====

    // Render Timer Component (Always in header)
    renderTimer() {
      if (!this.timerSettings || !this.timerSettings.enabled) return '';
      
      const effectClass = this.timerSettings.effect !== 'none' ? this.timerSettings.effect : '';
      
      return \`
        <div class="salla-timer-container" id="salla-timer">
          <div class="salla-timer-label">\${this.timerSettings.style.label}</div>
          <div class="salla-timer-display \${effectClass}" id="salla-timer-display">00:00:00</div>
        </div>
      \`;
    }

    // Start Timer Countdown
    startTimer() {
      if (!this.timerEndTime) return;
      
      this.updateTimerDisplay();
      
      this.timerInterval = setInterval(() => {
        this.updateTimerDisplay();
      }, 1000);
    }

    // Update Timer Display
    updateTimerDisplay() {
      const display = document.getElementById('salla-timer-display');
      if (!display) return;
      
      const now = Date.now();
      const remaining = Math.max(0, this.timerEndTime - now);
      
      if (remaining === 0) {
        if (this.timerSettings.auto_restart) {
          // Restart timer
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

    // Helper to get current bundle total price
    calculateCurrentTotal() {
      if (!this.selectedBundleData || !this.selectedBundleData.price) {
        return 0;
      }
      return this.selectedBundleData.price;
    }

    // Helper method to get contrasting color for progress bar
    getContrastColor(bgColor, defaultColor) {
      // If background is light, use dark progress color
      // If background is dark, use light progress color
      const rgb = this.hexToRgb(bgColor);
      if (!rgb) return defaultColor;

      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

      if (brightness > 128) {
        // Light background - use darker progress color
        return this.getDarkerColor(bgColor, 0.6);
      } else {
        // Dark background - use lighter progress color or default
        return defaultColor === '#ffffff' ? '#ffffff' : this.getLighterColor(bgColor, 0.3);
      }
    }

    // Helper method to darken a color
    getDarkerColor(color, factor) {
      const rgb = this.hexToRgb(color);
      if (!rgb) return color;

      const r = Math.floor(rgb.r * (1 - factor));
      const g = Math.floor(rgb.g * (1 - factor));
      const b = Math.floor(rgb.b * (1 - factor));

      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    // Helper method to lighten a color
    getLighterColor(color, factor) {
      const rgb = this.hexToRgb(color);
      if (!rgb) return color;

      const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * factor));
      const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * factor));
      const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * factor));

      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    // Helper method to convert hex to RGB
    hexToRgb(hex) {
      if (!hex) return null;

      // Remove # if present
      hex = hex.replace('#', '');

      // Handle shorthand hex
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

    // Render Free Shipping Banner with dynamic settings
    renderFreeShippingBanner(currentTotal = 0) {
      const bundleConfig = this.bundleData.data || this.bundleData;
      const settings = bundleConfig.settings || {};
      const freeShipping = settings.free_shipping || {};

      // Check if free shipping is enabled and mode
      if (!freeShipping.enabled || freeShipping.mode === 'hidden') {
        return '';
      }

      const minPrice = freeShipping.min_price || 0;
      const showProgress = freeShipping.mode === 'min_price' && minPrice > 0;
      const isEligible = currentTotal >= minPrice;

      // Settings with defaults
      const bgColor = freeShipping.bg_color || '#10b981';
      const textColor = freeShipping.text_color || '#ffffff';
      const truckIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>';
      const checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
      const icon = freeShipping.icon || truckIcon;
      const text = freeShipping.text || 'شحن مجاني لهذه الباقة';
      const progressText = freeShipping.progress_text || 'أضف {amount} ريال للحصول على شحن مجاني';

      // Enhanced progress colors with better contrast
      const progressColor = this.getContrastColor(bgColor, freeShipping.progress_color || '#ffffff');
      const progressBgColor = this.getDarkerColor(bgColor, 0.2); // Darker background for contrast
      const borderRadius = freeShipping.border_radius || 12;

      // Enhanced progress calculation with animation
      const animateProgress = (percentage) => {
        // Add haptic feedback at milestones
        if (percentage >= 25 && percentage < 26) this.triggerFeedback('progress');
        if (percentage >= 50 && percentage < 51) this.triggerFeedback('progress');
        if (percentage >= 75 && percentage < 76) this.triggerFeedback('progress');
        if (percentage >= 100) this.triggerFeedback('complete');
      };

      // If mode is 'always' or eligible, show success message with ALWAYS a progress bar at 100%
      if (freeShipping.mode === 'always' || isEligible) {
        // Trigger success feedback when eligible
        if (isEligible && minPrice > 0) {
          setTimeout(() => this.triggerFeedback('success'), 100);
        }

        // For 'always' mode, show 100% progress bar to indicate completion
        const percentage = 100;
        const progressText = isEligible ? '🎉 مبروك! لقد حصلت على الشحن المجاني!' : '🚀 شحن مجاني متاح دائماً لهذه الباقة!';

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
              <span style="
                background: rgba(255,255,255,0.3);
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                min-width: 45px;
                text-align: center;
                animation: popIn 0.6s ease-out;
              ">100%</span>
            </div>

            <!-- ALWAYS show progress bar at 100% for visual consistency -->
            <div style="
              width: 100%;
              background: ' + progressBgColor + ';
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
                background: linear-gradient(90deg, ' + progressColor + ', rgba(255,255,255,0.6), ' + progressColor + ');
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

      // Show enhanced progress bar if not eligible yet
      if (showProgress && !isEligible) {
        const remaining = minPrice - currentTotal;
        const percentage = Math.min(100, (currentTotal / minPrice) * 100);
        const formattedRemaining = remaining.toFixed(2);
        const message = progressText.replace('{amount}', formattedRemaining);

        // Determine progress level for different visual treatments
        let progressLevel = 'low';
        if (percentage >= 75) progressLevel = 'high';
        else if (percentage >= 50) progressLevel = 'medium';
        else if (percentage >= 25) progressLevel = 'low-medium';

        // Trigger animation
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
              ">' + Math.round(percentage) + '%</span>
            </div>

            <!-- Enhanced progress bar with segments -->
            <div style="
              width: 100%;
              background: ' + progressBgColor + ';
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
                width: ' + percentage + '%;
                background: linear-gradient(90deg, ' + progressColor + ', rgba(255,255,255,0.4));
                height: 100%;
                transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                border-radius: 25px;
                position: relative;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3);
                border: 1px solid rgba(255,255,255,0.2);
              ">
                <!-- Shimmer effect -->
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

              <!-- Milestone markers -->
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

            <!-- Progress motivation text -->
            <div style="
              font-size: 11px;
              text-align: center;
              opacity: 0.9;
              font-weight: 500;
              animation: fadeInSlide 0.8s ease-out 0.2s both;
            ">
              ' + (percentage < 25 ? '🚀 ابدأ رحلتك نحو الشحن المجاني!' :
                percentage < 50 ? '💪 أحسنت! واصل التقدم...' :
                percentage < 75 ? '🔥 رائع! اقتربت جداً من الهدف!' :
                percentage < 100 ? '⭐ ممتاز! خطوة أخيرة فقط!' : '') + '
            </div>
          </div>
        \`;
      }
      
      return '';
    }

    // Render Reviews Carousel (Modern Boxy Style)
    renderReviewsCarousel() {
      if (!this.reviews || this.reviews.length === 0) return '';
      
      // Calculate average rating
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
          <div style="margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;" id="salla-reviews-dots-modern">
            \${this.reviews.map((_, index) => \`
              <span style="height: 6px; border-radius: 3px; transition: all 0.3s; \${index === 0 ? 'width: 24px; background: var(--text-1);' : 'width: 8px; background: var(--border);'}" data-dot-index="\${index}"></span>
            \`).join('')}
          </div>
        </div>
        <style>
          .salla-reviews-track-modern::-webkit-scrollbar {
            display: none;
          }
        </style>
      \`;
    }

    // Render Reviews Carousel (Old Style - Keep for backward compatibility)
    renderReviews() {
      if (!this.reviews || this.reviews.length === 0) return '';
      
      // Calculate average rating
      const totalRating = this.reviews.reduce((sum, r) => sum + (r.rating || 5), 0);
      const avgRating = (totalRating / this.reviews.length).toFixed(1);
      
      return \`
        <div class="salla-reviews-section">
          <div class="salla-reviews-header">
            <span>⭐ آراء العملاء</span>
            <span style="font-size: 13px; color: var(--text-2); font-weight: normal;">\${avgRating} ★ متوسط</span>
          </div>
          <div class="salla-reviews-carousel">
            <div class="salla-reviews-track" id="salla-reviews-track">
              \${this.reviews.map(review => \`
                <div class="salla-review-card">
                  <div class="salla-review-header">
                    <img src="\${review.customerAvatar || 'https://via.placeholder.com/40'}" 
                         alt="\${review.customerName}" 
                         class="salla-review-avatar"
                         onerror="this.src='https://via.placeholder.com/40'" />
                    <div class="salla-review-customer">
                      <div class="salla-review-name">\${review.customerName}</div>
                      <div class="salla-review-rating">\${'⭐'.repeat(review.rating)}</div>
                    </div>
                  </div>
                  <div class="salla-review-content">\${review.content}</div>
                  <!-- <div class="salla-review-time">\${review.timeAgo}</div> -->
                </div>
              \`).join('')}
            </div>
          </div>
          <div class="salla-reviews-dots" id="salla-reviews-dots">
            \${this.reviews.map((_, index) => \`
              <div class="salla-review-dot \${index === 0 ? 'active' : ''}" 
                   onclick="window.sallaBundleModal.scrollToReview(\${index})"></div>
            \`).join('')}
          </div>
        </div>
      \`;
    }

    // Start Reviews Auto-Scroll
    startReviewsAutoScroll() {
      if (!this.reviews || this.reviews.length <= 1) return;

      const track = document.getElementById('salla-reviews-track');
      if (!track) return;

      // Clear existing interval
      if (this.reviewsInterval) {
        clearInterval(this.reviewsInterval);
      }

      // State management
      let userIsInteracting = false;
      let interactionTimeout;
      let scrollSyncTimeout;

      // Sync dots with scroll position
      const syncDotsWithScroll = () => {
        const dots = document.querySelectorAll('.salla-review-dot');
        if (!dots.length) return;

        const scrollLeft = track.scrollLeft;
        const cardWidth = track.scrollWidth / this.reviews.length;
        const scrollIndex = Math.round(scrollLeft / cardWidth);

        // For RTL, reverse the index
        const currentIndex = this.reviews.length - 1 - scrollIndex;

        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });

        this.currentReviewIndex = currentIndex;
      };

      // Listen to scroll events to update dots
      track.addEventListener('scroll', () => {
        clearTimeout(scrollSyncTimeout);
        scrollSyncTimeout = setTimeout(syncDotsWithScroll, 100);
      }, { passive: true });

      // Detect user interaction
      const pauseAutoScroll = () => {
        userIsInteracting = true;
        clearTimeout(interactionTimeout);

        // Resume 3 seconds after last interaction
        interactionTimeout = setTimeout(() => {
          userIsInteracting = false;
        }, 3000);
      };

      // Add interaction listeners
      track.addEventListener('touchstart', pauseAutoScroll, { passive: true, once: false });
      track.addEventListener('mousedown', pauseAutoScroll, { passive: true, once: false });
      track.addEventListener('wheel', pauseAutoScroll, { passive: true, once: false });

      // Auto-scroll function
      const autoScroll = () => {
        if (!userIsInteracting && track && document.body.contains(track)) {
          this.scrollToNextReview();
        }
      };

      // Start interval - scroll every 4 seconds
      this.reviewsInterval = setInterval(autoScroll, 4000);
    }

    // Scroll to Next Review
    scrollToNextReview() {
      // For RTL, we need to go backwards (decrement index)
      this.currentReviewIndex = (this.currentReviewIndex - 1 + this.reviews.length) % this.reviews.length;
      this.scrollToReview(this.currentReviewIndex);
    }

    // Scroll to Specific Review
    scrollToReview(index) {
      const track = document.getElementById('salla-reviews-track');
      const dots = document.querySelectorAll('.salla-review-dot');

      if (!track || !dots.length || !this.reviews) return;

      // Calculate card width dynamically based on scroll width
      const totalScrollWidth = track.scrollWidth;
      const cardWidth = totalScrollWidth / this.reviews.length;

      // For RTL layout, calculate from the right side
      // In RTL, index 0 is at the rightmost position
      const scrollPosition = (this.reviews.length - 1 - index) * cardWidth;

      // Scroll to the calculated position
      track.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });

      // Update dots
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });

      this.currentReviewIndex = index;
    }

    // Scroll Modern Reviews by Step (for navigation buttons)
    scrollReviewBy(step) {
      if (!this.reviews || this.reviews.length === 0) return;

      const track = document.getElementById('salla-reviews-track-modern');
      const dots = document.querySelectorAll('[data-dot-index]');

      if (!track) return;

      // Calculate current index based on scroll position
      const scrollLeft = track.scrollLeft;
      const cardWidth = track.scrollWidth / this.reviews.length;
      let scrollIndex = Math.round(scrollLeft / cardWidth);

      // For RTL, reverse the scroll index to get the actual review index
      let currentIndex = this.reviews.length - 1 - scrollIndex;

      // Calculate next index with wrapping (step is already negative for "next" in RTL)
      let nextIndex = currentIndex - step; // Reverse step for RTL
      if (nextIndex < 0) nextIndex = this.reviews.length - 1;
      if (nextIndex >= this.reviews.length) nextIndex = 0;

      // Convert back to scroll index for RTL
      const nextScrollIndex = this.reviews.length - 1 - nextIndex;

      // Scroll to the review
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

        // Update dots
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

    // Start Modern Reviews Auto-Scroll (for final step)
    startModernReviewsAutoScroll() {
      if (!this.reviews || this.reviews.length <= 1) return;

      const track = document.getElementById('salla-reviews-track-modern');
      if (!track) return;

      // Clear any existing interval
      if (this.modernReviewsInterval) {
        clearInterval(this.modernReviewsInterval);
      }

      // State management
      let userIsInteracting = false;
      let interactionTimeout;
      let scrollSyncTimeout;

      // Sync dots with scroll position
      const syncDotsWithScroll = () => {
        const dots = document.querySelectorAll('[data-dot-index]');
        if (!dots.length) return;

        const scrollLeft = track.scrollLeft;
        const cardWidth = track.scrollWidth / this.reviews.length;
        const scrollIndex = Math.round(scrollLeft / cardWidth);

        // For RTL, reverse the index
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

      // Listen to scroll events to update dots
      track.addEventListener('scroll', () => {
        clearTimeout(scrollSyncTimeout);
        scrollSyncTimeout = setTimeout(syncDotsWithScroll, 100);
      }, { passive: true });

      // Detect user interaction
      const pauseAutoScroll = () => {
        userIsInteracting = true;
        clearTimeout(interactionTimeout);

        // Resume 3 seconds after last interaction
        interactionTimeout = setTimeout(() => {
          userIsInteracting = false;
        }, 3000);
      };

      // Add interaction listeners
      track.addEventListener('touchstart', pauseAutoScroll, { passive: true, once: false });
      track.addEventListener('mousedown', pauseAutoScroll, { passive: true, once: false });
      track.addEventListener('wheel', pauseAutoScroll, { passive: true, once: false });

      // Auto-scroll function
      const autoScroll = () => {
        if (!userIsInteracting && track && document.body.contains(track)) {
          this.scrollReviewBy(1);
        }
      };

      // Start interval - scroll every 4 seconds
      this.modernReviewsInterval = setInterval(autoScroll, 4000);
    }

    // Render Discount Code Section
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
                     value="\${this.discountCode}" />
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

    // Toggle Discount Section
    toggleDiscountSection() {
      const body = document.getElementById('salla-discount-body');
      const toggle = document.getElementById('salla-discount-toggle');
      
      if (body && toggle) {
        body.classList.toggle('expanded');
        toggle.classList.toggle('expanded');
      }
    }

    // Toggle Desktop Summary
    toggleSummary() {
      const toggle = document.querySelector('.salla-summary-toggle');
      const details = document.querySelector('.salla-summary-details');
      
      if (toggle && details) {
        toggle.classList.toggle('expanded');
        details.classList.toggle('expanded');
      }
    }

    // Apply Discount Code
    async applyDiscountCode() {
      const input = document.getElementById('salla-discount-input');
      const messageEl = document.getElementById('salla-discount-message');
      
      if (!input || !messageEl) return;
      
      // Check if user is logged in
      if (!this.isUserLoggedIn()) {
        messageEl.innerHTML = '<div class="salla-discount-message error">يجب تسجيل الدخول لتطبيق كود الخصم</div>';
        setTimeout(() => {
          this.showLoginModal();
        }, 1500);
        return;
      }
      
      const code = input.value.trim();
      
      if (!code) {
        messageEl.innerHTML = '<div class="salla-discount-message error">الرجاء إدخل كود الخصم</div>';
        return;
      }
      
      try {
        messageEl.innerHTML = '<div class="salla-discount-message">جاري التحقق...</div>';
        
        const storeId = this.contextData.storeId || this.storeDomain;
        const response = await fetch(\`\${this.apiUrl}/storefront/stores/\${storeId}/validate-coupon\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({ code })
        });
        
        const result = await response.json();
        
        if (result.success && result.valid) {
          this.appliedDiscount = result.data;
          this.discountCode = code;
          messageEl.innerHTML = \`<div class="salla-discount-message success">\${result.data.message}</div>\`;
          
          // Update summary to reflect discount
          setTimeout(() => this.updateSummaryWithDiscount(), 300);
        } else {
          messageEl.innerHTML = \`<div class="salla-discount-message error">\${result.message || 'كود الخصم غير صالح'}</div>\`;
        }
      } catch (error) {
        console.error('[Discount] Apply error:', error);
        messageEl.innerHTML = '<div class="salla-discount-message error">حدث خطأ، حاول مرة أخرى</div>';
      }
    }

    updateSummaryWithDiscount() {
      // This will recalculate the summary including the discount
    }

    renderPaymentMethods() {
      if (!this.paymentMethods || this.paymentMethods.length === 0) return '';

      // Icon map - ONLY these payment methods will be shown
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
        'emkan_installment': 'emkano.svg',
        'mada': 'mada.svg'
      };

      // Filter to only show payment methods that have icons in the map
      const validMethods = this.paymentMethods.filter(method =>
        method && method.slug && iconMap.hasOwnProperty(method.slug)
      );

      // If no valid methods, don't render anything
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

      // Triple duplicate for smoother infinite scroll effect
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
      // This method is now deprecated but kept for backward compatibility
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
        'emkan_installment': 'emkano.svg',
        'mada': 'mada.svg'
      };

      if (!iconMap.hasOwnProperty(slug)) {
        return ''; // Don't return anything if icon doesn't exist
      }

      const iconFile = iconMap[slug];
      const iconPath = baseUrl + '/icons/' + iconFile;

      return '<img src="' + iconPath + '" alt="' + slug + '" class="salla-payment-logo" />';
    }

    // Start Payment Slider Auto-Scroll
    startPaymentSliderAutoScroll() {
      // Clear existing animation frame if any
      if (this.paymentSliderAnimationFrame) {
        cancelAnimationFrame(this.paymentSliderAnimationFrame);
        this.paymentSliderAnimationFrame = null;
      }

      const slider = document.getElementById('salla-payment-slider');
      if (!slider) {
        return;
      }

      // Check if slider has content
      if (slider.scrollWidth <= slider.clientWidth) {
        return;
      }

      // Disable smooth scrolling for seamless loop
      slider.style.scrollBehavior = 'auto';

      // Calculate the width of one set (we have 3 copies)
      const oneSetWidth = slider.scrollWidth / 3;

      let lastTime = performance.now();
      const scrollSpeed = 15; // pixels per second
      let isPaused = false;
      let interactionTimeout;

      // Pause on interaction
      const pauseScroll = () => {
        isPaused = true;
        clearTimeout(interactionTimeout);

        // Resume after 2 seconds
        interactionTimeout = setTimeout(() => {
          isPaused = false;
          lastTime = performance.now(); // Reset to prevent jump
        }, 2000);
      };

      // Add event listeners
      slider.addEventListener('touchstart', pauseScroll, { passive: true, once: false });
      slider.addEventListener('mousedown', pauseScroll, { passive: true, once: false });
      slider.addEventListener('wheel', pauseScroll, { passive: true, once: false });

      // Pause on hover
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

          // Scroll smoothly
          slider.scrollLeft += scrollSpeed * deltaTime;

          // Infinite loop: reset when reaching end of first set
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

    // ===== END NEW FEATURE COMPONENTS =====

    show() {
      if (this.modalElement) {
        this.modalElement.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Trigger satisfying feedback when modal opens
        this.triggerFeedback('success');

        // Start timer, reviews, and payment slider after modal shows
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
        document.body.style.overflow = '';

        // Clear intervals
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
