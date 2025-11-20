# Salla Advanced Bundler - Admin Dashboard API Collection

## Overview

This document provides a comprehensive API collection for the **Admin Dashboard** frontend. This dashboard is for internal staff to manage all stores, view platform analytics, and administer the Salla Advanced Bundler platform.

**Base URL**: `https://<host>/api/v1`
**Authentication**: Admin JWT Bearer tokens (12-hour expiry)
**Authorization**: Role-based access control (`admin`, `moderator`)

---

## Table of Contents

1. [Admin Authentication](#admin-authentication)
2. [Analytics & Overview](#analytics--overview)
3. [Store Management](#store-management)
4. [Bundle Administration](#bundle-administration)
5. [Subscription Management](#subscription-management)
6. [System Administration](#system-administration)
7. [Audit & Logs](#audit--logs)
8. [Error Handling](#error-handling)
9. [Data Models](#data-models)

---

## Admin Authentication

### Admin Login

```http
POST /admin/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "secureAdminPassword123"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "admin_user_id",
      "email": "admin@company.com",
      "roles": ["admin"],
      "token": "admin_jwt_token_12_hours"
    }
  }
}
```

### Get Current Admin Profile

```http
GET /admin/auth/me
Authorization: Bearer <admin_jwt_token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "admin_user_id",
    "email": "admin@company.com",
    "roles": ["admin"],
    "is_active": true,
    "last_login_at": "2024-01-01T12:00:00.000Z",
    "last_login_ip": "192.168.1.100"
  }
}
```

### Create Admin User (Admin Only)

```http
POST /admin/auth/seed
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "email": "newadmin@company.com",
  "password": "password123",
  "roles": ["moderator"]
}
```

---

## Analytics & Overview

### Platform Analytics Summary

```http
GET /admin/analytics/summary
Authorization: Bearer <admin_jwt_token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "generated_at": "2024-01-01T12:00:00.000Z",
    "stores": {
      "total": 1250,
      "active": 1180,
      "needsReauth": 25,
      "createdLast30Days": 45,
      "planBreakdown": {
        "basic": 800,
        "pro": 350,
        "enterprise": 80,
        "special": 20
      }
    },
    "bundles": {
      "total": 3420,
      "active": 2890,
      "draft": 380,
      "inactive": 150,
      "totalRevenue": 2450000,
      "totalConversions": 8900,
      "totalClicks": 45600,
      "totalViews": 245000,
      "conversionRate": 19.52
    }
  }
}
```

### Worker Status Monitoring

```http
GET /admin/workers
Authorization: Bearer <admin_jwt_token>
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "name": "bundleCleanup",
      "description": "Deactivates expired bundles and purges failed Salla offers.",
      "schedule": "0 * * * *",
      "status": "unknown",
      "lastSuccessAt": null,
      "lastErrorAt": null
    },
    {
      "name": "reviewCount",
      "description": "Auto-increments synthetic review counters for custom mode stores.",
      "schedule": "@daily",
      "status": "unknown",
      "lastSuccessAt": null,
      "lastErrorAt": null
    },
    {
      "name": "tokenRefresh",
      "description": "Refreshes Salla access tokens that are close to expiration.",
      "schedule": "0 3 * * *",
      "status": "unknown",
      "lastSuccessAt": null,
      "lastErrorAt": null
    },
    {
      "name": "cacheCleanup",
      "description": "Cleans expired product review cache entries.",
      "schedule": "0 3 * * *",
      "status": "unknown",
      "lastSuccessAt": null,
      "lastErrorAt": null
    },
    {
      "name": "reviewRefresh",
      "description": "Refreshes cached reviews weekly for tracked products.",
      "schedule": "0 2 * * 0",
      "status": "unknown",
      "lastSuccessAt": null,
      "lastErrorAt": null
    }
  ]
}
```

---

## Store Management

### List All Stores

```http
GET /admin/stores?page=1&limit=25&plan=pro&status=active&q=search_term&include_deleted=false
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:

- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Items per page (max: 100, default: 25)
- `plan` (string): Filter by plan (`basic`, `pro`, `enterprise`, `special`)
- `status` (string): Filter by status (`active`, `inactive`, `uninstalled`, `needs_reauth`)
- `q` (string): Search query (searches name, domain, store_id, merchant_email)
- `include_deleted` (boolean): Include deleted stores (default: false)

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "store_document_id",
      "store_id": "123456789",
      "name": "متجر إلكتروني",
      "domain": "store.salla.sa",
      "merchant_email": "merchant@example.com",
      "plan": "pro",
      "status": "active",
      "bundles_enabled": true,
      "bundleStats": {
        "totalBundles": 12,
        "activeBundles": 8,
        "totalRevenue": 45000,
        "totalConversions": 156
      },
      "installed_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-15T12:30:00.000Z",
      "is_deleted": false
    }
  ],
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 1180,
    "totalPages": 48
  }
}
```

### Get Store Details

```http
GET /admin/stores/{storeId}
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters**:

- `storeId`: Can be either MongoDB ID or store_id string

**Response**:

```json
{
  "success": true,
  "data": {
    "store": {
      "id": "store_document_id",
      "store_id": "123456789",
      "name": "متجر إلكتروني",
      "domain": "store.salla.sa",
      "merchant_email": "merchant@example.com",
      "plan": "pro",
      "status": "active",
      "bundles_enabled": true,
      "bundle_settings": {
        "max_bundles_per_store": 15,
        "analytics_enabled": true
      },
      "installed_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-15T12:30:00.000Z"
    },
    "bundleSummary": {
      "totalBundles": 12,
      "activeBundles": 8,
      "draftBundles": 3,
      "inactiveBundles": 1,
      "totalRevenue": 45000,
      "totalConversions": 156,
      "totalViews": 8900,
      "totalClicks": 1250,
      "conversionRate": 12.48
    }
  }
}
```

### Update Store (Admin Only)

```http
PATCH /admin/stores/{storeId}
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "plan": "enterprise",
  "status": "active",
  "bundles_enabled": true,
  "bundle_settings": {
    "max_bundles_per_store": 50,
    "analytics_enabled": true
  },
  "is_deleted": false
}
```

**Request Body**:

- `plan` (string): Store plan (`basic`, `pro`, `enterprise`, `special`)
- `status` (string): Store status (`active`, `inactive`, `uninstalled`, `needs_reauth`)
- `bundles_enabled` (boolean): Enable/disable bundle features
- `bundle_settings` (object): Bundle configuration settings
- `is_deleted` (boolean): Soft delete flag

### Refresh Store Token (Admin Only)

```http
POST /admin/stores/{storeId}/refresh-token
Authorization: Bearer <admin_jwt_token>
```

**Response**:

```json
{
  "success": true,
  "message": "Access token refreshed successfully."
}
```

---

## Bundle Administration

### List All Bundles (Cross-Store)

```http
GET /admin/bundles?page=1&limit=25&status=active&store_id=123&q=search_term
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:

- `page` (number): Page number for pagination
- `limit` (number): Items per page (max: 100)
- `status` (string): Filter by status (`active`, `draft`, `inactive`, `expired`)
- `store_id` (string): Filter by specific store
- `q` (string): Search query (searches name, target_product_name, store_id)

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "bundle_document_id",
      "name": "عرض التجميع الخاص",
      "status": "active",
      "store_id": "123456789",
      "target_product_id": "p987654321",
      "target_product_name": "المنتج الرئيسي",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-10T15:30:00.000Z",
      "total_views": 450,
      "total_clicks": 78,
      "total_conversions": 23,
      "total_revenue": 6900,
      "store": {
        "store_id": "123456789",
        "name": "متجر إلكتروني",
        "domain": "store.salla.sa",
        "plan": "pro",
        "status": "active",
        "bundles_enabled": true
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 2890,
    "totalPages": 116
  }
}
```

### Get Bundle Details (Admin)

```http
GET /admin/bundles/{bundleId}
Authorization: Bearer <admin_jwt_token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "bundle": {
      "id": "bundle_document_id",
      "name": "عرض التجميع الخاص",
      "description": "وصف العرض",
      "status": "active",
      "store_id": "123456789",
      "target_product_id": "p987654321",
      "target_product_name": "المنتج الرئيسي",
      "start_date": "2024-01-01T00:00:00.000Z",
      "expiry_date": "2024-12-31T23:59:59.999Z",
      "modal_title": "عرض خاص!",
      "modal_subtitle": "احصل على أفضل المنتجات",
      "bundles": [
        {
          "tier_name": "الباقة الأساسية",
          "tier_items": [
            {
              "product_id": "p987654321",
              "quantity": 1
            }
          ],
          "discount_percentage": 15,
          "gifts": [
            {
              "product_id": "p111111111",
              "quantity": 1,
              "gift_type": "free"
            }
          ]
        }
      ],
      "total_views": 450,
      "total_clicks": 78,
      "total_conversions": 23,
      "total_revenue": 6900,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-10T15:30:00.000Z"
    },
    "store": {
      "store_id": "123456789",
      "name": "متجر إلكتروني",
      "domain": "store.salla.sa",
      "plan": "pro",
      "status": "active",
      "bundles_enabled": true,
      "merchant_email": "merchant@example.com"
    }
  }
}
```

---

## Subscription Management

### List All Subscriptions

```http
GET /admin/subscriptions?page=1&limit=25&plan=pro&status=active
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:

- `page` (number): Page number for pagination
- `limit` (number): Items per page (max: 100)
- `plan` (string): Filter by plan type
- `status` (string): Filter by store status

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "store_id": "123456789",
      "name": "متجر إلكتروني",
      "domain": "store.salla.sa",
      "plan": "pro",
      "status": "active",
      "merchant_email": "merchant@example.com",
      "installed_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-15T12:30:00.000Z",
      "is_deleted": false
    }
  ],
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 350,
    "totalPages": 14
  }
}
```

---

## Plan Configuration Management

### Get All Plans

```http
GET /admin/plans
Authorization: Bearer <admin_jwt_token>
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "plan_document_id",
      "key": "basic",
      "label": "Basic",
      "limits": {
        "maxBundles": 1,
        "monthlyViews": 10000
      },
      "features": {
        "advancedBundleStyling": false,
        "stickyButton": false,
        "timer": false,
        "bundleAnalytics": false,
        "freeShipping": false,
        "couponControls": false,
        "customHideSelectors": false,
        "reviewsWidget": false,
        "announcement": false,
        "dashboardAnalytics": false,
        "conversionInsights": false,
        "bundlePerformance": false,
        "offerAnalytics": false,
        "productReviewsSection": false
      },
      "isActive": true,
      "price": 0,
      "currency": "SAR",
      "description": "Basic plan with essential features"
    },
    {
      "_id": "plan_document_id_2",
      "key": "pro",
      "label": "Pro",
      "limits": {
        "maxBundles": 10,
        "monthlyViews": 100000
      },
      "features": {
        "advancedBundleStyling": true,
        "stickyButton": true,
        "timer": true,
        "bundleAnalytics": true,
        "freeShipping": true,
        "couponControls": true,
        "customHideSelectors": false,
        "reviewsWidget": true,
        "announcement": true,
        "dashboardAnalytics": true,
        "conversionInsights": false,
        "bundlePerformance": false,
        "offerAnalytics": false,
        "productReviewsSection": false
      },
      "isActive": true,
      "price": 99.99,
      "currency": "SAR",
      "description": "Professional plan with advanced features"
    }
  ]
}
```

### Get Available Features

```http
GET /admin/plans/features
Authorization: Bearer <admin_jwt_token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "features": [
      {
        "key": "advancedBundleStyling",
        "label": "Advanced Bundle Styling",
        "default": true,
        "description": "Custom modal titles, colors, CTA buttons"
      },
      {
        "key": "stickyButton",
        "label": "Sticky Button",
        "default": true,
        "description": "Floating sticky button on product pages"
      },
      {
        "key": "timer",
        "label": "Timer",
        "default": true,
        "description": "Countdown timer display"
      },
      {
        "key": "freeShipping",
        "label": "Free Shipping",
        "default": true,
        "description": "Free shipping badge configuration"
      },
      {
        "key": "bundleAnalytics",
        "label": "Bundle Analytics",
        "default": true,
        "description": "Bundle-level analytics (clicks, conversions, views)"
      },
      {
        "key": "dashboardAnalytics",
        "label": "Dashboard Analytics",
        "default": true,
        "description": "Dashboard overview analytics"
      },
      {
        "key": "conversionInsights",
        "label": "Conversion Insights",
        "default": false,
        "description": "Conversion rate insights"
      },
      {
        "key": "bundlePerformance",
        "label": "Bundle Performance",
        "default": false,
        "description": "Performance metrics and charts"
      },
      {
        "key": "offerAnalytics",
        "label": "Offer Analytics",
        "default": false,
        "description": "Tier-level offer analytics"
      },
      {
        "key": "productReviewsSection",
        "label": "Product Reviews Section",
        "default": false,
        "description": "Custom review counts and randomizer"
      }
    ]
  }
}
```

### Get Specific Plan

```http
GET /admin/plans/{planKey}
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters**:

- `planKey`: Plan identifier (`basic`, `pro`, `enterprise`, `special`, or custom plan key)

### Update Plan Configuration

```http
PATCH /admin/plans/{planKey}
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "label": "Basic Plan Updated",
  "limits": {
    "maxBundles": 2,
    "monthlyViews": 15000
  },
  "features": {
    "advancedBundleStyling": true,
    "bundleAnalytics": true
  },
  "price": 49.99,
  "currency": "SAR",
  "description": "Updated basic plan with more features"
}
```

**Request Body**:

- `label` (string): Display name for the plan
- `limits` (object): Plan limits configuration
  - `maxBundles` (number): Maximum bundles per store (min: 0)
  - `monthlyViews` (number): Monthly view limit (null = unlimited)
- `features` (object): Feature toggles for the plan
- `price` (number): Plan price
- `currency` (string): Currency code
- `description` (string): Plan description

**Response**:

```json
{
  "success": true,
  "message": "Plan basic updated successfully",
  "data": {
    "_id": "plan_document_id",
    "key": "basic",
    "label": "Basic Plan Updated",
    "limits": {
      "maxBundles": 2,
      "monthlyViews": 15000
    },
    "features": {
      "advancedBundleStyling": true,
      "stickyButton": false,
      "timer": false,
      "bundleAnalytics": true
      // ... other features
    },
    "isActive": true,
    "price": 49.99,
    "currency": "SAR",
    "description": "Updated basic plan with more features"
  }
}
```

### Create New Plan

```http
POST /admin/plans
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "key": "premium",
  "label": "Premium",
  "limits": {
    "maxBundles": 25,
    "monthlyViews": 250000
  },
  "features": {
    "advancedBundleStyling": true,
    "stickyButton": true,
    "timer": true,
    "freeShipping": true,
    "bundleAnalytics": true,
    "dashboardAnalytics": true,
    "conversionInsights": true,
    "bundlePerformance": true
  },
  "price": 199.99,
  "currency": "SAR",
  "description": "Premium tier with advanced features"
}
```

**Request Body**:

- `key` (string): Unique plan identifier (required)
- `label` (string): Display name (required)
- `limits` (object): Plan limits (required)
- `features` (object): Feature toggles (required)
- `price` (number): Plan price (default: 0)
- `currency` (string): Currency code (default: "SAR")
- `description` (string): Plan description

### Reset Plan to Default Template

```http
POST /admin/plans/{planKey}/reset
Authorization: Bearer <admin_jwt_token>
```

**Response**:

```json
{
  "success": true,
  "message": "Plan basic reset to default template successfully",
  "data": {
    "_id": "plan_document_id",
    "key": "basic",
    "label": "Basic",
    "limits": {
      "maxBundles": 1,
      "monthlyViews": 10000
    },
    "features": {
      "advancedBundleStyling": false,
      "stickyButton": false,
      "timer": false,
      "bundleAnalytics": false
      // ... other features set to defaults
    },
    "isActive": true,
    "price": 0,
    "currency": "SAR",
    "description": "Basic plan with essential features"
  }
}
```

### Delete Plan (Soft Delete)

```http
DELETE /admin/plans/{planKey}
Authorization: Bearer <admin_jwt_token>
```

**Important**: Cannot delete the "basic" plan (protected system requirement).

**Response**:

```json
{
  "success": true,
  "message": "Plan premium deleted successfully"
}
```

---

## System Administration

### Force Refresh Store Tokens (Batch)

```http
POST /admin/system/refresh-batch-tokens
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "store_ids": ["123456789", "987654321"],
  "all_stores": false,
  "filter": {
    "status": "needs_reauth",
    "plan": "pro"
  }
}
```

### System Health Check

```http
GET /admin/system/health
Authorization: Bearer <admin_jwt_token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "services": {
      "database": "connected",
      "redis": "connected",
      "salla_api": "operational"
    },
    "metrics": {
      "active_connections": 45,
      "pending_jobs": 12,
      "failed_jobs_last_hour": 0
    }
  }
}
```

---

## Audit & Logs

### List Audit Logs (Admin Only)

```http
GET /admin/audit-logs?page=1&limit=50&action=store_update&actor_id=admin_id
Authorization: Bearer <admin_jwt_token>
```

**Response**:

```json
{
  "success": true,
  "data": [],
  "message": "Audit log storage is not yet implemented. Once available, this endpoint will surface trail records."
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "status": 403,
  "message": "Insufficient permissions"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient admin permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Permission Levels

- **Admin**: Full access to all endpoints including destructive operations
- **Moderator**: Read access to most endpoints, limited write access
- **Unauthenticated**: No access to admin endpoints

---

## Data Models

### Admin User Model

```typescript
interface AdminUser {
  id: string;
  email: string;
  roles: ("admin" | "moderator")[];
  is_active: boolean;
  last_login_at?: Date;
  last_login_ip?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Store Summary Model

```typescript
interface StoreSummary {
  id: string;
  store_id: string;
  name: string;
  domain: string;
  merchant_email: string;
  plan: "basic" | "pro" | "enterprise" | "special";
  status: "active" | "inactive" | "uninstalled" | "needs_reauth";
  bundles_enabled: boolean;
  bundleStats: {
    totalBundles: number;
    activeBundles: number;
    totalRevenue: number;
    totalConversions: number;
  };
  installed_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}
```

### Bundle Summary Model

```typescript
interface BundleSummary {
  id: string;
  name: string;
  status: "active" | "draft" | "inactive" | "expired";
  store_id: string;
  target_product_id: string;
  target_product_name: string;
  total_views: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: number;
  created_at: Date;
  updated_at: Date;
  store: {
    store_id: string;
    name: string;
    domain: string;
    plan: string;
    status: string;
  };
}
```

### Analytics Summary Model

```typescript
interface AnalyticsSummary {
  generated_at: Date;
  stores: {
    total: number;
    active: number;
    needsReauth: number;
    createdLast30Days: number;
    planBreakdown: {
      basic: number;
      pro: number;
      enterprise: number;
      special: number;
    };
  };
  bundles: {
    total: number;
    active: number;
    draft: number;
    inactive: number;
    totalRevenue: number;
    totalConversions: number;
    totalClicks: number;
    totalViews: number;
    conversionRate: number;
  };
}
```

### Worker Status Model

```typescript
interface WorkerStatus {
  name: string;
  description: string;
  schedule: string;
  status: "unknown" | "running" | "success" | "error";
  lastSuccessAt?: Date;
  lastErrorAt?: Date;
}
```

### Plan Configuration Model

```typescript
interface PlanConfiguration {
  _id: string;
  key: string; // Unique identifier: 'basic', 'pro', 'enterprise', etc.
  label: string; // Display name
  limits: {
    maxBundles: number; // Maximum bundles per store
    monthlyViews: number | null; // Monthly view limit (null = unlimited)
  };
  features: {
    // Bundle Styling Features
    advancedBundleStyling: boolean; // Custom modal titles, colors, CTA buttons
    stickyButton: boolean; // Floating sticky button on product pages
    timer: boolean; // Countdown timer display
    freeShipping: boolean; // Free shipping badge configuration
    couponControls: boolean; // Coupon/discount controls
    customHideSelectors: boolean; // Custom CSS selectors to hide elements
    reviewsWidget: boolean; // Product reviews widget
    announcement: boolean; // Announcement/announcement panel

    // Analytics Features
    bundleAnalytics: boolean; // Bundle-level analytics (clicks, conversions, views)
    dashboardAnalytics: boolean; // Dashboard overview analytics
    conversionInsights: boolean; // Conversion rate insights
    bundlePerformance: boolean; // Performance metrics and charts
    offerAnalytics: boolean; // Tier-level offer analytics
    productReviewsSection: boolean; // Custom review counts and randomizer
  };
  isActive: boolean;
  price: number;
  currency: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Available Feature Model

```typescript
interface AvailableFeature {
  key: string; // Feature identifier
  label: string; // Display name
  default: boolean; // Default value for new plans
  description?: string; // Feature description
}
```

---

## Usage Examples

### React + Axios Admin Client

```javascript
// Admin API Client Setup
import axios from "axios";

const adminApi = axios.create({
  baseURL: process.env.REACT_APP_ADMIN_API_URL + "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Admin auth interceptor
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin API Services
export const adminAPI = {
  // Authentication
  auth: {
    login: (credentials) => adminApi.post("/admin/auth/login", credentials),
    me: () => adminApi.get("/admin/auth/me"),
    seed: (userData) => adminApi.post("/admin/auth/seed", userData),
  },

  // Analytics
  analytics: {
    summary: () => adminApi.get("/admin/analytics/summary"),
    workers: () => adminApi.get("/admin/workers"),
  },

  // Stores Management
  stores: {
    list: (params) => adminApi.get("/admin/stores", { params }),
    get: (storeId) => adminApi.get(`/admin/stores/${storeId}`),
    update: (storeId, data) => adminApi.patch(`/admin/stores/${storeId}`, data),
    refreshToken: (storeId) =>
      adminApi.post(`/admin/stores/${storeId}/refresh-token`),
  },

  // Bundles Administration
  bundles: {
    list: (params) => adminApi.get("/admin/bundles", { params }),
    get: (bundleId) => adminApi.get(`/admin/bundles/${bundleId}`),
  },

  // Subscriptions
  subscriptions: {
    list: (params) => adminApi.get("/admin/subscriptions", { params }),
  },

  // Plan Configuration Management
  plans: {
    list: () => adminApi.get("/admin/plans"),
    get: (planKey) => adminApi.get(`/admin/plans/${planKey}`),
    getFeatures: () => adminApi.get("/admin/plans/features"),
    create: (planData) => adminApi.post("/admin/plans", planData),
    update: (planKey, planData) =>
      adminApi.patch(`/admin/plans/${planKey}`, planData),
    reset: (planKey) => adminApi.post(`/admin/plans/${planKey}/reset`),
    delete: (planKey) => adminApi.delete(`/admin/plans/${planKey}`),
  },

  // System Administration
  system: {
    health: () => adminApi.get("/admin/system/health"),
    refreshBatchTokens: (data) =>
      adminApi.post("/admin/system/refresh-batch-tokens", data),
  },

  // Audit Logs
  audit: {
    logs: (params) => adminApi.get("/admin/audit-logs", { params }),
  },
};
```

### Error Handling Hook

```javascript
import { useState } from "react";
import { notifications } from "@mantine/notifications";

export const useAdminApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiCall = async (apiCall, successMessage = null) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();

      if (successMessage) {
        notifications.show({
          title: "نجح",
          message: successMessage,
          color: "green",
        });
      }

      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || "حدث خطأ ما";

      setError(message);
      notifications.show({
        title: "خطأ",
        message,
        color: "red",
      });

      // Handle auth errors
      if (err.response?.status === 401) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleApiCall };
};
```

### React Admin Dashboard Component

```javascript
import { useEffect, useState } from "react";
import { adminAPI } from "./adminApi";

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [stores, setStores] = useState([]);
  const { loading, error, handleApiCall } = useAdminApi();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [analyticsRes, storesRes] = await Promise.all([
          handleApiCall(() => adminAPI.analytics.summary()),
          handleApiCall(() => adminAPI.stores.list({ limit: 10 })),
        ]);

        setAnalytics(analyticsRes.data);
        setStores(storesRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* Analytics Cards */}
      <div className="analytics-grid">
        <div className="card">
          <h3>Total Stores</h3>
          <p>{analytics?.stores?.total || 0}</p>
          <small>Active: {analytics?.stores?.active || 0}</small>
        </div>

        <div className="card">
          <h3>Total Bundles</h3>
          <p>{analytics?.bundles?.total || 0}</p>
          <small>Active: {analytics?.bundles?.active || 0}</small>
        </div>

        <div className="card">
          <h3>Conversion Rate</h3>
          <p>{analytics?.bundles?.conversionRate || 0}%</p>
        </div>
      </div>

      {/* Recent Stores */}
      <div className="recent-stores">
        <h2>Recent Stores</h2>
        {stores.map((store) => (
          <div key={store.id} className="store-card">
            <h4>{store.name}</h4>
            <p>
              {store.domain} - {store.plan}
            </p>
            <span className={`status ${store.status}`}>{store.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Plan Management Component Example

```javascript
import { useState, useEffect } from "react";
import { adminAPI } from "./adminApi";

export const PlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { loading, error, handleApiCall } = useAdminApi();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [plansRes, featuresRes] = await Promise.all([
          handleApiCall(() => adminAPI.plans.list()),
          handleApiCall(() => adminAPI.plans.getFeatures()),
        ]);

        setPlans(plansRes.data);
        setFeatures(featuresRes.data.features);
      } catch (err) {
        console.error("Failed to load plans:", err);
      }
    };

    loadData();
  }, []);

  const handleUpdatePlan = async (planKey, updates) => {
    try {
      await handleApiCall(
        () => adminAPI.plans.update(planKey, updates),
        `تم تحديث الباقة ${planKey} بنجاح`
      );

      // Refresh plans list
      const response = await adminAPI.plans.list();
      setPlans(response.data);
      setEditingPlan(null);
    } catch (err) {
      console.error("Failed to update plan:", err);
    }
  };

  const handleCreatePlan = async (planData) => {
    try {
      await handleApiCall(
        () => adminAPI.plans.create(planData),
        "تم إنشاء الباقة الجديدة بنجاح"
      );

      // Refresh plans list
      const response = await adminAPI.plans.list();
      setPlans(response.data);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create plan:", err);
    }
  };

  const handleResetPlan = async (planKey) => {
    if (window.confirm(`هل أنت متأكد من إعادة تعيين الباقة ${planKey}؟`)) {
      try {
        await handleApiCall(
          () => adminAPI.plans.reset(planKey),
          `تم إعادة تعيين الباقة ${planKey} بنجاح`
        );

        // Refresh plans list
        const response = await adminAPI.plans.list();
        setPlans(response.data);
      } catch (err) {
        console.error("Failed to reset plan:", err);
      }
    }
  };

  const handleDeletePlan = async (planKey) => {
    if (window.confirm(`هل أنت متأكد من حذف الباقة ${planKey}؟`)) {
      try {
        await handleApiCall(
          () => adminAPI.plans.delete(planKey),
          `تم حذف الباقة ${planKey} بنجاح`
        );

        // Refresh plans list
        const response = await adminAPI.plans.list();
        setPlans(response.data);
      } catch (err) {
        console.error("Failed to delete plan:", err);
      }
    }
  };

  const renderFeatureToggle = (feature, planFeatures, onChange) => (
    <label key={feature.key} className="feature-toggle">
      <input
        type="checkbox"
        checked={planFeatures[feature.key] || false}
        onChange={(e) => onChange(feature.key, e.target.checked)}
        disabled={
          editingPlan?.key === "basic" &&
          feature.key === "advancedBundleStyling"
        }
      />
      <span className="feature-label">
        <strong>{feature.label}</strong>
        {feature.description && (
          <small className="feature-description">{feature.description}</small>
        )}
      </span>
    </label>
  );

  return (
    <div className="plan-management">
      <div className="header">
        <h2>إدارة الباقات</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          إنشاء باقة جديدة
        </button>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.key} className="plan-card">
            <div className="plan-header">
              <h3>{plan.label}</h3>
              <span className="plan-key">{plan.key}</span>
              <span
                className={`plan-status ${
                  plan.isActive ? "active" : "inactive"
                }`}
              >
                {plan.isActive ? "نشط" : "غير نشط"}
              </span>
            </div>

            <div className="plan-pricing">
              <span className="price">
                {plan.price} {plan.currency}
              </span>
            </div>

            <div className="plan-limits">
              <h4>الحدود</h4>
              <div className="limit-item">
                <label>أقصى عدد من الباقات:</label>
                <input
                  type="number"
                  value={plan.limits.maxBundles}
                  onChange={(e) => {
                    const updatedPlan = {
                      ...plan,
                      limits: {
                        ...plan.limits,
                        maxBundles: parseInt(e.target.value) || 0,
                      },
                    };
                    setEditingPlan(updatedPlan);
                  }}
                  min="0"
                />
              </div>
              <div className="limit-item">
                <label>المشاهدات الشهرية:</label>
                <input
                  type="number"
                  value={plan.limits.monthlyViews || ""}
                  onChange={(e) => {
                    const updatedPlan = {
                      ...plan,
                      limits: {
                        ...plan.limits,
                        monthlyViews: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      },
                    };
                    setEditingPlan(updatedPlan);
                  }}
                  min="0"
                  placeholder="غير محدود"
                />
              </div>
            </div>

            <div className="plan-features">
              <h4>المميزات</h4>
              <div className="features-grid">
                {features.map((feature) =>
                  renderFeatureToggle(
                    feature,
                    editingPlan?.key === plan.key
                      ? editingPlan.features
                      : plan.features,
                    (featureKey, enabled) => {
                      const updatedPlan = {
                        ...plan,
                        features: { ...plan.features, [featureKey]: enabled },
                      };
                      setEditingPlan(updatedPlan);
                    }
                  )
                )}
              </div>
            </div>

            <div className="plan-actions">
              {editingPlan?.key === plan.key ? (
                <>
                  <button
                    className="btn btn-success"
                    onClick={() => handleUpdatePlan(plan.key, editingPlan)}
                  >
                    حفظ التغييرات
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditingPlan(null)}
                  >
                    إلغاء
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => setEditingPlan(plan)}
                  >
                    تعديل
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => handleResetPlan(plan.key)}
                    disabled={plan.key === "basic"}
                  >
                    إعادة تعيين
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeletePlan(plan.key)}
                    disabled={plan.key === "basic"}
                  >
                    حذف
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>إنشاء باقة جديدة</h3>
            <CreatePlanForm
              features={features}
              onSubmit={handleCreatePlan}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Create Plan Form Component
const CreatePlanForm = ({ features, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    key: "",
    label: "",
    limits: {
      maxBundles: 1,
      monthlyViews: null,
    },
    features: {},
    price: 0,
    currency: "SAR",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFeatureToggle = (featureKey, enabled) => {
    setFormData((prev) => ({
      ...prev,
      features: { ...prev.features, [featureKey]: enabled },
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>معرّف الباقة (key):</label>
        <input
          type="text"
          value={formData.key}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, key: e.target.value }))
          }
          required
          placeholder="premium"
        />
      </div>

      <div className="form-group">
        <label>اسم الباقة:</label>
        <input
          type="text"
          value={formData.label}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, label: e.target.value }))
          }
          required
          placeholder="Premium"
        />
      </div>

      <div className="form-group">
        <label>السعر:</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              price: parseFloat(e.target.value) || 0,
            }))
          }
          min="0"
          step="0.01"
        />
        <select
          value={formData.currency}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, currency: e.target.value }))
          }
        >
          <option value="SAR">ريال سعودي</option>
          <option value="USD">دولار أمريكي</option>
        </select>
      </div>

      <div className="form-group">
        <label>الوصف:</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows="3"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          إنشاء الباقة
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          إلغاء
        </button>
      </div>
    </form>
  );
};
```

---

## Admin Dashboard Features

Based on the APIs available, the admin dashboard should include:

### 1. **Overview Dashboard**

- Platform KPIs (stores, bundles, revenue)
- Plan distribution charts
- Recent activity feed
- Worker status monitor

### 2. **Store Management**

- Searchable store listing with filters
- Store detail view with bundle stats
- Plan management and upgrades
- Token refresh capabilities
- Store status management

### 3. **Bundle Administration**

- Cross-store bundle browsing
- Bundle performance analytics
- Bundle details with store context
- Bundle status management

### 4. **Subscription Management**

- Subscription listings by plan
- Plan distribution analytics
- Renewal tracking
- Churn analytics

### 5. **Plan Configuration Management** ⭐ **NEW**

- **Dynamic Plan Control**: Create, update, and delete subscription plans
- **Feature Toggle Management**: Enable/disable features per plan tier
- **Limit Configuration**: Set max bundles and monthly view limits
- **Plan Templates**: Reset plans to default templates
- **Feature Library**: View all available features with descriptions
- **Real-time Updates**: Changes apply immediately to affected stores
- **Protection Rules**: Basic plan cannot be deleted (system requirement)

**Key Features**:

- **14 Feature Toggles**: Including bundle styling, analytics, timers, shipping, etc.
- **Flexible Limits**: Set bundle limits and monthly view quotas
- **Pricing Control**: Configure plan pricing and currency
- **Plan Comparison**: Visual comparison of features across plans
- **Bulk Operations**: Future capability for bulk plan updates

### 6. **System Administration**

- Worker health monitoring
- Batch operations (token refresh)
- System health checks
- Configuration management

### 7. **Audit & Security**

- Admin activity logs
- Permission management
- Security monitoring

---

This API collection provides comprehensive coverage for building a full-featured admin dashboard that can effectively manage the Salla Advanced Bundler platform across all stores and users.
