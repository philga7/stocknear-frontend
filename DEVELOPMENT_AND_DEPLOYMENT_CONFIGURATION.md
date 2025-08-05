# Development and Deployment Configuration

## Overview

This document provides a comprehensive analysis of the development and deployment environment configuration for the StockNear frontend application. The system implements a sophisticated Docker-based development workflow with environment-aware configuration, hot reload capabilities, and production deployment strategies.

## Environment Variables

### Development Environment Variables

1. **VITE_APP_TITLE**
   - **Purpose**: Application title for browser tabs and metadata
   - **Default Value**: "StockNear Frontend"
   - **Usage**: HTML title and application branding

2. **VITE_APP_DESCRIPTION**
   - **Purpose**: Application description for SEO and metadata
   - **Default Value**: "Stock Analysis & Community Platform for Small Investors"
   - **Usage**: Meta tags and search engine optimization

3. **VITE_ENABLE_HOT_RELOAD**
   - **Purpose**: Enable/disable hot reload functionality during development
   - **Default Value**: "true"
   - **Usage**: Development server configuration

4. **VITE_ENABLE_SOURCE_MAPS**
   - **Purpose**: Enable source maps for debugging
   - **Default Value**: "true"
   - **Usage**: Development debugging and error tracking

5. **VITE_DEV_SERVER_URL**
   - **Purpose**: Development server URL for local development
   - **Default Value**: "http://localhost:3000"
   - **Usage**: Development server configuration and API endpoints

## Docker Configuration Architecture

### Multi-Stage Dockerfile

The application uses a sophisticated multi-stage Dockerfile with three distinct stages:

#### 1. Development Stage
```dockerfile
FROM node:18-alpine AS development
ARG DOCKER_MODE
ENV NODE_ENV=development
ENV PORT=3000
ENV DOCKER_MODE=${DOCKER_MODE}
```

**Features:**
- Volume mounts for live code editing
- Hot reload enabled
- Development dependencies included
- Non-root user for security
- Health checks implemented

#### 2. Production Stage
```dockerfile
FROM node:18-alpine AS production
ARG DOCKER_MODE
ENV NODE_ENV=production
ENV PORT=3000
ENV DOCKER_MODE=${DOCKER_MODE}
```

**Features:**
- Optimized build process
- Production-only dependencies
- Built application with compression
- Security hardening
- Performance optimization

#### 3. Backend Integration Stage
```dockerfile
FROM python:3.11-alpine AS backend-stage
WORKDIR /app
```

**Features:**
- Python backend integration
- FastAPI service support
- Redis integration
- Database connectivity

### Docker Compose Configuration

#### Service Profiles

The application implements a sophisticated profile-based service architecture:

1. **Frontend Profile** (`--profile frontend`)
   - SvelteKit application only
   - Development server with hot reload
   - Volume mounts for live editing

2. **Backend Profile** (`--profile backend`)
   - FastAPI service
   - Redis database
   - Fastify service
   - Database persistence

3. **Full Stack Profile** (`--profile full`)
   - Complete application stack
   - All services integrated
   - Production-ready configuration

#### Service Configuration

**SvelteKit Service:**
```yaml
sveltekit:
  profiles: ["frontend", "full"]
  build: 
    context: .
    dockerfile: Dockerfile
    args:
      - DOCKER_MODE=${DOCKER_MODE:-development}
  ports:
    - '3000:3000'
  volumes:
    - ${VOLUME_MOUNT_SOURCE:-.}:/app
    - /app/node_modules
  environment:
    - NODE_ENV=${NODE_ENV:-development}
    - PORT=3000
    - VITE_USEAST_API_URL=http://fastapi:8000
    - DOCKER_MODE=${DOCKER_MODE:-development}
```

**FastAPI Service:**
```yaml
fastapi:
  profiles: ["backend", "full"]
  build: 
    context: ../stocknear-backend
    dockerfile: Dockerfile
  ports:
    - '8000:8000'
  volumes:
    - ${BACKEND_DB_MOUNT:-../stocknear-backend/stocks.db}:/app/stocks.db
    - ${BACKEND_ETF_MOUNT:-../stocknear-backend/etf.db}:/app/etf.db
  environment:
    - REDIS_HOST=redis
    - REDIS_PORT=6380
    - ENVIRONMENT=${DOCKER_MODE:-development}
```

## Development Workflow

### Mode Detection System

The application implements an intelligent mode detection system with multiple fallback mechanisms:

#### 1. Environment Variable Detection
```bash
if [ -n "$DOCKER_MODE" ]; then
    echo "$DOCKER_MODE"
    return 0
fi
```

#### 2. File Presence Detection
```bash
if [ -f ".env.production" ]; then
    echo "production"
elif [ -f ".env.development" ]; then
    echo "development"
fi
```

#### 3. Volume Mount Detection
```bash
if [ -f "/.dockerenv" ]; then
    if [ -d "/app/src" ] && [ -w "/app/src" ]; then
        echo "development"
    else
        echo "production"
    fi
fi
```

### Development vs Production Environment Differences

#### Development Environment
- **Volume Mounts**: Source code mounted for live editing
- **Hot Reload**: Enabled for instant code changes
- **Source Maps**: Enabled for debugging
- **Development Dependencies**: Included
- **Debug Mode**: Enabled
- **Database Mounts**: Local database files mounted

#### Production Environment
- **Optimized Build**: Minified and compressed
- **No Volume Mounts**: Built application only
- **Performance Optimized**: Brotli compression enabled
- **Security Hardened**: Non-root user, minimal dependencies
- **Health Checks**: Comprehensive monitoring
- **Persistent Storage**: Database volumes for data persistence

## Deployment Configuration

### Deployment Script

The application includes a sophisticated deployment script with atomic updates:

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest changes
git pull
npm ci

# Create builds directory
mkdir -p builds

# Build to timestamped directory
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
npm run build
mv build "builds/build_$TIMESTAMP"

# Atomic symlink update
ln -sfn "builds/build_$TIMESTAMP" build

# Reload PM2
pm2 reload frontend

# Cleanup (keep last 3 builds)
cd builds && ls -t | grep "build_" | tail -n +4 | xargs -r rm -rf && cd ..

echo "✅ Deployment complete!"
```

### Build Configuration

#### Vite Configuration
```javascript
const config = {
  plugins: [
    tailwindcss(),
    sveltekit(),
  ],
  server: {
    cors: true,
    watch: {
      usePolling: false,
    },
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
    brotliSize: true,
  },
};
```

#### SvelteKit Configuration
```javascript
const config = {
  kit: {
    adapter: adapter({
      middleware: (handler) => compression()(handler),
      worker: true,
    }),
  },
  preprocess: vitePreprocess(),
  paths: {
    relative: false,
  },
};
```

## Development Commands

### Makefile Commands

The application provides a comprehensive Makefile with profile-specific commands:

#### Basic Commands
- `make setup` - Initialize and start all services
- `make start` - Start all services
- `make stop` - Stop all services
- `make restart` - Restart all services
- `make logs` - View logs for all services
- `make status` - Show status of all services

#### Profile-Specific Commands
- `make frontend` - Start frontend-only profile
- `make backend` - Start backend-only profile
- `make full` - Start full-stack profile

#### Mode-Specific Commands
- `make dev` - Start development mode with hot reload
- `make prod` - Start production mode
- `make detect` - Run mode detection script

#### Full-Stack Commands
- `make fullstack` - Start full-stack development
- `make fullstack-dev` - Start full-stack in development mode
- `make fullstack-prod` - Start full-stack in production mode

## Hot Reload Mechanisms

### Development Server Configuration

The development server implements sophisticated hot reload capabilities:

1. **File Watching**: Native FS events for better performance
2. **Volume Mounts**: Source code mounted for live editing
3. **CORS Support**: Enabled for cross-origin requests
4. **Polling Configuration**: Optimized for different environments

### Hot Reload Features

- **Instant Updates**: Code changes reflect immediately
- **State Preservation**: Application state maintained during reloads
- **Error Recovery**: Automatic recovery from compilation errors
- **Performance Optimized**: Minimal overhead during development

## Environment-Specific Configurations

### Development Environment Template

```bash
# Frontend Environment Configuration
NODE_ENV=development
PORT=3000

# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_BACKEND_URL=http://localhost:8000
VITE_USEAST_API_URL=http://localhost:8000

# Application Configuration
VITE_APP_TITLE=StockNear Frontend
VITE_APP_DESCRIPTION=Stock Analysis & Community Platform for Small Investors

# Development Configuration
VITE_ENABLE_HOT_RELOAD=true
VITE_ENABLE_SOURCE_MAPS=true
VITE_DEV_SERVER_URL=http://localhost:3000

# Docker Configuration
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1
```

### Production Environment Template

```bash
# Production Environment Configuration
NODE_ENV=production
PORT=3000

# API Configuration
VITE_API_BASE_URL=https://api.stocknear.com
VITE_BACKEND_URL=https://api.stocknear.com
VITE_USEAST_API_URL=https://api.stocknear.com

# Application Configuration
VITE_APP_TITLE=StockNear
VITE_APP_DESCRIPTION=Stock Analysis & Community Platform

# Production Configuration
VITE_ENABLE_HOT_RELOAD=false
VITE_ENABLE_SOURCE_MAPS=false
VITE_DEV_SERVER_URL=https://stocknear.com

# Docker Configuration
DOCKER_MODE=production
```

## Health Monitoring

### Health Check Configuration

Each service implements comprehensive health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 40s
```

### Service Monitoring

- **Frontend Health**: HTTP endpoint availability
- **Backend Health**: API endpoint responsiveness
- **Database Health**: Redis connectivity
- **Service Dependencies**: Inter-service communication

## Performance Optimization

### Build Optimizations

1. **Code Splitting**: Manual chunk configuration for optimal loading
2. **Compression**: Brotli compression enabled
3. **Minification**: ESBuild for fast minification
4. **Tree Shaking**: Unused code elimination
5. **Caching**: Browser and CDN caching strategies

### Development Optimizations

1. **Hot Reload**: Instant code updates
2. **Source Maps**: Debugging support
3. **Volume Mounts**: Live code editing
4. **Development Server**: Optimized for development workflow

## Security Considerations

### Development Security

- **Non-root User**: Application runs as non-root user
- **Volume Permissions**: Proper file permissions
- **Network Isolation**: Docker network isolation
- **Environment Variables**: Secure variable handling

### Production Security

- **Minimal Dependencies**: Production-only packages
- **Security Headers**: Comprehensive security headers
- **HTTPS Enforcement**: SSL/TLS configuration
- **Access Control**: Proper authentication and authorization

## Conclusion

The StockNear frontend implements a sophisticated development and deployment configuration with environment-aware Docker setup, comprehensive hot reload mechanisms, and production-ready deployment strategies. The system provides flexibility for both development and production environments while maintaining security, performance, and reliability standards. 