#!/bin/bash

# Mode Detection Script for Docker Compose Profiles
# Implements comprehensive mode detection with fallback logic

# Function to detect mode based on environment variable
detect_env_mode() {
    if [ -n "$DOCKER_MODE" ]; then
        echo "$DOCKER_MODE"
        return 0
    fi
    return 1
}

# Function to detect mode based on file presence
detect_file_mode() {
    if [ -f ".env.production" ]; then
        echo "production"
        return 0
    elif [ -f ".env.development" ]; then
        echo "development"
        return 0
    fi
    return 1
}

# Function to detect mode based on volume mount detection
detect_volume_mode() {
    # Check if we're in a Docker container and have volume mounts
    if [ -f "/.dockerenv" ]; then
        # Check if source code is mounted (development indicator)
        if [ -d "/app/src" ] && [ -w "/app/src" ]; then
            echo "development"
            return 0
        else
            echo "production"
            return 0
        fi
    fi
    return 1
}

# Function to set mode-specific environment variables
set_mode_variables() {
    local mode="$1"
    
    case "$mode" in
        "production")
            export VOLUME_MOUNT_SOURCE=""
            export BACKEND_DB_MOUNT=""
            export BACKEND_ETF_MOUNT=""
            export BACKEND_INDEX_MOUNT=""
            export BACKEND_INSTITUTE_MOUNT=""
            export BACKEND_CRYPTO_MOUNT=""
            export BACKEND_JSON_MOUNT=""
            export BACKEND_LOGS_MOUNT=""
            export FASTIFY_JSON_MOUNT=""
            export NODE_ENV="production"
            ;;
        "development")
            export VOLUME_MOUNT_SOURCE="."
            export BACKEND_DB_MOUNT="../stocknear-backend/stocks.db"
            export BACKEND_ETF_MOUNT="../stocknear-backend/etf.db"
            export BACKEND_INDEX_MOUNT="../stocknear-backend/index.db"
            export BACKEND_INSTITUTE_MOUNT="../stocknear-backend/institute.db"
            export BACKEND_CRYPTO_MOUNT="../stocknear-backend/crypto.db"
            export BACKEND_JSON_MOUNT="../stocknear-backend/json"
            export BACKEND_LOGS_MOUNT="../stocknear-backend/logs"
            export FASTIFY_JSON_MOUNT="../stocknear-backend/app/json"
            export NODE_ENV="development"
            ;;
        *)
            echo "Unknown mode: $mode" >&2
            exit 1
            ;;
    esac
}

# Main mode detection logic
main() {
    local detected_mode=""
    
    # Primary: Environment variable detection
    if detected_mode=$(detect_env_mode); then
        echo "Mode detected from environment variable: $detected_mode"
    # Secondary: File detection
    elif detected_mode=$(detect_file_mode); then
        echo "Mode detected from file presence: $detected_mode"
    # Tertiary: Volume mount detection
    elif detected_mode=$(detect_volume_mode); then
        echo "Mode detected from volume mounts: $detected_mode"
    # Fallback: Default to development
    else
        detected_mode="development"
        echo "Mode fallback to default: $detected_mode"
    fi
    
    # Set mode-specific environment variables
    set_mode_variables "$detected_mode"
    
    # Export the detected mode
    export DOCKER_MODE="$detected_mode"
    
    echo "Final mode: $DOCKER_MODE"
    echo "NODE_ENV: $NODE_ENV"
}

# Run main function
main "$@" 