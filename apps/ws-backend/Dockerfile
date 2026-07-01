FROM node:20
WORKDIR /app

COPY package.json pnpm-lock.yaml turbo.json ./
COPY pnpm-workspace.yaml ./

COPY apps ./apps
COPY packages ./packages

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm --filter @repo/db exec prisma generate
RUN pnpm run build --filter=ws-backend...

EXPOSE 8088
CMD ["node", "apps/ws-backend/dist/index.js"]
