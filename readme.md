# Salla Advanced Bundler API

## Overview

The API powers the Salla bundle modal, merchant dashboard, and Salla webhooks. It uses Express + MongoDB with JWT (Bearer) authentication for merchant-facing routes and exposes several public endpoints for storefront integrations. Background cron workers automate token refreshing, cache cleanup, and review growth.

- Base URL: `https://<your-domain>/api/v1`
- Authentication: `Authorization: Bearer <JWT>` unless marked **Public**
- Content-Type: JSON unless otherwise stated
- Errors: `{ success: false, status, message }`
- Rate limiting: not enforced server-side; add at proxy/CDN if required
- Versioning: v1 (current)

> Obtain JWTs via `/auth/login` or `/auth/setup`. Tokens include `store_id`, `name`, `domain`, `plan`, `email`.

---

## Authentication & Setup

| Method | Path                             | Auth       | Description                                                                                        |
| ------ | -------------------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| GET    | `/auth/setup?token=SECURE_TOKEN` | **Public** | Returns store metadata to finish first-time setup.                                                 |
| POST   | `/auth/setup`                    | **Public** | Body: `{ token, email, password }`. Finalizes setup, creates credentials, returns JWT.             |
| POST   | `/auth/login`                    | **Public** | Body: `{ email, password }`. Validates credentials, refreshes access token if needed, returns JWT. |
| POST   | `/auth/forgot-password`          | **Public** | Body: `{ email }`. Issues a 6-digit reset code (stored on the `Store`).                            |
| POST   | `/auth/reset-password`           | **Public** | Body: `{ email, code, new_password }`. Validates code, updates password.                           |
| GET    | `/auth/validate`                 | Bearer     | Quick token validity check; echoes store identity fields.                                          |

---

## Bundle Management (Protected)

`/bundles` routes require Bearer tokens tied to the store.

| Method | Path                                   | Description                                                                                                                                 |
| ------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/bundles`                             | Create a bundle configuration. Body must include `name`, `target_product_id`, `bundles[]`, `start_date`. Validates against Salla inventory. |
| GET    | `/bundles`                             | Query bundles. Filters: `status`, `target_product_id`, `limit`.                                                                             |
| GET    | `/bundles/:bundle_id`                  | Fetch full bundle configuration + analytics.                                                                                                |
| PUT    | `/bundles/:bundle_id`                  | Update whitelisted fields (UI text, bundle tiers, review selections, etc.).                                                                 |
| DELETE | `/bundles/:bundle_id`                  | Remove bundle and purge related Salla offers.                                                                                               |
| POST   | `/bundles/:bundle_id/offers/generate`  | Push special offers into Salla and activate bundle.                                                                                         |
| GET    | `/bundles/:bundle_id/offers/preview`   | Preview the payload sent to Salla without activation.                                                                                       |
| POST   | `/bundles/:bundle_id/deactivate`       | Deactivate bundle and delete live offers.                                                                                                   |
| POST   | `/bundles/:bundle_id/track/view`       | Server-side analytics increment.                                                                                                            |
| POST   | `/bundles/:bundle_id/track/click`      | Record click and tier checkout intent.                                                                                                      |
| POST   | `/bundles/:bundle_id/track/conversion` | Body `{ revenue }` to add conversion + revenue.                                                                                             |
| POST   | `/bundles/:bundle_id/refetch-reviews`  | Force-refresh product reviews from Salla (bypassing cache).                                                                                 |

---

## Product Catalog (Protected)

| Method | Path                                       | Description                                                                         |
| ------ | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| GET    | `/products`                                | Paginated list (`page`, `per_page`, optional `search`). Pulls live data from Salla. |
| GET    | `/products/search?q=term`                  | Lightweight search by name/SKU.                                                     |
| GET    | `/products/:product_id`                    | Fetch a single product with variants/options.                                       |
| GET    | `/products/:product_id/reviews?limit=20`   | Return cached reviews (auto-fetch and cache for 7 days).                            |
| PUT    | `/products/:product_id/reviews/:review_id` | Update cached review text/name/rating (does not sync to Salla).                     |

---

## Settings (Mixed Visibility)

| Method | Path                                | Auth       | Description                                                                                                                                |
| ------ | ----------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/settings/:store_id/review-count`  | **Public** | Returns review counter settings for modal display.                                                                                         |
| GET    | `/settings`                         | Bearer     | Read full store settings (sticky button, announcements, free shipping, etc.).                                                              |
| PUT    | `/settings`                         | Bearer     | Update settings. Nested objects allowed: `sticky_button`, `free_shipping`, `timer`, `review_count`, `announcement`, `custom_reviews`, etc. |
| POST   | `/settings/refetch-payment-methods` | Bearer     | Re-fetch enabled payment methods from Salla and cache them on the store.                                                                   |

### Timer Settings (No Auth)

These routes manage a standalone `TimerSettings` collection, often consumed by the modal.

| Method | Path                             | Description                                 |
| ------ | -------------------------------- | ------------------------------------------- |
| GET    | `/timer-settings/:storeId`       | Returns timer configuration or defaults.    |
| PUT    | `/timer-settings/:storeId`       | Update timer duration, styling, positions.  |
| POST   | `/timer-settings/:storeId/reset` | Reset to defaults.                          |
| GET    | `/timer-settings/:storeId/css`   | Returns CSS custom properties (`text/css`). |

---

## Public Storefront & Modal Integrations

| Method | Path                                                        | Purpose                                                                                                                       |
| ------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/storefront/stores/:store_id/products/:product_id/bundles` | Primary endpoint for modal script; resolves `store_id` from domain if needed, enriches bundle with settings + cached reviews. |
| GET    | `/storefront/bundles/:product_id`                           | Convenience check for active bundle on a product.                                                                             |
| GET    | `/storefront/bundles/:bundle_id/config`                     | Minimal bundle payload (active-only).                                                                                         |
| POST   | `/storefront/bundles/:bundle_id/track`                      | Body `{ action: "view\|click\|conversion", revenue?, tier_id? }`.                                                             |
| POST   | `/storefront/bundles/:bundle_id/track/tier-selection`       | Track which tier a shopper inspected.                                                                                         |
| POST   | `/storefront/bundles/:bundle_id/track/tier-checkout`        | Track tier taken to checkout.                                                                                                 |
| GET    | `/storefront/stores/:store_id/reviews?limit=&product_id=`   | Returns merged (cached + custom) reviews with display config.                                                                 |
| GET    | `/storefront/stores/:store_id/payment-methods`              | Returns cached or live payment methods (24h cache).                                                                           |
| POST   | `/storefront/stores/:store_id/validate-coupon`              | Body `{ code }`. Validates coupon via Salla admin API.                                                                        |
| GET    | `/modal/modal.js`                                           | Dynamic bundle modal loader (serves JS and injects CSS via `req.get("host")`).                                                |
| GET    | `/snippet/app-snippet.js`                                   | Long-running Salla App Snippet script for global injection.                                                                   |
| GET    | `/docs/app-installation`                                    | Serves static installation HTML for Salla App Snippets (from `/public`).                                                      |

---

## Webhooks

| Method | Path        | Auth                                                     | Description                                                                                                                                                                                                       |
| ------ | ----------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/webhooks` | Validates `x-salla-security-strategy` signature or token | Handles Salla events: `app.store.authorize`, subscription lifecycle, uninstall, coupon usage. Persists stores, updates plans, primes payment methods, and logs events. Webhook timeout guard responds within 25s. |

Webhook processing utilities:

- `webhookSecurity.verifyWebhookSignature` (signature or bearer token strategy)
- `webhookTimeout` (respond with 408 if exceeding 25s)
- `notification.service` sends setup emails/links.

---

## Background Workers

- `bundleCleanup.worker`: hourly cleanup of expired bundles and stale offers.
- `reviewCount.worker`: daily auto-increment for stores using synthetic review counts.
- `tokenRefresh.worker`: daily at 03:00 refreshes Salla access tokens close to expiry.
- `cacheCleanup.worker`: daily at 03:00 removes expired product caches.
- `reviewRefresh.worker`: Sunday 02:00 refreshes cached reviews from Salla.

Surface their metrics in the admin dashboard (counts, failures, timestamps) for operational visibility.

---

## Core Data Models

### Store (`Store`)

Fields include Salla credentials (`access_token`, `refresh_token`, expiry), merchant contact, plan, bundle limits, cached payment methods, dashboard credentials (`email`, `password`), `setup_token`, and lifecycle flags (`status`, `is_deleted`).

### BundleConfig

Stores bundle tiers, offers, UI configuration, analytics counters (`total_views`, `total_clicks`, `total_conversions`, `total_revenue`), review preferences, and cache versioning for modal invalidation.

### BundleOffer

Maps local bundle tiers to Salla special offer IDs, tracks sync status, and basic usage analytics.

### Settings

Persists modal behavior (sticky button, free shipping, timer, announcements, review randomizer, custom reviews). Public `review_count` settings are exposed to the modal and auto-adjusted by workers.

### TimerSettings

Standalone timer styling/config per store, with CSS helper.

### ProductCache

Caches reviews per product with expiry and fetch counter; supports manual overrides and forced refresh.

---

## Environment

| Variable                                                                        | Purpose                                            |
| ------------------------------------------------------------------------------- | -------------------------------------------------- |
| `PORT`                                                                          | Express port (default 3001)                        |
| `NODE_ENV`                                                                      | Environment flag                                   |
| `MONGO_URI`                                                                     | MongoDB connection                                 |
| `CLIENT_KEY`, `CLIENT_SECRET_KEY`, `REDIRECT_URI`                               | Salla OAuth                                        |
| `JWT_SECRET`                                                                    | Dashboard JWT signing                              |
| `WEBHOOK_SECRET`                                                                | Signature validation for Salla webhooks            |
| `DASHBOARD_URL`                                                                 | Dashboard origin (CORS + welcome email setup link) |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_DISABLE_TLS` | SMTP welcome emails                                |
| `AI_API_KEY`                                                                    | (Reserved)                                         |

---

## Error Handling

- All async controllers wrapped by `asyncWrapper`; unhandled rejections fall to `errorMiddleware`.
- `AppError` carries `statusCode`. Response format is consistent JSON.
- Non-production logs detailed stack traces.

---

## Extending for Admin Use-Cases

To support an internal operations dashboard:

1. Add an admin auth layer (separate JWT scope or role claims). Option: dedicate `/api/v1/admin` namespace with RBAC middleware.
2. Expose `Store` management endpoints (`GET /admin/stores`, `PATCH /admin/stores/:id`, `POST /admin/stores/:id/reset-password`, `POST /admin/stores/:id/trigger-token-refresh`).
3. Aggregate analytics endpoints:
   - `/admin/analytics/summary` → totals for active stores, bundles, conversions, revenue.
   - `/admin/analytics/workers` → last-run timestamps, success/failure counts (persist logs).
   - `/admin/subscriptions` → plan distribution, renewal timeline (based on webhook events).
4. Consider writing events into a dedicated collection (`audit_logs`) for admin dashboards, or stream to an external BI pipeline.


admin Dashboard Blueprint

Tech stack: React 18 + Vite + TypeScript, Tailwind CSS, shadcn/ui (Radix primitives), TanStack Router or React Router, TanStack Query for data fetching, Zustand or Jotai for lightweight global state (user, theme toggles), React Hook Form + Zod for forms, Recharts or Tremor for analytics cards. Configure pnpm + ESLint + Prettier + Tailwind IntelliSense.

Starter template: Generate with pnpm dlx shadcn-ui@latest init --supported). A polished alternative is the open-source https://github.com/itsFerdi/shadcn-dashboard (Vite + shadcn pre-wired, MIT). Tailor the base to your brand (RTL support, Arabic typography).

Information architecture

Auth: /login, /forgot-password, /reset-password.
Overview: KPIs (active stores, bundles, GMV uplift, conversion rate), worker health, subscription tier mix. Use real-time data from future /admin/analytics endpoints.
Stores: table with plan, status,Stores: table with plan, status, installdate, bundle count, token expiry; filters for plan/status; actions to resend setup link, deactivate, force token refresh. Drill-in panel with store timeline (webhook events, review metrics).
Subscriptions: timeline of renewals, upcoming expirations, churn reasons (from webhook events). Provide manual override or plan upgrades.
Bundles: global list with store association, status, conversions, revenue. Deep-dive view shows tier performance, manual analytics adjustments.
Products & Reviews: highlight top-performing products, stale review caches, manual review overrides.
Automations: surfaces background workers (last run, success/failure counts, manual re-run).
Payments & Coupons: view cached payment-method data per store, coupon validation logs (from webhook + /validate-coupon).
Audit Logs: track admin actions (requires new logging middleware).
Settings: global feature toggles, environment flags, email templates, announcement broadcasting.
Support/Inbox: optional module storing merchant support tickets tied to store.
Data workflow

Create dedicated admin API routes (e.g., /api/v1/admin/stores) secured via service-level JWT with role: "admin".
Implement server queries aggregating metrics (Mongo aggregation pipelines for bundle analytics, worker logs).
Leverage TanStack Query for caching, optimistic updates on plan changes or bundle deactivations.
Integrate websocket or SSE channel later for near-real-time worker/analytics updates.
UX considerations
Provide persistent filters, server-driven pagination (cursor-based for large store datasets).
RTL-friendly layout, accessible components via shadcn (Radix) with semantic HTML.
Dark/light theme toggles using CSS variables.
Notifications center for webhook anomalies or token-refresh failures.