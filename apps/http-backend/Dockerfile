FROM node:18

# Set work directory
WORKDIR /app

# Copy entire monorepo (because backend needs packages/*)
COPY . .

# Install pnpm
RUN npm install -g pnpm

# Install all workspace deps
RUN pnpm install

# Build backend (if you use ts)
RUN pnpm --filter http-backend run build

# Expose port
EXPOSE 4000

# Start server
CMD ["pnpm", "--filter", "http-backend", "start"]
