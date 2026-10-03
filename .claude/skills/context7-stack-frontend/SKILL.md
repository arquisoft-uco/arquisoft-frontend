---
name: context7-stack-frontend
description: IDs de librerías Context7 del stack Arquisoft Frontend (React 19, Vite 6, TanStack Query 5, react-router 7, Zustand 5, react-hook-form 7, Zod 3, Tailwind 4, Vitest 4, keycloak-js 26) y las trampas de versión del proyecto. Usar antes de generar componentes, hooks, services o configuración.
---

# Skill: context7-stack-frontend

IDs **resueltos con `resolve-library-id` contra el índice real**. Úsalos directo con `query-docs`
para saltarte la resolución. Las versiones exactas del proyecto están en `package.json`.

## IDs validados

| Librería | ID | Nota |
|---|---|---|
| React | `/reactjs/react.dev` | Con versiones: `/react/react` |
| TanStack Query | `/tanstack/query` | v5 |
| React Router | `/websites/reactrouter` | Con versiones: `/remix-run/react-router` |
| Zustand | `/pmndrs/zustand` | v5 |
| React Hook Form | `/react-hook-form/documentation` | |
| @hookform/resolvers | `/react-hook-form/resolvers` | |
| **Zod 3** | `/websites/v3_zod_dev` | **No** la doc por defecto, que es v4 |
| Tailwind CSS | `/websites/tailwindcss` | v4 |
| Vite 6 | `/websites/v6_vite_dev` | |
| Vitest | `/vitest-dev/vitest` | v4 |
| Testing Library | `/testing-library/testing-library-docs` | RTL: `/testing-library/react-testing-library` |
| user-event | `/testing-library/user-event` | |
| jest-dom | `/testing-library/jest-dom` | |
| Axios | `/axios/axios` | |
| Keycloak | `/keycloak/keycloak` | v26 |

TypeScript y `lucide-react` no tienen ID validado: resuélvelos en el momento, no los inventes.

## Trampas de versión

Verifícalas antes de copiar cualquier snippet:

- **Zod 3, no Zod 4.** v4 cambió lo que este proyecto usa: `error.issues` frente a `error.errors`, la
  firma de mensajes personalizados y el paquete `zod/v4`.
- **react-router 7 se importa desde `react-router`**, no `react-router-dom`. Un snippet con
  `react-router-dom` es de v6.
- **Tailwind 4 es CSS-first.** Los tokens van en `@theme` de `src/tailwind.css` y el plugin es
  `@tailwindcss/vite`. Un snippet con `content: [...]`, `theme.extend` o `postcss.config.js` es de v3.
- **La config de Vitest vive en `vite.config.ts`**, clave `test`.
- **React 19**: sin `React.FC`, sin `forwardRef` para pasar `ref` (ya es prop normal).
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
