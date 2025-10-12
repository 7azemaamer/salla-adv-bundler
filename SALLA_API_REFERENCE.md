# 📚 Salla JavaScript API Reference - Key Methods

This document summarizes the Salla JavaScript API methods used in the Bundle Modal.

---

## 🔐 **Authentication / Login**

### Trigger Login Modal

**Methods Available:**
```javascript
// Method 1: Event Emit (Recommended)
salla.event.emit('login::open')

// Method 2: Direct Method
salla.login.open()
```

**Your Implementation:** ✅ **Already Implemented**
```javascript
// Location: modal.routes.js:3140-3148
showLoginModal() {
  if (window.salla && window.salla.event) {
    // Trigger Salla's login event
    window.salla.event.emit('login::open');  // ✅
  } else {
    // Fallback: redirect to login page
    window.location.href = '/login';
  }
}
```

**Usage:**
```javascript
// Called from handleCheckout() when user is not logged in
if (!this.isUserLoggedIn()) {
  this.showSallaToast('يجب تسجيل الدخول أولاً لإتمام الطلب', 'warning');
  this.showLoginModal();  // ✅
  return;
}
```

### Check if User is Logged In

```javascript
// Location: modal.routes.js:3128-3136
isUserLoggedIn() {
  // Check if Salla is available and customer is logged in
  if (window.salla && window.salla.config && window.salla.config.get) {
    const isGuest = window.salla.config.get('user.guest');
    return !isGuest; // User is logged in if not a guest
  }
  return false;
}
```

---

## 🛒 **Cart Operations**

### Add Item to Cart

**Method:**
```javascript
salla.cart.addItem({
  id: productId,           // Product ID
  quantity: 1,             // Quantity
  options: {               // Product options/variants
    optionId: valueId
  }
})
```

**Your Implementation:** ✅ **Already Implemented**
```javascript
// Location: modal.routes.js:3270-3276
const targetCartItem = {
  id: this.productId,
  quantity: 1,
  options: targetOptionsForThisQuantity
};

await window.salla.cart.addItem(targetCartItem);  // ✅
```

**Returns:** Promise that resolves when item is added

---

### Navigate to Cart Page

**Method:**
```javascript
// Salla does NOT provide direct checkout
// You MUST navigate to cart page first
window.location.href = cartUrl;
```

**Your Implementation:** ✅ **Already Implemented**
```javascript
// Location: modal.routes.js:3382-3389
const currentPath = window.location.pathname;
const pathMatch = currentPath.match(/^(\/[^/]+\/)/);
const basePath = pathMatch ? pathMatch[1] : '/';
const cartUrl = `${window.location.origin}${basePath}cart`;

window.location.href = cartUrl;  // ✅
```

**Note:**
- ❌ Salla does NOT support direct checkout navigation
- ✅ Standard flow: Product → Cart → Checkout
- ✅ Your implementation is correct

---

## 📦 **Product Configuration**

### Get Salla Config Values

```javascript
// Get store configuration
window.salla.config.get('user.guest')        // Check if user is guest
window.salla.config.get('store.id')          // Store ID
window.salla.config.get('store.domain')      // Store domain
window.salla.config.get('customer.id')       // Customer ID
```

---

## 🎯 **Events**

### Authentication Events

**Listen to Login Success:**
```javascript
salla.event.on('auth::verified', (response, authType) => {
  console.log('User logged in successfully');
});
```

**Trigger Login Modal:**
```javascript
salla.event.emit('login::open');  // ✅ Used in your code
```

### Cart Events

**Listen to Item Added:**
```javascript
salla.event.on('cart::item-added', (response) => {
  console.log('Item added to cart', response);
});
```

---

## 📋 **Summary of Your Current Implementation**

| Feature | Method Used | Status |
|---------|-------------|--------|
| **Trigger Login** | `salla.event.emit('login::open')` | ✅ Correct |
| **Check Auth** | `salla.config.get('user.guest')` | ✅ Correct |
| **Add to Cart** | `salla.cart.addItem()` | ✅ Correct |
| **Navigate to Cart** | `window.location.href = cartUrl` | ✅ Correct (only way) |
| **Direct Checkout** | N/A - Not supported by Salla | ❌ Not available |

---

## ✅ **All Your Salla API Usages are Correct!**

Your implementation follows Salla's best practices:

1. ✅ Proper login modal trigger
2. ✅ Correct authentication check
3. ✅ Proper cart item addition
4. ✅ Standard navigation flow (cart → checkout)

**No changes needed!** 🎉

---

## 📚 **Official Documentation**

- [Salla Twilight JS SDK](https://docs.salla.dev/422610m0)
- [Salla Login Modal](https://docs.salla.dev/422711m0)
- [Salla Cart API](https://docs.salla.dev/doc-422575)
- [Salla Events](https://docs.salla.dev/doc-422611)

