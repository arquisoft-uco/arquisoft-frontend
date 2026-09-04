---
name: arquisoft-frontend-arquitectura
description: Arquitectura real de Arquisoft Frontend (React 19 + TypeScript + Vite) — capas de una feature, flujo models → services → hooks → components, enrutamiento perezoso, guards, capa HTTP única, stores de Zustand y contrato con el backend. Cargar antes de planificar, implementar, testear o validar cualquier HU/HT. El contexto de referencia es siempre fichas-perfil.
---

# Skill: arquisoft-frontend-arquitectura

**Esta skill es la fuente de verdad de arquitectura para agentes.** `CLAUDE.md` es un índice
operativo (comandos, variables de entorno, resumen del stack) y remite aquí; si discrepan, gana esta
skill. Para nomenclatura, formularios, validación, accesibilidad, design tokens, manejo de errores y
testing, ver la skill `arquisoft-frontend-estandares`.

**Regla de esta skill:** ningún ejemplo se pega como bloque de código largo. Cada regla apunta al
archivo real de `fichas-perfil` — la única feature completa del proyecto y el patrón a copiar. Ábrelo
con `Read` cuando necesites el detalle exacto.

## Qué hay implementado y qué no

Solo **una** de las diez features enrutadas tiene código de negocio:

| Feature | Estado |
|---|---|
| `fichas-perfil` | **Completa** — la referencia. 5 vistas por rol, 17 hooks, 1 service, 14 archivos de modelos |
| `dashboard` | Página propia, sin service ni hooks |
| `seleccionar-rol` | Página propia (selección de rol activo), sin service |
| `artefactos`, `biblioteca`, `entregables`, `evaluaciones`, `mapas-ruta`, `proyectos-grado`, `repositorio-artefactos`, `solicitudes` | **Stubs** — renderizan `<ComingSoon />`. Sus carpetas `components/`, `models/` y `services/` existen solo con un `.gitkeep` |

Consecuencia práctica: **cuando planifiques o implementes una feature nueva, el único molde válido
es `fichas-perfil`**. Un stub no enseña nada salvo dónde va el archivo de página. Y dentro de
`fichas-perfil` hay dos piezas que tampoco son molde: `AdministradorView` y
`asesor-ficha/DetalleFichaAsesor` son también `ComingSoon`.

## Dirección de dependencias (no negociable)

```
models  ←  services  ←  hooks  ←  components
```

Nadie la verifica automáticamente —no hay una tarea equivalente a `verificarCapasHexagonales` del
backend—, así que la sostienen la revisión y los checks de `@4a-validator-analyze`. Las tres reglas
que la definen:

- **Un componente nunca importa `apiClient`.** Si un `.tsx` importa `../../../api/axiosInstance`, la
  llamada está en la capa equivocada: baja al service y expón un hook.
- **Un hook nunca devuelve JSX** y no importa `lucide-react` ni componentes. Devuelve datos, estados
  y funciones.
- **Un service nunca importa React**, ni `@tanstack/react-query`, ni un store. Es una función pura de
  entrada → `Promise<T>`.

`models/` es el sumidero: solo tipos, sin importar nada de las otras tres capas.

## El árbol real de una feature — `fichas-perfil`

```
src/features/fichas-perfil/
├── FichasPerfil.tsx              # Página: destino de ruta, resuelve la vista por rol
├── components/
│   ├── {Rol}View.tsx             # Una por rol — CoordinadorView, EstudianteView, …
│   ├── RegistrarFichaPerfil.tsx  # Componentes compartidos entre vistas
│   └── {rol}/                    # Subcarpeta por rol para lo que solo ese rol ve
│       └── ...Panel.tsx | ...Table.tsx | ...Form.tsx
├── hooks/
│   └── use{Accion|Recurso}.ts    # Uno por caso de uso — useRegistrarFichaPerfil, useEstadosFicha
├── models/
│   ├── {Entidad}.ts              # Un archivo por entidad expuesta
│   ├── {Accion}{Entidad}Request.ts / Response.ts
│   └── fichas-perfil.ts          # Barril del dominio: catálogos, entidades y DTOs menores
└── services/
    └── fichasPerfilService.ts    # UN solo objeto plano, un método por endpoint
```

`CLAUDE.md` documenta el layout como `components/ · models/ · services/`. El árbol real tiene además
`hooks/`, y esa carpeta es obligatoria: **el árbol real gana sobre el resumen de `CLAUDE.md`.**

**Un service por feature, no uno por entidad.** `fichasPerfilService` cubre fichas, ítems,
evaluaciones, estados y estudiantes vinculados — todo el bounded context de fichas del backend.
Partirlo por entidad multiplicaría los imports de `apiClient` sin ganar nada.

**Un hook por caso de uso, no uno por endpoint.** `useMiFichaPerfil` compone una `useQuery` con una
`useMutation` y devuelve las dos, porque el componente que las consume las necesita juntas.
`useEstadosFicha` es una sola `useQuery` porque no hay más.

## Fan-out por rol: la página elige la vista

`FichasPerfil.tsx` es el patrón canónico y tiene tres ramas, en este orden:

1. `useRolActivo()` devuelve `null` → `<Navigate to="/seleccionar-rol" replace />`.
2. El rol activo no está en el mapa `VIEW_POR_ROL` → `<Navigate to="/forbidden" replace />`.
3. Hay vista → se renderiza.

El mapa se declara **a nivel de módulo**, fuera del componente, con las claves del enum `Rol`
(`Record<string, React.ComponentType>`). Nunca un `switch` dentro del cuerpo del componente ni una
cadena de ternarios.

Esta comprobación **no sustituye** al `RoleGuard` de la ruta: el guard decide quién entra a
`/fichas-perfil`, el mapa decide qué ve dentro. Los dos existen y los dos se declaran.

## Enrutamiento

Todo vive en `src/router.tsx` y tiene tres capas anidadas:

- `AuthGuard` (ruta de layout, con `errorElement: <RouteErrorPage />`) inicializa Keycloak una vez y
  renderiza `<AppLoader />` mientras tanto.
- `AppLayout` (shell: `Header` + `Sidebar` + `<Suspense fallback={<PageSkeleton />}>` dentro de un
  `ChunkErrorBoundary`).
- Las rutas de feature, **todas perezosas** (`lazy(() => import(...))`).

`/forbidden` cuelga de la raíz, **fuera** de `AuthGuard`: un 403 no debe volver a pedir sesión.

**Las restricciones por rol no se escriben en el router.** Se declaran una sola vez en
`src/layout/nav-items.ts` (`NAV_ITEMS[].roles`), de donde se deriva `ROLES_POR_RUTA`, y el helper
`guarded(path, element)` del router envuelve en `<RoleGuard>` solo las rutas que aparecen ahí.
Añadir una ruta protegida = añadir su `NavItem` con `roles`; escribir el `<RoleGuard>` a mano en el
router es duplicar la declaración y hace que el sidebar y la ruta puedan divergir.

`export const router` está exportado a propósito: el interceptor de Axios lo importa **de forma
dinámica** para navegar fuera del árbol de React. Un import estático ahí crea un ciclo
`router → features → axiosInstance → router`.

## Capa HTTP — una sola instancia

`src/api/axiosInstance.ts` exporta la **única** instancia de Axios del proyecto. Importar `axios`
directamente en un service es un hallazgo bloqueante: se pierden el token, el refresco y el ruteo de
errores.

Lo que hace, en orden:

1. **Request:** adjunta `Authorization: Bearer` leyendo `useAuthStore.getState().token` — `getState()`,
   nunca un hook: el interceptor corre fuera del árbol de React.
2. **401:** mutex de refresco compartido (`let refreshPromise`) para que N respuestas 401
   concurrentes disparen **un solo** `keycloak.updateToken(-1)`; marca `config._retry` para no
   reintentar en bucle y reintenta la petición con el token nuevo. Si el refresco falla, `logout`.
3. **403:** `import('../router').then(({ router }) => router.navigate('/forbidden'))`.
4. Siempre: `monitoring.captureHttpError(status, url, method)` y `Promise.reject(error)`.

**El interceptor no traga el error.** Todo fallo llega al service, del service a React Query y de ahí
a `isError`/`onError`. Un `catch` en un service que devuelve `[]` o `null` es un hallazgo: esconde el
fallo y deja a la UI sin cómo distinguir "vacío" de "roto".

## Autenticación y roles

| Store | Persistencia | Qué guarda |
|---|---|---|
| `useAuthStore` (`src/auth/authStore.ts`) | **Solo en memoria** — sin middleware `persist` | `isInitializing`, `authenticated`, `token`, `tokenParsed`, `username` |
| `useRoleStore` (`src/auth/roleStore.ts`) | `localStorage`, clave `arquisoft_rol_activo`, vía un adaptador `safeStorage` con `try/catch` | Únicamente el string del rol seleccionado |

**Nada sensible se escribe jamás en `localStorage` ni `sessionStorage`.** El JWT vive en memoria
(Zustand) y en la instancia de `keycloak-js`. El `safeStorage` existe porque `localStorage` lanza en
navegación privada de Safari y con la cuota llena; copia ese patrón si algún día persistes otra cosa.

**Los roles se leen de `realm_access.roles`,** no de `resource_access[clientId].roles`. Lo resuelve
`parseRoles()` en `authStore.ts`, y `devAuth.ts` construye su `tokenParsed` falso con la misma forma.
Un rol del JWT que no esté en el enum `Rol` se descarta en `useRolesDisponibles()`.

**El rol activo es derivado, no almacenado** (`useRolActivo()` en `src/hooks/useAuth.ts`): si el rol
guardado sigue estando en el JWT se usa; si el usuario tiene exactamente uno, se auto-selecciona; si
no, `null` y hay que pasar por `/seleccionar-rol`. Nunca leas `useRoleStore` directamente desde una
feature — usa `useRolActivo()` / `useRolesDisponibles()` / `useHasRole()`.

**El frontend no es la línea de seguridad final.** Ocultar un botón o redirigir a `/forbidden` es UX:
el backend valida cada request contra el JWT y su client role. Consecuencia práctica al planificar:
un control de acceso que solo existe en el cliente **no** cumple un criterio de aceptación de
seguridad, y omitir el guard tampoco abre un agujero — abre una mala experiencia.

`AuthGuard` protege su `keycloak.init()` con un `useRef` porque React StrictMode monta dos veces, y
llena el store con **un solo `setAuth(...)` atómico** para que no haya un render intermedio con
sesión a medias. El bypass de desarrollo (`VITE_AUTH_BYPASS=true` → `initDevAuth()`) sustituye ese
bloque entero; `src/config/env.ts` lo bloquea a nivel de módulo si el build es de producción.

## React Query: claves y cachés

Las query keys son **jerárquicas y empiezan por el nombre de la feature**:

```
['fichas-perfil', 'coordinador', page]
['fichas-perfil', 'estudiante', estudianteId, 'mi-ficha']
['fichas-perfil', fichaId, 'estudiantes']
['fichas-perfil', 'estados-ficha']
```

Eso es lo que permite que una mutación invalide por prefijo: `invalidateQueries({ queryKey:
['fichas-perfil'] })` alcanza todo lo de la feature. Una clave plana o inventada rompe esa
invalidación en silencio — la UI se queda con datos viejos y no falla nada.

Tres formas de refrescar tras una mutación, y se eligen a propósito:

- `invalidateQueries` por prefijo — el caso por defecto (`useRegistrarFichaPerfil`).
- `setQueryData` — cuando la respuesta ya trae lo justo para actualizar la caché sin ir al servidor
  (`useAsignarEstudiante` inserta el vínculo devuelto; `useMiFichaPerfil` parchea el título).
- Nada — solo si la mutación no afecta a ninguna query montada.

**Los catálogos cerrados se cachean para siempre:** `staleTime: Infinity, gcTime: Infinity`
(`useEstadosFicha`). Estados, tipos de ítem y estados de evaluación no cambian durante una sesión.

`enabled: !!id` cuando la query depende de un dato que puede no estar todavía
(`useMiFichaPerfil` espera al `sub` del token).

## Contrato con el backend

`docs/integracion-backend-frontend.md` es la **fuente autoritativa del mapeo actual** entre
`fichasPerfilService` y los endpoints reales. Léelo antes de tocar un service: dice, método por
método, cuál está implementado y cuál está pendiente.

- La URL base es `VITE_API_URL` e **incluye ya el `/api`** del `context-path` del backend. Una ruta
  de service empieza después: `/fichas-perfil`, nunca `/api/fichas-perfil`.
- **No hay envelope de éxito global.** El backend devuelve el DTO directo. Solo están estandarizados
  `Page<T>` (paginación) y `ApiError` (errores), ambos en `src/shared/models/api-response.ts`.
- 422 trae `fieldErrors[]` (validación de dominio); 400 también. Los helpers de
  `src/shared/utils/api-error.ts` son la única forma de leerlos.
- `docs/fichas-perfil/fichas-perfil-openapi.yaml` es el diseño **objetivo**, no el contrato vigente:
  su propia cabecera remite a `integracion-backend-frontend.md`. No planifiques contra él.

### Endpoints pendientes y degradación en la UI

Trece métodos de `fichasPerfilService` apuntan a endpoints que el backend todavía no expone; están
marcados con un comentario `// Pendiente:` y agrupados bajo su propio separador. **No los borres ni
los "arregles"**: la UI que los consume sigue existiendo y el comentario es la trazabilidad.

Cuando un catálogo no está disponible, la UI **degrada con aviso, no con un desplegable vacío**:
`<AvisoNoDisponible recurso="asesores" />` (`src/shared/components/AvisoNoDisponible.tsx`) más el
botón de envío deshabilitado. Está aplicado en `RegistrarFichaPerfil`, `CambiarAsesorForm` y
`AsignarEstudianteForm`. Si añades un formulario que dependa de un catálogo pendiente, repite ese
patrón — el usuario tiene que saber por qué no puede continuar.

Varias rutas pendientes de dos segmentos responden **405, no 404**, porque colisionan con el
`PATCH /fichas-perfil/{id}` del backend. Un 405 ahí significa "el endpoint no existe", no "existe con
otro verbo": no cambies el método HTTP para "arreglarlo".

## Superficie compartida — qué existe ya y no se reescribe

| Ruta | Qué aporta |
|---|---|
| `src/shared/models/api-response.ts` | `Page<T>`, `ApiResponse<T>`, `ApiError`, `FieldError` |
| `src/shared/models/rol.ts` | Enum `Rol` + `ETIQUETAS_ROL` + `ICONOS_ROL` |
| `src/shared/utils/api-error.ts` | `getApiErrorMessage`, `getApiErrorStatus`, `isApiErrorWithStatus`, `hasApiErrorCode`, `getApiFieldErrors`, `classifyApiError` |
| `src/shared/utils/monitoring.ts` | `captureError` / `captureHttpError` — único punto de integración con Sentry el día que se añada |
| `src/shared/validation/` | `LIMITES`, `MENSAJES_VALIDACION`, `EMAIL_REGEX`/`UUID_REGEX`, builders Zod. Barril en `index.ts` |
| `src/shared/hooks/useToast.ts` | Singleton `toast.success/info/debug/error` — usable fuera de React |
| `src/shared/stores/toastStore.ts` | Store del toaster; duración por nivel |
| `src/shared/components/` | `AppLoader`, `AvisoNoDisponible`, `ChunkErrorBoundary`, `ComingSoon`, `ConfirmDialog`, `ForbiddenPage`, `PageSkeleton`, `RootErrorBoundary`, `RouteErrorPage`, `Toaster` |
| `src/test-utils/` | `render` con providers, `keycloak.mock`, `store.utils`, `setup` |

**Antes de crear un componente compartido, `grep` esta lista.** Un segundo diálogo de confirmación o
un segundo esqueleto de carga es duplicación, no una variante.

**Un componente sube a `src/shared/components/` cuando lo consumen dos features distintas.** Con un
solo consumidor se queda en `features/{feature}/components/` — igual que en el backend un `shared:`
con un único cliente es un contexto mal ubicado.

## Frontera entre `src/shared/` y `src/features/`

`src/shared/` es transversal y **no conoce ninguna feature**: no importa nada de
`src/features/**`. La dirección es de un solo sentido, igual que la de capas. Si un componente
compartido necesita un tipo de una feature, el tipo está mal ubicado o el componente no es
compartido.

`src/auth/`, `src/api/`, `src/config/`, `src/guards/`, `src/hooks/`, `src/layout/` son
infraestructura de aplicación: los consume `src/features/**`, nunca al revés.
