# Push Notification Service Configuration Analysis

## Overview
This document provides a comprehensive analysis of the push notification service configuration in the StockNear frontend application, including VAPID key usage, service worker integration, and notification delivery mechanisms.

## VAPID Key Configuration

### Environment Variables
The application uses two critical VAPID environment variables:
- `VITE_VAPID_PUBLIC_KEY`: Used for client-side subscription
- `VITE_VAPID_PRIVATE_KEY`: Used for server-side notification sending

### Usage Patterns

#### Client-Side (Frontend)
**File:** `src/lib/notifications.ts`
- VAPID public key is converted from base64 to Uint8Array using `urlBase64ToUint8Array()`
- Used in `subscribeUser()` function for push subscription
- Key is accessed via `import.meta.env.VITE_VAPID_PUBLIC_KEY`

#### Server-Side (API)
**File:** `src/routes/api/sendPushSubscription/+server.ts`
- Both public and private keys are used for web-push configuration
- Keys are accessed via `import.meta.env.VITE_VAPID_PUBLIC_KEY` and `import.meta.env.VITE_VAPID_PRIVATE_KEY`
- Configured with `webPush.setVapidDetails()` using contact email `mailto:contact@stocknear.com`

## Service Worker Integration

### Service Worker File
**File:** `src/service-worker.ts`

#### Key Features:
1. **Push Event Handler**: Processes incoming push notifications
2. **Notification Display**: Shows notifications with custom icons and options
3. **Click Handling**: Navigates to specified URLs when notifications are clicked
4. **Cache Management**: Handles asset caching for PWA functionality

#### Notification Configuration:
- **Icons**: Uses PWA icons (192x192, 64x64, 512x512)
- **Vibration**: `[200, 100, 200]` pattern
- **Tag**: `'stocknear-notification'` for grouping
- **Require Interaction**: `true` to keep notifications visible
- **Renotify**: `true` to show new notifications even with same tag

### Push Event Processing
```typescript
self.addEventListener('push', (event: PushEvent) => {
  // Parse JSON payload with title, body, and url
  // Display notification with custom options
  // Handle navigation on click
});
```

## Notification Subscription Management

### Subscription Flow
1. **Permission Request**: `requestNotificationPermission()` checks and requests browser permission
2. **Service Worker Registration**: Ensures service worker is ready
3. **Push Subscription**: Creates subscription using VAPID public key
4. **Server Storage**: Saves subscription to PocketBase database

### API Endpoints

#### Add Subscription
**File:** `src/routes/api/addPushSubscription/+server.ts`
- Stores user subscription in PocketBase `pushSubscription` collection
- Links subscription to user ID
- Handles duplicate subscriptions by deleting old ones

#### Delete Subscription
**File:** `src/routes/api/deletePushSubscription/+server.ts`
- Removes all subscriptions for a user
- Cleans up both server and client-side subscriptions

#### Send Notifications
**File:** `src/routes/api/sendPushSubscription/+server.ts`
- Requires API key authentication
- Fetches all subscriptions for a user
- Sends notifications to all user devices
- Handles failed subscriptions (410/404 errors) by deleting them

## Notification Delivery Architecture

### Data Flow
1. **Client Subscription**: User subscribes via profile page
2. **Server Storage**: Subscription saved to PocketBase
3. **Notification Trigger**: External system calls send endpoint
4. **Multi-Device Delivery**: Notification sent to all user devices
5. **Service Worker Processing**: Displays notification to user

### Payload Structure
```json
{
  "title": "Notification Title",
  "body": "Notification Message",
  "url": "/target-page"
}
```

### Error Handling
- **Invalid Subscriptions**: Automatically deleted on 410/404 errors
- **Network Issues**: Logged but doesn't break other notifications
- **Permission Denied**: Gracefully handled with user feedback

## User Experience Integration

### Profile Page Integration
**File:** `src/routes/profile/+page.svelte`
- Permission status checking on mount
- Subscription status verification
- Toggle controls for enabling/disabling notifications
- User feedback via toast notifications

### Notification Features
- **Click Navigation**: Direct navigation to specified URLs
- **Window Focus**: Brings app to front when clicked
- **Visual Feedback**: Custom icons and vibration patterns
- **Grouping**: Notifications grouped by tag to prevent spam

## Reliability Considerations

### Network Resilience
- Uses HTTPS agent with IPv4 family for consistent connections
- Handles partial failures (some devices may fail while others succeed)
- Automatic cleanup of invalid subscriptions

### User Impact
- **Graceful Degradation**: App works without notifications
- **Clear Feedback**: Toast messages for success/failure states
- **Permission Handling**: Respects user choice and browser limitations

### Security
- API key authentication for sending notifications
- User-specific subscription filtering
- Secure VAPID key handling

## Configuration Requirements

### Environment Setup
The application expects these environment variables:
```bash
VITE_VAPID_PUBLIC_KEY=your_public_key_here
VITE_VAPID_PRIVATE_KEY=your_private_key_here
```

### PocketBase Schema
The `pushSubscription` collection should have:
- `user`: Reference to user ID
- `subscription`: JSON object containing push subscription data

## Failure Scenarios and Impact

### Common Failure Points
1. **Missing VAPID Keys**: Notifications won't work
2. **Service Worker Not Registered**: No push event handling
3. **Permission Denied**: User can't receive notifications
4. **Network Issues**: Temporary delivery failures
5. **Invalid Subscriptions**: Automatic cleanup occurs

### User Impact Assessment
- **High Impact**: Missing VAPID keys (complete failure)
- **Medium Impact**: Service worker issues (no notifications)
- **Low Impact**: Individual subscription failures (partial delivery)

## Recommendations

### Configuration Validation
- Add VAPID key validation on startup
- Implement health checks for notification service
- Add monitoring for delivery success rates

### User Experience Improvements
- Add notification preferences (frequency, types)
- Implement notification history
- Add notification scheduling capabilities

### Security Enhancements
- Implement rate limiting for notification sending
- Add subscription validation on server side
- Consider implementing notification encryption

## Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Browser  │    │   Service Worker │    │   PocketBase    │
│                 │    │                  │    │                 │
│ 1. Request      │───▶│ 2. Register      │    │ 3. Store        │
│    Permission   │    │    Subscription  │───▶│    Subscription │
│                 │    │                  │    │                 │
│ 4. Receive      │◀───│ 5. Display       │    │ 6. Query        │
│    Notification │    │    Notification  │◀───│    Subscriptions │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Profile Page  │    │   Push Event     │    │   Send API      │
│                 │    │   Handler        │    │                 │
│ • Permission    │    │ • Parse Payload  │    │ • Authentication│
│ • Subscription  │    │ • Show Notification│   │ • Multi-device  │
│ • User Controls │    │ • Handle Click   │    │ • Error Handling│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

This analysis provides a complete overview of the push notification system architecture, configuration requirements, and operational considerations for the StockNear frontend application. 