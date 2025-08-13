FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json .
COPY package-lock.json .
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
#COPY --from=deps /apps/web/node_modules ./node_modules
COPY . .
ARG VITE_API_BASE
ARG VITE_ML_BASE
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_ML_BASE=$VITE_ML_BASE
#RUN npm run build

FROM nginx:1.27-alpine
#COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
