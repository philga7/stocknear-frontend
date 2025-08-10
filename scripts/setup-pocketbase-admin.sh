#!/bin/bash

# PocketBase Admin Account Setup Script
# This script creates the default admin account for PocketBase

set -e

echo "🔧 Setting up PocketBase admin account..."

# Check if PocketBase container is running
if ! docker ps | grep -q "pocketbase"; then
    echo "❌ PocketBase container is not running. Please start it first:"
    echo "   docker-compose up pocketbase -d"
    exit 1
fi

# Get the container name
CONTAINER_NAME=$(docker ps --format "table {{.Names}}" | grep pocketbase | head -n 1)

if [ -z "$CONTAINER_NAME" ]; then
    echo "❌ Could not find PocketBase container"
    exit 1
fi

echo "📦 Found PocketBase container: $CONTAINER_NAME"

# Default admin credentials
ADMIN_EMAIL=${POCKETBASE_ADMIN_EMAIL:-admin@stocknear.com}
ADMIN_PASSWORD=${POCKETBASE_ADMIN_PASSWORD:-admin123}

echo "🔑 Creating admin account with email: $ADMIN_EMAIL"

# Create the admin account
echo "⏳ Creating admin account..."
if docker exec "$CONTAINER_NAME" /usr/local/bin/pocketbase --dir /pb_data superuser upsert "$ADMIN_EMAIL" "$ADMIN_PASSWORD"; then
    echo "✅ Admin account created successfully!"
    
    # Restart PocketBase to recognize the new admin account
    echo "🔄 Restarting PocketBase container..."
    docker restart "$CONTAINER_NAME"
    
    # Wait for container to be ready
    echo "⏳ Waiting for PocketBase to start..."
    sleep 5
    
    # Test if the service is accessible
    if curl -f http://localhost:8090/api/health > /dev/null 2>&1; then
        echo "✅ PocketBase is running and accessible"
        echo ""
        echo "🎉 Setup complete! You can now access:"
        echo "   - Admin Panel: http://localhost:8090/_/"
        echo "   - Email: $ADMIN_EMAIL"
        echo "   - Password: $ADMIN_PASSWORD"
    else
        echo "⚠️  PocketBase might still be starting up. Please wait a moment and try accessing:"
        echo "   http://localhost:8090/_/"
    fi
else
    echo "❌ Failed to create admin account"
    exit 1
fi
