# ==================== STAGE 1: BUILD ====================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias primero (cache layer)
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --production=false

# Copiar código fuente
COPY . .

# Vite lee las variables VITE_* del entorno durante el build
ENV VITE_API_URL=localhost:3000/api
ENV VITE_KEYCLOAK_URL=localhost:8080/auth
ENV VITE_KEYCLOAK_REALM=mi_realm
ENV VITE_KEYCLOAK_CLIENT_ID=mi_cliente

# Build de producción
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
    CMD wget -q --spider http://127.0.0.1/ || exit 1

# Nginx en foreground
CMD ["nginx", "-g", "daemon off;"]

# Para construir la imagen: docker build -t react-app:0.0.0 .
# Para correr el contenedor: docker run -d --name react-app --env-file .env.development.local -p 5173:80 react-app:0.0.0
# Para corroborar las variables de entorno: docker exec react-app env

# Pasar al dockerfile del backend
# docker build -t arquisoft-backend:local .
