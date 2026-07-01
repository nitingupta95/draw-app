FROM node:20
WORKDIR /app

COPY package.json pnpm-lock.yaml turbo.json ./
COPY pnpm-workspace.yaml ./

COPY apps ./apps
COPY packages ./packages

RUN npm install -g pnpm

RUN pnpm install
RUN pnpm run build --filter=exceldraw-frontend...

EXPOSE 8000
CMD ["pnpm", "--filter", "exceldraw-frontend", "start"]
