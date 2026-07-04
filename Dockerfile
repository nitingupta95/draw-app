# Base builder stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace config and lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Copy packages and the websocket backend
COPY packages ./packages
COPY apps/ws-backend ./apps/ws-backend

# Install dependencies for the workspace
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm --filter=@repo/db run generate

# Build the ws-backend package and its dependencies
RUN pnpm turbo run build --filter=ws-backend...

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built files and dependencies from builder
COPY --from=builder /app ./

# Expose WebSocket port
EXPOSE 8088

# Command to start the websocket server
CMD ["pnpm", "--filter=ws-backend", "start"]
