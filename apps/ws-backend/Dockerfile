FROM node:20
WORKDIR /app

COPY package.json package-lock.json turbo.json ./

COPY apps ./apps
COPY packages ./packages

RUN npm install
RUN npm run generate -w @repo/db
RUN npx turbo run build --filter=ws-backend...

EXPOSE 8088
CMD ["node", "apps/ws-backend/dist/index.js"]
