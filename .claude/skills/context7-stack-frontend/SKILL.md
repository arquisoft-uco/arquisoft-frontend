---
name: context7-stack-frontend
description: IDs de librerías Context7 del stack Arquisoft Frontend (React 19, Vite 6, TypeScript 5.9, TanStack Query 5, react-router 7, Zustand 5, react-hook-form 7, Zod 3, Tailwind 4, Vitest 4, keycloak-js 26). Usar antes de generar cualquier componente, hook, service o archivo de configuración para obtener documentación actualizada y específica por versión. Incluye tabla de IDs validados, trampas de versión del stack y consultas sugeridas por tipo de archivo.
---

# Skill: context7-stack-frontend

IDs de librerías Context7 del stack del frontend, **resueltos con `resolve-library-id` contra el
índice real**. Úsalos directamente con `query-docs` para saltarte el paso de resolución.

> Los IDs marcados con ★ son los recomendados: mejor combinación de reputación, cobertura de
> snippets y benchmark. Cuando exista un ID específico de la versión que usa el proyecto, **gana
> sobre el genérico** — es la diferencia entre documentación que compila y documentación que no.

**Stack real** (tomado de `package.json`): React 19 · TypeScript ~5.9.2 · Vite 6 · react-router 7 ·
@tanstack/react-query 5 · axios 1 · zustand 5 · react-hook-form 7 + @hookform/resolvers 5 · zod **3**
· tailwindcss 4 (+ @tailwindcss/vite) · keycloak-js 26.2 · lucide-react · vitest 4 ·
@testing-library/react 16.

---

## Tabla de IDs validados

| Librería | ID recomendado ★ | Snippets | Versión en el proyecto |
|---|---|---|---|
| React | `/reactjs/react.dev` | 5 940 | **19.x** |
| React (alternativo con versiones) | `/react/react` (tiene `v19.2.7`) | 6 440 | usar si necesitas fijar 19 |
| TanStack Query | `/tanstack/query` (tiene `v5.90.3`) | 2 526 | **5.x** |
| React Router | `/websites/reactrouter` | 4 124 | **7.x** |
| React Router (alternativo con versiones) | `/remix-run/react-router` (tiene `react-router_7.9.4`) | 2 399 | usar para fijar 7.x |
| Zustand | `/pmndrs/zustand` (tiene `v5.0.12`) | 775 | **5.x** |
| React Hook Form | `/react-hook-form/documentation` | 739 | **7.x** |
| @hookform/resolvers | `/react-hook-form/resolvers` | 424 | **5.x** — el `zodResolver` |
| **Zod 3** | `/websites/v3_zod_dev` | 3 184 | **3.x** — ver trampa abajo |
| Tailwind CSS | `/websites/tailwindcss` | 2 412 | **4.x** |
| Vite | `/websites/v6_vite_dev` | 812 | **6.x** |
| Vitest | `/vitest-dev/vitest` (tiene `v4.1.6`) | 4 512 | **4.x** |
| React Testing Library | `/testing-library/react-testing-library` | 85 | **16.x** |
| Testing Library (docs completas) | `/testing-library/testing-library-docs` | 1 091 | queries, `screen`, `waitFor` |
| user-event | `/testing-library/user-event` | 382 | **14.x** |
| jest-dom | `/testing-library/jest-dom` | 498 | **6.x** — matchers |
| Axios | `/axios/axios` | 933 | **1.x** |
| Keycloak | `/keycloak/keycloak` (tiene `26.5.2`) | 7 546 | adaptador JS **26.2** |

**Sin ID validado en esta tabla:** TypeScript y `lucide-react`. Si los necesitas, resuélvelos en el
momento con `resolve-library-id` — no inventes un ID.

## Trampas de versión de este stack

Verifícalas antes de copiar cualquier snippet de Context7:

- **Zod 3, no Zod 4.** `package.json` declara `zod: ^3.0.0`. La documentación por defecto de
  `zod.dev` es la de v4, y v4 cambió cosas que este proyecto usa: `error.issues` frente a
  `error.errors`, la firma de los mensajes personalizados y el paquete `zod/v4`. **Usa
  `/websites/v3_zod_dev`.** `validadores-zod.test.ts` lee `resultado.error.issues[0].message`, que es
  la forma de v3.
- **react-router 7 se importa desde `react-router`, no desde `react-router-dom`.** Todo el proyecto
  (`router.tsx`, `test-utils/render.tsx`, cada `<Navigate>`) importa de `'react-router'`. Un snippet
  con `react-router-dom` es de v6.
- **Tailwind 4 es CSS-first.** No hay `tailwind.config.js`: los tokens se declaran con `@theme` en
  `src/tailwind.css` y el plugin es `@tailwindcss/vite` en `vite.config.ts`. Cualquier snippet con
  `content: [...]`, `theme.extend` o `postcss.config.js` es de Tailwind 3 y no aplica.
- **La configuración de Vitest vive dentro de `vite.config.ts`**, en la clave `test`, no en un
  `vitest.config.ts` aparte. No crees ese archivo.
- **React 19**: sin `React.FC`, sin `forwardRef` para pasar `ref` (ya es una prop normal), y los
  componentes se declaran `export default function Nombre({ ... }: Props)`.
- **`@vitest/coverage-v8` no está instalado** y no hay umbral de cobertura configurado. Ningún
  snippet de `coverage` aplica hasta que alguien lo pida explícitamente.
- **keycloak-js 26**: `keycloak.logout()` es asíncrono y necesita `id_token_hint`; el proyecto
  construye la URL de `end-session` a mano en `src/auth/keycloak.ts` justamente por eso. PKCE S256 es
  el default desde v24 pero se declara explícito en `AuthGuard`.

## Consultas sugeridas por tipo de archivo

### `models/*.ts`
No necesitan Context7: son interfaces TypeScript planas.

### `services/*.ts`
```
/axios/axios          → "typed generic get/post with response interceptor and isAxiosError narrowing"
/axios/axios          → "AxiosRequestConfig custom flag to avoid infinite retry loops"
```

### `hooks/use*.ts`
```
/tanstack/query       → "useQuery with hierarchical queryKey, enabled option and staleTime Infinity"
/tanstack/query       → "useMutation onSuccess invalidateQueries by key prefix"
/tanstack/query       → "setQueryData to update cache optimistically after a mutation"
/pmndrs/zustand       → "read store outside React with getState and select a slice with a hook"
```

### Componentes (`*.tsx`)
```
/reactjs/react.dev    → "lazy and Suspense for route-level code splitting"
/reactjs/react.dev    → "useEffect to synchronise with an external system, with cleanup"
/websites/reactrouter → "createBrowserRouter nested layout routes, Navigate and errorElement"
```

### Formularios
```
/react-hook-form/documentation → "useForm defaultValues mode onChange, register, formState errors and isValid"
/react-hook-form/resolvers     → "zodResolver with a z.object schema and inferred FormValues type"
/websites/v3_zod_dev           → "z.object with custom messages, z.array min max, safeParse and error.issues"
```

### Estilos
```
/websites/tailwindcss → "Tailwind v4 @theme custom color and animation tokens in CSS"
/websites/tailwindcss → "@tailwindcss/vite plugin setup"
```

### Autenticación
```
/keycloak/keycloak    → "keycloak-js init login-required with pkceMethod S256 and updateToken refresh"
/keycloak/keycloak    → "OIDC end-session endpoint with id_token_hint and post_logout_redirect_uri"
```

### Tests
```
/vitest-dev/vitest                       → "vi.mock a module, jsdom environment and setupFiles in vite config"
/testing-library/testing-library-docs    → "getByRole queries with accessible name, findBy and waitFor"
/testing-library/user-event              → "userEvent.setup, click and type on form controls"
/testing-library/jest-dom                → "toBeInTheDocument, toHaveTextContent, toBeDisabled matchers"
/testing-library/react-testing-library   → "custom render with providers wrapper"
```

### Build y entorno
```
/websites/v6_vite_dev → "import.meta.env typed VITE_ variables and vite-env.d.ts"
/websites/v6_vite_dev → "defineConfig plugins and production build output"
```

## Cuándo NO consultar Context7

Refactorizar código propio, depurar lógica de negocio, revisar un diff o decidir dónde va un archivo
no son preguntas de documentación — ahí manda `arquisoft-frontend-arquitectura` /
`arquisoft-frontend-estandares` y el código real de `fichas-perfil`.
