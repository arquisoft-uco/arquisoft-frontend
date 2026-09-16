---
name: context7-stack-frontend
description: IDs de librerías Context7 del stack Arquisoft Frontend (React 19, Vite 6, TanStack Query 5, react-router 7, Zustand 5, react-hook-form 7, Zod 3, Tailwind 4, Vitest 4, keycloak-js 26) y las trampas de versión del proyecto. Usar antes de generar componentes, hooks, services o configuración.
---

# Skill: context7-stack-frontend

IDs **resueltos con `resolve-library-id` contra el índice real**. Úsalos directo con `query-docs`
para saltarte la resolución.

**Stack** (`package.json`): React 19 · TypeScript ~5.9 · Vite 6 · react-router 7 ·
@tanstack/react-query 5 · axios 1 · zustand 5 · react-hook-form 7 + @hookform/resolvers 5 · zod **3**
· tailwindcss 4 · keycloak-js 26.2 · vitest 4 · @testing-library/react 16.

## IDs validados

| Librería | ID | Snippets |
|---|---|---|
| React | `/reactjs/react.dev` | 5 940 |
| React (con versiones, `v19.2.7`) | `/react/react` | 6 440 |
| TanStack Query (`v5.90.3`) | `/tanstack/query` | 2 526 |
| React Router | `/websites/reactrouter` | 4 124 |
| React Router (con versiones, `7.9.4`) | `/remix-run/react-router` | 2 399 |
| Zustand (`v5.0.12`) | `/pmndrs/zustand` | 775 |
| React Hook Form | `/react-hook-form/documentation` | 739 |
| @hookform/resolvers | `/react-hook-form/resolvers` | 424 |
| **Zod 3** | `/websites/v3_zod_dev` | 3 184 |
| Tailwind CSS | `/websites/tailwindcss` | 2 412 |
| Vite 6 | `/websites/v6_vite_dev` | 812 |
| Vitest (`v4.1.6`) | `/vitest-dev/vitest` | 4 512 |
| Testing Library (docs completas) | `/testing-library/testing-library-docs` | 1 091 |
| React Testing Library | `/testing-library/react-testing-library` | 85 |
| user-event | `/testing-library/user-event` | 382 |
| jest-dom | `/testing-library/jest-dom` | 498 |
| Axios | `/axios/axios` | 933 |
| Keycloak (`26.5.2`) | `/keycloak/keycloak` | 7 546 |

TypeScript y `lucide-react` no tienen ID validado: resuélvelos en el momento, no los inventes.

## Trampas de versión

Verifícalas antes de copiar cualquier snippet:

- **Zod 3, no Zod 4.** La doc por defecto de `zod.dev` es v4, y v4 cambió lo que este proyecto usa:
  `error.issues` frente a `error.errors`, la firma de mensajes personalizados y el paquete `zod/v4`.
  Usa `/websites/v3_zod_dev`.
- **react-router 7 se importa desde `react-router`**, no `react-router-dom`. Un snippet con
  `react-router-dom` es de v6.
- **Tailwind 4 es CSS-first.** No hay `tailwind.config.js`: los tokens van en `@theme` de
  `src/tailwind.css` y el plugin es `@tailwindcss/vite`. Cualquier snippet con `content: [...]`,
  `theme.extend` o `postcss.config.js` es de v3.
- **La config de Vitest vive en `vite.config.ts`**, clave `test`. No crees `vitest.config.ts`.
- **React 19**: sin `React.FC`, sin `forwardRef` para pasar `ref` (ya es prop normal).
- **`@vitest/coverage-v8` no está instalado** y no hay umbral: ningún snippet de `coverage` aplica.
- **keycloak-js 26**: `logout()` es asíncrono y necesita `id_token_hint` — por eso `auth/keycloak.ts`
  construye la URL de `end-session` a mano. PKCE S256 es el default desde v24 pero se declara explícito.

## Consultas por capa

Una consulta por tecnología presente, con la pregunta completa (no una palabra suelta):

| Capa | ID y tema |
|---|---|
| models | — no necesita documentación |
| services | `/axios/axios` → genéricos tipados, `isAxiosError`, interceptores |
| hooks | `/tanstack/query` → `queryKey` jerárquica, `enabled`, `staleTime`, `invalidateQueries`, `setQueryData` · `/pmndrs/zustand` → `getState()` fuera de React |
| components | `/reactjs/react.dev` → `lazy` + `Suspense`, `useEffect` con cleanup · `/websites/reactrouter` → `createBrowserRouter`, rutas anidadas, `Navigate`, `errorElement` |
| formularios | `/react-hook-form/documentation` → `useForm`, `defaultValues`, `formState` · `/react-hook-form/resolvers` → `zodResolver` · `/websites/v3_zod_dev` → `z.object`, `safeParse`, `error.issues` |
| estilos | `/websites/tailwindcss` → `@theme` en v4, plugin de Vite |
| auth | `/keycloak/keycloak` → `init` con `login-required` y PKCE, `updateToken`, `end-session` |
| tests | `/vitest-dev/vitest` → `vi.mock`, jsdom, `setupFiles` · `/testing-library/testing-library-docs` → queries por rol, `findBy`, `waitFor` · `/testing-library/user-event` · `/testing-library/jest-dom` |
| build | `/websites/v6_vite_dev` → `import.meta.env` tipado, `defineConfig` |

**No consultes Context7** para refactorizar código propio, depurar lógica de negocio, revisar un diff
o decidir dónde va un archivo: ahí mandan las skills del proyecto y el código de `fichas-perfil`.
