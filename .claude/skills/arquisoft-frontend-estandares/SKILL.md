---
name: arquisoft-frontend-estandares
description: Estándares de código de Arquisoft Frontend — nomenclatura, componentes, services, models, stores, formularios con react-hook-form + Zod, validación compartida espejo del backend, retorno al listado tras registrar/editar/eliminar, manejo de errores de API, accesibilidad, design tokens de Tailwind, TypeScript, testing con Vitest + Testing Library, verificación y git. Cargar junto con arquisoft-frontend-arquitectura antes de implementar, testear o validar cualquier HU/HT.
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

`src/shared/validation/` es el espejo de `arquisoft-backend/shared/validation` (`ValidatorTexto`,
`ValidatorLongitud`, `ValidatorColeccion`, `ValidatorUUID`, …): validadores **reutilizables y
parametrizados** que cada formulario compone en su `z.object(...)`.

| Archivo | Contenido |
|---|---|
| `limites.ts` | `LIMITES` — espejo de los `@Size` del backend: `TITULO_PROYECTO_MAX 100`, `ITEM_CONTENIDO_MAX 7000`, `ESTADO_EVALUACION_ID_MAX 50`, `ESTUDIANTES_MAX 3` |
| `expresiones-regulares.ts` | `EMAIL_REGEX`, `UUID_REGEX` |
| `mensajes-validacion.ts` | `MENSAJES_VALIDACION`, algunos como función (`longitudMaxima(max)`) |
| `validadores-zod.ts` | `textoRequerido(max)`, `opcionRequerida()`, `emailValido()`, `uuidValido()`, `listaConMaximo(max)` |

Importa siempre del barril `index.ts`. La tabla refleja lo que había al escribirla; abre el archivo
antes de decidir que un validador no existe.

**El frontend replica todas las reglas de forma del backend, sin excepción.** Cada campo que el DTO
de entrada o el validador del caso de uso exija o restrinja lleva la misma regla en el schema Zod:
obligatoriedad, longitud mínima y máxima, formato (regex), rango numérico y tamaño de lista. Antes de
escribir el schema se abre el validador real en el repo hermano y se listan sus reglas campo por
campo; el plan las transcribe en una tabla **campo → regla del backend → validador Zod**. Una regla
de forma del backend sin su espejo en el cliente es un hallazgo.

- **Regla compuesta** (el backend valida `nombres + " " + apellidos` entre 2 y 50): se replica igual,
  con `superRefine` sobre el `z.object(...)` y el error asignado al campo que el usuario corrige. No
  se inventa un tope por campo que el backend no impone, ni se deja la regla solo al 422.
- Los valores mínimos y máximos salen de las constantes del backend (`{Modulo}Limits.java`) y van a
  `LIMITES`, igual que los máximos.

**Validadores reutilizables, nunca reglas en línea.** Un formulario compone los builders de
`validadores-zod.ts` (`emailValido()`, `textoRequerido(max)`, …); no escribe `.regex(EMAIL_REGEX)`,
`z.string().email()` ni un `.min/.max` suelto para una regla que ya tiene builder. Si falta, se crea
en `validadores-zod.ts` **genérico y parametrizado** (como `ValidatorLongitud.longitudEntre(min, max)`
del backend), con su mensaje en `mensajes-validacion.ts`, su regex en `expresiones-regulares.ts` y su
caso en `validadores-zod.test.ts`. Ampliar un builder existente con parámetros opcionales
retrocompatibles se prefiere a crear uno paralelo que haga casi lo mismo. Solo queda en línea lo que
no tiene una regla del backend detrás.

**Un número mágico en un `.max(...)` es un hallazgo.** Si el límite lo impone el backend va en
`LIMITES`, y el `maxLength` del input lo lee de ahí. `validadores-zod.test.ts` fija esos cuatro
valores: cambiarlos sin actualizar el backend rompe el test, que es lo que se busca.

**El cliente valida forma; el backend decide conjunto.** Obligatoriedad, longitud, formato y tamaño
de lista → Zod. Unicidad, existencia, propiedad y transición permitida → llegan como 422 y se
muestran. Duplicar una regla de conjunto en el cliente da falsos negativos: el frontend no tiene los
datos para decidirla.

El error del backend al enviar **siempre** produce `toast.error` (ver "Notificaciones") y, además, se
pinta junto al campo cuando corresponde a uno: `hasApiErrorCode(err, 'USUARIO_EMAIL_DUPLICADO')` o
`getApiFieldErrors(err)` → `setError('email', { message })` con el mensaje de
`getApiErrorMessage(err, …)`. Un `field` del backend que no es un input (el `nombre` derivado de
`nombres + apellidos`) se pinta en **todos** los inputs que lo componen. Los códigos salen de
`arquisoft-backend/shared/message/.../constant/{Modulo}Codes.java`, verificados, nunca adivinados.

**Los campos del formulario tienen la misma granularidad que el DTO de entrada del backend.** Si el
DTO separa `nombres` y `apellidos`, hay dos inputs; si separara primer y segundo nombre, habría
cuatro. Nunca se fusionan dos campos del backend en un input ni se parte uno en varios, porque el
error de cada campo debe poder mostrarse en su input.

Una regla compuesta del cliente se atribuye al input culpable cuando se puede (el formato de
`nombre` falla en el input que tiene el carácter inválido); si depende de varios (la longitud total
de `nombres + " " + apellidos`), el mensaje se pinta en todos los que la componen.

## Retorno tras registrar, editar o eliminar

Tras un registro, una edición o una eliminación **exitosos**, la UI vuelve de inmediato a la vista
anterior: el listado desde el que se abrió la acción, con el mismo filtro y la misma página con que se
consultó el objeto afectado. No se deja al usuario en el formulario limpio ni se lo manda al dashboard.

- **Orden en el éxito:** el hook invalida la query del listado por prefijo (para que refleje el
  cambio); el componente, en el `onSuccess` del `mutate(...)`, lanza el toast de éxito y cierra la
  vista (`onCerrar()` / `onVolver()`). `CoordinadorView` → `RegistrarFichaPerfil onCerrar` y
  `AsesorFichaView` → `onVolver` son la referencia.
- **Filtros y paginación viven por encima del formulario**, en la `{Rol}View` o en el hook del listado
  (`useFichasPerfilCoordinador`), nunca dentro del panel que se desmonta: si viven dentro, volver los
  resetea.
- **Con ruta propia** (`/{feature}/nuevo`, `/{feature}/:id/editar`), los filtros van en search params
  y el retorno los conserva; no se reconstruyen a mano.
- **Eliminar desde el detalle** vuelve al listado, no al detalle de un objeto que ya no existe.
- **En error** se queda en el formulario, con los datos intactos y los errores pintados.
- **Sin listado todavía** (el backend no expone el `GET`): el formulario abre desde la vista de la
  feature y el retorno es a esa vista. El plan lo declara explícitamente para que, cuando llegue el
  listado, el retorno se mueva a él.

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

**Toda mutación da retroalimentación con un mensaje emergente, sin excepción:** `toast.success` al
terminar bien y `toast.error` en **cualquier** error, aunque ese error también se pinte junto a su
campo. El mensaje del campo dice *dónde* está el problema; el toast garantiza que el usuario sepa que
el envío falló, aunque el campo quede fuera de la vista. Un `onError` que solo hace `setError`, o una
mutación sin toast de éxito, es un hallazgo. Las validaciones de Zod mientras se escribe no llevan
toast: se pintan en el campo.

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

### Mobile first

**El estilo base es el del celular; los breakpoints solo agregan.** Se escribe primero la versión
angosta sin prefijo y `sm:`/`md:`/`lg:` amplían hacia pantallas grandes. Un `lg:flex-col` que deshace
un layout de escritorio, o un ancho fijo que solo funciona ancho, es un hallazgo. `AppLayout` ya
resuelve el turno del menú lateral (cajón con backdrop bajo `lg`, fijo encima) y el padding de la
página (`p-4 sm:p-6 lg:p-8`): una feature no lo reimplementa.

| Regla | Cómo se escribe |
|---|---|
| Nada de anchos fijos | `w-full` + `max-w-*`; nunca `w-[720px]` ni `min-w` por encima de 320 px |
| Input legible y sin zoom en iOS | `text-base sm:text-sm` — con menos de 16 px Safari hace zoom al enfocar |
| Área táctil cómoda | `min-h-11` (44 px) en la etiqueta o el control; los iconos-botón, `h-11 w-11 sm:h-9 sm:w-9` |
| Control pequeño | `h-5 w-5 sm:h-4 sm:w-4` — la casilla de 16 px es para puntero, no para dedo |
| Fila de acciones | `flex flex-col-reverse gap-2 sm:flex-row sm:justify-end`, con `w-full sm:w-auto` en cada botón: la acción principal queda arriba en celular |
| Cabecera de título + acción | `flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between` |
| Columnas | apiladas por defecto, `sm:grid-cols-2` o `sm:flex-row` después |
| Tabla o bloque ancho | envuelto en un contenedor con `overflow-x-auto`; el resto de la página nunca desplaza en horizontal |

**Verificación obligatoria antes de entregar una pantalla nueva:** a 390 px y a 320 px no debe haber
desplazamiento horizontal (`document.documentElement.scrollWidth` igual a `window.innerWidth`) ni
elementos que se salgan de su contenedor. Si la ventana del navegador no se deja redimensionar, monta
la ruta en un `iframe` del ancho a probar: su viewport propio sí evalúa los breakpoints.

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

**Qué se mockea:** el módulo del service o el hook de la feature. **Nunca `axios` ni `apiClient`** —
eso prueba el interceptor, no la feature. Un test nunca llega a la red.

**`vi.mock` de un hook o un service siempre lleva fábrica**, con la forma
`vi.mock('../../hooks/useRegistrarUsuario', () => ({ useRegistrarUsuario: vi.fn() }))`. Sin ella,
Vitest carga el módulo real para inspeccionar qué exporta, y esa carga arrastra la cadena
`hook → service → apiClient → config/env.ts`, que lanza en test porque `VITE_API_URL` no está
definida: el archivo falla entero con un error de entorno que no tiene que ver con lo que se prueba.
La fábrica corta la cadena. `RegistrarUsuarioForm.test.tsx` y `test-utils/keycloak.mock.ts` son la
referencia.

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
