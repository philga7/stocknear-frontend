#!/bin/bash

# StockNear Frontend Docker Initialization Script
# This script sets up the frontend Docker environment for first-time use

set -e  # Exit on any error

echo "🚀 Initializing StockNear Frontend for Docker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running ✓"

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

print_status "Docker Compose is available ✓"

# Step 1: Check required files
print_status "Checking required files..."
required_files=(
    "Dockerfile"
    "docker-compose.yml"
    "package.json"
    "svelte.config.js"
    "vite.config.js"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists ✓"
    else
        print_error "$file is missing!"
        exit 1
    fi
done

# Step 2: Check if .env file exists, create from example if not
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_status "Creating .env file from .env.example..."
        cp .env.example .env
        print_success ".env file created from example ✓"
    else
        print_warning ".env.example not found, creating basic .env file..."
        cat > .env << EOF
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
EOF
        print_success "Basic .env file created ✓"
    fi
else
    print_success ".env file exists ✓"
fi

# Step 3: Stop any running containers
print_status "Stopping any existing containers..."
docker-compose down > /dev/null 2>&1 || true

# Step 4: Build Docker images
print_status "Building Docker images..."
docker-compose build

# Step 5: Start services
print_status "Starting services..."
docker-compose up -d

# Step 6: Wait for services to be ready
print_status "Waiting for services to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker-compose ps | grep -q "Up"; then
        print_success "Services are running! ✓"
        break
    fi
    
    attempt=$((attempt + 1))
    print_status "Waiting for services to start... (attempt $attempt/$max_attempts)"
    sleep 5
done

if [ $attempt -eq $max_attempts ]; then
    print_error "Services failed to start within the expected time."
    print_status "Checking container logs..."
    docker-compose logs --tail=20
    exit 1
fi

# Step 7: Wait for application to be ready
print_status "Waiting for application to be ready..."
max_attempts=60
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:3000/ > /dev/null 2>&1; then
        print_success "Frontend application is responding! ✓"
        break
    fi
    
    attempt=$((attempt + 1))
    print_status "Waiting for frontend to be ready... (attempt $attempt/$max_attempts)"
    sleep 5
done

if [ $attempt -eq $max_attempts ]; then
    print_warning "Frontend application is not responding yet."
    print_status "This might be normal during the first build. Check logs with: docker-compose logs -f sveltekit"
else
    print_success "Frontend application is healthy! ✓"
fi

# Step 8: Test endpoints
print_status "Testing service endpoints..."

# Test frontend
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    print_success "Frontend is responding ✓"
else
    print_warning "Frontend endpoint test failed (this might be expected during first build)"
fi

# Check if backend is available (optional)
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    print_success "Backend is available ✓"
else
    print_warning "Backend is not available (this is expected if backend is not running)"
fi

print_success "🎉 StockNear Frontend initialization complete!"
print_status "Services available at:"
print_status "  - Frontend: http://localhost:3000"

print_status "Development commands:"
print_status "  - View logs: docker-compose logs -f"
print_status "  - Stop services: docker-compose down"
print_status "  - Restart services: docker-compose restart"
print_status "  - Make commands: make help"

print_status "Hot reload is enabled for development. Changes to source code will automatically reload the application." 