# ArquiSoft — Frontend

Aplicación web de gestión académica construida con **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4** y **Keycloak** para autenticación.

## Tecnologías principales

| Categoría        | Herramientas                                    |
| ---------------- | ----------------------------------------------- |
| Framework        | React 19 + TypeScript                           |
| Bundler          | Vite 6                                          |
| Estilos          | Tailwind CSS v4                                 |
| Routing          | React Router 7                                  |
| Estado global    | Zustand 5                                       |
| Estado servidor  | TanStack React Query 5                          |
| Formularios      | React Hook Form + Zod                           |
| HTTP             | Axios                                           |
| Autenticación    | Keycloak JS                                     |
| Testing          | Vitest + Testing Library                        |
| Iconos           | Lucide React                                    |

## Requisitos

- **Node.js** ≥ 20
- **npm** ≥ 10

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Copiar y configurar variables de entorno
cp .env.example .env.development.local
# Editar .env.development.local con los valores reales

# Iniciar servidor de desarrollo (http://localhost:5173)
npm run dev
```

> Con `VITE_AUTH_BYPASS=true` (valor por defecto en `.env.development`) no se necesita un servidor Keycloak para desarrollar.

## Scripts disponibles

| Comando           | Descripción                                         |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo con Vite           |
| `npm run build`   | Compila TypeScript y genera el bundle de producción |
| `npm run preview` | Sirve el build de producción localmente             |
| `npm run test`    | Ejecuta los tests con Vitest                        |

## Variables de entorno

| Variable                  | Descripción                                          |
| ------------------------- | ---------------------------------------------------- |
| `VITE_API_URL`            | URL base del backend. Ej: `http://localhost:8082/api` |
| `VITE_KEYCLOAK_URL`       | URL del servidor Keycloak                            |
| `VITE_KEYCLOAK_REALM`     | Realm de Keycloak                                    |
| `VITE_KEYCLOAK_CLIENT_ID` | Client ID registrado en Keycloak                     |
| `VITE_AUTH_BYPASS`        | `true` para omitir Keycloak en desarrollo            |
| `VITE_DEV_USERNAME`       | Usuario ficticio inyectado cuando el bypass está activo |
| `VITE_DEV_ROLES`          | Roles simulados en dev (separados por coma)          |

Archivos de entorno:

| Archivo                    | En repo | Propósito                                    |
| -------------------------- | ------- | -------------------------------------------- |
| `.env.example`             | ✅      | Plantilla con todas las variables            |
| `.env.development`         | ✅      | Defaults del equipo (valores genéricos)      |
| `.env.development.local`   | ❌      | Overrides personales con valores reales      |

## Estructura del proyecto

```
src/
├── main.tsx                  # Punto de entrada de la aplicación
├── router.tsx                # Definición de rutas (React Router)
├── vite-env.d.ts             # Tipos de variables de entorno VITE_*
├── tailwind.css              # Estilos base de Tailwind CSS
├── index.css                 # Estilos globales
│
├── api/                      # Cliente HTTP (Axios + interceptores)
│   └── axiosInstance.ts
│
├── auth/                     # Autenticación e identidad del usuario
│   ├── keycloak.ts           # Cliente Keycloak + refresh proactivo
│   ├── authStore.ts          # Estado de sesión (token, usuario, roles)
│   ├── roleStore.ts          # Rol activo seleccionado (persiste en localStorage)
│   └── devAuth.ts            # Bypass de autenticación para desarrollo local
│
├── features/                 # Módulos de negocio (feature-based)
│   ├── example-domain/       # ← Referencia de implementación
│   │   ├── components/       #   Componentes del feature
│   │   ├── models/           #   Interfaces y tipos
│   │   └── services/         #   Servicios HTTP y lógica de negocio
│   ├── dashboard/
│   ├── seleccionar-rol/
│   ├── artefactos/
│   ├── biblioteca/
│   ├── entregables/
│   ├── evaluaciones/
│   ├── fichas-perfil/
│   ├── mapas-ruta/
│   ├── proyectos-grado/
│   ├── repositorio-artefactos/
│   └── solicitudes/
│
├── guards/                   # Guardias de ruta
│   ├── AuthGuard.tsx         # Inicialización de Keycloak
│   └── RoleGuard.tsx         # Control de acceso por rol
│
├── hooks/                    # Hooks personalizados globales
│   ├── useAuth.ts
│   └── useHasRole.ts
│
├── layout/                   # Shell de la aplicación
│   ├── AppLayout.tsx         # Layout principal (Header + Sidebar + contenido)
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── nav-items.ts          # Configuración de navegación
│
├── shared/                   # Código compartido entre features
│   ├── components/           # Componentes reutilizables (loaders, dialogs, etc.)
│   ├── hooks/                # Hooks reutilizables (useToast, etc.)
│   ├── models/               # Interfaces compartidas (Page<T>, ApiResponse<T>, Rol)
│   └── stores/               # Estado de UI global (toastStore)
│
└── test-utils/               # Utilidades de testing
    ├── setup.ts
    ├── render.tsx
    ├── store.utils.ts
    └── keycloak.mock.ts
```

### Convención de features

Cada feature sigue la estructura `example-domain/` como referencia:

```
features/<nombre-feature>/
├── <NombreFeature>.tsx       # Componente principal (página)
├── components/               # Componentes internos del feature
├── models/                   # Interfaces y tipos del dominio
└── services/                 # Servicios HTTP y lógica de negocio
```

## Docker

```bash
# Build con variables de entorno inyectadas como build args
docker build \
  --build-arg VITE_API_URL=https://api.ejemplo.com/api \
  --build-arg VITE_KEYCLOAK_URL=https://keycloak.ejemplo.com/ \
  --build-arg VITE_KEYCLOAK_REALM=mi-realm \
  --build-arg VITE_KEYCLOAK_CLIENT_ID=mi-client \
  -t arquisoft-frontend .

# Ejecutar
docker run -p 80:80 arquisoft-frontend
```

