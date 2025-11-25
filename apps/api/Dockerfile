# ========= BASE IMAGE =========
FROM node:20-alpine AS base

WORKDIR /app

# ========= INSTALL DEPENDENCIES =========
COPY package*.json ./
RUN npm install --production

# ========= COPY SOURCE =========
COPY . .

ENV PORT=3000
EXPOSE 3000

# ========= START SERVER =========
CMD ["node", "server.js"]
