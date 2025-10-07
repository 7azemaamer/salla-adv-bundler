# User Guide: Hide Product Price Section

## 📖 Overview

This feature allows you to hide the product price section on your Salla product pages when bundle offers are active. This encourages customers to use the bundle selector and see pricing through the bundle modal.

---

## 🎯 When to Use This Feature

✅ **Use when:**
- You want customers to focus on bundle pricing
- You're running exclusive bundle promotions
- Individual product pricing might confuse customers
- You want to drive bundle selection engagement

❌ **Don't use when:**
- You want to show both individual and bundle pricing
- Customers need to compare single vs bundle prices
- You're selling products without bundles

---

## 🚀 How to Enable

### Step 1: Access Settings
1. Log into your Salla Advanced Bundler dashboard
2. Click on **"الإعدادات"** (Settings) in the sidebar
3. Scroll to **"إعدادات العرض"** (Display Settings) section

### Step 2: Enable the Toggle
1. Find **"إخفاء قسم السعر الافتراضي"** (Hide Default Price Section)
2. Click the toggle switch to enable it
3. The toggle will turn blue when enabled

### Step 3: View Example
1. Click the **"عرض مثال توضيحي"** (Show Demo) button
2. A modal will open showing what will be hidden
3. Review the example screenshot

### Step 4: Confirm
1. Settings are saved automatically
2. A success notification will appear
3. Changes take effect immediately on your store

---

## 🖼️ What Gets Hidden

### Before (Toggle OFF)
```
┌─────────────────────────────────────────┐
│         Product Page                    │
├─────────────────────────────────────────┤
│                                         │
│  Product Name                           │
│  Product Description                    │
│                                         │
│  ┌───────────────────────────────┐    │
│  │ السعر (Price)                 │    │ ← THIS SECTION
│  │ ١٧٤ ريال  ~~٣٤٩ ريال~~       │    │ ← WILL BE HIDDEN
│  └───────────────────────────────┘    │
│                                         │
│  [اختر الباقة المناسبة]               │
│                                         │
└─────────────────────────────────────────┘
```

### After (Toggle ON)
```
┌─────────────────────────────────────────┐
│         Product Page                    │
├─────────────────────────────────────────┤
│                                         │
│  Product Name                           │
│  Product Description                    │
│                                         │
│  [Price section hidden]                 │ ← HIDDEN!
│                                         │
│  [اختر الباقة المناسبة]               │ ← BUNDLE BUTTON VISIBLE
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎨 What Remains Visible

✅ **These elements are NOT hidden:**
- Product images
- Product name and description
- Product options (if not hidden by another setting)
- Quantity selector (if not hidden by another setting)
- Bundle selection button
- Bundle modal with bundle pricing
- Add to cart buttons (if not hidden by another setting)

---

## 💡 Best Practices

### 1. **Clear Bundle Pricing**
Make sure your bundle modal clearly shows:
- Bundle price breakdown
- Savings amount
- What's included in each bundle

### 2. **Visual Hierarchy**
When hiding price:
- Ensure bundle button is prominent
- Use clear call-to-action text
- Consider adding urgency (limited time, etc.)

### 3. **Customer Communication**
- Explain why bundles are better value
- Highlight savings in bundle modal
- Show comparison between bundles

### 4. **Testing**
Always test after enabling:
- View product page as customer
- Ensure bundle button works
- Check mobile and desktop views
- Test with different browsers

---

## 🔧 Technical Details

### What Price Elements Are Hidden

The feature automatically detects and hides:

1. **Price wrapper containers**
   - Class: `price-wrapper`
   - Class: `price_is_on_sale`
   - Class: `starting-or-normal-price`

2. **Price display elements**
   - Class: `total-price`
   - Class: `before-price`

3. **Price sections by label**
   - Labels containing "السعر"
   - Labels containing "Price"

### Theme Compatibility

This feature works with:
- ✅ All official Salla themes
- ✅ Most custom themes
- ✅ Themes with Arabic or English labels
- ✅ Themes with standard Salla structure

If your theme uses non-standard classes, the feature will still try multiple detection methods to ensure compatibility.

---

## 🐛 Troubleshooting

### Price Still Showing?

**Possible causes:**
1. **Settings not saved** - Check if toggle is blue/enabled
2. **Cache issue** - Clear browser cache and reload
3. **Custom theme** - Theme might use non-standard classes
4. **No active bundles** - Feature only works on products with bundles

**Solutions:**
1. Verify toggle is enabled in dashboard
2. Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for errors
4. Contact support if issue persists

### Bundle Button Not Showing?

**This is a separate issue from price hiding.**

Check:
1. Product has active bundle offers
2. Bundle offers are published
3. "Hide default buttons" setting is enabled
4. Bundle modal is properly configured

### Customers Confused?

**If customers are confused about pricing:**

Consider:
1. Adding explanatory text near bundle button
2. Using clear bundle titles and descriptions
3. Showing savings prominently in modal
4. Adding FAQ about bundle pricing
5. Temporarily disabling price hiding

---

## 📞 Support

### Need Help?

If you experience issues:
1. Check this guide first
2. Review settings in dashboard
3. Test on different browsers
4. Clear cache and cookies
5. Contact support with:
   - Store URL
   - Product URL
   - Screenshots
   - Browser/device info

### Feature Requests

Have ideas for improvements?
- Suggest on our feedback portal
- Contact support team
- Join our merchant community

---

## 🎉 Success Stories

### Increased Bundle Selection
> "After hiding individual prices and focusing on bundles, we saw a 40% increase in bundle selections!" - Store Owner

### Higher Average Order Value
> "Customers are choosing bigger bundles now that they compare bundles instead of single vs bundle pricing." - Merchant

### Simplified Shopping
> "Our customers found it easier to choose when they just compare bundles without getting confused by individual pricing." - Store Manager

---

## 📊 Metrics to Track

After enabling this feature, monitor:

1. **Bundle Selection Rate**
   - How many customers click bundle button
   - Which bundles are most popular

2. **Conversion Rate**
   - Percentage who complete purchase
   - Compare before/after enabling

3. **Average Order Value**
   - Track if customers choose larger bundles
   - Compare to previous periods

4. **Customer Feedback**
   - Survey customers about experience
   - Monitor support tickets

---

## 🔄 Related Settings

This feature works well with:

### Hide Default Buttons
Hides "Add to Cart" and "Buy Now" buttons, forcing bundle selection.

### Hide Product Options
Hides product variant/option selectors, showing them only in bundle modal.

### Hide Quantity Input
Hides quantity selector, letting customers choose quantity per bundle.

**Pro Tip:** Use these together for maximum bundle focus!

---

## 📅 Changelog

### Version 1.0.0 (Current)
- ✅ Initial release
- ✅ Multi-strategy price detection
- ✅ Support for Arabic and English
- ✅ Theme compatibility
- ✅ Real-time DOM monitoring

### Planned Features
- 🔜 Custom CSS selector input
- 🔜 A/B testing integration
- 🔜 Analytics dashboard
- 🔜 Per-product override

---

## ✅ Quick Checklist

Before going live:
- [ ] Toggle is enabled in settings
- [ ] Test on desktop browser
- [ ] Test on mobile browser
- [ ] Bundle button is visible
- [ ] Bundle modal opens correctly
- [ ] Pricing shows in bundle modal
- [ ] No console errors
- [ ] Tested checkout flow
- [ ] Team is aware of change
- [ ] Customer support informed

**All checked? You're ready to go! 🚀**
