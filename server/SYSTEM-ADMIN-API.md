# System Administration API

Complete guide for system health monitoring, worker management, and global configuration.

## Table of Contents

1. [System Health](#system-health)
2. [Worker Management](#worker-management)
3. [Batch Operations](#batch-operations)
4. [System Configuration](#system-configuration)
5. [Worker Tracking Integration](#worker-tracking-integration)

---

## System Health

### Get System Health Status

Get overall system health including database status, store metrics, and service availability.

**Endpoint:** `GET /api/v1/admin/system/health`

**Authorization:** Admin only

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "services": {
      "database": "connected",
      "salla_api": "operational"
    },
    "metrics": {
      "total_stores": 150,
      "active_stores": 142,
      "stores_need_reauth": 8
    }
  }
}
```

**Status Values:**

- `healthy` - All services operational
- `unhealthy` - One or more services down
- `error` - System error occurred

---

## Worker Management

### Get Worker Status

Retrieve status and execution history for all background workers.

**Endpoint:** `GET /api/v1/admin/system/workers`

**Authorization:** Admin only

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "bundleCleanup",
      "description": "Deactivates expired bundles and purges failed Salla offers.",
      "schedule": "0 * * * *",
      "status": "success",
      "last_run_at": "2024-01-15T09:00:00.000Z",
      "last_success_at": "2024-01-15T09:00:12.000Z",
      "last_error_at": null,
      "last_error_message": null,
      "run_count": 240,
      "success_count": 238,
      "error_count": 2,
      "last_duration_ms": 12000,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T09:00:12.000Z"
    },
    {
      "name": "reviewCount",
      "description": "Auto-increments synthetic review counters for stores.",
      "schedule": "@daily",
      "status": "success",
      "last_run_at": "2024-01-15T00:00:00.000Z",
      "last_success_at": "2024-01-15T00:00:05.000Z",
      "run_count": 15,
      "success_count": 15,
      "error_count": 0,
      "last_duration_ms": 5000
    },
    {
      "name": "tokenRefresh",
      "description": "Refreshes Salla access tokens that are expiring.",
      "schedule": "0 3 * * *",
      "status": "error",
      "last_run_at": "2024-01-15T03:00:00.000Z",
      "last_error_at": "2024-01-15T03:00:08.000Z",
      "last_error_message": "Network timeout connecting to Salla API",
      "run_count": 15,
      "success_count": 14,
      "error_count": 1
    }
  ]
}
```

**Worker Status Values:**

- `idle` - Worker not running, waiting for next schedule
- `running` - Worker currently executing
- `success` - Last execution completed successfully
- `error` - Last execution failed
- `unknown` - No execution history

**Background Workers:**

1. **bundleCleanup**

   - Schedule: Every hour (`0 * * * *`)
   - Purpose: Deactivates expired bundles, purges failed Salla offers

2. **reviewCount**

   - Schedule: Daily (`@daily`)
   - Purpose: Auto-increments synthetic review counters

3. **tokenRefresh**

   - Schedule: Daily at 3 AM (`0 3 * * *`)
   - Purpose: Refreshes expiring Salla access tokens

4. **cacheCleanup**

   - Schedule: Daily at 3 AM (`0 3 * * *`)
   - Purpose: Removes expired product review cache entries

5. **reviewRefresh**
   - Schedule: Weekly on Sunday at 2 AM (`0 2 * * 0`)
   - Purpose: Refreshes cached reviews for tracked products

---

## Batch Operations

### Refresh Stores Needing Reauth

Force refresh access tokens for all stores with `needs_reauth` status.

**Endpoint:** `POST /api/v1/admin/system/refresh-needs-reauth`

**Authorization:** Admin only

**Response:**

```json
{
  "success": true,
  "message": "Refreshed 5 stores, 3 failed",
  "data": {
    "total": 8,
    "success": 5,
    "failed": 3,
    "results": [
      {
        "store_id": 123456789,
        "status": "success"
      },
      {
        "store_id": 987654321,
        "status": "failed",
        "reason": "No refresh token available"
      }
    ]
  }
}
```

**Use Cases:**

- Manual token refresh for stores with authentication issues
- Recovery after Salla API outage
- Bulk reauthorization operations

---

### Clear Expired Caches

Remove expired product review cache entries from the database.

**Endpoint:** `POST /api/v1/admin/system/clear-caches`

**Authorization:** Admin only

**Response:**

```json
{
  "success": true,
  "message": "Cleared 142 expired cache entries",
  "data": {
    "deleted_count": 142
  }
}
```

**Use Cases:**

- Manual cache cleanup outside of scheduled worker
- Free up database space
- Clear stale data after system maintenance

---

## System Configuration

### Get System Configuration

Retrieve current system-wide configuration and limits.

**Endpoint:** `GET /api/v1/admin/system/config`

**Authorization:** Admin only

**Response:**

```json
{
  "success": true,
  "data": {
    "environment": "production",
    "version": "1.0.0",
    "features": {
      "bundles": true,
      "analytics": true,
      "webhooks": true,
      "plan_management": true
    },
    "limits": {
      "max_bundles_per_request": 100,
      "max_products_per_bundle": 50,
      "api_rate_limit": "100/minute"
    }
  }
}
```

---

### Update System Configuration

Modify system-wide settings and feature flags.

**Endpoint:** `PATCH /api/v1/admin/system/config`

**Authorization:** Admin only

**Request Body:**

```json
{
  "limits": {
    "max_bundles_per_request": 150,
    "max_products_per_bundle": 75
  },
  "features": {
    "webhooks": false
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "System configuration updated successfully",
  "data": {
    "limits": {
      "max_bundles_per_request": 150,
      "max_products_per_bundle": 75
    },
    "features": {
      "webhooks": false
    }
  }
}
```

---

## Worker Tracking Integration

### Integrating Worker Tracking

All background workers should use the tracking utilities to report their status.

**Import:**

```javascript
import { executeWithTracking } from "../utils/workerTracking.js";
```

**Basic Usage:**

```javascript
import cron from "node-cron";
import { executeWithTracking } from "../utils/workerTracking.js";

// Your worker logic
async function cleanupBundles() {
  // Worker implementation
  console.log("Cleaning up expired bundles...");
  // ... cleanup logic
}

// Schedule with tracking
cron.schedule("0 * * * *", async () => {
  await executeWithTracking("bundleCleanup", cleanupBundles);
});
```

**Advanced Usage:**

```javascript
import {
  trackWorkerStart,
  trackWorkerSuccess,
  trackWorkerError,
} from "../utils/workerTracking.js";

async function myCustomWorker() {
  const startTime = await trackWorkerStart("customWorker");

  try {
    // Your worker logic
    await doSomeWork();

    await trackWorkerSuccess("customWorker", startTime);
  } catch (error) {
    await trackWorkerError("customWorker", error, startTime);
    throw error;
  }
}
```

**Worker Tracking Functions:**

- `executeWithTracking(workerName, workerFunction)` - Wrapper that handles all tracking
- `trackWorkerStart(workerName)` - Mark worker as running, increment run count
- `trackWorkerSuccess(workerName, startTime)` - Mark success, record duration
- `trackWorkerError(workerName, error, startTime)` - Mark error, record error message

**Tracked Metrics:**

- `status` - Current worker state (idle, running, success, error)
- `last_run_at` - When worker last started
- `last_success_at` - When worker last completed successfully
- `last_error_at` - When worker last failed
- `last_error_message` - Error message from last failure
- `run_count` - Total execution count
- `success_count` - Successful execution count
- `error_count` - Failed execution count
- `last_duration_ms` - Duration of last execution in milliseconds

---

## Complete API Reference

### Admin System Endpoints

| Endpoint                             | Method | Auth  | Description                              |
| ------------------------------------ | ------ | ----- | ---------------------------------------- |
| `/admin/system/health`               | GET    | Admin | Get system health status                 |
| `/admin/system/workers`              | GET    | Admin | Get worker status and history            |
| `/admin/system/refresh-needs-reauth` | POST   | Admin | Refresh tokens for stores needing reauth |
| `/admin/system/clear-caches`         | POST   | Admin | Clear expired cache entries              |
| `/admin/system/config`               | GET    | Admin | Get system configuration                 |
| `/admin/system/config`               | PATCH  | Admin | Update system configuration              |

---

## Example Frontend Integration

### React Hook for System Health

```javascript
import { useState, useEffect } from "react";
import api from "../services/api";

export function useSystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const response = await api.get("/admin/system/health");
      setHealth(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { health, loading, error, refetch: fetchHealth };
}
```

### React Component Example

```javascript
import { useSystemHealth } from "../hooks/useSystemHealth";

function SystemHealthDashboard() {
  const { health, loading, error, refetch } = useSystemHealth();

  if (loading) return <div>Loading system health...</div>;
  if (error) return <div>Error: {error}</div>;

  const { status, services, metrics } = health.data;

  return (
    <div className="system-health">
      <h2>System Health: {status}</h2>

      <div className="services">
        <h3>Services</h3>
        <div>Database: {services.database}</div>
        <div>Salla API: {services.salla_api}</div>
      </div>

      <div className="metrics">
        <h3>Store Metrics</h3>
        <div>Total Stores: {metrics.total_stores}</div>
        <div>Active: {metrics.active_stores}</div>
        <div>Need Reauth: {metrics.stores_need_reauth}</div>
      </div>

      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

---

## Security Notes

- All system administration endpoints require **admin role** authentication
- JWT tokens must be included in Authorization header: `Bearer <token>`
- Batch operations can be resource-intensive - use with caution
- Worker tracking is designed to be non-blocking and fail-safe
- System configuration changes may require application restart for some settings

---

## Monitoring Best Practices

1. **Regular Health Checks**: Poll `/system/health` every 1-5 minutes
2. **Worker Monitoring**: Check `/system/workers` to identify failing jobs
3. **Proactive Reauth**: Monitor `stores_need_reauth` count and trigger batch refresh
4. **Cache Management**: Clear caches weekly or when database size is concerning
5. **Error Alerting**: Set up notifications for worker errors and system health degradation

---

## Troubleshooting

### Workers Stuck in "running" Status

If a worker crashes without proper cleanup, status may show "running":

- Check server logs for error traces
- Restart the application to reset worker status
- Consider implementing worker timeout monitoring

### High Reauth Count

If many stores need reauth:

- Check Salla API status
- Verify OAuth credentials are valid
- Run batch refresh: `POST /admin/system/refresh-needs-reauth`
- Review `tokenRefresh` worker errors

### Database Connection Issues

If health shows database "disconnected":

- Check MongoDB service status
- Verify connection string in environment variables
- Check network connectivity
- Review MongoDB logs

---

## Future Enhancements

Planned improvements for system administration:

1. **Real-time Worker Monitoring**: WebSocket-based live worker status updates
2. **Alerting System**: Email/SMS notifications for critical system events
3. **Performance Metrics**: Track API response times, database query performance
4. **Audit Logging**: Detailed logs of all admin actions and system changes
5. **Scheduled Maintenance**: API for scheduling maintenance windows
6. **Worker Controls**: Manually start/stop/restart individual workers
7. **System Backups**: Automated backup and restore functionality
