# Hide Product Price Section Feature

## Overview
This feature adds a new toggle in the dashboard settings that allows merchants to hide the product price section on product pages when bundle offers are active.

## Implementation Details

### 1. Database Schema
**File**: `server/src/modules/settings/model/settings.model.js`

Added new field:
```javascript
hide_product_price: {
  type: Boolean,
  default: false,
}
```

### 2. Settings Service
**File**: `server/src/modules/settings/services/settings.service.js`

- Added `hide_product_price` to default settings creation
- Added to allowed fields for validation and updates

### 3. Snippet Controller (Client-side injection)
**File**: `server/src/modules/bundles/controllers/snippet.controller.js`

Added new method `hideProductPrice()` that:

#### Detection Methods (catches various theme implementations):
1. **CSS :has() selectors** - Hides sections containing:
   - `.price-wrapper`
   - `.total-price`
   - `.before-price`
   - `.price_is_on_sale`
   - `.starting-or-normal-price`

2. **Direct element hiding** - Hides price elements directly

3. **Label text detection** - Checks for labels containing:
   - "السعر" (Arabic for "Price")
   - "Price" (English)

4. **JavaScript backup** - Uses MutationObserver to:
   - Detect dynamically loaded price elements
   - Hide parent sections containing price elements
   - Continuously monitor DOM changes every 500ms

#### Protection Mechanisms:
- Always keeps bundle UI visible
- Checks for `[data-salla-bundle]` attribute
- Prevents hiding bundle container elements

### 4. Dashboard UI
**File**: `dashboard/src/pages/SettingsPage.jsx`

Added:
- New toggle switch "إخفاء قسم السعر الافتراضي"
- Demo button to show example screenshot
- Info alert explaining the feature
- Modal with screenshot reference

### 5. Assets
**Files**: 
- `dashboard/public/salla-price.png` - Placeholder image (replace with actual screenshot)
- `dashboard/public/README-IMAGES.md` - Instructions for image replacement

## Usage

### For Merchants:
1. Log into the dashboard
2. Navigate to Settings (الإعدادات)
3. Find "إخفاء قسم السعر الافتراضي" toggle
4. Enable the toggle
5. Price sections will be hidden on product pages with active bundles

### For Developers:
The feature automatically handles various Salla theme structures. It looks for common patterns:

```html
<!-- Example 1: Standard Salla price section -->
<section class="flex bg-white p-5 rounded-md">
  <div class="center-between w-full">
    <label class="form-label">
      <b class="block">السعر</b>
    </label>
    <div class="price-wrapper">
      <h2 class="total-price">١٧٤ SAR</h2>
      <span class="before-price line-through">٣٤٩ SAR</span>
    </div>
  </div>
</section>

<!-- Example 2: Sale price section -->
<div class="price_is_on_sale">
  <h2 class="total-price text-red-800">١٧٤ SAR</h2>
  <span class="before-price text-gray-500">٣٤٩ SAR</span>
</div>

<!-- Example 3: Normal price -->
<div class="starting-or-normal-price">
  <h2 class="total-price">١٧٤ SAR</h2>
</div>
```

## Testing

### Manual Testing Steps:
1. **Enable the toggle in dashboard**
   - Go to Settings page
   - Enable "إخفاء قسم السعر الافتراضي"
   - Verify toggle state is saved

2. **Test on product page**
   - Visit a product with active bundle offers
   - Verify price section is hidden
   - Verify bundle UI is still visible
   - Check browser console for any errors

3. **Test dynamic content**
   - Navigate between products
   - Verify price sections remain hidden
   - Test with different themes

4. **Test toggle off**
   - Disable the toggle
   - Verify price sections are visible again

### Browser Compatibility:
- Modern browsers supporting `:has()` CSS selector
- JavaScript MutationObserver (all modern browsers)
- Fallback methods for older browsers

## Notes

1. **Image Replacement**: Replace `dashboard/public/salla-price.png` with an actual screenshot showing the Salla price section that will be hidden.

2. **Theme Compatibility**: The implementation uses multiple detection methods to ensure compatibility with various Salla themes. If a theme uses non-standard classes, additional selectors can be added to the `hideProductPrice()` method.

3. **Performance**: The feature uses efficient CSS selectors and throttled JavaScript checks (500ms intervals) to minimize performance impact.

4. **Bundle UI Protection**: The implementation includes multiple checks to ensure bundle UI elements are never accidentally hidden.

## Future Improvements

Potential enhancements:
- Add custom CSS selector input in dashboard for edge cases
- Theme-specific detection patterns
- Performance optimization for large product catalogs
- A/B testing integration to measure impact on conversions
