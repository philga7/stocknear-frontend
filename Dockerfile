# Dockerfile for SvelteKit Frontend Application with Hybrid Backend Integration
ARG DOCKER_MODE=development

# Development stage with volume mounts
FROM node:20-alpine AS development
ARG DOCKER_MODE
ENV NODE_ENV=development
ENV PORT=3000
ENV DOCKER_MODE=${DOCKER_MODE}

# Install system dependencies
RUN apk add --no-cache python3 make g++ curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S sveltekit -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code (will be overridden by volume mount in development)
COPY . .

# Change ownership of the app directory
RUN chown -R sveltekit:nodejs /app

# Switch to non-root user
USER sveltekit

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# Production stage with backend integration
FROM node:20-alpine AS production
ARG DOCKER_MODE
ENV NODE_ENV=production
ENV PORT=3000
ENV DOCKER_MODE=${DOCKER_MODE}

# Install system dependencies
RUN apk add --no-cache python3 make g++ curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S sveltekit -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Copy backend integration files if they exist
COPY --from=backend-stage /app/backend-integration ./backend-integration 2>/dev/null || true

# Change ownership of the app directory
RUN chown -R sveltekit:nodejs /app

# Switch to non-root user
USER sveltekit

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]

# Backend integration stage
FROM python:3.11-alpine AS backend-stage
WORKDIR /app

# Copy backend requirements and install
COPY ../stocknear-backend/requirements.txt .
RUN pip install -r requirements.txt

# Copy backend code
COPY ../stocknear-backend .

# Build backend integration
RUN python -m compileall .

# Default to development stage
FROM development 