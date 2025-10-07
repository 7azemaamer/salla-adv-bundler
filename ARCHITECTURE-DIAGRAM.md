# Architecture Diagram: Hide Product Price Feature

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         DASHBOARD (React)                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │          Settings Page Component                        │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │ Toggle: "إخفاء قسم السعر الافتراضي"            │   │
│  │  │ ☐ Disabled  /  ☑ Enabled                       │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                         │                               │   │
│  │                         │ onChange                      │   │
│  │                         ▼                               │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │ handleToggleChange("hide_product_price", true) │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  └────────────────────────────┬───────────────────────────┘   │
│                                │                                │
└────────────────────────────────┼────────────────────────────────┘
                                 │
                                 │ API Call: PUT /api/settings
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER (Node.js/Express)                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │            Settings Controller                          │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │ Validate: "hide_product_price" in allowed     │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  │                         │                               │   │
│  │                         ▼                               │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │ Settings Service: updateSettings()            │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  │                         │                               │   │
│  │                         ▼                               │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │ MongoDB: Update store settings                │     │   │
│  │  │ { hide_product_price: true }                  │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │            Snippet Controller                           │   │
│  │         (Generates JavaScript for Salla)                │   │
│  │                                                          │   │
│  │  GET /api/bundles/snippet?store_id={id}                │   │
│  │                         │                               │   │
│  │                         ▼                               │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │ Fetch settings from MongoDB                   │     │   │
│  │  │ const settings = { hide_product_price: true } │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  │                         │                               │   │
│  │                         ▼                               │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │ Generate snippet.js with settings embedded    │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  └────────────────────────┬───────────────────────────────┘   │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │ JavaScript snippet
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER (Salla Store)                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Product Page Loaded                        │   │
│  │                                                          │   │
│  │  <form class="product-form">                            │   │
│  │    <section>                                            │   │
│  │      <label>السعر</label>                               │   │
│  │      <div class="price-wrapper">                        │   │
│  │        <h2 class="total-price">١٧٤ SAR</h2>            │   │
│  │        <span class="before-price">٣٤٩ SAR</span>       │   │
│  │      </div>                                             │   │
│  │    </section>                                           │   │
│  │  </form>                                                │   │
│  │                                                          │   │
│  └────────────────────────────┬───────────────────────────┘   │
│                                │                                │
│                                │ Snippet Execution              │
│                                ▼                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │        SallaBundleApp.hideProductPrice()                │   │
│  │                                                          │   │
│  │  if (settings.hide_product_price) {                     │   │
│  │                                                          │   │
│  │    ┌──────────────────────────────────────────────┐   │   │
│  │    │ Step 1: Add CSS to hide price sections       │   │   │
│  │    │                                               │   │   │
│  │    │ form.product-form section:has(.price-wrapper)│   │   │
│  │    │ { display: none !important; }                │   │   │
│  │    └──────────────────────────────────────────────┘   │   │
│  │                      │                                  │   │
│  │                      ▼                                  │   │
│  │    ┌──────────────────────────────────────────────┐   │   │
│  │    │ Step 2: Hide via JavaScript                  │   │   │
│  │    │                                               │   │   │
│  │    │ Query all .price-wrapper elements            │   │   │
│  │    │ Set display: none !important                 │   │   │
│  │    │ Hide parent sections                         │   │   │
│  │    └──────────────────────────────────────────────┘   │   │
│  │                      │                                  │   │
│  │                      ▼                                  │   │
│  │    ┌──────────────────────────────────────────────┐   │   │
│  │    │ Step 3: Setup MutationObserver               │   │   │
│  │    │                                               │   │   │
│  │    │ Monitor DOM for new price elements           │   │   │
│  │    │ Hide them as they appear                     │   │   │
│  │    └──────────────────────────────────────────────┘   │   │
│  │                      │                                  │   │
│  │                      ▼                                  │   │
│  │    ┌──────────────────────────────────────────────┐   │   │
│  │    │ Step 4: Protect Bundle UI                    │   │   │
│  │    │                                               │   │   │
│  │    │ Keep [data-salla-bundle] elements visible    │   │   │
│  │    │ Ensure bundle button always shows            │   │   │
│  │    └──────────────────────────────────────────────┘   │   │
│  │  }                                                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              RESULT: Product Page                       │   │
│  │                                                          │   │
│  │  <form class="product-form">                            │   │
│  │    <section style="display: none !important;">          │   │
│  │      <!-- Price section hidden -->                      │   │
│  │    </section>                                           │   │
│  │                                                          │   │
│  │    <!-- Bundle UI visible -->                           │   │
│  │    <div data-salla-bundle="true">                       │   │
│  │      <button class="salla-bundle-btn">                  │   │
│  │        اختر الباقة المناسبة                              │   │
│  │      </button>                                          │   │
│  │    </div>                                               │   │
│  │  </form>                                                │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Detection Strategy Flow

```
┌────────────────────────────────────────────────────────────┐
│         hideProductPrice() Detection Methods               │
└────────────────────────────────────────────────────────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
           ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Method 1 │    │ Method 2 │    │ Method 3 │
    │   CSS    │    │    JS    │    │ Observer │
    │ Selectors│    │ Detection│    │Continuous│
    └──────────┘    └──────────┘    └──────────┘
          │               │               │
          │               │               │
          ▼               ▼               ▼
    
    CSS :has()        querySelectorAll   MutationObserver
    - Modern          - Fallback          - Dynamic content
    - Fast            - Compatible        - Real-time
    - Efficient       - Reliable          - Continuous
    
          │               │               │
          └───────────────┴───────────────┘
                          │
                          ▼
                ┌──────────────────┐
                │  All methods      │
                │  work together    │
                │  for maximum      │
                │  compatibility    │
                └──────────────────┘
                          │
                          ▼
                ┌──────────────────┐
                │ Price sections   │
                │ successfully     │
                │ hidden across    │
                │ all themes       │
                └──────────────────┘
```

## Data Flow

```
[Merchant Dashboard]
        │
        │ Toggle ON
        │
        ▼
[Update MongoDB]
        │
        │ { store_id: "xxx", hide_product_price: true }
        │
        ▼
[Snippet Generation]
        │
        │ settings.hide_product_price === true
        │
        ▼
[JavaScript Injection]
        │
        │ hideProductPrice() called
        │
        ▼
[Price Section Detection]
        │
        ├─► .price-wrapper elements
        ├─► .total-price elements
        ├─► .before-price elements
        ├─► Labels containing "السعر"
        └─► Labels containing "Price"
        │
        ▼
[Apply Hiding]
        │
        ├─► CSS: display: none !important
        ├─► Visibility: hidden !important
        └─► Pointer-events: none !important
        │
        ▼
[Protect Bundle UI]
        │
        ├─► Keep [data-salla-bundle] visible
        └─► Keep .salla-bundle-btn visible
        │
        ▼
[Result: Price Hidden, Bundle Visible]
```

## State Management

```
┌─────────────────────────────────────────────────────┐
│                 Application State                    │
└─────────────────────────────────────────────────────┘

Dashboard State (React):
{
  settings: {
    hide_default_buttons: boolean,
    hide_salla_offer_modal: boolean,
    hide_product_options: boolean,
    hide_quantity_input: boolean,
    hide_product_price: boolean ← NEW
  },
  loading: {
    fetching: boolean,
    updating: boolean
  },
  showPriceModal: boolean ← NEW
}

Database State (MongoDB):
{
  _id: ObjectId("..."),
  store_id: "1234567890",
  hide_default_buttons: false,
  hide_salla_offer_modal: false,
  hide_product_options: false,
  hide_quantity_input: false,
  hide_product_price: false, ← NEW
  createdAt: Date,
  updatedAt: Date
}

Client State (Browser):
{
  settings: {
    hide_product_price: true
  },
  observers: [MutationObserver],
  intervals: [setInterval],
  styleElements: [<style id="salla-bundle-hide-product-price">]
}
```

## Error Handling

```
┌─────────────────────────────────────────────────────┐
│              Error Handling Flow                     │
└─────────────────────────────────────────────────────┘

API Request
    │
    ├─► Success: Update settings
    │       │
    │       └─► Show success notification
    │
    └─► Error: Failed to update
            │
            ├─► Catch error
            ├─► Rollback UI state
            ├─► Show error notification
            └─► Log to console

Snippet Execution
    │
    ├─► Settings loaded successfully
    │       │
    │       └─► Execute hideProductPrice()
    │
    └─► Settings load failed
            │
            ├─► Use default settings
            ├─► Log warning
            └─► Continue with other features

DOM Manipulation
    │
    ├─► Elements found
    │       │
    │       └─► Apply hiding
    │
    └─► Elements not found
            │
            ├─► Continue monitoring
            ├─► Try again on mutation
            └─► No error thrown (graceful)
```
