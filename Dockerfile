# ==========================================
# Multi-stage Dockerfile for JAM Loyalty Card
# ==========================================

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS builder

WORKDIR /app

# Ensure devDependencies are installed for building
ENV NODE_ENV=development

# Install dependencies
COPY package*.json ./
RUN npm ci --include=dev

# Copy source code and assets
COPY . .

# Build production bundle with Vite
RUN npm run build

# Stage 2: Serve with Nginx Alpine
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
