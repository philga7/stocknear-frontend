# Comprehensive Service Dependency Documentation

## Executive Summary

This document provides a complete synthesis of all service dependencies, criticality levels, and deployment configurations for the StockNear frontend application. Based on comprehensive analysis of the codebase, the application integrates with 6 main service categories with varying criticality levels and graceful degradation strategies.

## Service Dependency Overview

### Service Categories and Criticality Matrix

| Service Category | Criticality Level | Failure Impact | Graceful Degradation | Dependencies |
|------------------|-------------------|----------------|---------------------|--------------|
| **Core API Services** | 🔴 CRITICAL | Application non-functional | Limited functionality | FastAPI, Redis |
| **Payment Services** | 🔴 CRITICAL | Revenue loss | Feature disabled | Lemon Squeezy API |
| **Authentication Services** | 🟡 HIGH | User access issues | Guest mode | PocketBase |
| **Content Delivery** | 🟢 LOW | Visual degradation | Local fallbacks | CDN, PocketBase |
| **Push Notifications** | 🟢 LOW | Notification loss | Silent failure | VAPID, Service Worker |
| **Development Services** | 🟢 LOW | Development impact | Manual processes | Docker, Vite |

### Service Dependency Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    StockNear Frontend                          │
├─────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Core API  │    │   Payment   │    │   Auth &    │      │
│  │  Services   │    │  Services   │    │   Social    │      │
│  │  (CRITICAL) │    │  (CRITICAL) │    │   (HIGH)    │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│         │                   │                   │             │
│         ▼                   ▼                   ▼             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   FastAPI   │    │ Lemon       │    │  PocketBase │      │
│  │   Backend   │    │ Squeezy     │    │   + Discord │      │
│  │   + Redis   │    │   API       │    │     Bot     │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Content   │    │    Push     │    │ Development │      │
│  │  Delivery   │    │ Notifications│   │  Services   │      │
│  │   (LOW)     │    │   (LOW)     │    │   (LOW)     │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│         │                   │                   │             │
│         ▼                   ▼                   ▼             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   CDN +     │    │   VAPID +   │    │   Docker +  │      │
│  │  PocketBase │    │ Service     │    │    Vite     │      │
│  │   Images    │    │   Worker    │    │   Dev Tools │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Service Analysis

### 1. Core API Services (CRITICAL) 🔴

#### Environment Variables
- `VITE_USEAST_API_URL` - Primary API endpoint
- `VITE_USEAST_POCKETBASE_URL` - User authentication
- `VITE_USEAST_FASTIFY_URL` - JSON data operations (unused)
- `VITE_USEAST_WS_URL` - WebSocket connections
- `VITE_STOCKNEAR_API_KEY` - API authentication

#### Criticality Assessment
- **Application Core**: All stock data and financial information
- **User Authentication**: Complete user management system
- **Real-time Data**: WebSocket connections for live updates
- **Failure Impact**: Application becomes non-functional

#### Graceful Degradation Strategies
- Returns empty arrays `[]` on API failures
- Implements timeout handling with `fetchWithTimeout`
- Uses LRU caching to reduce API load
- Logs errors but continues application operation
- Authentication failures clear auth store but maintain app functionality

### 2. Payment Services (CRITICAL) 🔴

#### Environment Variables
- `VITE_LEMON_SQUEEZY_SECRET_KEY` - Webhook verification
- `VITE_LEMON_SQUEEZY_API_KEY` - API operations
- Product/Variant IDs for all subscription tiers

#### Criticality Assessment
- **Revenue Generation**: Primary monetization mechanism
- **Subscription Management**: User tier and credit allocation
- **Webhook Security**: Payment verification and processing
- **Failure Impact**: Complete revenue loss

#### Graceful Degradation Strategies
- HMAC-SHA256 signature verification
- Comprehensive error handling with HTTP status codes
- Input validation for all incoming data
- Separate Discord payment processing
- Subscription state management with fallbacks

### 3. Authentication & Social Services (HIGH) 🟡

#### Environment Variables
- `VITE_DISCORD_BOT_TOKEN` - Discord bot authentication
- `VITE_DISCORD_URL` - Community links
- `VITE_USEAST_POCKETBASE_URL` - PocketBase authentication service
- `POCKETBASE_ADMIN_EMAIL` - PocketBase admin email
- `POCKETBASE_ADMIN_PASSWORD` - PocketBase admin password

#### Criticality Assessment
- **User Access**: OAuth2 authentication flow
- **Community Features**: Discord role assignment
- **Premium Access**: Pro tier Discord benefits
- **User Authentication**: PocketBase user management and authentication
- **Failure Impact**: User access and community features affected

#### Graceful Degradation Strategies
- Multi-guild Discord support
- Error handling for missing roles/users
- Proper connection cleanup
- Status reporting for assignment results
- OAuth2 state verification
- PocketBase authentication fallback to guest mode
- User session management with local storage backup

### 4. Content Delivery Services (LOW) 🟢

#### Environment Variables
- `VITE_IMAGE_URL` - CDN for static assets
- `VITE_IMAGE_POCKETBASE_URL` - Dynamic content

#### Criticality Assessment
- **Visual Content**: Images and media assets
- **User Experience**: Visual enhancement
- **Performance**: CDN optimization
- **Failure Impact**: Visual degradation only

#### Graceful Degradation Strategies
- Environment-based routing
- Local fallback mechanisms
- Optional service design
- Application continues without images
- Thumbnail generation support

### 4.5. PocketBase Service (HIGH) 🟡

#### Service Overview
PocketBase provides user authentication, database functionality, and content management for the StockNear application. It serves as the primary backend for user management and data persistence.

#### Environment Variables
- `VITE_USEAST_POCKETBASE_URL` - PocketBase service URL (default: http://pocketbase:8090)
- `POCKETBASE_ADMIN_EMAIL` - Admin email for initial setup (default: admin@stocknear.com)
- `POCKETBASE_ADMIN_PASSWORD` - Admin password for initial setup (default: admin123)

#### Service Configuration
- **Image**: `elestio/pocketbase:latest`
- **Port**: 8090 (host) -> 8090 (container)
- **Volume**: `pocketbase_data:/pb_data` for data persistence
- **Admin Panel**: `http://localhost:8090/_/`
- **API Health**: `http://localhost:8090/api/health`
- **Network**: `stocknear-network` bridge network

#### Criticality Assessment
- **User Authentication**: Primary user management system
- **Data Persistence**: User preferences and application data
- **Content Management**: Dynamic content and media storage
- **Failure Impact**: User access issues, data loss potential

#### Graceful Degradation Strategies
- Guest mode when authentication fails
- Local storage backup for user preferences
- Fallback to static content when dynamic content unavailable
- Session recovery mechanisms
- Data export/import capabilities for backup

### 5. Push Notification Services (LOW) 🟢

#### Environment Variables
- `VITE_VAPID_PUBLIC_KEY` - Client-side subscription
- `VITE_VAPID_PRIVATE_KEY` - Server-side sending

#### Criticality Assessment
- **User Engagement**: Notification delivery
- **Real-time Updates**: Market alerts and news
- **Optional Feature**: Not core to application
- **Failure Impact**: Notification loss only

#### Graceful Degradation Strategies
- Service worker error handling
- Failed subscription cleanup
- Multi-device delivery support
- Silent failure on notification errors
- Browser permission handling

### 6. Development Services (LOW) 🟢

#### Environment Variables
- `VITE_APP_TITLE` - Application branding
- `VITE_APP_DESCRIPTION` - SEO metadata
- `VITE_ENABLE_HOT_RELOAD` - Development workflow
- `VITE_ENABLE_SOURCE_MAPS` - Debugging support
- `VITE_DEV_SERVER_URL` - Development server

#### Criticality Assessment
- **Development Experience**: Hot reload and debugging
- **Deployment Process**: Build and deployment tools
- **Development Only**: Not required for production
- **Failure Impact**: Development workflow affected

#### Graceful Degradation Strategies
- Multi-stage Docker builds
- Environment-aware configuration
- Profile-based service architecture
- Health monitoring and checks
- Atomic deployment updates

## Integration Failure Impact Analysis

### Critical Service Failures

#### 1. Core API Service Failure
**Impact Level**: 🔴 CRITICAL
- **Immediate Effects**: No stock data, watchlists broken
- **User Experience**: Application appears broken
- **Business Impact**: Core functionality unavailable
- **Recovery Time**: Minutes to hours
- **Mitigation**: API redundancy, caching strategies

#### 2. Payment Service Failure
**Impact Level**: 🔴 CRITICAL
- **Immediate Effects**: No new subscriptions, payment processing halted
- **User Experience**: Cannot upgrade or purchase
- **Business Impact**: Revenue generation stopped
- **Recovery Time**: Hours to days
- **Mitigation**: Payment provider redundancy, manual processing

#### 3. Authentication Service Failure
**Impact Level**: 🟡 HIGH
- **Immediate Effects**: Users cannot log in, sessions lost
- **User Experience**: Access to personal data blocked
- **Business Impact**: User engagement reduced
- **Recovery Time**: Minutes to hours
- **Mitigation**: Guest mode, session recovery

### Non-Critical Service Failures

#### 4. Content Delivery Failure
**Impact Level**: 🟢 LOW
- **Immediate Effects**: Images not loading, visual degradation
- **User Experience**: Reduced visual appeal
- **Business Impact**: Minimal
- **Recovery Time**: Hours to days
- **Mitigation**: Local fallbacks, CDN redundancy

#### 5. Push Notification Failure
**Impact Level**: 🟢 LOW
- **Immediate Effects**: No notifications delivered
- **User Experience**: Reduced engagement
- **Business Impact**: Minimal
- **Recovery Time**: Hours
- **Mitigation**: Email fallbacks, in-app notifications

#### 6. Development Service Failure
**Impact Level**: 🟢 LOW
- **Immediate Effects**: Development workflow disrupted
- **User Experience**: No impact on production
- **Business Impact**: Development velocity reduced
- **Recovery Time**: Minutes to hours
- **Mitigation**: Manual processes, alternative tools

## Deployment Configuration Templates

### Production Environment Template

```bash
# Core API Services (CRITICAL)
VITE_USEAST_API_URL=https://api.stocknear.com
VITE_USEAST_POCKETBASE_URL=https://pb.stocknear.com
VITE_USEAST_WS_URL=wss://ws.stocknear.com
VITE_STOCKNEAR_API_KEY=your_production_api_key

# Payment Services (CRITICAL)
VITE_LEMON_SQUEEZY_SECRET_KEY=your_production_secret_key
VITE_LEMON_SQUEEZY_API_KEY=your_production_api_key
VITE_LEMON_SQUEEZY_MONTHLY_ID_PLUS=your_monthly_plus_id
VITE_LEMON_SQUEEZY_ANNUAL_ID_PLUS=your_annual_plus_id
VITE_LEMON_SQUEEZY_MONTHLY_ID_PRO=your_monthly_pro_id
VITE_LEMON_SQUEEZY_ANNUAL_ID_PRO=your_annual_pro_id
VITE_LEMON_SQUEEZY_LIFE_TIME_ACCESS_ID=your_lifetime_id

# Authentication & Social Services (HIGH)
VITE_DISCORD_BOT_TOKEN=your_production_bot_token
VITE_DISCORD_URL=https://discord.gg/stocknear

# Content Delivery Services (LOW)
VITE_IMAGE_URL=https://cdn.stocknear.com
VITE_IMAGE_POCKETBASE_URL=https://pb.stocknear.com

# Push Notification Services (LOW)
VITE_VAPID_PUBLIC_KEY=your_production_public_key
VITE_VAPID_PRIVATE_KEY=your_production_private_key

# Development Services (LOW)
VITE_APP_TITLE=StockNear
VITE_APP_DESCRIPTION=Stock Analysis & Community Platform
VITE_ENABLE_HOT_RELOAD=false
VITE_ENABLE_SOURCE_MAPS=false
VITE_DEV_SERVER_URL=https://stocknear.com

# Docker Configuration
DOCKER_MODE=production
NODE_ENV=production
```

### Development Environment Template

```bash
# Core API Services (CRITICAL)
VITE_USEAST_API_URL=http://localhost:8000
VITE_USEAST_POCKETBASE_URL=http://localhost:8090
VITE_USEAST_WS_URL=ws://localhost:8000
VITE_STOCKNEAR_API_KEY=your_development_api_key

# Payment Services (CRITICAL)
VITE_LEMON_SQUEEZY_SECRET_KEY=your_development_secret_key
VITE_LEMON_SQUEEZY_API_KEY=your_development_api_key
VITE_LEMON_SQUEEZY_MONTHLY_ID_PLUS=your_dev_monthly_plus_id
VITE_LEMON_SQUEEZY_ANNUAL_ID_PLUS=your_dev_annual_plus_id
VITE_LEMON_SQUEEZY_MONTHLY_ID_PRO=your_dev_monthly_pro_id
VITE_LEMON_SQUEEZY_ANNUAL_ID_PRO=your_dev_annual_pro_id
VITE_LEMON_SQUEEZY_LIFE_TIME_ACCESS_ID=your_dev_lifetime_id

# Authentication & Social Services (HIGH)
VITE_DISCORD_BOT_TOKEN=your_development_bot_token
VITE_DISCORD_URL=https://discord.gg/stocknear-dev

# Content Delivery Services (LOW)
VITE_IMAGE_URL=http://localhost:8090
VITE_IMAGE_POCKETBASE_URL=http://localhost:8090

# Push Notification Services (LOW)
VITE_VAPID_PUBLIC_KEY=your_development_public_key
VITE_VAPID_PRIVATE_KEY=your_development_private_key

# Development Services (LOW)
VITE_APP_TITLE=StockNear Frontend
VITE_APP_DESCRIPTION=Stock Analysis & Community Platform for Small Investors
VITE_ENABLE_HOT_RELOAD=true
VITE_ENABLE_SOURCE_MAPS=true
VITE_DEV_SERVER_URL=http://localhost:3000

# Docker Configuration
DOCKER_MODE=development
NODE_ENV=development
```

## Service Health Monitoring

### Health Check Endpoints

| Service | Health Check URL | Expected Response | Check Interval |
|---------|------------------|-------------------|----------------|
| Frontend | `http://localhost:3000/` | 200 OK | 30s |
| FastAPI | `http://localhost:8000/` | 200 OK | 30s |
| Fastify | `http://localhost:2000/health` | 200 OK | 30s |
| Redis | `redis-cli ping` | PONG | 30s |
| PocketBase | `http://localhost:8090/api/health` | 200 OK with JSON | 30s |

### Monitoring Dashboard

```yaml
# Docker Compose Health Checks
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 40s
```

## Setup Instructions

### 1. Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd stocknear-frontend

# Run initialization script
./init-docker.sh

# Or use Makefile
make setup
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Configure critical services first
# 1. Core API Services
VITE_USEAST_API_URL=your_api_url
VITE_STOCKNEAR_API_KEY=your_api_key

# 2. Payment Services
VITE_LEMON_SQUEEZY_SECRET_KEY=your_secret_key
VITE_LEMON_SQUEEZY_API_KEY=your_api_key

# 3. Authentication Services
VITE_DISCORD_BOT_TOKEN=your_bot_token
```

### 3. Service Startup

```bash
# Development mode
make dev

# Production mode
make prod

# Full stack with all services
make fullstack
```

## Troubleshooting Guide

### Critical Service Issues

#### API Service Unavailable
```bash
# Check service status
make status

# View logs
make logs

# Restart services
make restart

# Check network connectivity
curl -f http://localhost:8000/
```

#### Payment Service Issues
```bash
# Verify webhook endpoint
curl -X POST http://localhost:3000/api/payment

# Check webhook signature
# Verify VITE_LEMON_SQUEEZY_SECRET_KEY is correct

# Test API connectivity
curl -H "Authorization: Bearer $VITE_LEMON_SQUEEZY_API_KEY" \
  https://api.lemonsqueezy.com/v1/users/me
```

#### Authentication Issues
```bash
# Check PocketBase status
curl -f http://localhost:8090/api/health

# Verify PocketBase admin panel access
curl -I http://localhost:8090/_/

# Check PocketBase environment variables
docker exec stocknear-frontend-pocketbase-1 env | grep POCKETBASE

# Test SvelteKit connection to PocketBase
docker exec stocknear-frontend-sveltekit-1 curl -f http://pocketbase:8090/api/health

# Verify Discord bot token
# Test bot connectivity in Discord

# Check OAuth2 configuration
# Verify redirect URIs in Discord application
```

### Non-Critical Service Issues

#### Content Delivery Issues
```bash
# Check CDN connectivity
curl -f $VITE_IMAGE_URL/assets/test.png

# Verify PocketBase image service
curl -f $VITE_IMAGE_POCKETBASE_URL/api/health

# Check image URLs in browser console
```

#### Push Notification Issues
```bash
# Verify VAPID keys
echo $VITE_VAPID_PUBLIC_KEY | base64 -d

# Test service worker
# Check browser console for service worker errors

# Verify subscription storage
# Check PocketBase pushSubscription collection
```

#### Development Issues
```bash
# Check Docker status
docker-compose ps

# View detailed logs
docker-compose logs -f sveltekit

# Rebuild containers
docker-compose build --no-cache

# Reset development environment
make clean && make setup
```

## Performance Optimization

### Critical Service Optimization

1. **API Caching**: Implement LRU caching for API responses
2. **Connection Pooling**: Optimize database connections
3. **CDN Usage**: Use CDN for static assets
4. **Load Balancing**: Implement load balancing for critical services

### Non-Critical Service Optimization

1. **Image Optimization**: Compress and optimize images
2. **Notification Batching**: Batch push notifications
3. **Development Tools**: Optimize hot reload performance

## Security Considerations

### Critical Service Security

1. **API Key Management**: Secure storage and rotation
2. **Webhook Security**: HMAC signature verification
3. **Authentication**: Secure OAuth2 implementation
4. **Payment Security**: PCI compliance for payment processing

### Non-Critical Service Security

1. **CDN Security**: HTTPS enforcement
2. **Push Notifications**: VAPID key security
3. **Development Security**: Non-root user in containers

## Conclusion

The StockNear frontend application implements a sophisticated service architecture with clear criticality levels and graceful degradation strategies. The system prioritizes critical services (Core API and Payment) while maintaining functionality through optional services. The comprehensive monitoring, health checks, and troubleshooting procedures ensure reliable operation across all environments.

### Key Recommendations

1. **Monitor Critical Services**: Implement comprehensive monitoring for Core API and Payment services
2. **Implement Redundancy**: Consider backup providers for critical services
3. **Regular Testing**: Test failure scenarios and graceful degradation
4. **Documentation Updates**: Keep service documentation current with any changes
5. **Security Audits**: Regular security reviews of all service integrations 