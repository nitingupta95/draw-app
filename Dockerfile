# Base builder stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy workspace config and package files
COPY package.json package-lock.json turbo.json ./

# Copy packages and the websocket backend
COPY packages ./packages
COPY apps/ws-backend ./apps/ws-backend

RUN npm install

# Generate Prisma client
RUN npm run generate -w @repo/db

# Build the ws-backend package and its dependencies
RUN npx turbo run build --filter=ws-backend...

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app



# Copy built files and dependencies from builder
COPY --from=builder /app ./

# Expose WebSocket port
EXPOSE 8088

CMD ["npm", "run", "start", "-w", "ws-backend"]
