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
cp src/environments/environment.ts.example src/environments/environment.ts

# Iniciar servidor de desarrollo (http://localhost:5173)
npm run dev
```

## Scripts disponibles

| Comando           | Descripción                                    |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo con Vite      |
| `npm run build`   | Compila TypeScript y genera el bundle de producción |
| `npm run preview` | Sirve el build de producción localmente        |
| `npm run test`    | Ejecuta los tests con Vitest                   |

## Estructura del proyecto

```
src/
├── main.tsx                  # Punto de entrada de la aplicación
├── router.tsx                # Definición de rutas (React Router)
├── keycloak.ts               # Configuración del cliente Keycloak
├── tailwind.css              # Estilos base de Tailwind CSS
├── index.css                 # Estilos globales
│
├── api/                      # Cliente HTTP (Axios + interceptores)
│   └── axiosInstance.ts
│
├── dev/                      # Utilidades solo para desarrollo
│   └── devAuth.ts            # Bypass de autenticación local
│
├── environments/             # Configuración por entorno
│   ├── environment.ts
│   └── environment.production.ts
│
├── features/                 # Módulos de negocio (feature-based)
│   ├── example-domain/       # ← Referencia de implementación
│   │   ├── components/       #   Componentes del feature
│   │   ├── models/           #   Interfaces y tipos
│   │   └── services/         #   Servicios HTTP y lógica
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
├── hooks/                    # Hooks personalizados
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
│   ├── components/           # Componentes reutilizables
│   └── models/               # Interfaces compartidas (Page, ApiResponse, Rol)
│
├── stores/                   # Estado global (Zustand)
│   ├── authStore.ts
│   └── roleStore.ts
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

## Variables de entorno

| Variable            | Descripción                            |
| ------------------- | -------------------------------------- |
| `VITE_AUTH_BYPASS`  | `true` para omitir Keycloak en dev     |
| `VITE_DEV_ROLES`   | Roles simulados en dev (separados por coma) |

Las URLs de API y Keycloak se configuran en `src/environments/environment.ts`.

## Docker

```bash
# Build de producción
docker build -t arquisoft-frontend .

# Ejecutar
docker run -p 80:80 arquisoft-frontend
```
