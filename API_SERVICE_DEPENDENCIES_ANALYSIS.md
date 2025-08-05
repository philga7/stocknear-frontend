# Core API Service Dependencies Analysis

## Overview

This document provides a comprehensive analysis of all core API service environment variables and their criticality levels in the StockNear frontend application. The analysis covers service interactions, failure impact, and graceful degradation patterns.

## Core Environment Variables

### 1. VITE_USEAST_API_URL
**Criticality Level: CRITICAL** ⚠️

**Purpose:** Primary API endpoint for all stock data, financial information, and core application functionality.

**Usage Patterns:**
- Used in `src/hooks.server.ts` for server-side API configuration
- Primary data source for stock quotes, company profiles, financial metrics
- Used across multiple layout server files for data fetching
- Supports POST requests with API key authentication

**Failure Impact:**
- **HIGH**: Complete loss of stock data functionality
- All stock pages would fail to load data
- Watchlist functionality would be severely impacted
- Real-time data updates would cease

**Graceful Degradation:**
- Returns empty arrays `[]` on API failures
- Implements timeout handling with `fetchWithTimeout`
- Uses LRU caching to reduce API load
- Logs errors but continues application operation

**Dependencies:**
- Requires `VITE_STOCKNEAR_API_KEY` for authentication
- Depends on FastAPI backend service

---

### 2. VITE_USEAST_POCKETBASE_URL
**Criticality Level: CRITICAL** ⚠️

**Purpose:** User authentication, user management, and database operations.

**Usage Patterns:**
- Used in `src/hooks.server.ts` for PocketBase client initialization
- Handles user authentication and session management
- Manages user data, watchlists, and application state
- Used in `src/lib/pocketbase.ts` for client configuration

**Failure Impact:**
- **HIGH**: Complete loss of user authentication
- Users cannot log in or maintain sessions
- Watchlist functionality completely broken
- User preferences and settings lost

**Graceful Degradation:**
- Implements try-catch blocks for auth refresh operations
- Clears auth store on authentication failures
- Continues application operation with limited functionality
- Logs authentication errors

**Dependencies:**
- Independent service (no other service dependencies)

---

### 3. VITE_USEAST_FASTIFY_URL
**Criticality Level: LOW** ✅

**Purpose:** Fastify service for specific JSON data operations.

**Usage Patterns:**
- Configured in `src/hooks.server.ts` but **NOT actively used**
- Available in `event.locals.fastifyURL` but no code references found
- Appears to be a placeholder for future functionality

**Failure Impact:**
- **LOW**: No current functionality depends on this service
- Application continues to operate normally
- No user-facing impact

**Graceful Degradation:**
- Not applicable (service not currently used)

**Dependencies:**
- None (service not actively used)

---

### 4. VITE_USEAST_WS_URL
**Criticality Level: MEDIUM** ⚡

**Purpose:** WebSocket connections for real-time price data updates.

**Usage Patterns:**
- Used in multiple Svelte components for real-time data
- Active in watchlist, stock pages, ETF pages, and table components
- Connects to `/price-data` endpoint for live updates
- Implements automatic reconnection logic

**Failure Impact:**
- **MEDIUM**: Loss of real-time price updates
- Static data still available through API endpoints
- User experience degraded but not broken
- Manual refresh still works

**Graceful Degradation:**
- Implements WebSocket connection error handling
- Automatic reconnection attempts
- Falls back to static data when WebSocket fails
- Logs connection errors but doesn't break UI

**Dependencies:**
- Depends on WebSocket service availability
- Independent of other API services

---

### 5. VITE_STOCKNEAR_API_KEY
**Criticality Level: CRITICAL** ⚠️

**Purpose:** Authentication key for API requests to the main backend.

**Usage Patterns:**
- Used in all API requests as `X-API-KEY` header
- Required for all data fetching operations
- Used in layout server files for stock data requests

**Failure Impact:**
- **HIGH**: All API requests will fail with 401/403 errors
- Complete loss of stock data functionality
- Application becomes unusable for core features

**Graceful Degradation:**
- API requests return empty arrays on authentication failure
- Error logging but continued operation
- No user-facing error messages for security

**Dependencies:**
- Required by `VITE_USEAST_API_URL` for all requests

## Service Interaction Patterns

### Primary Data Flow
```
User Request → SvelteKit → API (VITE_USEAST_API_URL) → FastAPI Backend
                ↓
            PocketBase (VITE_USEAST_POCKETBASE_URL) → User Auth/Data
                ↓
            WebSocket (VITE_USEAST_WS_URL) → Real-time Updates
```

### Error Handling Patterns

1. **API Timeout Handling:**
   ```javascript
   const fetchWithTimeout = async (url, options, timeout) => {
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), timeout);
     // ... implementation
   }
   ```

2. **Graceful Degradation:**
   ```javascript
   try {
     const data = await fetchWithTimeout(`${apiURL}${endpoint}`, options, REQUEST_TIMEOUT);
     return data;
   } catch (error) {
     console.error(`Error fetching ${endpoint}:`, error);
     return []; // Return empty array instead of throwing
   }
   ```

3. **Authentication Error Handling:**
   ```javascript
   try {
     await event?.locals?.pb?.collection("users")?.authRefresh();
   } catch (e) {
     event.locals.pb.authStore.clear();
     event.locals.user = undefined;
   }
   ```

## Criticality Assessment

### Absolutely Critical Services (Cannot be disabled)
1. **VITE_USEAST_API_URL** - Core data functionality
2. **VITE_USEAST_POCKETBASE_URL** - User authentication
3. **VITE_STOCKNEAR_API_KEY** - API authentication

### Optional Services (Can be disabled)
1. **VITE_USEAST_WS_URL** - Real-time updates (nice-to-have)
2. **VITE_USEAST_FASTIFY_URL** - Not currently used

## Failure Impact Analysis

### Complete Backend Failure
- **Impact**: Application becomes read-only with cached data
- **User Experience**: Limited functionality but not completely broken
- **Recovery**: Requires backend service restoration

### Authentication Service Failure
- **Impact**: Users cannot log in or access personalized features
- **User Experience**: Public data still accessible
- **Recovery**: Requires PocketBase service restoration

### WebSocket Service Failure
- **Impact**: Loss of real-time updates
- **User Experience**: Manual refresh required for data updates
- **Recovery**: Graceful fallback to static data

## Graceful Degradation Mechanisms

### 1. Caching Strategy
- LRU cache implementation for API responses
- Reduces dependency on real-time API availability
- Provides fallback data during service outages

### 2. Error Boundaries
- Try-catch blocks around all API calls
- Returns empty arrays instead of throwing errors
- Maintains UI functionality during service failures

### 3. Timeout Handling
- Configurable request timeouts
- Prevents UI freezing during slow responses
- Automatic retry mechanisms in some components

### 4. WebSocket Reconnection
- Automatic reconnection attempts
- Graceful handling of connection drops
- Fallback to static data when WebSocket unavailable

## Recommendations

### 1. Service Monitoring
- Implement health checks for all critical services
- Monitor API response times and error rates
- Set up alerts for service failures

### 2. Enhanced Error Handling
- Add user-friendly error messages for service failures
- Implement retry mechanisms with exponential backoff
- Consider implementing circuit breaker patterns

### 3. Caching Improvements
- Implement more aggressive caching for critical data
- Add cache warming strategies
- Consider implementing offline-first capabilities

### 4. Service Discovery
- Implement service discovery for dynamic endpoint resolution
- Add fallback endpoints for critical services
- Consider implementing load balancing for API endpoints

## Conclusion

The StockNear frontend application has a well-structured service architecture with appropriate error handling and graceful degradation patterns. The critical services (API, PocketBase, API Key) are essential for core functionality, while the WebSocket service provides enhanced user experience but is not critical for basic operation. The application demonstrates good resilience through caching, error handling, and timeout management. 