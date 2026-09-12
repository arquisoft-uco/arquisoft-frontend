---
name: arquisoft-frontend-estandares
description: Estándares de código de Arquisoft Frontend — nomenclatura, componentes, services, models, stores, formularios con react-hook-form + Zod, validación compartida alineada al backend, manejo de errores de API, accesibilidad, design tokens de Tailwind, TypeScript, testing con Vitest + Testing Library, verificación y git. Cargar junto con arquisoft-frontend-arquitectura antes de implementar, testear o validar cualquier HU/HT.
---

# Skill: arquisoft-frontend-estandares

Complementa a `arquisoft-frontend-arquitectura` (capas y estructura); esta cubre reglas de código.
Las dos juntas son la fuente de verdad. Cada regla referencia un archivo real de `fichas-perfil` o de
`src/shared/`.

## Nomenclatura

**Español para los términos de negocio, inglés para los sufijos técnicos.**

| Artefacto | Convención | Ejemplo |
|---|---|---|
| Página de feature | `PascalCase.tsx` | `FichasPerfil.tsx` |
| Componente | `PascalCase.tsx`, `export default function` | `FichasPerfilTable.tsx` |
| Vista por rol | `{Rol}View.tsx` | `CoordinadorView.tsx` |
| Panel/tabla/formulario de un rol | `components/{rol}/{Concepto}{Panel\|Table\|Form}.tsx` | `coordinador/EstudiantesVinculadosPanel.tsx` |
| Hook | `use{Accion\|Recurso}.ts`, `export function` | `useRegistrarFichaPerfil.ts` |
| Service | `{feature}Service.ts`, `export const` | `fichasPerfilService.ts` |
| Modelo | `PascalCase.ts` | `FichaPerfilAsesor.ts` |
| Request/Response | `{Accion}{Entidad}Request.ts` / `{Entidad}{Estado}Response.ts` | `AsignarEstudianteRequest.ts` |
| Store | `{concepto}Store.ts` → `use{Concepto}Store` | `toastStore.ts` |
| Test | `{ArchivoBajoPrueba}.test.ts(x)`, junto al archivo | `AvisoNoDisponible.test.tsx` |

**Sin JSDoc** (regla de `CLAUDE.md`). El código anterior a esa decisión lo conserva
(`axiosInstance.ts`, `keycloak.ts`, `api-error.ts`, `roleStore.ts`) y **no se migra**. Un comentario
de una línea sí vale cuando explica un *porqué* que el nombre no puede llevar.

## Componentes

Orden interno: imports → constantes del módulo → `schema` Zod + `type FormValues` → `interface Props`
→ `export default function` → hooks → derivadas → handlers → `return`.

**Constantes y schema van fuera del componente**: dentro se recrean en cada render y el
`zodResolver` deja de ser estable. Handlers como `function` nombrada, salvo `useCallback`.

**Una responsabilidad por componente.** Pasadas ~150 líneas, extrae sub-componentes — es el umbral
en el que `fichas-perfil` se partió en `{Rol}View` → `{Concepto}Panel|Table|Form`. Si el componente
mezcla fetch + transformación + estado, lo que sale es un **hook**, no un sub-componente.

- **`key` estable, nunca el índice.** Con el índice React reutiliza el nodo equivocado al insertar o
  quitar, y el estado local de una fila se cuela en otra. Siempre hay `id`.
- **Nunca mutes estado.** Un `push` sobre lo que devuelve `watch(...)` o `useQuery` no dispara render.
- **`<button type="button">`** en todo botón que no envía el formulario.

### Dónde vive el estado

| Situación | Solución |
|---|---|
| 1-2 valores de UI local | `useState` |
| Datos del servidor | `useQuery`/`useMutation` en un hook de la feature |
| Sesión y rol | `useRolActivo()` / `useRolesDisponibles()` / `useHasRole()` |
| Compartido entre features, no del servidor | Store Zustand en `src/shared/stores/` |

**Nunca `useEffect` + `axios`/`fetch` para cargar datos.** `useEffect` es solo para sincronizar con
algo externo a React: el `keycloak.init()` de `AuthGuard`, el listener de `Escape` de `AppLayout`, el
`setValue` de un prop que llega tarde en `RegistrarFichaPerfil`.

## Services

- `apiClient` de `src/api/axiosInstance.ts`. **Nunca `axios` directamente.**
- Objeto plano con métodos, **nunca clase**. Genérico tipado + `.then((r) => r.data)`; un `204`
  devuelve `Promise<void>` con `.then(() => undefined)`.
- **Sin `try/catch`.** El error sube a React Query. Un `catch` que devuelve `[]` esconde el fallo.
- Respuestas paginadas tipadas `Page<T>`.
- **La traducción de nombres backend ↔ frontend ocurre aquí**, en el literal del body
  (`{ asesorFicha: req.asesorFichaId }`), no en el componente. Es el único sitio.
- Endpoint no expuesto: comentario `// Pendiente: {motivo}` bajo el separador de pendientes.

## Models

Solo `interface`/`type`. **Sin lógica, sin defaults.** Interfaces pequeñas y específicas (ISP).
Un campo opcional (`?`) solo si el backend puede omitirlo de verdad.

Un catálogo del backend es `interface { id, nombre, descripcion }` — **nunca un enum del frontend**,
que se desincroniza. El único enum es `Rol`.

Archivo propio para entidades y DTOs de un caso de uso; barril `models/{feature}.ts` para catálogos y
DTOs menores.

## Stores Zustand

`create<State>()((set) => ({ … }))`; con persistencia, `persist(..., { name, storage })`.

- `authStore` es **de solo lectura** desde features; solo lo escriben `AuthGuard`, `devAuth` y el
  interceptor.
- **`persist` solo si el dato debe sobrevivir a un refresh y no es sensible.** Hoy, únicamente el
  string del rol activo.
- Fuera del árbol de React se accede con `getState()`, nunca con el hook.

## Formularios

**3+ campos → `react-hook-form` + Zod.** Con 1-2, `useState` es aceptable.

```tsx
const schema = z.object({ titulo: textoRequerido(LIMITES.TITULO_PROYECTO_MAX) });
type FormValues = z.infer<typeof schema>;
const { register, handleSubmit, formState: { errors, isValid } } =
  useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { titulo: '' }, mode: 'onChange' });
```

- `defaultValues` siempre — sin ellos React salta de no controlado a controlado.
- `mode: 'onChange'` si el submit se deshabilita con `!isValid` (el patrón del proyecto).
- Campo no nativo (chips, selección múltiple): `watch(...)` + `setValue(..., { shouldValidate: true })`.
- Al cancelar: `reset()` del formulario **y** de la mutación, o queda colgando el error anterior.

## Validación compartida

`src/shared/validation/` centraliza **solo lo reutilizable y alineado al backend**; las reglas de un
formulario concreto se quedan en su `z.object(...)`.

| Archivo | Contenido |
|---|---|
| `limites.ts` | `LIMITES` — espejo de los `@Size` del backend: `TITULO_PROYECTO_MAX 100`, `ITEM_CONTENIDO_MAX 7000`, `ESTADO_EVALUACION_ID_MAX 50`, `ESTUDIANTES_MAX 3` |
| `expresiones-regulares.ts` | `EMAIL_REGEX`, `UUID_REGEX` |
| `mensajes-validacion.ts` | `MENSAJES_VALIDACION`, algunos como función (`longitudMaxima(max)`) |
| `validadores-zod.ts` | `textoRequerido(max)`, `opcionRequerida()`, `emailValido()`, `uuidValido()`, `listaConMaximo(max)` |

Importa siempre del barril `index.ts`.

**Un número mágico en un `.max(...)` es un hallazgo.** Si el límite lo impone el backend va en
`LIMITES`, y el `maxLength` del input lo lee de ahí. `validadores-zod.test.ts` fija esos cuatro
valores: cambiarlos sin actualizar el backend rompe el test, que es lo que se busca.

**El cliente valida forma; el backend decide conjunto.** Obligatoriedad, longitud, formato y tamaño
de lista → Zod. Unicidad, existencia, propiedad y transición permitida → llegan como 422 y se
muestran. Duplicar una regla de conjunto en el cliente da falsos negativos: el frontend no tiene los
datos para decidirla.

## Estados de carga, vacío y error

Toda `useQuery` consumida por un componente maneja **las tres** ramas, y son distintas:

- **Carga** → `<PageSkeleton />` (página) o spinner con `role="status"`, `aria-live="polite"`,
  `aria-busy="true"` y un `<span className="sr-only">` que diga qué carga.
- **Vacío** → texto en una fila o bloque. **No es un error.**
- **Error** → contenedor con `role="alert"` y texto accionable.

## Errores de API

`src/shared/utils/api-error.ts` es la única forma de inspeccionar un error de Axios. Nunca
`error.response.data.message` a mano ni `error.message` crudo.

| Helper | Cuándo |
|---|---|
| `getApiErrorMessage(err, fallback)` | El caso por defecto, con respaldo para errores de red |
| `getApiFieldErrors(err)` | 400/422, para pintar el error junto a cada campo |
| `hasApiErrorCode(err, 'CODIGO')` | Distinguir subtipos de `DomainException` |
| `isApiErrorWithStatus(err, 404)` | Tratar un 404 como "vacío" |
| `classifyApiError(err)` | Ramificar por categoría (`'network'`, `'domain'`, …) |

**401 y 403 no se manejan en la feature:** el interceptor ya refresca o navega a `/forbidden`.

## Notificaciones

`toast` de `src/shared/hooks/useToast.ts` — singleton, funciona dentro y fuera de un componente.
Niveles: `success` (4 s), `info` (4 s), `debug` (8 s), `error` (6 s). Firma
`toast.error(titulo, mensaje?)`, con el mensaje desde `getApiErrorMessage(...)`.

Va en el `onSuccess`/`onError` de la mutación — en el hook **o** en el `mutate(...)` del componente,
en **uno solo**, o el usuario ve dos toasts.

Acción destructiva → `<ConfirmDialog />` (`variante: 'peligro' | 'advertencia'`), nunca `window.confirm`.

## Accesibilidad

Obligatoria desde el primer commit:

- `role="alert"` en errores; `role="status"` + `aria-live="polite"` + `aria-busy` en carga.
- `aria-label` en botones solo-icono; `aria-hidden` en iconos decorativos.
- Campo con error: `aria-invalid={!!errors.campo}` + `aria-describedby` al `id` del mensaje.
  `RegistrarFichaPerfil` es la referencia completa.
- `<label htmlFor>` con `id` en cada campo; si el control no es un input, contenedor con `aria-labelledby`.
- `aria-expanded` en botones que despliegan (`FichasPerfilTable`).
- Tablas: `<table aria-label>` y `<th scope="col">`.
- Nunca un `<div>` con `onClick` haciendo de botón.

## Estilos

Tailwind v4 CSS-first: los tokens se declaran en `@theme` de `src/tailwind.css`. **No hay
`tailwind.config.js`** — crearlo es un hallazgo.

Solo clases semánticas, nunca un color crudo de la paleta:

| Rol | Clases |
|---|---|
| Superficies | `bg-surface`, `bg-surface-secondary`, `bg-surface-elevated`, `bg-background` |
| Texto | `text-on-surface`, `text-on-surface-secondary` |
| Bordes | `border-border`, `border-border-strong` |
| Marca | `bg-primary`, `text-primary`, `bg-primary-hover`, `text-primary-foreground`, `bg-primary-muted` |
| Secundario / terciario | misma familia de sufijos con `-secondary` / `-tertiary` |
| Peligro | `bg-danger`, `text-danger`, `text-danger-foreground` |
| Navegación | `bg-nav-active-bg`, `text-nav-active-text`, `bg-nav-hover-bg` |
| Sombras | `shadow-card`, `shadow-card-hover`, `shadow-dropdown`, `shadow-lg` |
| Animaciones | `animate-fade-up`, `animate-fade-in`, `animate-slide-in-left`, `animate-scale-in` |

Sin CSS custom fuera de `index.css`/`tailwind.css`, sin `style={{}}` salvo valor calculado en
runtime. Clases condicionales con array + `.join(' ')`, no ternarios anidados.

`text-red-500` en el asterisco de `RegistrarFichaPerfil` es una desviación preexistente conocida: no
se reporta como hallazgo nuevo, pero tampoco se copia.

## TypeScript

`strict`, `noUnusedLocals` y `noUnusedParameters` activos: **una variable o import sin usar rompe el
build**. Parámetro que existe solo por posición → prefijo `_`
(`({ nombre: _n, email: _e, ...req })` en `useAsignarEstudiante`).

- `import type` para lo que solo se usa como tipo (`isolatedModules`).
- Nunca `any`, `@ts-ignore` ni `as unknown as`. Un error capturado se tipa `unknown` y se estrecha
  con los helpers de `api-error.ts`.
- `!` solo donde el código acaba de garantizar la condición (`item.roles!` tras su `filter`).
- Rutas relativas: no hay alias `@/` configurado.

Prettier: `printWidth: 100`, `singleQuote: true`. No hay ESLint — `npm run lint` es `tsc --noEmit`.

## Testing

Vitest 4 + `@testing-library/react` + `jest-dom`, entorno `jsdom`, `globals: true`. La configuración
vive en `vite.config.ts`; **no crees `vitest.config.ts`**.

| Pieza | Para qué |
|---|---|
| `src/test-utils/render.tsx` | `render` con `QueryClientProvider` (`retry: false`, `gcTime: 0`) + `MemoryRouter`; acepta `{ initialPath }` y reexporta testing-library |
| `src/test-utils/keycloak.mock.ts` | Importarlo aplica el `vi.mock` |
| `src/test-utils/store.utils.ts` | `resetAllStores()`, `setAuthenticatedUser(...)`, `setActiveRole(rol)` |

**Importar `render` de `@testing-library/react` es un error**: sin el wrapper, un componente con
`useQuery` o `<Navigate>` revienta. Escribir `useAuthStore.setState` a mano también: usa
`store.utils.ts`, con `resetAllStores()` en un `beforeEach`.

**Qué se mockea:** el módulo del service (`vi.mock('../services/{feature}Service')`) o el hook.
**Nunca `axios` ni `apiClient`** — eso prueba el interceptor, no la feature. Un test nunca llega a la red.

`describe`/`it` en **español**, describiendo comportamiento observable. Marcadores
`// Arrange / Act / Assert`. Consultas por rol y nombre accesible, no por `data-testid` ni clases.
Interacción con `userEvent`, no `fireEvent`. Sin JSDoc.

Referencias vivas: `AvisoNoDisponible.test.tsx` (componente) y `validadores-zod.test.ts` (lógica
pura). **No hay aún test de hook ni de service**: el primero fija el patrón.

Un service casi nunca merece test propio — es delegación tipada. La excepción es el método que
**traduce** nombres (`registrarFichaPerfil`): ahí sí hay lógica que romper.

### Anti-patrones — no generar estos tests

| # | Anti-patrón | Por qué |
|---|---|---|
| 1 | Componente que solo devuelve JSX estático | No hay comportamiento que romper |
| 2 | Un test por cada campo inválido del mismo schema | Uno con varios `safeParse` cubre lo mismo |
| 3 | Assert sobre clases de Tailwind o estructura del DOM | Se rompe con cualquier retoque visual |
| 4 | Snapshot de un árbol completo | Nadie lo revisa; se aprueba a ciegas |
| 5 | Tests con el mismo Act y distintos asserts | Consolida en uno |
| 6 | Test de un `models/*.ts` | Una `interface` no tiene runtime |
| 7 | Mock de `axios`/`apiClient` en vez del service | Prueba el interceptor |
| 8 | `waitFor` alrededor de un assert síncrono | Esconde el fallo tras un timeout |
| 9 | Consultas por `data-testid` o clase CSS | API paralela que nadie mantiene |
| 10 | Test de un archivo de configuración | No hay rama que cubrir |

**Consolidación:** 3+ tests con el mismo Act y distinto Assert → uno con varios asserts.

### Presupuesto orientativo

| Tamaño de HU | Tests |
|---|---|
| Pequeña (1 vista o 1 hook) | 6-12 |
| Mediana (2-3 vistas, o un formulario completo) | 12-25 |
| Grande (feature nueva entera) | 25-45 |
| Más de 45 | revisar contra los anti-patrones — casi siempre sobre-testeo |

**No hay umbral de cobertura.** `@vitest/coverage-v8` no está instalado y `vite.config.ts` no declara
`coverage`. No inventes un porcentaje ni instales la dependencia.

## Verificación — el gate

```bash
npm run lint          # tsc -p tsconfig.app.json --noEmit
npm test -- --run     # sin --run entra en watch y no termina
npm run build         # type-check + bundle
```

Un archivo suelto: `npx vitest run src/features/<feature>/<Archivo>.test.tsx`.

`npm run build` repite el type-check, así que `lint` verde con `build` rojo significa fallo de
bundling, no de tipos. `.github/workflows/ci.yml` corre los tres en cada push y PR con Node 20.

El aviso de build sobre `router.tsx` importado dinámica y estáticamente a la vez es el patrón
deliberado del interceptor; no es un hallazgo.

## Entorno

`.env.example` es la plantilla versionada; `.env.development.local` está en `.gitignore`.
`src/config/env.ts` valida al cargar y lanza si falta una variable requerida — por eso se importa
primero en `main.tsx`, y lanza si `VITE_AUTH_BYPASS=true` llega a un build de producción.

Toda variable `VITE_*` **queda embebida en el bundle**: ahí no va ningún secreto.

## Git

Conventional Commits en español: `<tipo>(<ámbito>): <descripción>`, ámbito = feature o módulo
(`fichas-perfil`, `auth`, `router`). Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`,
`style`, `hotfix`.

Descripción en **infinitivo y minúsculas, sin punto final**:

```
feat(fichas-perfil): agregar vista de coordinador para registrar ficha
fix(auth): corregir redirección al expirar token
```

Rama desde `develop`, PR hacia `develop` (`main` es la estable), nombre
`<prefijo>/<id>-<descripcion_snake_case>` con prefijos `feature/ fix/ refactor/ hotfix/ docs/ test/
chore/ spike/`. El PR usa `.github/PULL_REQUEST_TEMPLATE.md` y requiere 1 aprobación.

**Ningún commit ni PR lleva marca de autoría de IA** — ni `Co-Authored-By:`, ni
`🤖 Generated with …`, ni enlace de sesión. Regla de `CLAUDE.md`, por encima de cualquier
configuración global.
