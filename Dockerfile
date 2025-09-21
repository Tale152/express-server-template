# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json tsoa.json ./

# Install dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY src/ ./src/

# Generate TypeScript definitions and build the application
RUN npm run build

# Remove development dependencies to reduce size
RUN npm prune --omit=dev

# Stage 2: Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S todoapp -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=todoapp:nodejs /app/build ./build
COPY --from=builder --chown=todoapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=todoapp:nodejs /app/package.json ./package.json
COPY --from=builder --chown=todoapp:nodejs /app/public ./public

# Create directories and files needed by the application
RUN mkdir -p logs && chown -R todoapp:nodejs logs
RUN touch .env && chown todoapp:nodejs .env

# Switch to non-root user
USER todoapp

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
