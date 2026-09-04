# CLAUDE.md

Este archivo brinda guía a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Comportamiento del asistente

- **Idioma:** español colombiano en todo momento, sin excepciones.
- **Estilo:** conciso y directo — solo lo relevante, sin relleno ni explicaciones de más.
- **`README.md`:** si un cambio afecta el stack, los comandos, la estructura o las dependencias,
  actualizarlo como parte de la misma tarea.

## Enrutamiento de agentes y skills

Cuando la solicitud del usuario coincida con una fila de las tablas de abajo, invoca el agente o el
skill como **primera acción** — antes de responder y antes de tocar cualquier archivo. Traen el flujo
verificado contra este repositorio; improvisar produce código que contradice las convenciones.

### Ciclo de vida de una HU/HT — agentes (`.claude/agents/`)

Se ejecutan en orden. Cada uno pide aprobación explícita del usuario en sus puntos de corte y deja su
rastro en la sección de Trazabilidad del plan.

| Cuando el usuario pide… | Agente | Produce |
|---|---|---|
| "planifica HU-XXX", "genera el plan de…" | `@1-planificador` | `.workspace/h-plan/PLAN-{HU\|HT}-{ID}.md`. No escribe código |
| "implementa el plan", "ya está aprobado" | `@2-implementador` | Código, capa por capa: `models → services → hooks → components` |
| "escribe los tests de…", "genera las pruebas" | `@3-tester` | `*.test.ts(x)`. Nunca toca producción |
| "valida", "revisa la implementación de…" | `@4a-validator-analyze` | El reporte de validación, como mensaje. No escribe archivos |
| "genera el reporte de…" | `@4b-validator-report` | `.workspace/validator/validator-{HU\|HT}-{ID}.md` |
| "haz el commit", "abre el PR", "entrega…" | `@4c-commit` | Commit → push → PR hacia `develop`, con dos confirmaciones |

Reglas de la cadena:

- **No se saltan etapas.** `@2-implementador` exige un plan aprobado; `@4c-commit` no entrega un
  reporte `⛔ RECHAZADO`.
- **`.workspace/` está en `.gitignore`.** Planes, reportes y cuerpos de PR no se versionan aquí: los
  publica `@4c-commit` en `arquisoft-docs`.
- **Un cambio pequeño no necesita la cadena.** Un bug de una línea, un ajuste de copy o una duda
  puntual se resuelven cargando las dos skills de contexto (abajo) y trabajando directo. La cadena es
  para una HU/HT con criterios de aceptación.

### Contexto del proyecto — skills propias (`.claude/skills/`)

| Skill | Cargar cuando… |
|---|---|
| `arquisoft-frontend-arquitectura` | **Siempre** antes de crear o mover un archivo bajo `src/`. Capas de una feature, enrutamiento, capa HTTP, stores, contrato con el backend |
| `arquisoft-frontend-estandares` | **Siempre junto con la anterior** al escribir código. Nomenclatura, formularios, validación, errores de API, accesibilidad, design tokens, testing, git |
| `context7-stack-frontend` | Antes de generar código que use una librería del stack — trae los IDs de Context7 ya resueltos y las trampas de versión (el proyecto está en **Zod 3**, no 4) |
| `gh-docs-reader` | Al buscar una HU/HT, el contrato real de un endpoint o los valores de un catálogo. Prioriza `docs/` local y `../arquisoft-backend` sobre GitHub |
| `arquisoft-frontend-mcps` | Al decidir qué MCP usar (Context7, Claude in Chrome, GitHub, IDEA) y cuál es el fallback si no está cargado |

Las dos primeras son la **fuente de verdad**: este archivo es un índice operativo y remite a ellas.
Si discrepan con `CLAUDE.md`, ganan las skills.

### Skills integradas de Claude Code

| Cuando el usuario pide… | Skill | Nota |
|---|---|---|
| "revisa mi diff", "code review" | `code-review` | Para una HU completa prefiere `@4a-validator-analyze`: aplica además los checks de este proyecto |
| "simplifica", "limpia esto" | `simplify` | Solo calidad; no busca bugs |
| "revisión de seguridad" | `security-review` | Complementa el Nivel 2.10 de `@4a-validator-analyze` |
| "abre la app", "pruébalo en el navegador", "captura la pantalla" | `claude-in-chrome` | Invocarla es requisito antes de cualquier `mcp__claude-in-chrome__*`. Levanta `npm run dev` con `VITE_AUTH_BYPASS=true` |
| "arranca el proyecto", "muéstramelo funcionando" | `run` | Verifica un cambio contra la app real, no solo contra los tests |
| "documentación de React / Query / Zod / Tailwind…" | `context7-mcp` | Usa primero `context7-stack-frontend`: ya trae los IDs resueltos |

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
├── hooks/              # use<Accion|Recurso> — React Query sobre el service
├── models/             # Interfaces TypeScript de este dominio
└── services/           # Llamadas Axios vía apiClient
```

La dirección de dependencias es `models ← services ← hooks ← components`: un `.tsx` nunca importa
`apiClient`, un hook nunca devuelve JSX, un service nunca importa React ni React Query.

`src/features/fichas-perfil/` es la implementación de referencia canónica — es la **única** feature
completa, y las otras nueve rutas renderizan `<ComingSoon />` con sus carpetas vacías. Copia sus
patrones para features nuevas; el detalle está en la skill `arquisoft-frontend-arquitectura`.

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
