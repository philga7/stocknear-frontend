# Dockerfile for SvelteKit Frontend Application
FROM node:18-alpine

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000

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

# Copy application code
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