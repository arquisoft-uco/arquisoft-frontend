# ==================== STAGE 1: BUILD ====================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias primero (cache layer)
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --production=false

# Copiar código fuente
COPY . .

# Build args para inyectar valores de entorno en tiempo de build
ARG API_URL=/api
ARG KEYCLOAK_URL=http://localhost:8080/
ARG KEYCLOAK_REALM=your-realm
ARG KEYCLOAK_CLIENT_ID=your-client-id

# Generar environment.ts (desarrollo, usa .example)
RUN cp src/environments/environment.ts.example src/environments/environment.ts

# Generar environment.production.ts con valores reales inyectados
RUN printf "export const environment = {\n\
  production: true,\n\
  apiUrl: '%s',\n\
  keycloak: {\n\
    url: '%s',\n\
    realm: '%s',\n\
    clientId: '%s',\n\
  },\n\
};\n" \
  "$API_URL" "$KEYCLOAK_URL" "$KEYCLOAK_REALM" "$KEYCLOAK_CLIENT_ID" \
  > src/environments/environment.production.ts

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
