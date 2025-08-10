# StockNear Frontend Makefile
# Provides convenient commands for managing the Docker setup with profiles and mode detection

.PHONY: help setup start stop restart logs status clean test build frontend backend full dev prod fullstack fullstack-dev fullstack-prod fullstack-test fullstack-build fullstack-clean fullstack-logs fullstack-status fullstack-shell fullstack-hybrid fullstack-hybrid-dev fullstack-hybrid-prod fullstack-cross-repo fullstack-mode-detect pocketbase-init

# Default target
help:
	@echo "StockNear Frontend Docker Management with Profiles"
	@echo ""
	@echo "Available commands:"
	@echo "  setup    - Initialize and start all services (recommended for first time)"
	@echo "  start    - Start all services"
	@echo "  stop     - Stop all services"
	@echo "  stop-frontend - Stop frontend services only"
	@echo "  stop-backend  - Stop backend services only"
	@echo "  stop-full     - Stop full-stack services only"
	@echo "  stop-sveltekit- Stop SvelteKit service only"
	@echo "  stop-fastapi  - Stop FastAPI service only"
	@echo "  stop-redis    - Stop Redis service only"
	@echo "  stop-fastify  - Stop Fastify service only"
	@echo "  stop-pocketbase- Stop PocketBase service only"
	@echo "  restart  - Restart all services"
	@echo "  logs     - View logs for all services"
	@echo "  status   - Show status of all services"
	@echo "  clean    - Stop services and clean up"
	@echo "  test     - Test all service endpoints"
	@echo "  build    - Build all Docker images"
	@echo "  shell    - Open shell in SvelteKit container"
	@echo ""
	@echo "Profile-specific commands:"
	@echo "  frontend - Start frontend-only profile (SvelteKit)"
	@echo "  backend  - Start backend-only profile (FastAPI, Redis, Fastify)"
	@echo "  full     - Start full-stack profile (all services)"
	@echo ""
	@echo "Mode-specific commands:"
	@echo "  dev      - Start development mode with hot reload"
	@echo "  prod     - Start production mode"
	@echo "  detect   - Run mode detection script"
	@echo ""
	@echo "Full-Stack Development Commands:"
	@echo "  fullstack           - Start full-stack development with all services"
	@echo "  fullstack-dev       - Start full-stack in development mode"
	@echo "  fullstack-prod      - Start full-stack in production mode"
	@echo "  fullstack-test      - Test full-stack endpoints"
	@echo "  fullstack-build     - Build full-stack Docker images"
	@echo "  fullstack-clean     - Clean full-stack environment"
	@echo "  fullstack-logs      - View full-stack logs"
	@echo "  fullstack-status    - Show full-stack status"
	@echo "  fullstack-shell     - Open shell in full-stack container"
	@echo "  fullstack-hybrid    - Start full-stack with hybrid backend integration"
	@echo "  fullstack-hybrid-dev- Start full-stack hybrid in development mode"
	@echo "  fullstack-hybrid-prod- Start full-stack hybrid in production mode"
	@echo "  fullstack-cross-repo- Full-stack with cross-repo development support"
	@echo "  fullstack-mode-detect- Run full-stack mode detection"

# Mode detection
detect:
	@echo "🔍 Running mode detection..."
	@./scripts/detect-mode.sh

# Initialize PocketBase admin and schema (idempotent)
pocketbase-init:
	@echo "🛠️  Initializing PocketBase (admin + schema)..."
	@echo "Waiting for PocketBase health..."
	@until curl -sSf http://localhost:8090/api/health >/dev/null; do echo "Waiting for PocketBase..."; sleep 2; done
	@./scripts/setup-pocketbase-admin.sh
	@echo "Waiting for PocketBase restart..."
	@sleep 2
	@until curl -sSf http://localhost:8090/api/health >/dev/null; do echo "Waiting for PocketBase after admin setup..."; sleep 2; done
	@echo "Ensuring users collection has tier and credits fields..."
	@POCKETBASE_URL=http://pocketbase:8090 POCKETBASE_ADMIN_EMAIL=$${POCKETBASE_ADMIN_EMAIL:-admin@stocknear.com} POCKETBASE_ADMIN_PASSWORD=$${POCKETBASE_ADMIN_PASSWORD:-admin123} docker-compose exec -T sveltekit node /app/scripts/pocketbase/ensure-users-tier-credits.js
	@echo "✅ PocketBase initialization complete."

# Initialize and start all services (recommended for first time)
setup:
	@echo "🚀 Setting up StockNear Frontend..."
	@./scripts/detect-mode.sh
	@docker-compose --profile full up -d --build
	@$(MAKE) pocketbase-init
	@echo "Full-stack setup complete! Access at http://localhost:3000"

# Start all services
start:
	@echo "Starting all services..."
	@./scripts/detect-mode.sh
	@docker-compose --profile full up -d

# Stop all services
stop:
	@echo "Stopping all services..."
	@docker-compose --profile full down

# Stop specific profile services
stop-frontend:
	@echo "Stopping frontend services..."
	@docker-compose --profile frontend down

stop-backend:
	@echo "Stopping backend services..."
	@docker-compose --profile backend down

stop-full:
	@echo "Stopping full-stack services..."
	@docker-compose --profile full down

# Stop individual services
stop-sveltekit:
	@echo "Stopping SvelteKit service..."
	@docker-compose stop sveltekit || docker-compose --profile frontend stop sveltekit

stop-fastapi:
	@echo "Stopping FastAPI service..."
	@docker-compose stop fastapi || docker-compose --profile backend stop fastapi

stop-redis:
	@echo "Stopping Redis service..."
	@docker-compose stop redis || docker-compose --profile backend stop redis

stop-fastify:
	@echo "Stopping Fastify service..."
	@docker-compose stop fastify || docker-compose --profile backend stop fastify

stop-pocketbase:
	@echo "Stopping PocketBase service..."
	@docker-compose stop pocketbase || docker-compose --profile backend stop pocketbase

# Restart all services
restart:
	@echo "Restarting services..."
	@docker-compose restart

# View logs for all services
logs:
	@docker-compose logs -f

# Show status of all services
status:
	@docker-compose ps

# Stop services and clean up
clean:
	@echo "Cleaning up..."
	@docker-compose down
	@docker system prune -f

# Test all service endpoints
test:
	@echo "Testing service endpoints..."
	@echo "Testing SvelteKit frontend..."
	@curl -s http://localhost:3000/ || echo "SvelteKit frontend not responding"
	@echo "Testing FastAPI backend..."
	@curl -s http://localhost:8000/ || echo "FastAPI backend not responding"
	@echo "Testing Fastify service..."
	@curl -s http://localhost:2000/health || echo "Fastify service not responding"

# Build all Docker images
build:
	@echo "Building Docker images..."
	@./scripts/detect-mode.sh
	@docker-compose build

# Open shell in SvelteKit container
shell:
	@docker-compose exec sveltekit sh

# View logs for specific service
logs-sveltekit:
	@docker-compose logs -f sveltekit

logs-fastapi:
	@docker-compose logs -f fastapi

logs-fastify:
	@docker-compose logs -f fastify

logs-pocketbase:
	@docker-compose logs -f pocketbase

# Profile-specific commands
frontend:
	@echo "🚀 Starting frontend-only profile..."
	@./scripts/detect-mode.sh
	@docker-compose --profile frontend up -d --build
	@echo "Frontend profile started! Access at http://localhost:3000"

backend:
	@echo "🚀 Starting backend-only profile..."
	@./scripts/detect-mode.sh
	@docker-compose --profile backend up -d --build
	@echo "Backend profile started!"
	@echo "FastAPI: http://localhost:8000"
	@echo "Fastify: http://localhost:2000"
	@echo "Redis: localhost:6380"

full:
	@echo "🚀 Starting full-stack profile..."
	@./scripts/detect-mode.sh
	@docker-compose --profile full up -d --build
	@echo "Full-stack profile started!"
	@echo "Frontend: http://localhost:3000"
	@echo "FastAPI: http://localhost:8000"
	@echo "Fastify: http://localhost:2000"

# Mode-specific commands
dev:
	@echo "🔧 Starting development mode..."
	@DOCKER_MODE=development ./scripts/detect-mode.sh
	@DOCKER_MODE=development docker-compose --profile full up -d --build
	@echo "Development mode started! Access at http://localhost:3000"
	@echo "View logs with: make logs"

prod:
	@echo "🏭 Starting production mode..."
	@DOCKER_MODE=production ./scripts/detect-mode.sh
	@DOCKER_MODE=production docker-compose --profile full up -d --build
	@echo "Production mode started! Access at http://localhost:3000"

# Full-Stack Development Commands
fullstack:
	@echo "🚀 Starting full-stack development..."
	@./scripts/detect-mode.sh
	@docker-compose --profile full up -d --build
	@echo "Full-stack development started!"
	@echo "Frontend: http://localhost:3000"
	@echo "FastAPI: http://localhost:8000"
	@echo "Fastify: http://localhost:2000"
	@echo "Redis: localhost:6380"

fullstack-dev:
	@echo "🔧 Starting full-stack development mode..."
	@DOCKER_MODE=development ./scripts/detect-mode.sh
	@DOCKER_MODE=development docker-compose --profile full up -d --build
	@echo "Full-stack development mode started!"
	@echo "Frontend: http://localhost:3000"
	@echo "FastAPI: http://localhost:8000"
	@echo "Fastify: http://localhost:2000"
	@echo "Redis: localhost:6380"

fullstack-prod:
	@echo "🏭 Starting full-stack production mode..."
	@DOCKER_MODE=production ./scripts/detect-mode.sh
	@DOCKER_MODE=production docker-compose --profile full up -d --build
	@echo "Full-stack production mode started!"
	@echo "Frontend: http://localhost:3000"
	@echo "FastAPI: http://localhost:8000"
	@echo "Fastify: http://localhost:2000"
	@echo "Redis: localhost:6380"

fullstack-test:
	@echo "🧪 Testing full-stack endpoints..."
	@echo "Testing SvelteKit frontend..."
	@curl -s http://localhost:3000/ || echo "SvelteKit frontend not responding"
	@echo "Testing FastAPI backend..."
	@curl -s http://localhost:8000/ || echo "FastAPI backend not responding"
	@echo "Testing Fastify service..."
	@curl -s http://localhost:2000/health || echo "Fastify service not responding"
	@echo "Testing Redis connection..."
	@docker-compose --profile full exec redis redis-cli ping || echo "Redis not responding"
	@echo "Testing PocketBase service..."
	@curl -s http://localhost:8090/api/health || echo "PocketBase service not responding"

fullstack-build:
	@echo "🔨 Building full-stack Docker images..."
	@./scripts/detect-mode.sh
	@docker-compose --profile full build
	@echo "Full-stack images built successfully"

fullstack-clean:
	@echo "🧹 Cleaning full-stack environment..."
	@docker-compose --profile full down
	@docker system prune -f
	@echo "Full-stack environment cleaned"

fullstack-logs:
	@echo "📋 Viewing full-stack logs..."
	@docker-compose --profile full logs -f

fullstack-status:
	@echo "📊 Full-stack service status..."
	@docker-compose --profile full ps

fullstack-shell:
	@echo "🐚 Opening shell in full-stack container..."
	@docker-compose --profile full exec sveltekit sh

# Hybrid Integration Commands
fullstack-hybrid:
	@echo "🔗 Starting full-stack with hybrid backend integration..."
	@./scripts/detect-mode.sh
	@docker-compose --profile full up -d --build
	@echo "Full-stack hybrid integration started!"
	@echo "Frontend: http://localhost:3000"
	@echo "FastAPI: http://localhost:8000"
	@echo "Fastify: http://localhost:2000"
	@echo "Redis: localhost:6380"

fullstack-hybrid-dev:
	@echo "🔧 Starting full-stack hybrid in development mode..."
	@DOCKER_MODE=development ./scripts/detect-mode.sh
	@DOCKER_MODE=development docker-compose --profile full up -d --build
	@echo "Full-stack hybrid development mode started!"
	@echo "Frontend: http://localhost:3000"
	@echo "FastAPI: http://localhost:8000"
	@echo "Fastify: http://localhost:2000"
	@echo "Redis: localhost:6380"

fullstack-hybrid-prod:
	@echo "🏭 Starting full-stack hybrid in production mode..."
	@DOCKER_MODE=production ./scripts/detect-mode.sh
	@DOCKER_MODE=production docker-compose --profile full up -d --build
	@echo "Full-stack hybrid production mode started!"
	@echo "Frontend: http://localhost:3000"
	@echo "FastAPI: http://localhost:8000"
	@echo "Fastify: http://localhost:2000"
	@echo "Redis: localhost:6380"

# Cross-Repo Development Support
fullstack-cross-repo:
	@echo "🔄 Starting full-stack with cross-repo development support..."
	@./scripts/detect-mode.sh
	@if [ -d "../stocknear-backend" ]; then
		@echo "Backend repository found, syncing..."
		@cd ../stocknear-backend && git pull origin main
	@else
		@echo "Backend repository not found at ../stocknear-backend"
	@fi
	@docker-compose --profile full up -d --build
	@echo "Full-stack cross-repo development started!"
	@echo "Frontend: http://localhost:3000"
	@echo "FastAPI: http://localhost:8000"
	@echo "Fastify: http://localhost:2000"
	@echo "Redis: localhost:6380"

# Mode Detection for Full-Stack
fullstack-mode-detect:
	@echo "🔍 Running full-stack mode detection..."
	@./scripts/detect-mode.sh
	@echo "Full-stack mode detection completed"

# Development workflow commands
dev-stop:
	@echo "Stopping development environment..."
	@make stop

dev-restart:
	@echo "Restarting development environment..."
	@make restart

# Quick development commands
dev-logs:
	@echo "Viewing development logs..."
	@make logs-sveltekit

dev-status:
	@echo "Checking development status..."
	@make status

# Production commands
prod-build:
	@echo "Building production image..."
	@export DOCKER_MODE=production
	@./scripts/detect-mode.sh
	@docker build --build-arg DOCKER_MODE=production -t stocknear-frontend:latest .

prod-run:
	@echo "Running production container..."
	@docker run -p 3000:3000 stocknear-frontend:latest

# Utility commands
check-deps:
	@echo "Checking Docker dependencies..."
	@docker --version || echo "Docker not installed"
	@docker-compose --version || echo "Docker Compose not installed"

info:
	@echo "StockNear Frontend Docker Information"
	@echo "Profiles: frontend, backend, full"
	@echo "Modes: development, production"
	@echo "Services: sveltekit, fastapi, redis, fastify, pocketbase"
	@echo "Ports: 3000 (frontend), 8000 (fastapi), 2000 (fastify), 6380 (redis), 8090 (pocketbase)"
	@echo "Network: stocknear-network"
	@./scripts/detect-mode.sh

# Profile status commands
status-frontend:
	@docker-compose --profile frontend ps

status-backend:
	@docker-compose --profile backend ps

status-full:
	@docker-compose --profile full ps 