---
name: arquisoft-frontend-arquitectura
description: Arquitectura real de Arquisoft Frontend (React 19 + TypeScript + Vite) — capas de una feature, flujo models → services → hooks → components, enrutamiento perezoso, guards, capa HTTP única, stores de Zustand y contrato con el backend. Cargar antes de planificar, implementar, testear o validar cualquier HU/HT. El contexto de referencia es siempre fichas-perfil.
---

# Skill: arquisoft-frontend-arquitectura

Fuente de verdad de arquitectura. `CLAUDE.md` es el índice operativo y remite aquí; si discrepan,
gana esta skill. Para nomenclatura, formularios, validación, accesibilidad, estilos, errores y
testing, ver `arquisoft-frontend-estandares`.

Ningún ejemplo se pega como bloque largo: cada regla apunta al archivo real de `fichas-perfil`.
Ábrelo con `Read` cuando necesites el detalle exacto.

## Qué hay implementado

Solo **una** de las diez features enrutadas tiene código de negocio:

| Feature | Estado |
|---|---|
| `fichas-perfil` | **Completa** — una vista por rol, un hook por caso de uso, **un** service, modelos en archivos propios más el barril |
| `dashboard`, `seleccionar-rol` | Página propia, sin service ni hooks |
| `artefactos`, `biblioteca`, `entregables`, `evaluaciones`, `mapas-ruta`, `proyectos-grado`, `repositorio-artefactos`, `solicitudes` | **Stubs** — `<ComingSoon />`; sus carpetas solo tienen `.gitkeep` |

El único molde válido para una feature nueva es `fichas-perfil`. Dentro de ella, `AdministradorView`
y `asesor-ficha/DetalleFichaAsesor` tampoco lo son: también son `ComingSoon`.

## Dirección de dependencias

```
models  ←  services  ←  hooks  ←  components
```

No hay tarea de build que la verifique; la sostienen la revisión y los checks de
`@4a-validator-analyze`. Tres reglas la definen:

- **Un componente nunca importa `apiClient`.** Si un `.tsx` importa `../../../api/axiosInstance`, la
  llamada baja al service y se expone un hook.
- **Un hook nunca devuelve JSX** ni importa `lucide-react` o componentes. Devuelve datos, banderas y
  funciones.
- **Un service nunca importa React**, `@tanstack/react-query` ni un store.

`models/` es el sumidero: solo tipos, sin importar de las otras capas.

`src/shared/` es transversal y **no importa de `src/features/**`**; una feature tampoco importa de
otra. `src/auth/`, `src/api/`, `src/config/`, `src/guards/`, `src/hooks/` y `src/layout/` son
infraestructura que consumen las features, nunca al revés.

## El árbol de una feature

```
src/features/fichas-perfil/
├── FichasPerfil.tsx              # Página: destino de ruta, resuelve la vista por rol
├── components/
│   ├── {Rol}View.tsx             # Una por rol
│   ├── {Concepto}.tsx            # Lo que comparten dos o más vistas
│   └── {rol}/{Concepto}{Panel|Table|Form}.tsx
├── hooks/use{Accion|Recurso}.ts  # Uno por caso de uso
├── models/{Entidad}.ts           # + {Accion}{Entidad}Request.ts / Response.ts
│   └── {feature}.ts              # Barril: catálogos y DTOs menores
└── services/{feature}Service.ts  # UN objeto plano, un método por endpoint
```

`CLAUDE.md` resume este layout sin `hooks/`; **el árbol real gana**.

**Un service por feature**, no por entidad: `fichasPerfilService` cubre fichas, ítems, evaluaciones,
estados y estudiantes vinculados. **Un hook por caso de uso**, no por endpoint: `useMiFichaPerfil`
compone una query y una mutación porque su consumidor las necesita juntas.

## Fan-out por rol

`FichasPerfil.tsx` es el patrón, con tres ramas en orden: `useRolActivo()` es `null` → `/seleccionar-rol`;
el rol no está en `VIEW_POR_ROL` → `/forbidden`; hay vista → se renderiza.

El mapa se declara a nivel de módulo (`Record<string, React.ComponentType>` con claves del enum
`Rol`), nunca como `switch` ni ternarios dentro del componente.

**No sustituye al `RoleGuard` de la ruta:** el guard decide quién entra, el mapa decide qué ve. Los
dos se declaran.

## Enrutamiento

`src/router.tsx`, tres capas anidadas: `AuthGuard` (con `errorElement`) → `AppLayout` (shell +
`<Suspense fallback={<PageSkeleton />}>` dentro de `ChunkErrorBoundary`) → rutas de feature, **todas
perezosas**. `/forbidden` cuelga de la raíz, fuera de `AuthGuard`: un 403 no debe volver a pedir sesión.

**Las restricciones por rol no se escriben en el router.** Se declaran en `NAV_ITEMS[].roles`
(`src/layout/nav-items.ts`), de ahí se deriva `ROLES_POR_RUTA`, y el helper `guarded(path, element)`
envuelve en `<RoleGuard>`. Escribir el guard a mano duplica la declaración y permite que el sidebar y
la ruta diverjan.

`export const router` está exportado para que el interceptor de Axios navegue fuera del árbol de
React. Su import allí es **dinámico**: uno estático crea el ciclo `router → features → axiosInstance
→ router`.

## Capa HTTP

`src/api/axiosInstance.ts` es la **única** instancia de Axios. Importar `axios` en un service pierde
token, refresco y ruteo de errores.

1. **Request:** adjunta `Authorization: Bearer` con `useAuthStore.getState().token` — `getState()`,
   nunca un hook: el interceptor corre fuera del árbol de React.
2. **401:** mutex compartido (`let refreshPromise`) para que N respuestas 401 concurrentes disparen
   un solo `keycloak.updateToken(-1)`; marca `config._retry` y reintenta. Si el refresco falla, `logout`.
3. **403:** `import('../router').then(({ router }) => router.navigate('/forbidden'))`.
4. Siempre: `monitoring.captureHttpError(...)` y `Promise.reject(error)`.

El interceptor no traga el error: llega al service, de ahí a React Query y a `isError`/`onError`.

## Autenticación y roles

| Store | Persistencia | Contenido |
|---|---|---|
| `useAuthStore` | **Solo memoria**, sin `persist` | `isInitializing`, `authenticated`, `token`, `tokenParsed`, `username` |
| `useRoleStore` | `localStorage`, clave `arquisoft_rol_activo`, vía `safeStorage` con `try/catch` | Solo el string del rol seleccionado |

Nada sensible se escribe en `localStorage` ni `sessionStorage`. El `safeStorage` existe porque
`localStorage` lanza en navegación privada de Safari y con la cuota llena.

**Los roles se leen de `realm_access.roles`** (no de `resource_access[clientId].roles`), vía
`parseRoles()`; `devAuth.ts` construye su `tokenParsed` falso con la misma forma. Un rol que no esté
en el enum `Rol` se descarta en `useRolesDisponibles()`.

**El rol activo es derivado, no almacenado** (`useRolActivo()`): si el rol guardado sigue en el JWT
se usa; si el usuario tiene exactamente uno, se auto-selecciona; si no, `null`. Nunca leas
`useRoleStore` directo desde una feature.

**El frontend no es la línea de seguridad final.** Ocultar un botón o redirigir es UX; el backend
valida cada request contra el JWT y su client role. Un control de acceso que solo existe en el
cliente no cumple un criterio de aceptación de seguridad.

`AuthGuard` protege su `keycloak.init()` con un `useRef` (StrictMode monta dos veces) y llena el
store con un solo `setAuth(...)` atómico. El bypass (`VITE_AUTH_BYPASS=true` → `initDevAuth()`)
sustituye ese bloque; `src/config/env.ts` lo bloquea en builds de producción.

## React Query

Query keys **jerárquicas, empezando por el nombre de la feature**:

```
['fichas-perfil', 'coordinador', page]
['fichas-perfil', 'estudiante', estudianteId, 'mi-ficha']
['fichas-perfil', fichaId, 'estudiantes']
['fichas-perfil', 'estados-ficha']
```

Eso permite invalidar por prefijo. Una clave plana o inventada rompe la invalidación en silencio.

Tras una mutación, tres estrategias y se elige a propósito: `invalidateQueries` por prefijo (el
default), `setQueryData` (si la respuesta ya trae lo justo — `useAsignarEstudiante`,
`useMiFichaPerfil`), o nada.

Catálogos cerrados: `staleTime: Infinity, gcTime: Infinity` (`useEstadosFicha`).
`enabled: !!id` cuando la query depende de un dato que puede faltar (`useMiFichaPerfil` espera al `sub`).

## Contrato con el backend

`docs/integracion-backend-frontend.md` es la **fuente autoritativa** del mapeo servicio ↔ endpoint,
con el estado de cada uno. Léelo antes de tocar un service.

- `VITE_API_URL` **ya incluye el `/api`**: una ruta de service empieza en `/fichas-perfil`.
- **Sin envelope de éxito.** Solo están estandarizados `Page<T>` y `ApiError`
  (`src/shared/models/api-response.ts`). 400 y 422 traen `fieldErrors[]`.
- `docs/fichas-perfil/fichas-perfil-openapi.yaml` es el diseño **objetivo**, no el contrato vigente.
  No planifiques contra él.

**Endpoints pendientes.** Algunos métodos apuntan a endpoints que el backend no expone; llevan
`// Pendiente:` bajo su propio separador. No los borres ni les cambies el verbo sin verificar primero
contra el controller real — varias rutas pendientes de dos segmentos responden **405 y no 404** por
colisión con `PATCH /fichas-perfil/{id}`, y eso significa que el endpoint no existe. **No cites un
número fijo de cuántos son** (ni aquí ni en un plan): se desactualiza solo — cuenta los que hay en el
service en el momento de leer esto.

La UI degrada con aviso, no con un desplegable vacío: `<AvisoNoDisponible recurso="…" />` más envío
deshabilitado (`RegistrarFichaPerfil`, `CambiarAsesorForm`, `AsignarEstudianteForm`).

### Verificar Nivel 2 es tres pasos, no uno

"Confirmar contra el repo hermano" no es solo mirar que la ruta exista. Un método puede tener la ruta
perfecta y seguir roto porque nadie miró el resto. Verifica los tres, por separado:

1. **Ruta y verbo** coinciden con el `@GetMapping`/`@PostMapping`/`@PatchMapping`/`@DeleteMapping`
   real (incluida la base del `@RequestMapping` del controller).
2. **Cada campo del body de la petición** coincide con el record/DTO real — nombre exacto, no una
   traducción adivinada. Si el backend espera `{ estudiantes: string[] }`, enviar `{ idEstudiante }`
   compila en el frontend y falla en runtime.
3. **Cada campo de la respuesta** coincide con el DTO real, incluyendo la forma: un campo puede venir
   plano en el backend (`tipoItem: string` + `tipoItemNombre: string`) y anidado en el modelo del
   frontend (`tipoItem: { id, nombre }`) — ahí la traducción va en el service, nunca copiando el shape
   tal cual. Un objeto único en el modelo cuando el backend devuelve una **lista** es el mismo error:
   confírmalo en el controller (`ResponseEntity<List<...>>` vs `ResponseEntity<...>>`), no lo asumas
   por el nombre del método.

Un método puede pasar el paso 1 y fallar en el 2 o el 3 sin que ningún error de compilación lo avise
— TypeScript no valida shapes contra una API real. La única forma de atraparlo es abrir el DTO.

### Los `// Pendiente` no se re-verifican solos

Backend entrega HU sin avisarle a este repo. Antes de planificar una HU nueva en una feature que ya
tiene service (hoy, `fichas-perfil`), corre un grep de `// Pendiente:` en su archivo y cruza cada uno
contra `docs/hus/validaciones/` en `arquisoft-uco/arquisoft-docs` (Nivel 0 de `gh-docs-reader`). Un
`// Pendiente` cuya HU ya aparece con `Veredicto: APROBADO` ahí es candidato a corregirse ya mismo —
verificándolo con los tres pasos de arriba —, no a dejarlo marcado indefinidamente. No asumas que un
comentario de una sesión anterior sigue siendo cierto.

## Superficie compartida

Antes de crear algo en `src/shared/`, comprueba que no exista ya:

| Ruta | Contenido |
|---|---|
| `shared/models/api-response.ts` | `Page<T>`, `ApiResponse<T>`, `ApiError`, `FieldError` |
| `shared/models/rol.ts` | Enum `Rol`, `ETIQUETAS_ROL`, `ICONOS_ROL` |
| `shared/utils/api-error.ts` | `getApiErrorMessage`, `getApiErrorStatus`, `isApiErrorWithStatus`, `hasApiErrorCode`, `getApiFieldErrors`, `classifyApiError` |
| `shared/utils/monitoring.ts` | `captureError`, `captureHttpError` — único punto de integración con Sentry |
| `shared/validation/` | `LIMITES`, `MENSAJES_VALIDACION`, regex, builders Zod; barril en `index.ts` |
| `shared/hooks/useToast.ts` | Singleton `toast.success/info/debug/error`, usable fuera de React |
| `shared/stores/toastStore.ts` | Store del toaster, duración por nivel |
| `shared/components/` | `AppLoader`, `AvisoNoDisponible`, `ChunkErrorBoundary`, `ComingSoon`, `ConfirmDialog`, `ForbiddenPage`, `PageSkeleton`, `RootErrorBoundary`, `RouteErrorPage`, `Toaster` |
| `test-utils/` | `render` con providers, `keycloak.mock`, `store.utils`, `setup` |

Un componente sube a `src/shared/components/` solo con **dos consumidores de features distintas**.
Con uno se queda en `features/{feature}/components/`.
