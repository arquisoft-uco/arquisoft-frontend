# CLAUDE.md

Este archivo brinda guía a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Enrutamiento de skills

Cuando la solicitud del usuario coincida con un skill disponible, SIEMPRE invócalo usando la
herramienta Skill como tu PRIMERA acción. NO respondas directamente, NO uses otras herramientas primero.
El skill tiene flujos de trabajo especializados que producen mejores resultados que respuestas improvisadas.

Reglas clave de enrutamiento:
- Ideas de producto, "vale la pena construir esto", lluvia de ideas → invocar office-hours
- Bugs, errores, "por qué está fallando esto", errores 500 → invocar investigate
- Ship, deploy, push, crear PR → invocar ship
- QA, probar el sitio, encontrar bugs → invocar qa
- Code review, revisar mi diff → invocar review
- Actualizar docs después de un release → invocar document-release
- Retro semanal → invocar retro
- Design system, marca → invocar design-consultation
- Auditoría visual, pulido de diseño → invocar design-review
- Revisión de arquitectura → invocar plan-eng-review
- Guardar progreso, checkpoint, resume → invocar checkpoint
- Calidad de código, health check → invocar health

## Comandos

```bash
npm run dev        # Servidor de desarrollo en http://localhost:5173
npm run build      # Type-check + bundle de producción
npm run test       # Ejecuta todos los tests con Vitest
npm run lint       # Solo type-check de TypeScript (sin ESLint)
```

Ejecutar un solo archivo de test:
```bash
npx vitest run src/features/<feature>/components/<Component>.test.tsx
```

## Configuración del entorno

Copia `.env.example` a `.env.development.local` y completa con valores reales. Las variables clave:

| Variable | Propósito |
|---|---|
| `VITE_API_URL` | URL base del backend, ej. `http://localhost:8082/api` |
| `VITE_AUTH_BYPASS` | Ponla en `true` para saltar Keycloak en desarrollo local |
| `VITE_DEV_USERNAME` / `VITE_DEV_ROLES` | Usuario/roles falsos inyectados cuando el bypass está activo |

`.env.development.local` está en gitignore — nunca lo commitees. `.env.example` es la plantilla versionada.

## Arquitectura

### Flujo de autenticación

`AuthGuard` (ruta de layout) llama a `keycloak.init()` una sola vez al montarse. Mientras inicializa, renderiza `<AppLoader />`. Al tener éxito, llena `useAuthStore` de forma atómica e inicia el refresco proactivo del token vía `scheduleRefresh`. Cuando `VITE_AUTH_BYPASS=true`, `initDevAuth()` reemplaza este flujo con un usuario falso tomado de variables de entorno.

`useAuthStore` (Zustand, **solo en memoria**) guarda el token actual y los claims parseados. La instancia de Axios lee el token desde `useAuthStore.getState()` — sin hooks de React — para que funcione en interceptores fuera del árbol de React.

`useRoleStore` (Zustand, **persistido en localStorage** bajo la clave `arquisoft_rol_activo`) guarda el rol activo seleccionado por el usuario. `RoleGuard` lee este valor para redirigir a `/seleccionar-rol` o `/forbidden`.

### Capa HTTP

`src/api/axiosInstance.ts` es la única instancia de Axios. Ella:
- Adjunta el Bearer token vía interceptor de request.
- Ante un 401: usa un mutex de refresco compartido (`refreshPromise`) para que fallos concurrentes disparen un solo refresco de token, y luego reintenta.
- Ante un 403: navega a `/forbidden` importando el router dinámicamente (evita import circular).

### Estructura de features

La lógica de negocio se divide en módulos de features bajo `src/features/`. Cada uno sigue el mismo layout:

```
features/<name>/
├── <Name>.tsx          # Componente de página (destino de ruta)
├── components/         # Componentes internos
├── models/             # Interfaces TypeScript de este dominio
└── services/           # Llamadas Axios vía apiClient
```

`src/features/fichas-perfil/` es la implementación de referencia canónica — copia sus patrones para features nuevas.

### Tipos compartidos

`src/shared/models/api-response.ts` exporta `Page<T>`, `ApiResponse<T>` y `ApiError` — las formas estándar que devuelve el backend. Los services deben tipar sus respuestas con estas.

### Estructura del token

Los roles se leen desde `realm_access.roles` en el JWT de Keycloak (no desde `resource_access[clientId].roles`). `parseRoles()` en `authStore.ts` se encarga de esto. El bypass de desarrollo en `devAuth.ts` refleja la misma estructura vía `realm_access: { roles }` en el `tokenParsed` falso.

Los tokens se mantienen **solo en memoria** (Zustand sin `persist` + propiedad de instancia de Keycloak JS). Nada sensible se escribe jamás en `localStorage` o `sessionStorage`; solo se persiste el string del rol seleccionado (`arquisoft_rol_activo`).

### Enrutamiento

Todas las rutas se cargan de forma perezosa (lazy) en `src/router.tsx`. Las rutas de features nuevas van dentro del arreglo `children` de `AppLayout`. La instancia `router` se exporta para que el interceptor de Axios pueda llamar a `router.navigate()` fuera del árbol de React.

### Testing

Los tests usan `@testing-library/react`. Importa `render` desde `src/test-utils/render.tsx` en lugar de testing-library directamente — envuelve los componentes en `QueryClientProvider` + `MemoryRouter` automáticamente. Keycloak se mockea vía `src/test-utils/keycloak.mock.ts`.

## Convenciones

- **Nombres de rama:** `<prefix>/<id>-<descripcion_snake_case>` — ej. `feature/HU-042-registro_evaluacion`
  - Prefijos válidos: `feature/`, `fix/`, `refactor/`, `hotfix/`, `docs/`, `test/`, `chore/`, `spike/`
- **Commits:** Conventional Commits en español — `feat(fichas-perfil): descripción`
  - Nunca agregar un trailer `Co-Authored-By` (ej. `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`) ni ningún otro footer de autoría de IA.
- **Nombres:** Español para términos de negocio, inglés para sufijos técnicos (`.tsx`, `Service`, `Store`, etc.)
- **PRs:** apuntan a `develop`; requieren 1 review aprobado antes de mergear
- **Sin JSDoc:** el código debe autodocumentarse mediante el naming; no agregar bloques de documentación `/** ... */`.
