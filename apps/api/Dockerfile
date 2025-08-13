FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy app code
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
