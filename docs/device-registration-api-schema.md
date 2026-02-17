# Device Registration API Schema

## Endpoint

```
POST /notification/Device/Register
```

Update the base URL in `services/api_endpoint.ts` and ensure `Config.API_URL` points to your backend.

## Request

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Body:**
```json
{
  "deviceId": "string",
  "fcmToken": "string",
  "platform": "ios" | "android"
}
```

| Field     | Type   | Description                                      |
|----------|--------|--------------------------------------------------|
| deviceId | string | Unique device identifier (UUID, persisted)      |
| fcmToken | string | Firebase Cloud Messaging token for push delivery |
| platform | string | `"ios"` or `"android"`                           |

## Response

**Success (200):**
```json
{
  "success": true,
  "message": "Device registered successfully"
}
```

**Error (4xx/5xx):**
```json
{
  "message": "Error description"
}
```

## Backend Implementation Notes

1. Store `fcmToken` linked to the authenticated user (from JWT) and `deviceId`
2. Use `fcmToken` with Firebase Admin SDK to send push notifications when app is in background/quit
3. On token refresh, client will re-register; upsert by `deviceId` or `userId + deviceId`
4. Consider unregistering device on logout
