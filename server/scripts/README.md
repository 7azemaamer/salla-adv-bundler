# Server Scripts

Collection of utility scripts for managing the Salla Bundle application.

## Available Scripts

### 1. Refresh All Reviews (`refreshAllReviews.js`)

Manually refreshes cached product reviews for all products in the database by fetching fresh data from Salla API.

**Usage:**

```bash
npm run refresh-reviews
```

or

```bash
node scripts/refreshAllReviews.js
```

**What it does:**

- Connects to MongoDB
- Fetches all cached products from `ProductCache` collection
- For each product:
  - Gets valid access token for the store
  - Fetches fresh reviews from Salla API
  - Updates the cached reviews in MongoDB
  - Sets new cache expiry (7 days)
- Shows detailed progress and summary

**When to use:**

- After major Salla API changes
- To force refresh all reviews immediately
- For maintenance or debugging purposes
- Complement to the weekly cron job

**Output Example:**

```
================================================================================
🔄 Starting Manual Review Refresh...
================================================================================
✅ Connected to MongoDB
📦 Found 25 cached products to refresh

[1/25] Processing product 2054606251 (store: 115531408)
  ✅ Updated 12 reviews

[2/25] Processing product 340166806 (store: 115531408)
  ✅ Updated 8 reviews

...

================================================================================
📊 Refresh Summary:
================================================================================
✅ Success: 23
❌ Errors: 1
⚠️  Skipped: 1
📦 Total: 25
================================================================================
```

---

### 2. Fetch All Payments (`fetchAllPayments.js`)

Fetches payment method icons and data for all stores.

**Usage:**

```bash
npm run fetch-payments
```

---

## Automatic Workers vs Manual Scripts

### Automatic Workers (Cron Jobs)

- **Token Refresh**: Every 5 minutes
- **Review Refresh**: Weekly on Sunday at 2:00 AM
- **Cache Cleanup**: Daily
- **Bundle Cleanup**: Daily

### Manual Scripts

- Use when you need immediate action
- Useful for debugging
- Run on-demand for specific tasks

---

## Environment Variables Required

Make sure `.env` file contains:

```env
MONGO_URI=mongodb://localhost:27017/salla-bundles
```

---

## Notes

- Scripts include rate limiting (500ms delay between API calls)
- All scripts show detailed progress and error handling
- MongoDB connection is automatically closed after completion
- Safe to run multiple times (idempotent)
