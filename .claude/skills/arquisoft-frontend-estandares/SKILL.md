---
name: arquisoft-frontend-estandares
description: Estándares de código de Arquisoft Frontend — nomenclatura, orden interno de un componente, formularios con react-hook-form + Zod, validación compartida alineada al backend, manejo de errores de API, accesibilidad, design tokens de Tailwind, testing con Vitest + Testing Library y git. Cargar junto con arquisoft-frontend-arquitectura antes de implementar, testear o validar cualquier HU/HT.
---

# Skill: arquisoft-frontend-estandares

Complementa a `arquisoft-frontend-arquitectura` (esa cubre capas y estructura; esta cubre reglas de
código transversales). **Las dos juntas son la fuente de verdad**: `CLAUDE.md` es un índice operativo
que remite aquí, y si discrepan gana la skill. Cada regla referencia un archivo real de
`fichas-perfil` o de `src/shared/` en vez de un snippet — ábrelo con `Read` si necesitas el código
exacto.

## Nomenclatura

**Español para los términos de negocio, inglés para los sufijos técnicos.** `RegistrarFichaPerfil`,
`useCambiarAsesor`, `fichasPerfilService`, `EstudianteVinculado`.

| Artefacto | Convención | Ejemplo real |
|---|---|---|
| Página de feature | `PascalCase.tsx`, mismo nombre que la carpeta en PascalCase | `FichasPerfil.tsx` |
| Componente | `PascalCase.tsx`, `export default function` | `FichasPerfilTable.tsx` |
| Vista por rol | `{Rol}View.tsx` en `components/` | `CoordinadorView.tsx` |
| Panel/tabla/formulario de un rol | `components/{rol}/{Concepto}{Panel\|Table\|Form}.tsx` | `coordinador/EstudiantesVinculadosPanel.tsx` |
| Hook | `use{Accion\|Recurso}.ts`, `export function` (no default) | `useRegistrarFichaPerfil.ts` |
| Service | `{feature}Service.ts`, objeto plano exportado con `export const` | `fichasPerfilService.ts` |
| Modelo | `PascalCase.ts` con la interfaz del mismo nombre | `FichaPerfilAsesor.ts` |
| Request/Response | `{Accion}{Entidad}Request.ts` / `{Entidad}{Estado}Response.ts` | `AsignarEstudianteRequest.ts`, `FichaPerfilCreadaResponse.ts` |
| Store Zustand | `{concepto}Store.ts`, hook `use{Concepto}Store` | `toastStore.ts` → `useToastStore` |
| Test | `{ArchivoBajoPrueba}.test.ts(x)`, junto al archivo que prueba | `AvisoNoDisponible.test.tsx` |

**Sin JSDoc.** Es regla del proyecto (`CLAUDE.md`): el código se autodocumenta por el naming, y los
bloques `/** ... */` no se agregan. El código anterior a esa decisión los conserva —`axiosInstance.ts`,
`keycloak.ts`, `api-error.ts`— y **no se migra en masa**; simplemente no escribas ninguno nuevo. Un
comentario de una línea sí es legítimo cuando explica un *porqué* que el nombre no puede llevar
(el `// StrictMode monta dos veces` de `AuthGuard`).

## Orden interno de un componente

```tsx
// 1. Imports
// 2. Constantes del módulo (fuera del componente)
// 3. const schema = z.object({ ... }) / type FormValues
// 4. interface Props { ... }
// 5. export default function NombreComponente({ prop }: Props) {
//      6. Hooks (useState, useQuery/useMutation, hooks del proyecto, useForm)
//      7. Variables derivadas
//      8. Handlers (function handleX / verbo de acción)
//      9. return ( JSX )
//    }
```

Las constantes y el schema van **fuera** del componente: dentro se recrean en cada render y el
`zodResolver` deja de ser estable. `PAGE_SIZE` en `useFichasPerfilCoordinador` y `VIEW_POR_ROL` en
`FichasPerfil.tsx` son los ejemplos.

Los handlers se declaran como `function` nombrada dentro del componente, no como `const` con arrow,
salvo cuando la función es un `useCallback` (`AppLayout.closeSidenav`).

## Tamaño y composición

**Un componente, una responsabilidad.** Pasadas ~150 líneas, extrae sub-componentes: es el umbral en
el que la feature de referencia se partió en `{Rol}View` → `{Concepto}Panel` / `Table` / `Form`.
Cuando un componente mezcla fetch + transformación + estado local, lo que sale no es un
sub-componente sino un **hook** de la feature.

Dos detalles de renderizado que rompen cosas en silencio:

- **`key` estable, nunca el índice del array.** Con el índice, React reutiliza el nodo equivocado al
  insertar o quitar un elemento, y el estado local de una fila se cuela en otra. En este proyecto
  siempre hay un `id` (`fichas.map((ficha) => <… key={ficha.id}>`).
- **Nunca mutes estado.** Un `push`/`splice` sobre lo que devuelve `watch(...)` o `useQuery` no
  dispara render. Se copia: `setValue('idEstudiantes', [...idEstudiantes, id])`,
  `prev.filter(...)`.

## Dónde vive cada pieza de estado

| Situación | Solución |
|---|---|
| 1-2 valores de UI local (acordeón abierto, diálogo visible) | `useState` |
| Datos que vienen del servidor | `useQuery` / `useMutation` dentro de un hook de la feature |
| Sesión y rol | `useAuthStore` / `useRoleStore`, **leídos por los hooks de `src/hooks/useAuth.ts`** |
| Compartido entre features sin ser del servidor | Store de Zustand en `src/shared/stores/` |

**Nunca `useEffect` + `axios`/`fetch` para cargar datos.** Eso es lo que existe React Query para
evitar: pierdes caché, deduplicación, `isLoading`, `isError` y reintentos.

Un `useEffect` sí es legítimo para sincronizar con algo externo al React tree: el
`keycloak.init()` de `AuthGuard`, el listener de `Escape` de `AppLayout`, o el `setValue` de un prop
que llega tarde en `RegistrarFichaPerfil`.

## Services

- Importan `apiClient` de `src/api/axiosInstance.ts`. **Nunca `axios` directamente.**
- Objeto plano con métodos (`export const xService = { ... }`), **nunca una clase**.
- Cada método tipa la respuesta con el genérico y desenvuelve: `.then((r) => r.data)`. Los `204`
  devuelven `Promise<void>` con `.then(() => undefined)`.
- **No atrapan errores.** Los propagan; los maneja React Query.
- Las respuestas paginadas se tipan `Page<T>` de `src/shared/models/api-response.ts`.
- Cuando el nombre del campo del backend no coincide con el del modelo del frontend, **la traducción
  ocurre aquí**, en el literal del body, no en el componente:
  `{ tituloProyecto: req.tituloProyecto, asesorFicha: req.asesorFichaId, estudiantes: req.estudiantesIds }`.
  Es el único sitio donde el vocabulario del backend y el del frontend se tocan.
- Un método cuyo endpoint el backend aún no expone lleva un comentario `// Pendiente: {motivo}` y
  vive bajo el separador de pendientes del archivo. Ver `arquisoft-frontend-arquitectura`.

## Modelos

Solo `interface`/`type`. **Sin lógica, sin funciones, sin valores por defecto.**

Interfaces pequeñas y específicas (ISP): `FichaPerfil` tiene tres campos y compone `Asesor`; no
existe una interfaz gigante con veinte campos opcionales. Un campo opcional (`?`) se declara solo
cuando el backend realmente puede omitirlo — no "por si acaso".

Los catálogos y DTOs menores del dominio se agrupan en el barril `models/{feature}.ts`
(`fichas-perfil.ts`); las entidades con vida propia y los Request/Response de un caso de uso tienen
archivo propio. El criterio: si un componente lo importa por su nombre, merece archivo.

Los enums se usan solo para valores que el sistema reconoce y compara (el enum `Rol`). Para un
catálogo que viene del backend, una `interface { id, nombre, descripcion }` — nunca un enum
hardcodeado que se desincronice de la base.

## Stores Zustand

- Patrón: `create<State>()((set) => ({ ... }))`; con persistencia, `create<State>()(persist(..., { name, storage }))`.
- `authStore` es **de solo lectura** desde las features. Solo `AuthGuard`, `devAuth` y el interceptor
  de Axios lo escriben.
- `roleStore` no se lee directo: se lee por `useRolActivo()` / `useRolesDisponibles()`.
- **`persist` solo cuando el dato debe sobrevivir a un refresh** y no es sensible. Hoy el único caso
  es el string del rol activo. Un token, un `tokenParsed` o cualquier dato personal **nunca** se
  persiste.
- Un store que se lee fuera del árbol de React se accede con `useStore.getState()`, nunca con el hook.

## Formularios

**3 o más campos → `react-hook-form` + Zod.** Con 1-2 campos, `useState` es aceptable.

```tsx
const schema = z.object({ titulo: textoRequerido(LIMITES.TITULO_PROYECTO_MAX) });
type FormValues = z.infer<typeof schema>;
const { register, handleSubmit, formState: { errors, isValid } } =
  useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { titulo: '' }, mode: 'onChange' });
```

- `defaultValues` siempre presente — sin ellos React pasa de input no controlado a controlado y
  avisa por consola.
- `mode: 'onChange'` cuando el botón de envío se deshabilita con `!isValid` (que es el patrón del
  proyecto).
- Un campo que no es un `<input>` nativo (lista de chips, selección múltiple) se maneja con
  `watch(...)` + `setValue(..., { shouldValidate: true })`, como los estudiantes de
  `RegistrarFichaPerfil`.
- Al cerrar o cancelar: `reset()` del formulario **y** `reset()` de la mutación (`resetMutation`),
  para no dejar el estado de error de la mutación anterior colgando.

## Validación compartida — alineada al backend

`src/shared/validation/` centraliza **solo lo reutilizable y alineado a las restricciones del
backend**. Las reglas propias de un formulario concreto se quedan en su `z.object(...)`.

| Archivo | Contenido |
|---|---|
| `limites.ts` | `LIMITES` — espejo de las restricciones `@Size` del backend: `TITULO_PROYECTO_MAX = 100`, `ITEM_CONTENIDO_MAX = 7000`, `ESTADO_EVALUACION_ID_MAX = 50`, `ESTUDIANTES_MAX = 3` |
| `expresiones-regulares.ts` | `EMAIL_REGEX`, `UUID_REGEX` |
| `mensajes-validacion.ts` | `MENSAJES_VALIDACION` — textos en español, algunos como función (`longitudMaxima(max)`) |
| `validadores-zod.ts` | Builders: `textoRequerido(max)`, `opcionRequerida()`, `emailValido()`, `uuidValido()`, `listaConMaximo(max)` |
| `index.ts` | Barril — importa siempre desde `'../../../shared/validation'`, no de un archivo suelto |

**Un número mágico en un `.max(...)` de Zod es un hallazgo.** Si el límite lo impone el backend, va
en `LIMITES` y el `maxLength` del `<input>` lo lee de ahí también. `validadores-zod.test.ts` fija
esos cuatro valores con asserts explícitos: cambiarlos sin actualizar el backend rompe el test, que
es justo lo que se busca.

**Un mensaje de error repetido en dos formularios va a `MENSAJES_VALIDACION`.** Uno específico de un
campo concreto (`'Selecciona un asesor'`) se queda en su schema.

## Estados de carga y error

Toda `useQuery` consumida por un componente maneja **las dos** ramas antes del contenido:

```tsx
if (isLoading) return <PageSkeleton />;          // o el spinner con role="status" + sr-only
if (isError)   return <div role="alert">…</div>;
```

Formas del proyecto, en orden de preferencia:

- Página completa cargando → `<PageSkeleton />` (ya es el `fallback` del `<Suspense>` del layout).
- Sección dentro de una página → spinner con `role="status"`, `aria-live="polite"`,
  `aria-busy="true"` y un `<span className="sr-only">` que diga qué carga
  (`ConsultarFichasPerfilCoordinador`).
- Error → contenedor con `role="alert"` y texto accionable. Nunca `error.message` crudo de Axios: usa
  `getApiErrorMessage(err, 'mensaje de respaldo en español')`.

Una lista vacía **no es un estado de error**: es una fila `<td colSpan={n}>` con el texto
"No hay … registradas".

## Errores de API

`src/shared/utils/api-error.ts` es la única forma de inspeccionar un error de Axios. No escribas
`error.response.data.message` a mano en un componente.

| Helper | Cuándo |
|---|---|
| `getApiErrorMessage(err, fallback)` | El caso por defecto — el texto del `ErrorResponseDTO`, con respaldo para errores de red |
| `getApiFieldErrors(err)` | 400/422 con `fieldErrors[]`, para pintarlos junto a cada campo |
| `hasApiErrorCode(err, 'CODIGO')` | Distinguir subtipos de `DomainException` sin depender solo del status |
| `isApiErrorWithStatus(err, 404)` | Tratar un 404 como "vacío" en vez de como fallo |
| `classifyApiError(err)` | Ramificar la UI por categoría (`'network'`, `'domain'`, `'forbidden'`, …) |

**401 y 403 no se manejan en la feature:** el interceptor ya refresca el token o navega a
`/forbidden`. Un `if (status === 401)` en un hook es duplicación.

## Notificaciones al usuario

`toast` de `src/shared/hooks/useToast.ts` — es un singleton, así que funciona igual dentro y fuera de
un componente. Cuatro niveles: `success` (4 s), `info` (4 s), `debug` (8 s), `error` (6 s).

Firma: `toast.error(titulo, mensaje?)`. El título es corto y en español ("Error al registrar la
ficha"); el mensaje sale de `getApiErrorMessage(err, '…')`.

**El toast va en el `onSuccess`/`onError` del `mutate`, no en el `catch` de un service.** Puede vivir
en el hook (`useMiFichaPerfil`) o en el `mutate(..., { onSuccess, onError })` del componente
(`RegistrarFichaPerfil`); elige uno y no los dupliques, o el usuario ve dos toasts.

Una acción destructiva pasa por `<ConfirmDialog />` (`variante: 'peligro' | 'advertencia'`) antes de
mutar. No uses `window.confirm`.

## Accesibilidad — obligatoria, no opcional

- `role="alert"` en todo mensaje de error; `role="status"` + `aria-live="polite"` en lo que cambia
  solo; `aria-busy="true"` mientras carga.
- `aria-label` en todo botón que solo lleva icono; los iconos de Lucide decorativos van con
  `aria-hidden`.
- Un input con error: `aria-invalid={!!errors.campo}` + `aria-describedby` apuntando al `id` del
  `<p role="alert">` que lo explica. `RegistrarFichaPerfil` es la referencia completa.
- `<label htmlFor>` con `id` explícito en cada campo; si el control no es un input (un grupo de
  chips), el contenedor lleva `aria-labelledby` al `id` del texto que lo titula.
- Un botón que expande contenido lleva `aria-expanded` y un `aria-label` que diga qué hará
  (`FichasPerfilTable`).
- Tablas: `<table aria-label="…">` y `<th scope="col">`.
- `<button type="button">` **siempre** salvo el que envía el formulario. Un `<button>` sin `type`
  dentro de un `<form>` envía.

## Estilos y design tokens

Tailwind v4 con configuración CSS-first: los tokens se declaran en `@theme` dentro de
`src/tailwind.css` y `src/index.css` importa ese archivo. **No hay `tailwind.config.js`** — añadir uno
es un hallazgo.

Usa siempre las clases semánticas, nunca un color crudo de la paleta de Tailwind:

| Rol | Clases |
|---|---|
| Superficies | `bg-surface`, `bg-surface-secondary`, `bg-surface-elevated`, `bg-background` |
| Texto | `text-on-surface`, `text-on-surface-secondary` |
| Bordes | `border-border`, `border-border-strong` |
| Marca | `bg-primary`, `text-primary`, `bg-primary-hover`, `text-primary-foreground`, `bg-primary-muted` |
| Secundario / terciario | `*-secondary*`, `*-tertiary*` con la misma familia de sufijos |
| Peligro | `bg-danger`, `text-danger`, `text-danger-foreground` |
| Navegación | `bg-nav-active-bg`, `text-nav-active-text`, `bg-nav-hover-bg` |
| Sombras | `shadow-card`, `shadow-card-hover`, `shadow-dropdown`, `shadow-lg` |
| Animaciones de entrada | `animate-fade-up`, `animate-fade-in`, `animate-slide-in-left`, `animate-scale-in` |

`text-red-500` aparece hoy en el asterisco de campo requerido de `RegistrarFichaPerfil`; es una
desviación conocida —lo correcto es `text-danger`— y no es precedente.

**No escribas CSS custom** fuera de `src/index.css` / `src/tailwind.css`. Nada de `style={{ ... }}`
salvo un valor calculado en tiempo de ejecución que no puede ser una clase.

Cuando una lista de clases es condicional, arma un array y únelo (`[...].join(' ')`, como
`AppLayout`), no concatenes strings con ternarios anidados.

## TypeScript

`strict: true`, `noUnusedLocals` y `noUnusedParameters` están activos: **una variable o un import sin
usar rompe `npm run lint` y por tanto el build**. Un parámetro que existe solo por posición se
prefija con `_` (`({ nombre: _n, email: _e, ...req })` en `useAsignarEstudiante`).

- `import type { ... }` para todo lo que solo se usa como tipo — `isolatedModules` está activo.
- Nunca `any`. Un error capturado se tipa `unknown` y se estrecha con los helpers de `api-error.ts`.
- Nada de `!` (non-null assertion) salvo donde el propio código acaba de garantizar la condición
  (`item.roles!` tras un `filter((item) => item.roles)`).
- Rutas de import relativas (`../../../shared/...`). No hay alias `@/` configurado; no lo introduzcas
  sin tocar también `tsconfig.app.json` y `vite.config.ts`.

Prettier: `printWidth: 100`, `singleQuote: true`. No hay ESLint en el proyecto — `npm run lint` es
`tsc --noEmit`, nada más.

## Testing

Vitest 4 + `@testing-library/react` + `@testing-library/jest-dom`, entorno `jsdom`, `globals: true`
(configurado en `vite.config.ts`, setup en `src/test-utils/setup.ts`).

- **Importa `render` de `src/test-utils/render.tsx`**, nunca de `@testing-library/react`: el wrapper
  envuelve en `QueryClientProvider` (con `retry: false`, `gcTime: 0`) + `MemoryRouter`. Acepta
  `{ initialPath }`. Reexporta todo testing-library, así que `screen`, `waitFor` y demás salen de ahí.
- Keycloak se mockea con `src/test-utils/keycloak.mock.ts` (importarlo ya aplica el `vi.mock`).
- Estado de sesión: `resetAllStores()`, `setAuthenticatedUser(...)`, `setActiveRole(rol)` de
  `src/test-utils/store.utils.ts`. **No escribas `useAuthStore.setState` a mano en un test.**
- Los services se mockean con `vi.mock('../services/{feature}Service')` cuando pruebas un hook o un
  componente. Un test **nunca** llega a la red ni mockea `axios` a mano.
- `describe`/`it` en **español**, describiendo comportamiento observable:
  `it('se anuncia como alerta accesible')`, no `it('renders correctly')`.
- Consulta por rol y texto accesible (`getByRole('alert')`, `getByRole('button', { name: /…/ })`),
  no por `data-testid` ni por clase CSS.
- Interacción con `@testing-library/user-event`, no con `fireEvent`.
- Sin JSDoc en tests, igual que en producción.

Las dos referencias vivas son `src/shared/components/AvisoNoDisponible.test.tsx` (componente) y
`src/shared/validation/validadores-zod.test.ts` (lógica pura). **No hay todavía un test de hook ni de
service en el repo**: el primero que escribas fija el patrón, así que ajústalo a estas reglas en vez
de improvisar uno nuevo.

### Anti-patrones — no generes estos tests

| # | Anti-patrón | Por qué |
|---|---|---|
| 1 | Test de un componente que solo devuelve JSX estático sin lógica | No hay comportamiento que romper |
| 2 | Un test por cada campo inválido del mismo schema Zod | Un solo test con varios `safeParse` cubre lo mismo |
| 3 | Assert sobre clases de Tailwind | Acopla el test al diseño; se rompe con cualquier retoque visual |
| 4 | Snapshot de un árbol completo | Nadie lo revisa y se aprueba a ciegas |
| 5 | Tests duplicados con el mismo "Act" y distintos asserts | Consolida en uno con varios asserts |
| 6 | Test de un modelo (`interface`) | No hay runtime que probar |
| 7 | Mock de `axios` en vez del service | Prueba el interceptor, no la feature |
| 8 | `waitFor` alrededor de un assert síncrono | Esconde el fallo real detrás de un timeout |

**Regla de consolidación:** 3+ tests con el mismo Act y distinto Assert → uno solo con varios asserts.

### Presupuesto orientativo

| Tamaño de HU | Tests esperados |
|---|---|
| Pequeña (1 vista, 1 hook) | 6-12 |
| Mediana (2-3 vistas o un formulario completo) | 12-25 |
| Grande (una feature nueva entera) | 25-45 |
| Más de 45 | revisa contra los anti-patrones — casi siempre sobre-testeo |

**No hay umbral de cobertura.** `@vitest/coverage-v8` no está instalado y `vite.config.ts` no declara
sección `coverage`. El gate real es el de CI: `npm run lint`, `npm test`, `npm run build`. No
inventes un porcentaje ni añadas la dependencia sin que el usuario lo pida.

## Verificación local — el gate

```bash
npm run lint     # tsc -p tsconfig.app.json --noEmit
npm test -- --run
npm run build    # type-check + bundle de producción
```

`npm test` sin `--run` entra en modo watch y no termina: **en un agente siempre `--run`**. Un solo
archivo: `npx vitest run src/features/<feature>/components/<Componente>.test.tsx`.

`npm run build` vuelve a hacer type-check, así que un `lint` verde y un `build` rojo significa que
falló el bundling (import inexistente, asset ausente), no los tipos.

`.github/workflows/ci.yml` corre esos tres pasos en cada push y en cada PR hacia `develop`/`main`,
con Node 20 y un `.env` sintético. Reportar verde habiendo corrido solo los tests es un error.

## Entorno

`.env.example` es la plantilla versionada; `.env.development.local` está en `.gitignore` y **nunca**
se commitea. `src/config/env.ts` valida al cargar el módulo y lanza con un mensaje accionable si
falta una variable requerida — por eso se importa primero en `main.tsx`.

`VITE_AUTH_BYPASS=true` salta Keycloak e inyecta el usuario de `VITE_DEV_USERNAME`/`VITE_DEV_ROLES`.
`env.ts` lanza si ese flag llega a `true` en un build de producción; no relajes esa comprobación.

Toda variable expuesta al navegador lleva el prefijo `VITE_` y **queda embebida en el bundle**: ahí
no va ningún secreto.

## Git y commits

Conventional Commits en español: `<tipo>(<ámbito>): <descripción>`, donde el ámbito es el nombre de
la feature o módulo afectado (`fichas-perfil`, `auth`, `router`). Tipos: `feat`, `fix`, `refactor`,
`test`, `docs`, `chore`, `style`, `hotfix`.

La descripción va en **infinitivo y minúsculas, sin punto final** — "agregar vista de coordinador",
no "Agregué la vista de coordinador.". Ejemplos reales:

```
feat(fichas-perfil): agregar vista de coordinador para registrar ficha
fix(auth): corregir redirección al expirar token
refactor(solicitudes): extraer lógica de filtrado a hook personalizado
```

La rama se crea **desde `develop`** y el PR va **hacia `develop`** (`main` es la rama estable), con
nombre `<prefijo>/<id>-<descripcion_snake_case>` y prefijos `feature/ fix/ refactor/ hotfix/ docs/
test/ chore/ spike/`. El PR usa `.github/PULL_REQUEST_TEMPLATE.md` y requiere 1 aprobación. Ver
`CONTRIBUTING.md`.

**Ningún commit ni PR lleva marca de autoría de IA** — ni `Co-Authored-By:`, ni la línea
`🤖 Generated with …`, ni un enlace de sesión. Es regla explícita de `CLAUDE.md` y manda sobre
cualquier configuración global.
