# StockNear Frontend Makefile
# Provides convenient commands for managing the Docker setup

.PHONY: help setup start stop restart logs status clean test build

# Default target
help:
	@echo "StockNear Frontend Docker Management"
	@echo ""
	@echo "Available commands:"
	@echo "  setup    - Initialize and start all services (recommended for first time)"
	@echo "  start    - Start all services"
	@echo "  stop     - Stop all services"
	@echo "  restart  - Restart all services"
	@echo "  logs     - View logs for all services"
	@echo "  status   - Show status of all services"
	@echo "  clean    - Stop services and clean up"
	@echo "  test     - Test all service endpoints"
	@echo "  build    - Build all Docker images"
	@echo "  shell    - Open shell in SvelteKit container"
	@echo "  dev      - Start development environment with hot reload"

# Initialize and start all services (recommended for first time)
setup:
	@echo "🚀 Setting up StockNear Frontend..."
	@docker-compose up -d --build
	@echo "Frontend setup complete! Access at http://localhost:3000"

# Start all services
start:
	@echo "Starting services..."
	@docker-compose up -d

# Stop all services
stop:
	@echo "Stopping services..."
	@docker-compose down

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
	@echo "Testing health check..."
	@curl -s http://localhost:3000/ || echo "Health check not responding"

# Build all Docker images
build:
	@echo "Building Docker images..."
	@docker-compose build

# Open shell in SvelteKit container
shell:
	@docker-compose exec sveltekit sh

# View logs for specific service
logs-sveltekit:
	@docker-compose logs -f sveltekit

# Development workflow commands
dev:
	@echo "Starting development environment with hot reload..."
	@docker-compose up -d
	@echo "Development server started! Access at http://localhost:3000"
	@echo "View logs with: make logs"

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
	@docker build -t stocknear-frontend:latest .

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
	@echo "Service: sveltekit"
	@echo "Port: 3000"
	@echo "Network: stocknear-network"
	@echo "Environment: development" 