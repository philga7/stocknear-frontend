# StockNear Docker Profiles and Full-Stack Development

This document describes the Docker Compose profiles and full-stack development commands available for the StockNear project.

## Overview

The StockNear project uses Docker Compose profiles to manage different service configurations and full-stack development scenarios. The system includes comprehensive mode detection and hybrid backend integration support.

## Available Profiles

### Frontend Profile (`frontend`)
- **Services**: SvelteKit frontend only
- **Port**: 3000
- **Use Case**: Frontend-only development and testing

### Backend Profile (`backend`)
- **Services**: FastAPI, Redis, Fastify
- **Ports**: 8000 (FastAPI), 2000 (Fastify), 6380 (Redis)
- **Use Case**: Backend-only development and testing

### Full Profile (`full`)
- **Services**: All services (SvelteKit, FastAPI, Redis, Fastify)
- **Ports**: 3000, 8000, 2000, 6380
- **Use Case**: Complete full-stack development and production

## Mode Detection

The system includes automatic mode detection with the following priority:

1. **Environment Variable**: `DOCKER_MODE` (development/production)
2. **File Detection**: `.env.production` or `.env.development`
3. **Volume Mount Detection**: Container volume mounts
4. **Fallback**: Default to development mode

### Mode-Specific Configuration

#### Development Mode
- Source code mounted for hot reload
- Development environment variables
- Debug logging enabled
- Volume mounts for local development

#### Production Mode
- Optimized builds
- Production environment variables
- Minimal logging
- No source code mounts

## Full-Stack Development Commands

### Frontend Makefile Commands

#### Basic Full-Stack Commands
```bash
make fullstack           # Start full-stack development with all services
make fullstack-dev       # Start full-stack in development mode
make fullstack-prod      # Start full-stack in production mode
make fullstack-test      # Test full-stack endpoints
make fullstack-build     # Build full-stack Docker images
make fullstack-clean     # Clean full-stack environment
make fullstack-logs      # View full-stack logs
make fullstack-status    # Show full-stack status
make fullstack-shell     # Open shell in full-stack container
```

#### Hybrid Integration Commands
```bash
make fullstack-hybrid        # Start full-stack with hybrid backend integration
make fullstack-hybrid-dev    # Start full-stack hybrid in development mode
make fullstack-hybrid-prod   # Start full-stack hybrid in production mode
```

#### Cross-Repo Development Commands
```bash
make fullstack-cross-repo    # Full-stack with cross-repo development support
make fullstack-mode-detect   # Run full-stack mode detection
```

### Backend Makefile Commands

#### Basic Full-Stack Commands
```bash
make fullstack           # Start full-stack development with backend focus
make fullstack-dev       # Start full-stack in development mode
make fullstack-prod      # Start full-stack in production mode
make fullstack-test      # Test full-stack backend endpoints
make fullstack-build     # Build full-stack backend Docker images
make fullstack-clean     # Clean full-stack backend environment
make fullstack-logs      # View full-stack backend logs
make fullstack-status    # Show full-stack backend status
make fullstack-shell     # Open shell in full-stack backend container
```

#### Hybrid Integration Commands
```bash
make fullstack-hybrid        # Start full-stack with hybrid backend integration
make fullstack-hybrid-dev    # Start full-stack hybrid in development mode
make fullstack-hybrid-prod   # Start full-stack hybrid in production mode
```

#### Cross-Repo Development Commands
```bash
make fullstack-cross-repo    # Full-stack with cross-repo development support
make fullstack-mode-detect   # Run full-stack mode detection
```

## Hybrid Backend Integration

The hybrid integration feature allows seamless integration between frontend and backend services with:

- **Automatic Service Discovery**: Services automatically discover each other
- **Unified Configuration**: Shared configuration across services
- **Cross-Service Communication**: Direct communication between services
- **Unified Logging**: Centralized logging for all services
- **Shared Resources**: Common resources and data sharing

### Hybrid Mode Features

1. **Development Mode**:
   - Hot reload for all services
   - Source code mounting
   - Debug logging
   - Cross-service debugging

2. **Production Mode**:
   - Optimized builds
   - Production logging
   - Performance monitoring
   - Health checks

## Cross-Repo Development Support

The system supports development across multiple repositories:

### Repository Structure
```
/workspace/
├── stocknear-frontend/     # Current repository
└── stocknear-backend/      # Backend repository
```

### Cross-Repo Features
- **Automatic Repository Detection**: Detects backend repository
- **Repository Syncing**: Pulls latest changes from backend repo
- **Unified Development**: Develop across both repositories
- **Shared Configuration**: Common configuration between repos
- **Dependency Management**: Handles dependencies across repos

## Mode Detection Script

The `scripts/detect-mode.sh` script provides comprehensive mode detection:

### Detection Methods
1. **Environment Variable**: `DOCKER_MODE` variable
2. **File Detection**: `.env.production` or `.env.development` files
3. **Volume Mount Detection**: Container volume mounts
4. **Fallback**: Default to development mode

### Environment Variables Set
- `VOLUME_MOUNT_SOURCE`: Source code mounting
- `BACKEND_DB_MOUNT`: Database mounting
- `BACKEND_ETF_MOUNT`: ETF data mounting
- `BACKEND_INDEX_MOUNT`: Index data mounting
- `BACKEND_INSTITUTE_MOUNT`: Institute data mounting
- `BACKEND_CRYPTO_MOUNT`: Crypto data mounting
- `BACKEND_JSON_MOUNT`: JSON data mounting
- `BACKEND_LOGS_MOUNT`: Logs mounting
- `FASTIFY_JSON_MOUNT`: Fastify JSON mounting
- `NODE_ENV`: Node environment

## Usage Examples

### Starting Full-Stack Development
```bash
# Start full-stack development
make fullstack

# Start full-stack in development mode
make fullstack-dev

# Start full-stack in production mode
make fullstack-prod
```

### Testing Full-Stack Services
```bash
# Test all endpoints
make fullstack-test

# View logs
make fullstack-logs

# Check status
make fullstack-status
```

### Hybrid Development
```bash
# Start hybrid development
make fullstack-hybrid-dev

# Start hybrid production
make fullstack-hybrid-prod
```

### Cross-Repo Development
```bash
# Start with cross-repo support
make fullstack-cross-repo

# Run mode detection
make fullstack-mode-detect
```

## Service Endpoints

### Frontend Services
- **SvelteKit**: http://localhost:3000
- **Development**: Hot reload enabled
- **Production**: Optimized builds

### Backend Services
- **FastAPI**: http://localhost:8000
- **Fastify**: http://localhost:2000/health
- **Redis**: localhost:6380

## Health Checks

### Frontend Health Check
```bash
curl -s http://localhost:3000/
```

### Backend Health Checks
```bash
# FastAPI
curl -s http://localhost:8000/

# Fastify
curl -s http://localhost:2000/health

# Redis
docker-compose exec redis redis-cli ping
```

## Troubleshooting

### Common Issues

1. **Services Not Starting**:
   ```bash
   make fullstack-clean
   make fullstack-build
   make fullstack
   ```

2. **Mode Detection Issues**:
   ```bash
   make fullstack-mode-detect
   ```

3. **Cross-Repo Issues**:
   ```bash
   make fullstack-cross-repo
   ```

### Debug Commands
```bash
# View all logs
make fullstack-logs

# Check service status
make fullstack-status

# Open shell for debugging
make fullstack-shell
```

## Best Practices

1. **Development Workflow**:
   - Use `make fullstack-dev` for development
   - Use `make fullstack-test` to verify services
   - Use `make fullstack-logs` to monitor logs

2. **Production Deployment**:
   - Use `make fullstack-prod` for production
   - Use `make fullstack-build` to build images
   - Use `make fullstack-clean` to clean environment

3. **Cross-Repo Development**:
   - Use `make fullstack-cross-repo` for multi-repo development
   - Ensure backend repository is available
   - Sync repositories regularly

4. **Hybrid Integration**:
   - Use `make fullstack-hybrid-dev` for hybrid development
   - Use `make fullstack-hybrid-prod` for hybrid production
   - Monitor service communication

## Configuration

### Environment Variables
- `DOCKER_MODE`: Set to `development` or `production`
- `VOLUME_MOUNT_SOURCE`: Source code mounting path
- `BACKEND_*_MOUNT`: Backend data mounting paths
- `NODE_ENV`: Node environment setting

### Docker Compose Profiles
- `frontend`: Frontend-only services
- `backend`: Backend-only services
- `full`: All services

### Mode Detection
- Automatic mode detection with fallback
- Environment variable override
- File-based detection
- Volume mount detection

This comprehensive setup provides a unified development environment for full-stack development with hybrid backend integration and comprehensive mode detection. 