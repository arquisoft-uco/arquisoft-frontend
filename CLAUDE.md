# CLAUDE.md

Este archivo brinda guía a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Comportamiento del asistente

- **Idioma:** español colombiano en todo momento, sin excepciones.
- **Estilo:** conciso y directo — solo lo relevante, sin relleno ni explicaciones de más.
- **`README.md`:** si un cambio afecta el stack, los comandos, la estructura o las dependencias,
  actualizarlo como parte de la misma tarea.

## Enrutamiento de agentes y skills

Cuando la solicitud coincida con una fila, invoca el agente o el skill como **primera acción**, antes
de responder y antes de tocar archivos.

### Ciclo de vida de una HU/HT — agentes (`.claude/agents/`)

En orden. Cada uno pide aprobación explícita en sus puntos de corte y deja rastro en la Trazabilidad
del plan.

| Cuando el usuario pide… | Agente | Produce |
|---|---|---|
| "planifica HU-XXX", "genera el plan de…" | `@1-planificador` | `.workspace/h-plan/PLAN-{HU\|HT}-{ID}.md`. No escribe código |
| "implementa el plan", "ya está aprobado" | `@2-implementador` | Código, capa por capa: `models → services → hooks → components` |
| "escribe los tests de…" | `@3-tester` | `*.test.ts(x)`. Nunca toca producción |
| "valida", "revisa la implementación de…" | `@4a-validator-analyze` | El reporte, como mensaje. No escribe archivos |
| "genera el reporte de…" | `@4b-validator-report` | `.workspace/validator/validator-{HU\|HT}-{ID}.md` |
| "haz el commit", "abre el PR", "entrega…" | `@4c-commit` | Commit → push → PR hacia `develop`, con dos confirmaciones |

- **No se saltan etapas.** `@2-implementador` exige plan aprobado; `@4c-commit` no entrega un
  reporte `⛔ RECHAZADO`.
- **`.workspace/` está en `.gitignore`.** Planes, reportes y cuerpos de PR se publican en
  `arquisoft-docs`, no se versionan aquí.
- **Un cambio pequeño no necesita la cadena.** Un bug de una línea o una duda puntual se resuelven
  cargando las dos skills de contexto y trabajando directo.

### Contexto del proyecto — skills propias (`.claude/skills/`)

| Skill | Cargar cuando… |
|---|---|
| `arquisoft-frontend-arquitectura` | **Siempre** antes de crear o mover algo en `src/`. Capas, enrutamiento, capa HTTP, stores, contrato con el backend |
| `arquisoft-frontend-estandares` | **Siempre junto con la anterior** al escribir código. Nomenclatura, componentes, formularios, validación, errores, a11y, estilos, TypeScript, testing, git |
| `context7-stack-frontend` | Antes de generar código que use una librería del stack — IDs ya resueltos y trampas de versión (el proyecto está en **Zod 3**) |
| `gh-docs-reader` | Al buscar una HU/HT, el contrato real de un endpoint o los valores de un catálogo |
| `arquisoft-frontend-mcps` | Al decidir qué MCP usar y cuál es su fallback |

Las dos primeras son la **fuente de verdad**: este archivo es un índice y remite a ellas. Si
discrepan, ganan las skills.

### Skills integradas de Claude Code

| Cuando el usuario pide… | Skill | Nota |
|---|---|---|
| "revisa mi diff", "code review" | `code-review` | Para una HU completa prefiere `@4a-validator-analyze`: añade los checks del proyecto |
| "simplifica", "limpia esto" | `simplify` | Solo calidad; no busca bugs |
| "revisión de seguridad" | `security-review` | Complementa el Nivel 2.10 de `@4a-validator-analyze` |
| "pruébalo en el navegador", "captura la pantalla" | `claude-in-chrome` | Requisito antes de cualquier `mcp__claude-in-chrome__*`. Levanta `npm run dev` con `VITE_AUTH_BYPASS=true` |
| "arranca el proyecto", "muéstramelo funcionando" | `run` | Verifica contra la app real, no solo contra los tests |
| "documentación de React / Query / Zod / Tailwind…" | `context7-mcp` | Usa antes `context7-stack-frontend` |

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

Resumen operativo. **El detalle y el porqué están en la skill `arquisoft-frontend-arquitectura`**;
si algo aquí discrepa, gana la skill.

```
src/features/<feature>/
├── <Feature>.tsx       # Página, destino de ruta (lazy en router.tsx)
├── components/         # Vistas por rol y componentes de la feature
├── hooks/              # use<Accion|Recurso> — React Query sobre el service
├── models/             # Solo interfaces y tipos
└── services/           # <feature>Service.ts — un objeto plano sobre apiClient
```

Dirección: `models ← services ← hooks ← components`. Un `.tsx` nunca importa `apiClient`, un hook
nunca devuelve JSX, un service nunca importa React ni React Query. `src/shared/` no importa de
`src/features/`.

`src/features/fichas-perfil/` es la **única** feature completa y el único molde válido; las otras
nueve rutas renderizan `<ComingSoon />`.

- **Capa HTTP** — `src/api/axiosInstance.ts` es la única instancia de Axios: adjunta el Bearer token,
  resuelve el 401 con un mutex de refresco compartido y reintenta, y ante un 403 navega a
  `/forbidden` importando el router de forma dinámica (evita el ciclo de imports).
- **Sesión** — `useAuthStore` vive **solo en memoria**; el interceptor lo lee con `getState()`, no con
  hooks. `useRoleStore` persiste en `localStorage` **únicamente** el string del rol activo. Los roles
  salen de `realm_access.roles`, y el rol activo es derivado: léelo con `useRolActivo()`.
- **Enrutamiento** — todas las rutas son perezosas. La restricción por rol se declara en
  `NAV_ITEMS[].roles` (`src/layout/nav-items.ts`), no a mano en `router.tsx`.
- **Tipos del backend** — `Page<T>`, `ApiResponse<T>` y `ApiError` en `src/shared/models/api-response.ts`.
  `docs/integracion-backend-frontend.md` es la fuente autoritativa de qué endpoint existe hoy.
- **Testing** — importa `render` de `src/test-utils/render.tsx` (trae `QueryClientProvider` +
  `MemoryRouter`); Keycloak se mockea con `src/test-utils/keycloak.mock.ts`.

## Convenciones

- **Nombres de rama:** `<prefix>/<id>-<descripcion_snake_case>` — ej. `feature/HU-042-registro_evaluacion`
  - Prefijos válidos: `feature/`, `fix/`, `refactor/`, `hotfix/`, `docs/`, `test/`, `chore/`, `spike/`
- **Commits:** Conventional Commits en español — `feat(fichas-perfil): descripción`
  - Nunca agregar un trailer `Co-Authored-By` (ej. `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`) ni ningún otro footer de autoría de IA.
- **Nombres:** Español para términos de negocio, inglés para sufijos técnicos (`.tsx`, `Service`, `Store`, etc.)
- **PRs:** apuntan a `develop`; requieren 1 review aprobado antes de mergear
- **Sin JSDoc:** el código debe autodocumentarse mediante el naming; no agregar bloques de documentación `/** ... */`.
