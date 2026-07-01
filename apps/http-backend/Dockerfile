FROM node:20

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml turbo.json ./
COPY pnpm-workspace.yaml ./

# Copy entire repo for correct workspace resolution
COPY apps ./apps
COPY packages ./packages

RUN npm install -g pnpm

RUN pnpm install
RUN pnpm --filter @repo/db exec prisma generate

RUN pnpm run build --filter=http-backend...

EXPOSE 4000
CMD ["node", "apps/http-backend/dist/index.js"]
