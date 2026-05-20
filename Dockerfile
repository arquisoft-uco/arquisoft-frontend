# ==================== STAGE 1: BUILD ====================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias primero (cache layer)
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --production=false

# Copiar código fuente
COPY . .

# Vite embebe VITE_* en el bundle durante el build — deben llegar como build args,
# no como env vars del contenedor en runtime.
ARG VITE_API_URL
ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID

# Fallar el build si alguna variable requerida no fue provista
RUN test -n "$VITE_API_URL"         || (echo "ERROR: VITE_API_URL is required" && exit 1) && \
    test -n "$VITE_KEYCLOAK_URL"    || (echo "ERROR: VITE_KEYCLOAK_URL is required" && exit 1) && \
    test -n "$VITE_KEYCLOAK_REALM"  || (echo "ERROR: VITE_KEYCLOAK_REALM is required" && exit 1) && \
    test -n "$VITE_KEYCLOAK_CLIENT_ID" || (echo "ERROR: VITE_KEYCLOAK_CLIENT_ID is required" && exit 1)

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL
ENV VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM
ENV VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID

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
