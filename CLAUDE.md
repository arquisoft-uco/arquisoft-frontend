# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

## Commands

```bash
npm run dev        # Dev server at http://localhost:5173
npm run build      # Type-check + production bundle
npm run test       # Run all tests with Vitest
npm run lint       # TypeScript type-check only (no ESLint)
```

Run a single test file:
```bash
npx vitest run src/features/<feature>/components/<Component>.test.tsx
```

## Environment setup

Copy `.env.example` to `.env.development.local` and fill in real values. The key variables:

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL, e.g. `http://localhost:8082/api` |
| `VITE_AUTH_BYPASS` | Set `true` to skip Keycloak in local dev |
| `VITE_DEV_USERNAME` / `VITE_DEV_ROLES` | Fake user/roles injected when bypass is active |

`.env.development.local` is gitignored — never commit it. `.env.example` is the committed template.

## Architecture

### Auth flow

`AuthGuard` (layout route) calls `keycloak.init()` once on mount. While initialising it renders `<AppLoader />`. On success it populates `useAuthStore` atomically and starts proactive token refresh via `scheduleRefresh`. When `VITE_AUTH_BYPASS=true`, `initDevAuth()` replaces this flow with a fake user from env vars.

`useAuthStore` (Zustand, **in-memory only**) holds the current token and parsed claims. The Axios instance reads the token from `useAuthStore.getState()` — no React hooks — so it works in interceptors outside the React tree.

`useRoleStore` (Zustand, **persisted to localStorage** under key `arquisoft_rol_activo`) stores the user's active role selection. `RoleGuard` reads this to redirect to `/seleccionar-rol` or `/forbidden`.

### HTTP layer

`src/api/axiosInstance.ts` is the single Axios instance. It:
- Attaches Bearer token via request interceptor.
- On 401: uses a shared refresh mutex (`refreshPromise`) so concurrent failures trigger only one token refresh, then retries.
- On 403: navigates to `/forbidden` by dynamically importing the router (avoids circular imports).

### Feature structure

Business logic is split into feature modules under `src/features/`. Each follows the same layout:

```
features/<name>/
├── <Name>.tsx          # Page component (route target)
├── components/         # Internal components
├── models/             # TypeScript interfaces for this domain
└── services/           # Axios calls via apiClient
```

`src/features/fichas-perfil/` is the canonical reference implementation — copy its patterns for new features.

### Shared types

`src/shared/models/api-response.ts` exports `Page<T>`, `ApiResponse<T>`, and `ApiError` — the standard shapes returned by the backend. Services should type their responses with these.

### Token structure

Roles are read from `realm_access.roles` in the Keycloak JWT (not `resource_access[clientId].roles`). `parseRoles()` in `authStore.ts` handles this. The dev bypass in `devAuth.ts` mirrors the same structure via `realm_access: { roles }` in the fake `tokenParsed`.

Tokens are kept **in-memory only** (Zustand without `persist` + Keycloak JS instance property). Nothing sensitive is ever written to `localStorage` or `sessionStorage`; only the selected role string is persisted (`arquisoft_rol_activo`).

### Routing

All routes are lazy-loaded in `src/router.tsx`. New feature routes go inside the `AppLayout` children array. The `router` instance is exported so the Axios interceptor can call `router.navigate()` outside the React tree.

### Testing

Tests use `@testing-library/react`. Import `render` from `src/test-utils/render.tsx` instead of testing-library directly — it wraps components in `QueryClientProvider` + `MemoryRouter` automatically. Keycloak is mocked via `src/test-utils/keycloak.mock.ts`.

## Conventions

- **Branch naming:** `<prefix>/<id>-<description_snake_case>` — e.g. `feature/HU-042-registro_evaluacion`
  - Valid prefixes: `feature/`, `fix/`, `refactor/`, `hotfix/`, `docs/`, `test/`, `chore/`, `spike/`
- **Commits:** Conventional Commits in Spanish — `feat(fichas-perfil): descripción`
- **Naming:** Spanish for business terms, English for technical suffixes (`.tsx`, `Service`, `Store`, etc.)
- **PRs:** target `develop`; require 1 approved review before merging
