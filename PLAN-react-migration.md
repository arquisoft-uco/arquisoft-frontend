<!-- /autoplan restore point: /Users/brayan/.gstack/projects/arquisoft-uco-arquisoft-frontend/feat-tailwind-migration-autoplan-restore-20260404-110121.md -->
# Plan: Migración de Angular a React

**Proyecto:** arquisoft-frontend  
**Rama actual:** feat/tailwind-migration  
**Rama objetivo:** feat/react-migration  
**Fecha:** 2026-04-04  
**Autor:** Brayan

---

## Resumen

Migrar la aplicación Angular 21 actual (`arquisoft-frontend`) a React (con Vite + TypeScript + React Router + TanStack Query), manteniendo:
- Autenticación con Keycloak
- Las mismas rutas y funcionalidades de los 10+ features
- El diseño Tailwind CSS v4 ya implementado
- CI/CD con GitHub Actions
- Estructura de proyecto escalable y mantenible

---

## Contexto

La aplicación actual es un frontend universitario para gestión académica (proyectos de grado,
entregas, evaluaciones, artefactos, mapas de ruta, etc.). Fue construida en Angular 21 con:
- Standalone components (sin NgModules)
- Angular Signals para estado reactivo
- Keycloak para autenticación/autorización
- Tailwind CSS v4 con design tokens
- Rutas lazy-loaded por feature
- 10 features: dashboard, fichas-perfil, proyectos-grado, evaluaciones, artefactos,
  biblioteca, entregables, mapas-ruta, repositorio-artefactos, solicitudes
- Un layout compartido: shell (con header + sidebar)
- Guards de autenticación y roles

---

## Stack objetivo (React)

| Concern | Angular (actual) | React (objetivo) |
|---------|-----------------|-----------------|
| Framework | Angular 21 | React 19 + Vite |
| Routing | Angular Router | React Router v7 |
| Estado global | Angular Signals | Zustand |
| Estado servidor | RxJS Observables | TanStack Query v5 |
| Formularios | Reactive Forms | React Hook Form + Zod |
| Auth | Keycloak JS (manual init) | keycloak-js + Context |
| Iconos | lucide-angular | lucide-react |
| Estilos | Tailwind CSS v4 | Tailwind CSS v4 (mantener) |
| HTTP | Servicio angular HttpClient | Axios + interceptors |
| Testing | Vitest (ya configurado) | Vitest + React Testing Library |
| Build | Angular CLI | Vite |

---

## Sub-tareas

### 1. Setup inicial (nueva rama + scaffolding)
- Crear rama `feat/react-migration` desde `main`
- Eliminar proyecto Angular (preservar utilidades: Tailwind config, Dockerfile, nginx.conf)
- Inicializar proyecto Vite + React 19 + TypeScript en el mismo directorio raíz
- Configurar Tailwind CSS v4 (copiar `tailwind.css` y tokens existentes)
- Configurar ESLint, Prettier (copiar `.prettierrc`)
- Configurar Vitest para pruebas

### 2. Auth: Keycloak
- Implementar `KeycloakContext` (React Context) equivalente al `KeycloakService` Angular
- `useKeycloak()` hook con: `authenticated`, `token`, `roles`, `username`
- `AuthGuard` component wrapper para rutas protegidas
- `RoleGuard` component wrapper para rutas por rol
- Auth interceptor en Axios (Bearer token)

### 3. Routing + Layout Shell
- Configurar React Router v7 con lazy loading por feature
- `AppLayout` component = ShellComponent actual (sidebar + header + outlet)
- `Header` component con avatar de usuario y menú
- `Sidebar` component con items de navegación y badge de roles
- `SeleccionarRol` page (equivalente al componente actual)

### 4. HTTP / API Service
- `apiClient` (Axios instance) con interceptors de auth y error handling
- Equivale al `ApiService + auth.interceptor + error.interceptor` actuales

### 5. Features (migración 1:1)
Cada feature tiene: routes, componente principal, service. Migrar en orden:
1. Dashboard
2. Fichas Perfil
3. Proyectos de Grado
4. Evaluaciones
5. Artefactos
6. Biblioteca
7. Mapas de Ruta
8. Repositorio Artefactos
9. Entregables
10. Solicitudes
11. Example Domain (referencia/template para features futuros)

### 6. Shared components
- Migrar componentes de `src/app/shared/components/` a React
- Migrar directivas a hooks personalizados

### 7. Estado global (Zustand)
- Store para auth state (equivale a signals de KeycloakService)
- Store para rol activo (equivale a `RolActivoService`)

### 8. Testing
- Configurar Vitest + React Testing Library
- Tests unitarios para hooks de auth, guards
- Tests de integración para rutas principales

### 9. CI/CD + Docker
- Actualizar `Dockerfile` para build Vite (output en `dist/`)
- Actualizar `nginx.conf` si es necesario
- Actualizar GitHub Actions workflows

### 10. Limpieza y documentación
- Actualizar README.md
- Eliminar archivos Angular residuales

---

## No en scope

- SSR / Server-Side Rendering
- Internacionalización (i18n)
- Migración de Angular Material (ya fue removido en rama actual)
- Storybook
- E2E testing (Playwright/Cypress)

---

## Criterios de aceptación

- [ ] La app compila y corre con `npm run dev`
- [ ] Login/logout con Keycloak funciona
- [ ] Guard de autenticación redirige a login si no autenticado
- [ ] Guard de rol muestra 403 si rol insuficiente
- [ ] Todas las rutas de features cargan correctamente
- [ ] Sidebar muestra los items de nav según el rol activo
- [ ] Diseño visual es equivalente al estado actual (Tailwind v4)
- [ ] Tests pasan (`npm test`)
- [ ] Docker build funciona
- [ ] CI pasa en GitHub Actions

---

---

## PHASE 1: CEO REVIEW (SELECTIVE EXPANSION)

### PRE-REVIEW SYSTEM AUDIT FINDINGS

- 155 files changed from `main` (+18,272 lines) — the Tailwind migration work is substantial
- No TODOs/FIXMEs in TS source files
- No stashed work, no TODOS.md
- Previous commit history shows: React originally planned → Angular chosen → now React again
- No design doc in gstack artifacts

---

### 0A. Premise Challenge

**Premise 1 (assumed, not stated):** The team builds features faster in React than Angular.
Status: **UNPROVEN**. The plan never establishes why Angular is blocking them. This is the load-bearing premise of the entire migration. If it's wrong, the team spends 2-3 weeks migrating skeleton → skeleton with zero user value.

**Premise 2 (stated implicitly):** The migration will start fresh in a new branch from `main`.
Status: **CORRECT ASSUMPTION**. But the plan doesn't clarify whether Tailwind migration work (`feat/tailwind-migration`) should be merged to main first.

**Premise 3 (assumed):** React over Vue/Svelte/Solid is the obvious choice.
Status: **LIKELY VALID** for an academic team — React has the deepest ecosystem and widest documentation. But the plan doesn't justify it.

**Premise 4 (assumed):** The whole team agreed on this migration.
Status: **UNVERIFIED**. Plan is authored by "Brayan" with no evidence of team review.

**Critical missing piece:** There is no problem statement. "I want to migrate to React" is a solution. The problem must be stated: "We are migrating because [X] and not staying on Angular because [Y]."

---

### 0B. Existing Code Leverage Map

| Sub-problem | Existing code/asset | Reusable? |
|---|---|---|
| Styles / design system | `src/tailwind.css` + design tokens | YES — copy verbatim |
| Auth / Keycloak | `keycloak.service.ts`, `auth.guard.ts`, `role.guard.ts` | LOGIC reusable, not code |
| HTTP interceptors | `auth.interceptor.ts`, `error.interceptor.ts` | PATTERN reusable in Axios |
| Layout structure | `shell.ts`, `header.ts`, `sidebar.ts` | STRUCTURE reusable, rewrite in React |
| Route definitions | `app.routes.ts` (nav metadata pattern) | PATTERN reusable — nav items array with icons |
| Feature skeletons | All 10 features are scaffolding only | LOW reuse (just page shells) |
| Docker + nginx | `Dockerfile`, `nginx.conf` | HIGH — change only build output path |
| CI/CD | `.github/workflows/` | HIGH — change build command only |

**Nothing is being lost that was real and working.** The app is skeleton. This is the migration's biggest advantage and its biggest strategic question.

---

### 0C. Dream State Mapping

```
CURRENT STATE                       THIS PLAN                       12-MONTH IDEAL
────────────────────────────────    ──────────────────────────────  ─────────────────────────────────
Angular 21 SPA with:                React 19 SPA with:              Same React app with:
- 10 feature skeletons              - Same 10 routes/features        - All 10 features IMPLEMENTED
- Keycloak auth (working)           - Keycloak in React Context       - Real API integrations
- Tailwind v4 UI (complete)         - Tailwind v4 preserved           - Role-based dashboards
- Signals for state                 - Zustand for global state         - Test coverage >70%
- Angular Router (lazy)             - React Router v7 (lazy)          - E2E tests passing
- lucide-angular icons              - lucide-react icons               - Storybook component library
                                    - TanStack Query for data           - CI/CD + Docker in production
                                    - React Hook Form + Zod
```

The plan moves TOWARD the 12-month ideal. This is a bet that React velocity > Angular velocity for this team for the remaining 10-month development cycle.

---

### 0C-bis. Implementation Alternatives

```
APPROACH A: Full React Migration (plan as written)
  Summary: Nuke Angular, scaffold React 19 + Vite on a new branch from main.
           Preserve Tailwind tokens and infra. Rebuild all 10 features in React.
  Effort:  L (Human: 3-4 weeks | CC+gstack: ~2-3 days)
  Risk:    Medium — Keycloak in React StrictMode is the main technical risk
  Pros:    - Clean slate, no Angular debt
           - Full React conventions from day one
           - All future features use React patterns natively
  Cons:    - Discards the Tailwind migration work (partially)
           - Blocking future features for 2-3 days of CC time
  Reuses:  tailwind.css, Dockerfile, nginx.conf, env structure, lib patterns

APPROACH B: Feature-by-feature micro-migration (Angular shell + React islands)
  Summary: Keep Angular app running, insert React components via Angular Elements
           (web components). Migrate features one by one.
  Effort:  XL (Human: 2-3 months | CC+gstack: ~1 week)
  Risk:    High — Angular Elements + React is non-standard, complex build
  Pros:    - No big-bang migration day
           - Features can be validated independently
  Cons:    - Two framework maintenance burden
           - Complex Tailwind scope (both frameworks need it)
           - Overkill for a skeleton app with no live users
  Reuses:  Everything current

APPROACH C: Stay Angular, adopt React-like patterns (signals-only, no migration)
  Summary: No migration. Use Angular 21's resource() API, signals, and inject()
           to make Angular feel more React-like. Reduce RxJS usage.
  Effort:  S (Human: 1 week | CC+gstack: ~2 hours)
  Risk:    Low
  Pros:    - Zero migration cost
           - Keeps Tailwind migration work
           - Angular 21 signals are functionally equivalent to React state
  Cons:    - Doesn't satisfy the team's stated preference for React
           - Accumulates "learning Angular against their will"
  Reuses:  Everything
```

**RECOMMENDATION (auto-decided, P5 + P3):** APPROACH A. The app is skeleton — this is the window. Approach B is overengineered. Approach C doesn't satisfy the stated goal. Auto-decision: APPROACH A selected.

---

### 0D. SELECTIVE EXPANSION: Cherry-pick Candidates

*(Auto-decided per 6 principles — surfaced at Final Gate as taste decisions)*

| # | Candidate | Effort | Auto-decision | Principle |
|---|---|---|---|---|
| 1 | TanStack Router instead of React Router v7 | S | TASTE DECISION | Both valid: TanStack has better type safety, React Router has more ecosystem |
| 2 | shadcn/ui component library | S | DEFERRED | P4-DRY: Tailwind primitives already provide this; adds lock-in |
| 3 | E2E tests with Playwright | M | DEFERRED → TODOS.md | P2: in blast radius but plan explicitly scoped out; defer is right |
| 4 | Storybook | M | DEFERRED → TODOS.md | P3: pragmatic — nice to have, not blocking |
| 5 | React 19 Server Components | L | REJECTED | P5: explicit over clever; SPA with Keycloak doesn't need SSR |

---

### 0E. Temporal Interrogation

```
HOUR 1 (foundations / Vite setup):
  - Which entry branch? main or feat/tailwind-migration?
  - Does tsconfig.json from Angular carry forward or start fresh?
  - How to handle environment.ts → Vite's import.meta.env pattern?

HOUR 2-3 (Keycloak auth):
  - Keycloak init in React StrictMode runs twice in dev → useRef guard needed
  - Should auth be Context API or Zustand? Plan says Zustand, but auth context
    is a common React pattern. Needs a decision BEFORE writing a single component.
  - Token refresh background timer: setInterval cleanup on unmount (useEffect)

HOUR 4-5 (routing + layout shell):
  - NavItemData pattern from Angular routes (icon, label, order) needs a React
    equivalent. Same shape works fine in React Router data objects.
  - Sidebar icon rendering: lucide-react exposes components, not data objects.
    The current Angular pattern (passing LucideIconData) needs to change.

HOUR 6+ (features):
  - 10 features × ~30 min each (CC+gstack) = ~5 hours for skeleton parity
  - RolActivoService (selected role management) needs a Zustand store equivalent
  - The seleccionar-rol page logic is the most complex — user picks active role
    from JWT claims, stored in session, used by sidebar and guards
```

---

### 0F. Mode: SELECTIVE EXPANSION confirmed

Migration scope is the baseline (non-negotiable). Cherry-pick decisions surfaced at gate.

---

### CLAUDE SUBAGENT — CEO Strategic independence

**Key findings from independent CEO review:**

1. **CRITICAL: No problem statement** — The plan jumps to solution without stating why Angular is failing the team. Must add: "We migrate because X. Evidence: Y. We ruled out staying on Angular because Z."

2. **CRITICAL: Migrating skeleton → skeleton has no productivity proof** — If the team doesn't build faster in React, this was 2-3 weeks of zero user value. Define the productivity hypothesis explicitly.

3. **HIGH: Third framework decision with no "why final" explanation** — React → Angular → React reads as framework anxiety, not conviction. Must address.

4. **HIGH: Incoherent timing** — The Tailwind migration was just completed. Starting a React migration immediately abandons that Angular-specific integration work. Sunk cost must be acknowledged explicitly.

5. **HIGH: Pending design decisions are pre-flight blockers** — "Zustand vs Context for auth?" must be resolved before writing sub-task 2 (auth). Otherwise guaranteed rework.

6. **MEDIUM: Angular 21 closes most stated gaps** — `resource()` ≈ TanStack Query. Signals ≈ Zustand. The gap between Angular 21 and the proposed React stack is narrower than any prior Angular version.

7. **MEDIUM: No team alignment evidence** — Solo-authored plan for a team project. All developers must confirm they prefer React before work begins.

8. **MEDIUM: One framework → six independent libraries** — Angular gives routing, HTTP, forms, state, DI, and build as a coherent unit. The React stack requires separately integrating six libraries. For a team new to this combination, that's 6x "how do we do X" surface area.

---

### CEO DUAL VOICES — CONSENSUS TABLE (subagent-only)
```
CEO DUAL VOICES — CONSENSUS TABLE:
══════════════════════════════════════════════════════════════════
  Dimension                               Claude   Codex  Consensus
  ────────────────────────────────────── ────────  ─────  ──────────
  1. Premises valid?                      NO        N/A   [subagent-only]
  2. Right problem to solve?              MAYBE     N/A   [subagent-only]
  3. Scope calibration correct?           YES       N/A   [subagent-only]
  4. Alternatives sufficiently explored?  NO        N/A   [subagent-only]
  5. Competitive/market risks covered?    N/A       N/A   [subagent-only]
  6. 6-month trajectory sound?            RISKY     N/A   [subagent-only]
══════════════════════════════════════════════════════════════════
Single model only (codex unavailable). All findings tagged [subagent-only].
```

---

### Error & Rescue Registry (Section 2)

| Method/Codepath | What can go wrong | Exception |
|---|---|---|
| Keycloak init (useEffect) | StrictMode double-mount fires init twice | State corruption |
| Keycloak init | Network unreachable | Network error → blank app |
| Token refresh interval | Token expired before refresh fires | 401 waterfall on all requests |
| Axios auth interceptor | Token signal/state read while stale | Stale token sent, 401 |
| Route guards | Auth state not hydrated yet on hard reload | Flash of unprotected route |
| React.lazy() imports | Bundle chunk 404 (deploy mismatch) | ErrorBoundary catches → 500-like screen |
| keycloak.init() 2nd call | Called if React StrictMode unmounts/remounts | Duplicate session |

**Unrescued gaps:**
- `→ GAP: Keycloak double-init` if not guarded with `useRef` — plan must specify this pattern
- `→ GAP: Route auth flash` — plan needs a loading state before showing protected content

---

### Failure Modes Registry (CEO)

| Failure | Probability | Impact | Mitigated? |
|---|---|---|---|
| Team doesn't align on React decision | Medium | High — abandoned branch | NO — not in plan |
| Keycloak StrictMode double-init | High | High — auth broken in dev | YES — risk table mentions it |
| Tailwind v4 PostCSS config breaks in Vite | Low | Medium | YES — risk table mentions it |
| Feature parity never reached (deadline) | Medium | High | NO — no deadline in plan |
| React Router v7 vs TanStack Router debate mid-migration | Medium | Medium | NO — deferred in plan |

---

### What already exists (reuse map)

- `src/tailwind.css` — copy verbatim to new project
- `Dockerfile` — only build output path changes (`dist/` is already Vite's default)
- `nginx.conf` — no changes needed
- `.github/workflows/` — only build command changes
- `.prettierrc` — copy verbatim
- `.editorconfig` — copy verbatim
- `src/environments/` — rename keys to `VITE_*` prefix
- Keycloak service logic — translate signal API to React state (1:1 mapping conceptually)

---

### "NOT in scope" (auto-deferred decisions)

| Item | Reason |
|---|---|
| SSR / React Server Components | Overkill for Keycloak SPA |
| shadcn/ui | Tailwind primitives sufficient |
| Storybook | Post-foundation work |
| E2E tests (Playwright) | Plan explicitly scoped out; add to TODOS.md |
| i18n | App is Spanish-only, no requirement stated |
| Migration of `feat/tailwind-migration` Angular commits | Discarded intentionally |

---

### Dream state delta

This plan leaves the project at: **React skeleton parity** — same features, same auth, same UI, different framework.

The 12-month ideal requires building ALL 10 features with real API integrations. This plan is step 1 of N. Without delivering real features, the migration has no observable user value.

---

### CEO Completion Summary

| Dimension | Finding | Severity |
|---|---|---|
| Problem statement | MISSING — plan has no "why Angular is failing us" | CRITICAL |
| Productivity proof | MISSING — no evidence React makes this team faster | CRITICAL |
| Framework history | Third decision, no "why final" explanation | HIGH |
| Timing | Tailwind migration just finished — acknowledge sunk cost | HIGH |
| Pre-flight decisions | auth: Zustand vs Context, folder structure unresolved | HIGH |
| Team alignment | No evidence all team members agreed | MEDIUM |
| Stack cohesion | Angular (1 framework) → React (6 libraries) — manageable risk | MEDIUM |
| Approach | APPROACH A selected: full migration from skeleton | RESOLVED |
| Mode | SELECTIVE EXPANSION: migration baseline + cherry-picks at gate | RESOLVED |

**CEO Verdict:** The TECHNICAL plan is sound. The STRATEGIC foundation has 2 critical gaps (problem statement + productivity proof). Both must be addressed before premise gate is passed.

---

## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|---|---|---|---|---|---|
| 1 | CEO | Mode: SELECTIVE EXPANSION | Mechanical | P3 (pragmatic) | Migration + cherry-pick slots | EXPANSION, REDUCTION |
| 2 | CEO | Approach A: Full migration | Mechanical | P5 (explicit) | Skip B (overengineered) and C (doesn't meet goal) | Approach B, C |
| 3 | CEO | shadcn/ui → deferred | Mechanical | P4 (DRY) | Tailwind primitives sufficient | In-scope |
| 4 | CEO | E2E → TODOS.md | Mechanical | P3 (pragmatic) | Plan explicitly scoped out; right call | In-scope |
| 5 | CEO | SSR → rejected | Mechanical | P5 (explicit) | Keycloak SPA doesn't need SSR | In-scope |
| 6 | CEO | TanStack Router vs React Router | Taste | both valid | TanStack=type-safety, ReactRouter=ecosystem | — |

---

## PHASE 2: DESIGN REVIEW

### Step 0: Design Scope Assessment

**Initial Design Rating: 3/10**

The plan is a complete technical migration spec and a near-total blank check for UI. Every design decision is deferred, unstated, or replaced with "equivalent to current state" — which is itself an empty skeleton. A 10 would specify loading states, empty states, component dimensions, role bypass logic, and the user's emotional journey from login to first action.

**DESIGN.md:** Not found. Proceeding with universal design principles + existing `tailwind.css` design tokens as reference.

**Existing design leverage:**
- `src/tailwind.css` — design tokens (colors, typography, spacing) preserved in migration
- `src/app/core/layout/shell/shell.html` — layout structure (sidebar + header + outlet)
- `src/app/features/seleccionar-rol/` — role selection card UI
- All Lucide icons already in use → kept via `lucide-react`

---

### CLAUDE SUBAGENT — Design independent review

Key findings from independent design subagent:

**CRITICAL: No information hierarchy for any screen** — The plan describes component names but never answers "what does the user see first?" For `SeleccionarRol` (the first impression screen), it says only "card-based" with zero spec.

**CRITICAL: Auth loading state (Keycloak init) unspecified** — Nothing says what the user sees during the ~300-800ms Keycloak init. Default: blank white screen. This ships to users if not fixed.

**CRITICAL: Empty/error states for all 10 feature pages undefined** — "Migrar en orden" means migrating placeholders. Empty state for data tables, error fallback for API failures — none specified.

**HIGH: All UI descriptions are generic category nouns** — "Header con avatar" vs "Avatar (32px, initials fallback), clicking opens Profile / Change Role / Logout dropdown."

**HIGH: Sidebar collapsed state behavior undefined** — icon-only at 64px? Mobile drawer? Overlay? The hamburger toggle in the header implies collapsible behavior but nothing is specified.

**HIGH: Single-role user bypass undefined** — If user has 1 role, does `SeleccionarRol` render? If not, where does the user land after auth?

**HIGH: Post-role-selection transition undefined** — User picks a role. Then what? Any animation? Confirmation? Direct to dashboard?

---

### Design Litmus Scorecard (7 Dimensions)

| Dimension | Score | Gap | Auto-decision |
|---|---|---|---|
| 1. Information Hierarchy | 2/10 | No per-screen visual priority order | ADD: loading+empty+error states spec |
| 2. Missing States | 1/10 | Auth loading, empty data, error all unspecified | ADD: Keycloak loader + empty/error patterns |
| 3. User Journey | 3/10 | Login-to-first-action flow missing emotional arc | ADD: 5-step user journey with UX notes |
| 4. Specificity | 3/10 | Generic nouns ("header", "sidebar", "card") | ADD: min viable dimensions + behavior spec |
| 5. Responsive | 2/10 | No breakpoints, no mobile sidebar behavior | ADD: mobile-first notes + breakpoints |
| 6. Accessibility | 4/10 | Keycloak/auth flow has WCAG implications | ADD: focus trap in header dropdown |
| 7. Interaction States | 2/10 | No hover, active, disabled, loading per component | ADD: standard interaction pattern reference |

**DESIGN CONSENSUS TABLE (subagent-only):**
```
DESIGN DUAL VOICES — CONSENSUS TABLE:
═══════════════════════════════════════════════════════════════
  Dimension                           Claude  Codex  Consensus
  ──────────────────────────────────── ─────── ─────── ─────────
  1. Information hierarchy specified?  NO      N/A    [subagent-only]
  2. All UI states covered?            NO      N/A    [subagent-only]
  3. User journey documented?          NO      N/A    [subagent-only]
  4. Design specificity adequate?      NO      N/A    [subagent-only]
  5. Responsive behavior specified?    NO      N/A    [subagent-only]
  6. Accessibility addressed?          PARTIAL N/A    [subagent-only]
  7. Interactions specified?           NO      N/A    [subagent-only]
═══════════════════════════════════════════════════════════════
Codex unavailable. All findings [subagent-only].
```

---

### Pass 1: Information Hierarchy (auto-fixed)

**Auto-decision (P5 — explicit):** Add minimum hierarchy specs to the plan. These resolve structural ambiguity, not taste.

**Added to plan — information hierarchy:**
- Shell: Sidebar (left, fixed) → Header (top, sticky) → Main content (scrollable outlet)
- Header reading order (LTR): [Hamburger] [App Logo/Name] [spacer] [Active Role Chip] [User Avatar]
- Sidebar nav items: ordered by `order` field (matches current Angular pattern), active item highlighted with left border accent
- `SeleccionarRol`: Title + subtitle centered above grid → Role cards grid (3-col desktop, 1-col mobile) → each card: [role icon] [role name bold] [role description muted] [CTA button]
- Dashboard: role-aware content slots above the fold, even if placeholder [*Taste: specific widget order per role is deferred to feature implementation*]

---

### Pass 2: Missing UI States (auto-fixed)

**Auto-decision (P1 — completeness):** All critical states must be specified.

**Added to plan — UI state specifications:**

| State | Where | What user sees |
|---|---|---|
| Keycloak initializing | Entire app | Full-page branded loader (app logo + spinner) — min 200ms display |
| Keycloak unreachable | Entire app | Full-page error: "No se pudo conectar al servidor de autenticación. [Reintentar]" |
| Auth hydration (hard reload) | Protected routes | Same branded loader as above — blocks render until `authenticated === true` |
| Single role user | Auth callback | Skip `SeleccionarRol`, auto-select role, redirect to `/dashboard` |
| Multi-role, no selection | App shell | Redirect to `/seleccionar-rol` — header + sidebar hidden until role chosen |
| Role selected | `SeleccionarRol` | Short transition animation → navigate to `/dashboard` |
| Feature page loading | All 10 features | Skeleton rows (3-5 rows of gray rectangles matching expected content) |
| Feature page empty | All 10 features | Standard empty state: domain icon + "No hay [entidades] aún" + optional CTA |
| Feature page error | All 10 features | Error card: "Error al cargar datos. [Intentar de nuevo]" |
| 403 unauthorized | Guards | Dedicated 403 page: role icon + "No tienes permiso para esta sección" + "Cambiar rol" button |
| Sidebar collapsed | Shell | Icon-only view (64px width), tooltips on hover — mobile: slide-over overlay |

---

### Pass 3: User Journey (auto-fixed)

**Added to plan — 5-step login journey:**

```
1. NAVIGATE → branded loading screen (Keycloak init, ~500ms)
2. AUTH → redirected to Keycloak login (external, out of scope)
3. RETURN → branded loading screen again (token processing, ~200ms)
4. ORIENTATION →
   - 1 role: auto-selected → land on Dashboard
   - N roles: SeleccionarRol page — card grid, must click to proceed
5. FIRST ACTION → Dashboard with role-appropriate content slots
```

**Role confirmation:** After role selected, the active role chip in the Header (top-right area) shows the selected role. No separate confirmation toast needed.

---

### Pass 4: Specificity (auto-fixed — minimum viable specs only)

**Auto-decision (P3 — pragmatic):** Add minimum specs that prevent 50 micro-decisions at implementation time. Hyper-specific pixel values are TASTE — deferred to design system iteration.

**Added to plan — minimum component specs:**
- `AppLayout`: CSS Grid layout (`grid-cols-[auto_1fr]`, sidebar + main columns)
- `Header`: `h-16` (64px), sticky top, `z-50`, flex row
- `Sidebar expanded`: `w-60` (240px), `h-screen`, sticky top-0, overflow-y-auto
- `Sidebar collapsed`: `w-16` (64px), icon-only, tooltips on each item
- `SidebarItem`: `h-10` (40px) touch target, icon `w-5 h-5`, label `text-sm`
- `RolChip` in header: active role name in a `badge`-style element — text only (no count, no nav item badges)
- `SeleccionarRol` cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, each card has icon + bold role name + muted description + contained CTA button
- `EmptyState` shared component: icon prop + title prop + optional action button — used across all features
- `ErrorState` shared component: icon + message + retry callback — used across all features

---

### Pass 5: Responsive (auto-fixed)

**Added to plan — responsive behavior:**
- Mobile breakpoint (`< 768px`): sidebar is a slide-over overlay (fixed, z-50), triggered by hamburger
- Desktop (`>= 768px`): sidebar is persistent, collapsible to icon-only
- All feature pages: mobile-first, Tailwind `sm:` / `md:` / `lg:` breakpoints
- `SeleccionarRol`: 1-column mobile, 2-column tablet, 3-column desktop

---

### Pass 6: Accessibility (auto-fixed for structural, deferred for audit)

**Auto-fixed:**
- Header dropdowns (role menu + user menu): must trap focus when open, close on Escape, ARIA `role="menu"` + `aria-expanded`
- Sidebar nav items: `aria-current="page"` on active item
- Protected route loading state: `aria-live="polite"` region for screen reader announcements
- `SeleccionarRol` role cards: `role="radio"` within `role="radiogroup"`, keyboard navigable

**Deferred:** Full WCAG AA audit → post-migration with `/qa` run.

---

### Pass 7: Interaction States (auto-fixed — reference pattern only)

**Added to plan — interaction state reference:**
All interactive elements must implement: default, hover, focus-visible, active, disabled states using Tailwind utility classes. The existing `tailwind.css` tokens provide the palette. No new colors introduced.

---

### Taste Decisions from Design Phase

| # | Decision | Option A | Option B |
|---|---|---|---|
| D1 | Dashboard widget order per role | Generic slots (implement per feature) | Role-specific layout from day one |
| D2 | Sidebar collapse animation | CSS transition (instant, simple) | Spring animation (polished) |
| D3 | 403 page design | Simple text + button | Illustrated error page |

---

### Design Completion Summary

Added to plan:
- Keycloak init loading state (full-page branded loader)
- Single-role auto-bypass on auth callback
- Skeleton/empty/error states for all 10 features
- Minimum dimension specs for Shell, Header, Sidebar, SeleccionarRol
- Responsive sidebar behavior (overlay on mobile)
- Accessibility ARIA requirements for dropdowns and nav
- Role confirmation pattern (chip in header, no extra toast)

**Phase 2 complete.** Codex N/A (unavailable). Claude subagent: 16 findings (11 auto-fixed, 3 taste decisions surfaced). Consensus: [subagent-only]. Passing to Phase 3.

---

## Phase 3: Engineering Review

### Step 0 — Scope Challenge

**Files in plan scope:** 10 features × ~3 files + auth (4) + layout (3) + API layer (2) + tests + CI/CD = ~50 new files.  
**Angular source files changed from main:** 155 (per git diff on `feat/tailwind-migration`).  
**Complexity verdict:** HIGH — auth migration has 3 critical edge cases (Keycloak init, token refresh, hydration flash). Scope is justified, not over-engineered.

**Completeness gaps found:**
- Sub-task 2: "Zustand vs Context API for auth?" left unresolved → **RESOLVED** by A1 finding: Zustand mandatory
- Sub-task 4: error interceptor behaviors not documented → gap (HC3)
- Sub-task 3: no `isInitializing` state spec → gap (E3)
- Sub-task 5: no LucideIconData → lucide-react migration note → gap (A2)
- No checklist item for Keycloak redirect URI update → gap (S4)
- Sub-task 8: no mock strategy, no timer approach → gaps (T1, T4)

**Existing code leverage map:**

| Asset | Reuse | Work |
|-------|-------|------|
| `src/tailwind.css` | ✅ Copy verbatim | None |
| `Dockerfile` | ✅ | Change dist path: `dist/angular-app` → `dist` |
| `nginx.conf` | ✅ | None |
| GitHub Actions workflows | ⚠️ Partial | Change build output path |
| `environment.ts` pattern | ⚠️ Transform | `import.meta.env.VITE_*` prefix |
| `rol.model.ts` role definitions | ⚠️ Partial | Replace `LucideIconData` with `React.ComponentType` |
| `app.routes.ts` NavItemData | ⚠️ Partial | Same icon type change throughout |

---

### Section 1 — Architecture

#### 1.1 Dependency Graph

```
main.tsx
└── <RouterProvider router={router} />
    └── router (createBrowserRouter — exported from router.ts)
        └── AuthProvider
            └── AppLayout (authGuard → isInitializing check first)
                ├── Header
                │   ├── useAuthStore (Zustand — in-memory, no persist)
                │   └── useRoleStore (Zustand — persist: arquisoft_rol_activo)
                ├── Sidebar (hidden when rolActivo === null)
                └── <Outlet /> — React.lazy() features
                    ├── Dashboard (lazy)
                    ├── FichasPerfil (lazy)
                    ├── ProyectosGrado (lazy)
                    ├── Evaluaciones (lazy)
                    ├── Artefactos (lazy)
                    ├── Biblioteca (lazy)
                    ├── MapasRuta (lazy)
                    ├── RepositorioArtefactos (lazy)
                    ├── Entregables (lazy)
                    └── Solicitudes (lazy)

keycloak.ts (module-level singleton — ONE instance, never in hooks/components)
└── keycloak.init() → useAuthStore.setState({ isInitializing: false, authenticated, token, tokenParsed })
└── scheduleRefresh() → setTimeout at (exp - now - 30)s → keycloak.updateToken(30)
                       → useAuthStore.setState({ token: keycloak.token })
                       → recursive scheduleRefresh()

axiosInstance (module-level)
├── request interceptor  → useAuthStore.getState().token     ← Zustand .getState(), NOT useContext()
└── response interceptor
    ├── 401 → refreshPromise mutex → retry with new token
    ├── 403 → router.navigate('/forbidden')                  ← router exported from router.ts
    └── default → log { status, url, method } only          ← never log full error (JWT exposure)
```

**Key coupling decisions:**
- `router` must be exported from `router.ts` — allows Axios error interceptor to navigate programmatically (hooks unavailable in interceptors)
- `keycloak` must be a module singleton — one file, one import, never re-constructed
- Auth store uses **no `persist` middleware** — raw JWT lives in Keycloak adapter's memory only
- Role store uses `persist` with safe localStorage adapter (try/catch on all operations)

#### 1.2 Critical Findings

**[CRITICAL] (confidence: 10/10) auth.interceptor.ts — Context incompatible with Axios**  
Axios interceptors run outside the React tree. `useContext()` is unavailable. Auth state accessed inside Axios interceptors MUST use `useAuthStore.getState()` (Zustand module API). **This resolves the open design decision "Zustand vs Context API for auth?" — decision: Zustand is mandatory.**

**[CRITICAL] (confidence: 10/10) keycloak.service.ts — Module singleton required**  
React StrictMode unmounts and remounts every component in development. If `new Keycloak(...)` is called inside a hook or component body, StrictMode creates two instances — the `useRef` guard on a per-instance basis does not prevent two concurrent `init()` calls. The Keycloak constructor must run exactly once, at module level, outside any React tree.

```ts
// src/keycloak.ts — correct pattern
export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});
// useRef guard on keycloak.init() is still needed as a secondary layer
```

**[CRITICAL] (confidence: 9/10) keycloak.service.ts:_scheduleTokenRefresh — Wrong strategy in plan**  
The plan's risk table says `onTokenExpired callback in useEffect`. The Angular implementation uses a proactive `setTimeout` firing 30 seconds **before** expiry. `onTokenExpired` fires **after** expiry — leaving a window for 401 errors on in-flight requests. The React implementation must replicate the Angular proactive `setTimeout` approach. Additionally, a refresh mutex is required in the Axios 401 handler to prevent concurrent refresh calls:

```ts
// Refresh mutex — one promise shared across all concurrent 401 retries
let refreshPromise: Promise<void> | null = null;
axiosInstance.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401 && !error.config._retry) {
    error.config._retry = true;
    if (!refreshPromise) {
      refreshPromise = keycloak.updateToken(-1)
        .then(() => useAuthStore.setState({ token: keycloak.token }))
        .finally(() => { refreshPromise = null; });
    }
    await refreshPromise;
    error.config.headers['Authorization'] = `Bearer ${keycloak.token}`;
    return axiosInstance(error.config);
  }
  return Promise.reject(error);
});
```

**[HIGH] (confidence: 10/10) app.routes.ts + rol.model.ts — LucideIconData does not exist in lucide-react**  
`lucide-angular` exports `LucideIconData` (raw SVG descriptor objects). `lucide-react` exports `React.ComponentType<LucideProps>` (React component constructors). Every route's `NavItemData` and every `Rol` definition must change the icon type. Rendering pattern changes from data objects to JSX: `const Icon = item.icon; return <Icon size={20} />;`

**[HIGH] (confidence: 10/10) auth.guard.ts:12 — Redirect to `/unauthorized` causes infinite redirect loop**  
`auth.guard.ts` redirects unauthenticated users to `/unauthorized`. This route does not exist in `app.routes.ts` — the wildcard catches it and redirects to `''` (dashboard), re-triggering `authGuard`. In Angular this is masked by `onLoad: 'login-required'`. In React (where auth is async), a hard reload by an unauthenticated user hits this loop. Fix: standardize on `keycloak.login()` redirect (no Angular router involvement) or use `/forbidden`. Create the target route explicitly.

**[HIGH] (confidence: 10/10) keycloak.service.ts + APP_INITIALIZER — Auth hydration flash**  
Angular's `APP_INITIALIZER` blocks all rendering until `keycloak.init()` completes. React renders immediately; `useEffect` runs after first paint. Every guard check before init resolves sees `authenticated: false`. Add `isInitializing: boolean` to the auth Zustand store. Every guard and layout must check `isInitializing` first:

```tsx
function AuthGuard({ children }) {
  const { isInitializing, authenticated } = useAuthStore();
  if (isInitializing) return <AppLoader />;
  if (!authenticated) { keycloak.login(); return null; }
  return <>{children}</>;
}
```

**[HIGH] (confidence: 10/10) HC2 — seleccionar-rol Shell behavior: plan contradicts Angular source**  
`app.routes.ts` renders `seleccionar-rol` inside `ShellComponent`. The Phase 2 design spec says "sidebar hidden until role selected". These are contradictory. Resolution (auto-decided, mechanical): `AppLayout` checks `rolActivo === null` → renders content full-width with no sidebar. Explicit implementation note added to sub-task 3 (see revised sub-tasks below).

**[HIGH] (confidence: 9/10) HC1 — Zustand atomic update prevents role flash**  
Split `setState` calls during Keycloak init (e.g., one for `authenticated: true`, another for `tokenParsed`) create intermediate states where subscribers see `authenticated: true` with `roles: []`. Use a single atomic `setState` call:

```ts
useAuthStore.setState({
  isInitializing: false,
  authenticated: true,
  token: keycloak.token,
  tokenParsed: keycloak.tokenParsed,
});
```
Derive `roles`, `rolesDisponibles` as Zustand selectors (not stored fields) to ensure they always reflect the latest `tokenParsed`.

**[HIGH] (confidence: 8/10) S1 — JWT token exposure in Axios error logs**  
Axios error objects include `error.config.headers['Authorization']`. Any logging of the full error object exposes the Bearer token in browser console and log aggregators. Log only `{ status, url, method }`.

**[HIGH] (confidence: 8/10) S2 — JWT must not be persisted**  
`token` (raw JWT string) and `tokenParsed` (decoded payload) must NOT be in Zustand `persist` middleware. The Keycloak adapter holds them in memory. Only the active role string (`arquisoft_rol_activo`) should touch localStorage.

#### 1.3 Rollback Posture

Branch `feat/react-migration` is cut from `main`. Angular code is preserved on `feat/tailwind-migration`. Rollback = switch branch. CI remains gated: both branches can be deployed independently until React branch is merged and verified.

---

### Section 2 — Code Quality

**DRY:** The `parseRoles` logic (extract roles from `tokenParsed.resource_access[clientId].roles`) appears in both `keycloak.service.ts` and `rol-activo.service.ts` (implied by `rolesDisponibles` computed). Write one `src/utils/parseRoles.ts` utility:
```ts
export function parseRoles(tokenParsed: KeycloakTokenParsed | undefined, clientId: string): string[] {
  return tokenParsed?.resource_access?.[clientId]?.roles ?? [];
}
```

**Over-engineering risk:** Sub-task 7 lists two separate Zustand stores (auth + role). One store with two logical slices avoids cross-store selector composition issues. Consider consolidating unless the separation is needed for the localStorage persist scope (which it is — only role slice should persist). The split is justified.

**Under-engineering risk:** Sub-task 6 (shared components) has no inventory. Minimum required before features:
- `AppLoader` (fullscreen loading spinner for auth init)
- `PageSkeleton` (Suspense fallback for lazy features)
- `ChunkErrorFallback` (ErrorBoundary fallback with retry button)
- `NavItem` (sidebar item with icon, label, active state)
- `RoleBadge` (active role chip in header)
- `ForbiddenPage` + `NotFoundPage`

**Naming:** `useKeycloak` is the name of the hook exported by `react-keycloak-web`. If not using that library (recommended — use `keycloak-js` directly), name the custom hook `useAuth` to avoid confusion.

---

### Section 3 — Test Coverage (NEVER SKIP)

#### 3.1 Test Flow Diagram

```
UX Flow / Codepath                         | Unit | Integration | E2E*
-------------------------------------------|------|-------------|------
Keycloak init → store hydration            |  ✓   |             |
Keycloak init failure → loader persists    |  ✓   |             |
Token refresh: proactive setTimeout        |  ✓   |             |
Token refresh: concurrent requests (mutex) |  ✓   |             |
Token refresh failure → logout             |  ✓   |             |
AuthGuard: isInitializing=true → loader    |  ✓   |             |
AuthGuard: authenticated=false → redirect  |  ✓   |             |
AuthGuard: authenticated=true → pass       |  ✓   |             |
RoleGuard: rolActivo=null → seleccionar-rol|  ✓   |             |
RoleGuard: wrong role → /forbidden         |  ✓   |             |
RoleGuard: correct role → pass             |  ✓   |             |
Single-role user → skip SeleccionarRol     |       |     ✓       |
Multi-role user → show SeleccionarRol      |       |     ✓       |
rolActivo localStorage persist/restore     |  ✓   |             |
localStorage unavailable (Safari priv.)    |  ✓   |             |
rolActivo localStorage tampered value      |  ✓   |             |
Axios: auth interceptor adds Bearer        |  ✓   |             |
Axios: 401 → refresh → retry (mutex)       |  ✓   |             |
Axios: 401 → refresh fails → logout        |  ✓   |             |
Axios: 403 → router.navigate /forbidden    |  ✓   |             |
Axios: error log never includes token      |  ✓   |             |
React.lazy chunk load error → ErrorBoundary|       |     ✓       |
AppLayout: rolActivo=null, no sidebar      |  ✓   |             |
AppLayout: rolActivo set, sidebar visible  |  ✓   |             |
NavItem: renders lucide-react icon as SVG  |  ✓   |             |

*E2E: out of scope per plan (see "No en scope")
```

**Mock strategy — create on day 1:**
```ts
// src/test-utils/keycloak.mock.ts
export const mockKeycloak = {
  init: vi.fn().mockResolvedValue(true),
  login: vi.fn(),
  logout: vi.fn(),
  updateToken: vi.fn().mockResolvedValue(true),
  token: 'mock.jwt.token',
  tokenParsed: {
    exp: Math.floor(Date.now() / 1000) + 300,
    resource_access: { 'angular-app': { roles: ['estudiante'] } },
  },
} as unknown as Keycloak;
vi.mock('../keycloak', () => ({ keycloak: mockKeycloak }));
```

**Zustand test isolation — required in every auth test:**
```ts
beforeEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState());
  useRoleStore.setState(useRoleStore.getInitialState());
});
```

**Timer-dependent tests:**
```ts
vi.useFakeTimers();
vi.advanceTimersByTime((300 - 30) * 1000); // advance to 30s before expiry
expect(mockKeycloak.updateToken).toHaveBeenCalledWith(30);
vi.useRealTimers();
```

**Visibility API mock (for background tab refresh test):**
```ts
Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
```

#### 3.2 Test Plan Artifact

Test plan artifact saved to:  
`~/.gstack/projects/arquisoft-uco-arquisoft-frontend/brayan-feat-tailwind-migration-test-plan-20260404-112556.md`

Contains: AUTH-01 through AUTH-09 (P0), ROLE-01 through ROLE-03, HTTP-01 through HTTP-02, LAYOUT-01, LAZY-01, ICON-01, ENV-01 (P1/P2) with full code bodies.

**Coverage targets:**

| Module | Target |
|--------|--------|
| `src/keycloak.ts` | 100% |
| `src/stores/authStore.ts` | 100% |
| `src/stores/roleStore.ts` | 100% |
| `src/guards/AuthGuard.tsx` | 100% |
| `src/guards/RoleGuard.tsx` | 100% |
| `src/api/axiosInstance.ts` | 90% |
| `src/hooks/useAuth.ts` | 90% |
| Features | 60% |

---

### Section 4 — Performance

**Timer cleanup:** The proactive refresh `setTimeout` must return a cleanup function from `useEffect` to prevent it from firing after logout or unmount:
```ts
useEffect(() => {
  if (!isAuthenticated) return;
  const cleanup = scheduleRefresh();
  return cleanup;
}, [isAuthenticated]);
```

**TanStack Query stale time:** Default stale time is `0` (re-fetches on every window focus). Features with low-change data should override:
```ts
useQuery({ queryKey: ['fichas-perfil'], queryFn: ..., staleTime: 5 * 60 * 1000 })
```
Affects: `fichas-perfil`, `mapas-ruta`, `biblioteca` — add to feature sub-tasks.

**Bundle analysis:** Add to `vite.config.ts`:
```ts
import { visualizer } from 'rollup-plugin-visualizer';
plugins: [..., visualizer({ open: true, gzipSize: true })]
```
Run once after initial migration to verify lazy loading is working as expected.

**Tailwind CSS v4 in Vite:** Use the Vite plugin, not PostCSS:
```ts
import tailwindcss from '@tailwindcss/vite';
// vite.config.ts → plugins: [react(), tailwindcss()]
```
PostCSS path (`@tailwindcss/postcss`) works in dev but can degrade prod bundle size with some Vite configs.

**Day-1 dev server blocker (S4):** Vite defaults to port `5173`; Angular used `4200`. **Before writing any code,** update the Keycloak client configuration in the Keycloak admin console:
- "Valid Redirect URIs": add `http://localhost:5173/*`
- "Web Origins": add `http://localhost:5173`

Without this, every developer gets `Invalid parameter: redirect_uri` on the first Keycloak login attempt.

---

### Eng Findings Applied to Sub-tasks

**Sub-task 2 (Auth) — revised spec:**
- Create `src/keycloak.ts` as module-level singleton (never inside hooks/components)
- Auth state in `useAuthStore` (Zustand): fields `isInitializing`, `authenticated`, `token`, `tokenParsed` — **no `persist` on these fields**
- `scheduleRefresh()`: proactive `setTimeout` at `(exp - now - 30) * 1000` — NOT `onTokenExpired` callback
- `AuthProvider` sets `isInitializing: false` atomically after `keycloak.init()` resolves
- **Decision resolved: Zustand mandatory for auth state. Context API dropped.**

**Sub-task 3 (Routing + Layout) — revised spec:**
- Export `router` from `router.ts` at module level (Axios error interceptor needs it)
- `AuthGuard` checks `isInitializing` first → `<AppLoader />` while true; never redirects before init
- `RoleGuard` same `isInitializing` gate
- `AppLayout` checks `rolActivo === null` → renders content full-width **without sidebar**
- Wrap each route's `<Suspense>` boundary with `<ErrorBoundary>` catching chunk load errors
- Fix `/unauthorized` bug: use `keycloak.login()` or `/forbidden` — do NOT migrate the bug

**Sub-task 4 (HTTP) — revised spec:**
- Document all error interceptor behaviors explicitly:
  - `401` → refresh mutex → retry (DO NOT call `keycloak.logout()` here; that's the refresh-failure path)
  - `403` → `router.navigate('/forbidden')`
  - `404` → **skip** (Angular source has `/not-found` which doesn't exist — do not migrate this bug)
  - Default → `console.error({ status, url, method })` — never the full error object
- Zustand: use `getState()` in interceptors, not `useContext()`/hooks

**Sub-task 5 (Features) — revised spec:**
- Add "icon migration" step to every feature with nav registration
- `LucideIconData` → `React.ComponentType<LucideProps>` in `NavItemData` and `Rol` model
- Rendering: `const Icon = item.icon; return <Icon size={20} />;`

**New Pre-flight Checklist (before sub-task 1):**
- [ ] Update Keycloak client: add `http://localhost:5173/*` to Valid Redirect URIs
- [ ] Create `src/test-utils/keycloak.mock.ts` on day 1
- [ ] Create `src/test-utils/store.utils.ts` with Zustand reset helpers

---

### Eng Consensus [subagent-only]

| Review | Critical | High | Medium | Low | Verdict |
|--------|---------|------|--------|-----|---------|
| Claude subagent | 3 | 8 | 4 | 2 | **PROCEED WITH FIXES** |

**3 pre-flight blockers (resolve before writing line 1 of React):**
1. **Auth = Zustand** (not Context) — unblocks A1, HC3
2. **`src/keycloak.ts` module singleton** — unblocks E1 and the E2 concurrent-refresh fix
3. **`isInitializing: boolean` in auth store** — unblocks E3, HC1, and the roleGuard race (T3)

**Phase 3 complete.** Codex N/A (unavailable). Claude subagent: 20 findings (3 critical, 8 high, 4 medium, 2 low, 3 hidden-complexity). All critical findings auto-resolved in revised sub-task specs above. No new taste decisions (T6 from CEO review remains the only open routing taste decision). Passing to Phase 4.

---

## Riesgos

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Keycloak init en React StrictMode (doble mount) | Alto | **`keycloak.ts` module singleton** — la instancia se crea una sola vez fuera del árbol React; `useRef` como guarda secundaria en `keycloak.init()` |
| Token refresh race condition (requests concurrentes) | Alto | `setTimeout` proactivo (30s antes de expirar), más mutex `refreshPromise` en el response interceptor de Axios |
| Auth hydration flash (render antes de init) | Alto | `isInitializing: boolean` en Zustand store; todos los guards muestran `<AppLoader />` mientras es `true` |
| Angular Signals → React state no 1:1 | Medio | Zustand para estado compartido, `useState` + `useMemo` para estado local |
| Tailwind CSS v4 en Vite | Bajo | Plugin `@tailwindcss/vite` (no PostCSS); ya probado |
| `React.lazy()` chunk load errors | Bajo | `<ErrorBoundary>` wrapping cada `<Suspense>` con botón de retry |
| `LucideIconData` no existe en lucide-react | Medio | Cambio de tipo a `React.ComponentType<LucideProps>` en todo `NavItemData` y `rol.model.ts` |
| Keycloak redirect URI para Vite dev server | Medio | **Pre-flight:** agregar `http://localhost:5173/*` al cliente Keycloak antes de iniciar desarrollo |
| JWT expuesto en logs de error de Axios | Medio | Registrar solo `{ status, url, method }`, nunca el objeto `error.config` completo |
| JWT en Zustand persist / DevTools | Medio | `persist` solo en role store (solo el rol activo); auth store en memoria |

---

## Decisiones de diseño pendientes

- ¿Mantener la misma estructura de carpetas `features/[name]/` o adoptar una estructura más React-idiomática?
- ¿Usar TanStack Query para todas las llamadas API o solo para las que requieren cache/refetch?
- **~~¿Estado global Zustand o Context API para auth?~~** → **RESUELTO (Fase 3):** Zustand obligatorio — los interceptors de Axios no tienen acceso a React Context.

---

## Referencias

- [Keycloak JS adapter](https://www.keycloak.org/securing-apps/javascript-adapter)
- [React Router v7 docs](https://reactrouter.com/start/library)
- [TanStack Query v5](https://tanstack.com/query/latest)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [Tailwind CSS v4 Vite plugin](https://tailwindcss.com/docs/guides/vite)

---

## Phase 4: Final Approval Gate

### Auto-decided decisions summary (no user input needed)

| # | Phase | Decision | Principle |
|---|-------|----------|-----------|
| 1 | CEO | Mode: SELECTIVE EXPANSION | P3 |
| 2 | CEO | Approach A: Full migration (clean-slate React from main) | P5 |
| 3 | CEO | shadcn/ui → deferred (Tailwind primitives sufficient) | P4 |
| 4 | CEO | E2E tests → TODOS.md (out of scope) | P3 |
| 5 | CEO | SSR / React Server Components → rejected (SPA + Keycloak) | P5 |
| 6 | Design | Auth loading state: fullscreen branded loader | P1 |
| 7 | Design | Single-role auto-bypass on auth callback | P1 |
| 8 | Design | Skeleton/empty/error specs for 10 features added to plan | P1 |
| 9 | Design | ARIA requirements for nav and dropdowns in plan | P1 |
| 10 | Eng | Zustand mandatory for auth state (not Context) | P5 |
| 11 | Eng | keycloak.ts module singleton (not inside hooks) | P5 |
| 12 | Eng | Proactive setTimeout for token refresh (not onTokenExpired) | P5 |
| 13 | Eng | Router exported from router.ts (Axios interceptor access) | P5 |
| 14 | Eng | Auth store: no persist; role store: persist with safe adapter | P5 |
| 15 | Eng | `/unauthorized` bug → don't migrate; use keycloak.login() | P5 |
| 16 | Eng | `404` error interceptor bug → don't migrate | P5 |

### Taste decisions — choose one per item

#### T6: React Router v7 vs TanStack Router v1
**Both are valid for this project.** User must decide before sub-task 1.

| | React Router v7 | TanStack Router v1 |
|-|----------------|-------------------|
| Bundle size | ~50KB | ~35KB |
| Type safety | Good | Excellent (fully type-safe params/search) |
| Ecosystem | Largest | Growing fast |
| `React.lazy()` | Built-in | Built-in |
| File-based routing | Optional | Optional |
| Learning curve | Familiar (Angular Router–like) | Steeper |
| **Recommended** | ✅ (safer default) | If the team values type safety |

**Default recommendation:** React Router v7 (closer mental model to Angular Router, wider ecosystem, less friction for new React developers on the team).

#### D1: Dashboard widget order per role
Which widgets should appear first for `estudiante` vs `coordinador` vs `director`?

**Default recommendation:** Same widget order for all roles in v1; role-specific ordering as a future enhancement.

#### D2: Sidebar collapse animation style
Sliding drawer (left-to-right) vs icon-only collapse (width minimizes to show only icons)?

**Default recommendation:** Sliding drawer on mobile (overlay), icon-only collapse on desktop. Matches most academic platform conventions.

#### D3: 403 Forbidden page design style
Full-page illustration vs minimal centered message?

**Default recommendation:** Minimal centered message with a "Volver al inicio" link. Matches the existing Angular error handling tone.

---

### Acknowledged risks (user confirmed premises)

The following challenges were surfaced by the CEO subagent and are **documented risks, not blockers** — the user confirmed "el equipo prefiere React, continuar" on 2026-04-04:

1. No formal problem statement documenting why React was chosen over continued Angular investment
2. This is the team's third framework decision (post-Angular Material removal, mid-Tailwind migration)
3. Angular 21 closes many of the stated gaps (signals = reactive, standalone = modular, zoneless = fast)

These are entered in the plan's error/rescue registry and represent team context that future members should read.

---

### Autoplan complete

All phases done:
- ✅ Phase 0: Intake + restore point + scope detection
- ✅ Phase 1: CEO Review (SELECTIVE EXPANSION, premises confirmed)
- ✅ Phase 2: Design Review (16 findings, 11 auto-fixed)
- ✅ Phase 3: Eng Review (20 findings, all critical → revised sub-tasks)
- ✅ Phase 4: Final Gate (4 taste decisions surfaced)

**Next step:** Resolve the 4 taste decisions (T6, D1, D2, D3) above, then run `/ship` on the new branch `feat/react-migration`.
