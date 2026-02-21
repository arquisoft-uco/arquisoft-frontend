# ==================== STAGE 1: BUILD ====================
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias primero (cache layer)
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --production=false

# Copiar código fuente
COPY . .

# Build de producción (Vite)
RUN npm run build

# ==================== STAGE 2: RUNTIME ====================
FROM nginx:1.25-alpine

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build desde stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Puerto
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:80/ || exit 1

# Nginx en foreground
CMD ["nginx", "-g", "daemon off;"]
