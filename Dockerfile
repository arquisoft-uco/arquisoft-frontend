# ==================== STAGE 1: BUILD ====================
# --platform=$BUILDPLATFORM: esta etapa siempre compila nativa en el runner
# (amd64), nunca bajo emulación QEMU aunque el target sea arm64 — evita que
# el build de Vite se vuelva 10-20x más lento en el runner de GitHub Actions.
FROM --platform=$BUILDPLATFORM node:25-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias primero (cache layer)
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --production=false

# Copiar código fuente. El workflow de CI escribe .env.production.local (desde
# el secreto VITE_ENV_FILE) en el checkout ANTES de este build, así que llega
# incluido aquí — Vite lo carga automáticamente en "npm run build" y embebe
# las VITE_* en el bundle. No se usan build ARGs.
COPY . .

RUN test -f .env.production.local || \
    (echo "ERROR: falta .env.production.local con las variables VITE_* requeridas" && exit 1)

# Build de producción
RUN npm run build

# ==================== STAGE 2: RUNTIME ====================
FROM nginx:1.31-alpine

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
