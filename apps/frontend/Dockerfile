FROM node:20
WORKDIR /app

COPY package.json package-lock.json turbo.json ./

COPY apps ./apps
COPY packages ./packages

RUN npm install
RUN npx turbo run build --filter=exceldraw-frontend...

EXPOSE 8000
CMD ["npm", "run", "start", "-w", "exceldraw-frontend"]
