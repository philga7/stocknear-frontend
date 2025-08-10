# Docker Setup for StockNear Frontend

This document provides instructions for running the StockNear frontend application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually included with Docker Desktop)

## Quick Start

Build and run the application:

```bash
# Build and start the service
docker-compose up

# Or build and run in detached mode
docker-compose up -d
```

The application will be available at `http://localhost:3000`

## Manual Docker Commands

```bash
# Build the image
docker build -t stocknear-frontend:latest .

# Run the container
docker run -p 3000:3000 -v $(pwd):/app stocknear-frontend:latest
```

## Docker Compose Commands

```bash
# Start the service
docker-compose up

# Start in detached mode
docker-compose up -d

# Start with full profile (all services)
docker-compose --profile full up -d

# Stop the service
docker-compose down

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f sveltekit

# View PocketBase logs
docker-compose logs -f pocketbase

# View all service logs
docker-compose logs -f
```

## Environment Variables

The following environment variables can be customized:

- `NODE_ENV`: Set to `development` (default)
- `PORT`: Port number for the application (default: 3000)
- `VITE_USEAST_POCKETBASE_URL`: PocketBase service URL for authentication (default: http://pocketbase:8090)
- `POCKETBASE_ADMIN_EMAIL`: PocketBase admin email (default: admin@stocknear.com)
- `POCKETBASE_ADMIN_PASSWORD`: PocketBase admin password (default: admin123)

## Health Checks

The container includes health checks that verify the application is responding correctly:

- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 5
- Start period: 40 seconds

### Service Health Endpoints

| Service | Health Check URL | Expected Response |
|---------|------------------|-------------------|
| SvelteKit | `http://localhost:3000/` | 200 OK |
| FastAPI | `http://localhost:8000/` | 200 OK |
| Fastify | `http://localhost:2000/health` | 200 OK |
| Redis | `redis-cli ping` | PONG |
| PocketBase | `http://localhost:8090/api/health` | 200 OK with JSON response |

## Security Features

- Non-root user execution
- Proper file permissions
- Alpine Linux base image for smaller size

## Development Features

- Hot reload enabled for development
- Source code mounted as volume for live updates
- Node modules cached in container

## Troubleshooting

### Build Issues

If you encounter build issues, try:

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Port Conflicts

If port 3000 is already in use, modify the `docker-compose.yml` file to use a different port:

```yaml
ports:
  - "3001:3000"  # Use port 3001 on host
```

### Volume Mount Issues

Ensure your source code is properly mounted:

```bash
# Check if volumes are mounted correctly
docker-compose exec sveltekit ls -la /app
```

## Network Configuration

The service is configured to use the `stocknear-network` bridge network, allowing it to communicate with other services in the StockNear ecosystem.

## PocketBase Service

### Overview
PocketBase is a backend service that provides user authentication and database functionality for the StockNear application. It runs on port 8090 and integrates seamlessly with the SvelteKit frontend.

### Configuration
- **Image**: `elestio/pocketbase:latest`
- **Port**: 8090 (host) -> 8090 (container)
- **Volume**: `pocketbase_data:/pb_data` for data persistence
- **Admin Panel**: Accessible at `http://localhost:8090/_/`
- **API Health**: `http://localhost:8090/api/health`

### Admin Credentials
- **Email**: `admin@stocknear.com` (configurable via `POCKETBASE_ADMIN_EMAIL`)
- **Password**: `admin123` (configurable via `POCKETBASE_ADMIN_PASSWORD`)

### Data Persistence
PocketBase data is persisted using Docker volumes:
- Volume name: `pocketbase_data`
- Driver: `local`
- Mount point: `/pb_data` inside container

### Integration
- SvelteKit connects to PocketBase via `VITE_USEAST_POCKETBASE_URL`
- Internal Docker networking uses service name `pocketbase:8090`
- External access uses `localhost:8090` 