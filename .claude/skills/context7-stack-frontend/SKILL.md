---
name: context7-stack-frontend
description: IDs de librerías Context7 del stack Arquisoft Frontend (React 19, Vite 6, TanStack Query 5, react-router 7, Zustand 5, react-hook-form 7, Zod 3, Tailwind 4, Vitest 4, keycloak-js 26) y las trampas de versión del proyecto. Usar solo al explorar un tema nuevo (librería, API o patrón que el proyecto aún no usa); nunca para lo ya definido en el código.
---

# Skill: context7-stack-frontend

IDs **resueltos con `resolve-library-id` contra el índice real**. Úsalos directo con `query-docs`
para saltarte la resolución. Las versiones exactas del proyecto están en `package.json`.

## Cuándo consultar

**Solo al explorar un tema nuevo**: una librería, una API o un patrón que el proyecto aún no usa (una
dependencia por añadir, una capacidad de la librería que ningún archivo emplea todavía, un salto de
versión). Con la pregunta completa —no una palabra suelta— y el ID de abajo.

**No para lo ya definido.** `useQuery` y sus claves, `useForm` + `zodResolver`, el interceptor de
Axios, los stores de Zustand, `lazy` + `Suspense`, los tests con Testing Library… ya están resueltos en
el código: el molde `fichas-perfil` y las skills `arquisoft-frontend-arquitectura` y
`arquisoft-frontend-estandares` son la fuente. Consultar Context7 para repetir una convención del
proyecto cuesta contexto y puede contradecirla.

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

Verifícalas antes de copiar cualquier snippet de una consulta:

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
