# Kit de componentes

Lo que cada pieza hace, cómo se llama su API y con qué clases se pinta. Las clases salen de
`tokens.md` (todas son semánticas y mobile first). Las de las 11 piezas del kit base se **comprobaron contra el
compilador de Tailwind y en el navegador con `getComputedStyle`**; las de las demás piezas se verificaron solo contra
el compilador y se corrigen al construirlas: aplica la regla «Composición de clases» de abajo, no las reinventes ni las
sustituyas por colores crudos.

**Lista `src/shared/components/ui/` antes de crear nada**: el estado real del kit está ahí, no en esta
página. Lo que sigue es la receta para escribir lo que falte.

## Convenciones del kit

- Un archivo por pieza, `PascalCase.tsx`, `export default function`, `interface Props` y **sin JSDoc**.
  Menos de 150 líneas: si crece, la lógica sube a un hook de `src/shared/hooks/` y lo visual se parte en
  subcomponentes de la misma carpeta.
- **Nombre del componente en inglés** (sufijo técnico) y **props en español**, como `ConfirmDialog`
  (`titulo`, `variante`, `cargando`). La variante de aviso se llama `advertencia`, igual que allí.
- Iconos de `lucide-react` con `size={16}` y `aria-hidden` (salvo el recuadro de `EmptyState` y de `ErrorState`, que
  usa 22, y el mensaje de error de `Field` y el separador de las migas, que usan 14). Un botón que solo tiene icono
  lleva `etiqueta`.
- Todo `<button>` que no envía un formulario es `type="button"`: las piezas lo ponen por defecto.
- Una pieza admite `className` solo para disposición (márgenes, ancho); nunca para cambiar su variante.
- **Composición de clases.** Tailwind v4 emite las utilidades dentro de `@layer utilities` en un orden fijo (por
  propiedad y por nombre), así que no gana la última de `className` sino la que sale después en la hoja. Las
  clases globales de `src/index.css` (`.field-input`, `.skeleton`, `.section-header`…) no están en una capa y
  ganan a cualquier utilidad. Por eso cada pieza arma su `className` con una cadena base más **una** por estado
  (variante, tono, activa o inactiva), de forma excluyente, y nunca mezcla una utilidad con una clase global que
  fije la misma propiedad: el borde de `Button` y el hover de `IconButton` van en la variante o en el tono,
  `Tabs` y el contador de `Field` traen su color por estado, `Skeleton` no pone `rounded-*` (el radio lo fija
  `.skeleton`) y `PageHeader` no usa `.section-header`. Se verifica con `getComputedStyle` sobre el elemento
  renderizado (el color del borde del botón secundario, el subrayado de la pestaña activa), no leyendo el orden
  de las clases.
- Solo hay prueba para las piezas con comportamiento (teclado, foco, callbacks). Una pieza que solo
  devuelve JSX estático no se prueba (anti-patrón 1 de los estándares).

## Dónde nace cada pieza

| Pieza | Nace en | Por qué |
|---|---|---|
| `Button`, `IconButton`, `Badge` (+ `estado-variante.ts`), `Field`, `Notice`, `EmptyState`, `ErrorState`, `Skeleton`, `LoadingState`, `PageHeader`, `Avatar`, `Tabs`, `Segmented` | `src/shared/components/ui/` | Usuarios y Fichas ya las necesitan |
| `DataTable`, `FilterBar`, `RowMenu`, `FormSection`, `FormActions`, `ErrorSummary` | `src/shared/components/ui/` | Usuarios y Fichas tienen listados y formularios |
| `PaginadorListado` ampliado | se queda en `src/shared/components/` | Ya lo importan dos features |
| `SidePanel`, `Switch` | `features/usuarios/components/` | Solo Usuarios los usa al principio |
| `Combobox` | `features/fichas-perfil/components/` | Solo Fichas lo usa al principio |
| `ConfirmDialog`, `Toaster`, `PageSkeleton`, `AvisoNoDisponible`, `ComingSoon` | siguen en `src/shared/components/` | Se **actualizan en su sitio**; no se mueven |

Una pieza «feature primero» sube a `shared/components/ui/` cuando una segunda feature la necesita: se mueve
el archivo y se ajustan los imports, sin cambiar su API. Si un plan declara en `shared/` una pieza con un
solo consumidor, es una ambigüedad: pregunta, no la crees.

## Piezas base

### Button

- **Reemplaza:** los 54 botones escritos a mano (22 primarios, 32 secundarios).
- **API:** `variante?: 'primario' | 'secundario' | 'fantasma' | 'peligro' | 'peligroContorno'`,
  `tamano?: 'md' | 'sm'`, `cargando?: boolean`, `icono?: LucideIcon`, más los atributos de `<button>`.
- **Reglas:** una acción primaria por pantalla o panel. Cargando: `aria-busy`, deshabilitado y el spinner antes
  del texto, en el lugar del icono; el texto en gerundio («Guardando…») lo pone quien usa el botón. `sm` solo en
  barras densas desde `sm`.
- **Composición:** `base` + `md` o `sm` + **una** variante + `atenuado`, que se omite mientras `cargando` para que
  el botón se vea nítido (`disabled:cursor-not-allowed` sí se mantiene). El **color del borde va en la
  variante**, no en la base: un `border-transparent` en `base` anularía el borde de `secundario` y de
  `peligroContorno`.

```clases
Button.base | inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed
Button.atenuado | disabled:opacity-50
Button.md | h-11 px-4 text-sm sm:h-10
Button.sm | h-11 px-3 text-sm sm:h-8
Button.primario | border-transparent bg-primary text-primary-foreground hover:bg-primary-hover
Button.secundario | border-border-strong bg-surface text-on-surface hover:bg-muted
Button.fantasma | border-transparent text-primary hover:bg-primary-muted
Button.peligro | border-transparent bg-danger text-danger-foreground hover:bg-danger/90
Button.peligroContorno | border-danger bg-surface text-danger-muted-foreground hover:bg-danger-muted
Button.spinner | size-4 animate-spin rounded-full border-2 border-current border-t-transparent
```

### IconButton

- **Reemplaza:** los botones de icono de 22 px (`p-1`) y los `h-11 w-11 sm:h-9 sm:w-9` copiados.
- **API:** `etiqueta: string` (obligatoria, va a `aria-label`), `icono: LucideIcon`, `tono?: 'neutro' | 'peligro'`.
- **Regla:** 44 px de área en celular y 36 px desde `sm`.
- **Composición:** `base` + **un** tono. Cada tono trae su color de texto y su hover: con el hover de `neutro` en
  la base, `peligro` no cambiaría de color al pasar el cursor.

```clases
IconButton.base | inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:w-9
IconButton.neutro | text-on-surface-secondary hover:bg-muted hover:text-on-surface
IconButton.peligro | text-on-surface-secondary hover:bg-danger-muted hover:text-danger-muted-foreground
```

### Badge y `estado-variante.ts`

- **Reemplaza:** las pastillas hechas con `bg-green-100`, `bg-red-100`… (`EstadosEvaluacionPanel`) y con
  `bg-muted` (`FichasPerfilTable`, `DetalleFicha*`, `EstadosFichaPanel`).
- **API:** `variante: 'neutro' | 'info' | 'exito' | 'advertencia' | 'peligro'`. Siempre lleva punto y texto.
- **Composición:** `base` + **una** variante; el `punto` es un `<span aria-hidden="true">` que toma el color del
  texto (`bg-current`).
- **`src/shared/utils/estado-variante.ts`** (función pura, sin JSX; el tipo de variante se declara una vez
  en `Badge.tsx` y se importa con `import type`): una sola tabla estado → variante, por `id` del backend.
  La etiqueta que se muestra es el `nombre` que venga del backend; un `id` desconocido cae en `neutro`.

| Dominio | `id` → variante |
|---|---|
| Ficha | `EN_CONSTRUCCION` → neutro · `DISPONIBLE_PARA_EVALUACION` → advertencia · `APROBADA` → exito · `APROBADA_CON_OBSERVACIONES` → advertencia · `NO_APROBADA` → peligro · `DESCARTADA` → neutro |
| Evaluación | `EN_EVALUACION` → info · `APROBADA` → exito · `APROBADA_CON_OBSERVACIONES` → advertencia · `NO_APROBADA` → peligro · `DESCARTADA` → neutro |
| Usuario | `ACTIVO` → exito · `INACTIVO` → neutro · `vigente === false` → peligro, con el texto «Dado de baja» (una sola insignia combina estado y vigencia) |

```clases
Badge.base | inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap
Badge.punto | size-1.5 rounded-full bg-current
Badge.neutro | bg-muted text-muted-foreground
Badge.info | bg-primary-muted text-primary-muted-foreground
Badge.exito | bg-secondary-muted text-secondary-muted-foreground
Badge.advertencia | bg-tertiary-muted text-tertiary-muted-foreground
Badge.peligro | bg-danger-muted text-danger-muted-foreground
```

- **Pruebas:** `estado-variante.test.ts` (lógica pura, incluido el `id` desconocido). `Badge` no.
- **Uso:** la `Badge` no parte el texto (`whitespace-nowrap`): en una fila con el título, el contenedor lleva `flex-wrap` (y el
  bloque del título `flex-1`) para que una insignia larga («Aprobada Con Observaciones») baje de línea a 320 px en vez de
  desbordar.

### Field

- **Reemplaza:** `CampoTexto` (solo Usuarios), `.field-label`/`.field-input` armados a mano y los campos con
  clases propias (`RegistrarFichaPerfil`, `SelectorAsesorFicha`, `EstadosFichaPanel`).
- **API:** `etiqueta`, `ayuda?`, `error?`, `opcional?`, `contador?: { actual: number; max: number }` y un
  hijo-función `(control) => ReactNode` que recibe `{ id, 'aria-invalid', 'aria-describedby' }` (con
  `useId`); el control es un `<input className="field-input">`, `<select>` o `<textarea>` que los usa.
  `aria-describedby` apunta al error o, si no hay, a la ayuda (el contador no entra).
- **Anatomía:** etiqueta → control → pie. El pie solo existe si hay error, ayuda o contador; muestra el error
  (con icono y `role="alert"`) o, si no hay error, la ayuda; el contador va a la derecha del pie. Los límites
  van en la ayuda **antes** de fallar.
- **Reglas:** sin asterisco; el opcional dice «(opcional)» dentro de la etiqueta. El contador pasa de
  `contadorReposo` a `contadorCerca` desde el 90 % del máximo. Textarea: `min-h-24` y `resize-y`, con
  `maxLength` de `LIMITES`.
- **Espaciado:** `Field.raiz` no lleva `gap`. `field-label` ya deja 6 px bajo la etiqueta y `field-error` y
  `field-hint` 4 px entre el control y su mensaje: con un `gap` el espacio etiqueta → control se duplicaría.
- **Composición:** el contador es `contador` + **uno** de `contadorReposo` o `contadorCerca`; sumados, el color lo
  decidiría el orden de la hoja y no el estado.
- **Con react-hook-form:** `useForm({ mode: 'onTouched' })`; el error aparece al salir del campo y se limpia
  al corregir (ver «Formularios» en `patrones.md`).

```clases
Field.raiz | flex min-w-0 flex-col
Field.opcional | font-normal text-on-surface-secondary
Field.pie | flex items-start justify-between gap-3
Field.error | field-error flex items-start gap-1.5
Field.iconoError | mt-0.5 shrink-0
Field.contador | mt-1 ml-auto shrink-0 text-xs tabular-nums
Field.contadorReposo | text-on-surface-secondary
Field.contadorCerca | font-semibold text-tertiary-muted-foreground
```

Las clases globales `field-label`, `field-input`, `field-error` y `field-hint` (en `index.css`, ver `tokens.md`)
siguen siendo el único lugar donde se decide el aspecto del control.

**Modificadores de campo (clases globales).** Los `pl-10`, `pr-10` y `border-*` de utilidad no vencen a `.field-input`, que es global y
sin capa. Un campo con icono a la izquierda o con una acción a la derecha usa dos clases globales que se agregan a
`src/index.css` justo después de `.field-input` (las crea la HT que construye la primera pieza que las usa, `FilterBar` en HT-UX-02):

```css
.field-input--icono {
  padding-left: 2.5rem;
}
.field-input--accion {
  padding-right: 2.5rem;
}
```

`Field.valido` (`border-secondary pr-10`) y `Field.corto` (`max-w-60`) no están en el código: ningún prop los
activa. Se agregan cuando una pantalla los pida (`FormSection` usa el ancho corto).

### Notice

- **Reemplaza:** `AvisoNoDisponible` (que pasa a ser un uso de `Notice` con la frase «Esta opción aún no
  está disponible.»), bordes rojos hechos a mano y `<p className="text-danger">` sueltos.
- **API:** `variante: 'info' | 'exito' | 'advertencia' | 'peligro'`, `titulo?`, `accion?: { etiqueta; onClick }`,
  `etiqueta?` (va a `aria-label` y le da nombre accesible al aviso, por ejemplo «No disponible: asesores») y los
  `children` (el texto).
- **Regla:** el aviso es contexto que se queda en la pantalla; el toast es la confirmación breve de una
  acción. `role="alert"` en `peligro`, `role="status"` en `exito`, `role="note"` en los demás. Siempre
  icono (`Info`, `CircleCheck`, `TriangleAlert`, `CircleAlert`) más texto.
- **Composición:** `base` + **una** variante (sus colores son excluyentes).

```clases
Notice.base | flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm
Notice.info | bg-primary-muted text-primary-muted-foreground
Notice.exito | bg-secondary-muted text-secondary-muted-foreground
Notice.advertencia | bg-tertiary-muted text-tertiary-muted-foreground
Notice.peligro | bg-danger-muted text-danger-muted-foreground
Notice.icono | mt-0.5 shrink-0
Notice.texto | min-w-0
Notice.titulo | block font-semibold
Notice.accion | ml-auto font-semibold whitespace-nowrap underline underline-offset-4
```

### EmptyState, ErrorState, Skeleton y LoadingState

- **Reemplazan:** los 19 spinners copiados, `PageSkeleton` con forma de dashboard dentro de una pantalla,
  las líneas «No hay …» en una celda, los recuadros «No se pudo cargar…» sin salida y `ComingSoon` dentro
  de una pestaña.
- **`EmptyState`:** `icono`, `titulo`, `descripcion?`, `accion?: ReactNode`. Tres tipos: **aún no hay datos**
  (acción: la que crea el primero), **sin resultados** (solo con búsqueda o filtros activos; acción «Limpiar
  filtros») y **todavía no disponible** (sin acción, o un enlace a lo que sí hay).
- **`ErrorState`:** `titulo`, `descripcion?`, `onReintentar?`, `detalle?`. `role="alert"`. Con `onReintentar`
  muestra el botón «Reintentar» (`secundario` con `RefreshCw`) y lo llama como `onReintentar()`, **sin pasarle el
  evento**: así se le puede entregar `refetch` tal cual (que leería el evento como opciones). `detalle` va bajo
  el botón, en pequeño, y se muestra tal cual, sin prefijo: se le pasa `getApiErrorMessage(err, …)`.
- **`Skeleton`:** `variante: 'tabla' | 'tarjetas' | 'formulario' | 'lineas'`, `etiqueta`. El contenedor lleva
  `role="status"` y `aria-busy="true"`, y un `<span className="sr-only">` con la `etiqueta` como primer hijo
  (lo que anuncia el lector de pantalla). Los bloques usan la clase global `skeleton` de `index.css` con alto y
  ancho y **nunca llevan `rounded-*`**: `.skeleton` fija el radio (0.5rem) y, al ser global, gana a la utilidad;
  por eso `avatar` es un cuadrado de 36 px y no un círculo.
- **Formas del `Skeleton`:** `tabla` (en una `caja`): una barra `skeleton h-3 w-2/5` y tres `fila` con el cuadro
  `avatar`, una `pila` de dos barras (`skeleton h-3 w-3/4` y `skeleton h-2.5 w-1/2`) y un bloque `skeleton h-5`.
  `tarjetas` (en una `columna`): tres `tarjeta` con las barras `skeleton h-4 w-2/5`, `skeleton h-3 w-full` y
  `skeleton h-3 w-4/5`. `formulario` (en una `caja`): tres `pila` con una barra `skeleton h-3 w-1/3` y un bloque
  `skeleton h-10 w-full`. `lineas` (en una `columna`): cuatro barras `skeleton h-4` de ancho `w-full`, `w-5/6`,
  `w-2/3` y `w-3/4`.
- **`LoadingState`:** `etiqueta` (visible). Solo cuando no se conoce la forma. `role="status"`,
  `aria-live="polite"` y `aria-busy="true"`. Es, con el de `Button` (`cargando`), el único spinner del
  proyecto: `src/arquitectura.test.ts` rechaza otro fuera de `shared/components/ui/`.
- **`PageSkeleton`** (fallback de `Suspense` en `AppLayout`) se simplifica: cabecera y una tarjeta, sin la
  fila de cifras.

```clases
EmptyState.raiz | flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-8 text-center
EmptyState.icono | flex size-12 items-center justify-center rounded-2xl bg-primary-muted text-primary
EmptyState.titulo | text-base font-semibold text-on-surface
EmptyState.texto | max-w-sm text-sm text-on-surface-secondary
ErrorState.raiz | flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-surface px-5 py-8 text-center
ErrorState.icono | flex size-12 items-center justify-center rounded-2xl bg-danger-muted text-danger-muted-foreground
ErrorState.titulo | text-base font-semibold text-on-surface
ErrorState.texto | max-w-sm text-sm text-on-surface-secondary
ErrorState.detalle | text-xs text-on-surface-secondary
Skeleton.caja | flex flex-col gap-2.5 rounded-xl border border-border bg-surface-secondary p-3.5
Skeleton.columna | flex flex-col gap-2.5
Skeleton.tarjeta | flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-3.5
Skeleton.fila | grid grid-cols-[2.25rem_1fr_4.5rem] items-center gap-3 border-t border-border py-2.5
Skeleton.pila | flex flex-col gap-1.5
Skeleton.bloque | skeleton h-4 w-full
Skeleton.avatar | skeleton size-9
LoadingState.raiz | flex flex-col items-center justify-center gap-2 py-12 text-sm text-on-surface-secondary
LoadingState.spinner | size-5 animate-spin rounded-full border-2 border-primary border-t-transparent
```

- **Pruebas:** `ErrorState` (el clic en «Reintentar» llama a `onReintentar`).

### Avatar

- **API:** `nombre`, `tamano?: 'md' | 'sm'`. Muestra las iniciales de las dos primeras palabras. Decorativo:
  el nombre ya está al lado, así que va con `aria-hidden`.

```clases
Avatar.base | inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-muted text-xs font-bold text-primary-muted-foreground
```

## Navegación y selección

### Tabs y Segmented

- **Reemplazan:** las cinco pestañas copiadas (una con subrayado en `AdministradorView`, cuatro segmentadas
  cuya pista `bg-muted/50` no se pintaba).
- **`Tabs`** (subrayado): genérico, `Tabs<T extends string>`: `items: { id: T; etiqueta; contador?; to? }[]`,
  `valor: T`, `etiqueta` (va a `aria-label`), `onCambiar?: (id: T) => void`, `children?` y `className?`.
  Si **todos** los ítems traen `to` (subrutas) renderiza `<nav aria-label>` con un `Link` por ítem y
  `aria-current="page"` solo en el de `valor` (no `NavLink`: así `valor` es la única fuente de la pestaña
  activa): **las pestañas navegan y cambian la URL**, y `children` no se usa. Si no (secciones dentro de la
  misma página) usa `role="tablist"` y `role="tab"` (botones `type="button"`), `aria-selected`, solo la activa
  es tabulable, y las flechas (que dan la vuelta), Inicio y Fin mueven el foco y la selección.
  Los `children` se envuelven en `<div role="tabpanel" aria-labelledby>` ligado a la pestaña activa, y la activa
  lleva `aria-controls` hacia él (solo si hay `children`): sin el panel, `aria-controls` apuntaría a nada y cada
  consumidor repetiría los ids.
- **Sin `-mb-px`:** la pestaña no se monta sobre el borde de la lista. Ese solape de 1 px desborda la lista (que
  lleva `overflow-x-auto`), abre una barra vertical y recorta el subrayado.
- **Composición de `Tabs`:** `pestana` + **una** de `activa` o `inactiva`; `contador` + **una** de
  `contadorActiva` o `contadorInactiva`. La activa no lleva hover. `raiz` envuelve la lista y el panel solo en el
  modo `tablist`; en el modo `to` la raíz es el `<nav>`.
- **`Segmented`:** `opciones: { id; etiqueta }[]`, `valor`, `onCambiar`, `etiqueta`. Cambia la **vista** de los
  mismos datos (tabla/tarjetas); `role="group"` y `aria-pressed`.
- **Regla:** una pestaña que todavía no tiene pantalla no se muestra.
- **Foco:** la lista de pestañas recorta lo que sobresale (`overflow-x-auto`), así que `src/index.css` dibuja el anillo de
  foco de `[role='tab']` hacia adentro (`outline-offset: -2px`). La lista no lleva `-mb-px`: con él abre una barra vertical.
- **Composición de `Segmented`:** `opcion` más exactamente una de `inactiva` o `activa`.

```clases
Tabs.raiz | flex flex-col gap-4
Tabs.lista | flex gap-1 overflow-x-auto border-b border-border
Tabs.pestana | inline-flex h-11 shrink-0 items-center gap-2 border-b-2 px-3.5 text-sm font-medium whitespace-nowrap transition-colors
Tabs.activa | border-primary text-primary
Tabs.inactiva | border-transparent text-on-surface-secondary hover:text-on-surface
Tabs.contador | rounded-full px-2 py-px text-xs font-semibold
Tabs.contadorActiva | bg-primary-muted text-primary-muted-foreground
Tabs.contadorInactiva | bg-muted text-muted-foreground
Segmented.grupo | inline-flex gap-1 rounded-lg bg-muted p-1
Segmented.opcion | h-9 rounded-md px-3.5 text-sm font-medium
Segmented.inactiva | text-muted-foreground
Segmented.activa | bg-surface text-on-surface shadow-card
```

- **Pruebas:** `Tabs` en modo `tablist` (flechas mueven el foco y la selección; solo la activa es tabulable).

### Switch

- **Reemplaza:** las casillas que guardan al instante (`RolesUsuarioFieldset`).
- **API:** `marcado: boolean`, `onCambiar: (valor: boolean) => void`, `etiqueta: string`, `pendiente?`, `deshabilitado?`.
- **Reglas:** `<button type="button" role="switch" aria-checked>`; fila de 44 px o más. **Se aplica al instante y la
  mutación avisa con toast** (`Rol agregado` / `Rol quitado`); quitar algo que da acceso pide `ConfirmDialog`.
  Mientras la mutación corre, `pendiente` deshabilita el interruptor y pone `aria-busy`. Lo que aún no existe
  se muestra deshabilitado con una insignia «Pronto». Una casilla (`checkbox`) o un radio se usa solo
  cuando el valor viaja con el botón del formulario.

```clases
Switch.pista | relative inline-flex h-6.5 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50
Switch.pistaOff | bg-border-input
Switch.pistaOn | bg-primary
Switch.pulgar | absolute left-0.75 size-5 rounded-full bg-surface shadow-sm transition-transform
Switch.pulgarOn | translate-x-4.5
Switch.fila | flex min-h-16 items-center gap-3 border-t border-border py-2.5 first:border-t-0
```

- **Composición:** la pista es `pista` más exactamente una de `pistaOff` o `pistaOn`; el pulgar, `pulgar` más `pulgarOn` solo
  cuando está marcado.

### Combobox

- **Reemplaza:** el `select` con «nombre — correo» (`SelectorAsesorFicha`) y el muro de botones para elegir
  estudiantes (`RegistrarFichaPerfil`), que crece con cada estudiante vigente.
- **Cuándo:** hasta 5 opciones, radio o chips; de 6 a 8, `select` nativo; más de 8, o cuando hay que reconocer
  personas, `Combobox`.
- **API:** `opciones: { id; etiqueta; descripcion? }[]`, `valor` (un `id` o `id[]`), `onCambiar`, `multiple?`,
  `max?`, `textoVacio`, y se envuelve en `Field` para su etiqueta.
- **Comportamiento:** filtra en el cliente por etiqueta y descripción, sin distinguir mayúsculas ni tildes
  (normaliza con `NFD`). Lo elegido se ve debajo como filas con ✕ (`IconButton`, «Quitar a {nombre}») y un
  contador «2 de 3»; lo ya elegido aparece en la lista deshabilitado con «Agregada»; al llegar a `max` el
  campo se deshabilita con una frase. Sin virtualización: más de unos cientos de opciones piden búsqueda en
  el servidor (otra historia).
- **A11y:** patrón ARIA combobox/listbox: `role="combobox"`, `aria-expanded`, `aria-controls`,
  `aria-autocomplete="list"`, `aria-activedescendant`; opciones en `<li role="option">`; el foco no sale del
  campo; flechas, Enter, Esc, Inicio y Fin. La lógica de teclado y filtrado sube a `useCombobox` en
  `src/shared/hooks/` si el archivo pasa de 150 líneas.

```clases
Combobox.input | field-input field-input--icono
Combobox.icono | pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-secondary
Combobox.lista | absolute inset-x-0 top-full z-30 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-dropdown
Combobox.opcion | flex min-h-12 w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left text-sm
Combobox.opcionActiva | bg-muted
Combobox.opcionAgregada | opacity-60
Combobox.elegido | flex items-center gap-3 rounded-lg border border-border-input bg-surface py-2 pl-3 pr-2
```

- **Composición:** `opcion` más, a lo sumo, una de `opcionActiva` u `opcionAgregada`. El campo de texto usa
  `field-input field-input--icono`: los `pl-10`/`pr-10` de utilidad pierden contra el `padding` de `.field-input`, así que el
  espacio del icono se pide con las clases globales de campo (ver «Field», «Modificadores de campo»).
- **Pruebas:** filtrar escribiendo, elegir con Enter, quitar con ✕ y el tope `max`.

## Listados

### FilterBar

- **Reemplaza:** `FiltrosUsuariosPanel`, el formulario de filtros de `ConsultarFichasRepresentante`, el de
  `EstadosFichasAsesorPanel` y las pestañas por rol de Usuarios.
- **Piezas:** búsqueda, `FilterChip` (chip de selección, `aria-pressed`), botón «Filtros» con contador y
  popover, `AppliedFilter` (chip con ✕) y «Limpiar todo».
- **API:** `busqueda: { valor; onCambiar; etiqueta; placeholder }`, `chips?: { etiqueta; opciones; seleccionados;
  onAlternar }`, `popover?: { secciones: { id; etiqueta; opciones; valor; onCambiar }[] }`,
  `aplicados: { id; etiqueta; onQuitar }[]`, `onLimpiar`.
- **Reglas:** un solo paradigma, **todo filtra al instante** y el texto con retardo de 300 ms
  (`useDebouncedValue` en `src/shared/hooks/`); no hay botón «Buscar» ni «Filtrar». Los filtros principales
  (uno o dos, con 7 opciones como máximo) están a la vista como chips; los secundarios, en el popover. La fila
  de aplicados muestra solo lo que está en el popover (los chips ya se ven marcados) y «Limpiar todo» aparece
  con más de un filtro. En celular el popover es una hoja inferior modal (`hoja`) con «Limpiar» y «Ver N
  resultados». El popover es no modal en escritorio: Esc lo cierra y el foco vuelve al botón.
- **Estado:** vive en el hook del listado (o en la URL, ver `patrones.md`), nunca dentro del popover; cualquier
  cambio de filtro, búsqueda u orden vuelve a la página 0.

```clases
FilterBar.raiz | relative z-10 flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-4 shadow-card
FilterBar.fila | flex flex-wrap gap-3
FilterBar.busqueda | relative min-w-0 flex-[1_1_17.5rem]
FilterBar.busquedaIcono | pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-secondary
FilterBar.busquedaInput | field-input field-input--icono field-input--accion
FilterBar.limpiarBusqueda | absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-secondary hover:bg-muted
FilterBar.chips | flex flex-wrap gap-2
FilterBar.chip | inline-flex h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors sm:h-9
FilterBar.chipInactivo | border-border-strong bg-surface text-on-surface hover:bg-muted
FilterBar.chipActivo | border-primary bg-primary-muted text-primary-muted-foreground hover:bg-primary-muted
FilterBar.contador | inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground
FilterBar.popover | absolute right-0 top-full z-30 mt-2 flex w-85 max-w-[calc(100vw-3rem)] flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-dropdown
FilterBar.aplicados | flex flex-wrap items-center gap-2 border-t border-border pt-3
FilterBar.aplicado | inline-flex h-8 items-center gap-1 rounded-full bg-primary-muted pl-3 pr-1 text-sm font-medium text-primary-muted-foreground
FilterBar.quitar | inline-flex size-6 items-center justify-center rounded-full hover:bg-primary/10
FilterBar.limpiarTodo | text-sm font-semibold text-primary underline underline-offset-4
FilterBar.hoja | fixed inset-x-0 bottom-0 z-50 flex max-h-[86dvh] flex-col rounded-t-2xl bg-surface shadow-lg
```

- **Composición:** el chip es `chip` más exactamente una de `chipInactivo` o `chipActivo` (el fondo, el borde y el color del chip activo
  no pueden convivir con los del inactivo). La búsqueda usa `field-input field-input--icono field-input--accion`.
- **Pruebas:** escribir y esperar el retardo antes de llamar a `onCambiar`; quitar un aplicado; «Limpiar todo».

### RowMenu

- **Reemplaza:** los iconos sueltos de lápiz y papelera y los botones de 12 px («Estudiantes», «Cambiar Asesor») que
  abrían formularios dentro de la fila.
- **API:** `etiqueta` (para `aria-label`: «Acciones de {nombre}»), `acciones: { etiqueta; icono?; onSeleccionar;
  peligro?; deshabilitada? }[]`.
- **Reglas:** la fila abre el detalle o el panel con su título; el menú ⋯ agrupa las acciones secundarias **con
  etiqueta**. La acción que da de baja o elimina va al final, tras un separador, en rojo. Se dibuja en un portal
  (`createPortal`, como `ConfirmDialog`) con posición calculada, para que el `overflow-x-auto` de la tabla no
  lo recorte; las coordenadas calculadas son el único `style={{}}` admitido.
- **A11y:** disparador con `aria-haspopup="menu"` y `aria-expanded`; `role="menu"` y `role="menuitem"`; flechas,
  Esc (devuelve el foco al disparador) y Tab (cierra).

```clases
RowMenu.menu | fixed z-40 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-dropdown
RowMenu.item | flex h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm sm:h-10
RowMenu.itemNormal | text-on-surface hover:bg-muted
RowMenu.itemPeligro | text-danger-muted-foreground hover:bg-danger-muted
RowMenu.separador | my-1.5 h-px bg-border
```

- **Composición:** el ítem es `item` más exactamente una de `itemNormal` o `itemPeligro`.
- **Pruebas:** abrir, moverse con flechas, seleccionar y Esc con retorno del foco.

### DataTable

- **Reemplaza:** `UsuariosTable`, `UsuariosRolTable`, `FichasPerfilTable`, las tablas de `ConsultarFichasAsesor`,
  `ConsultarFichasRepresentante` y `EstadosFichasAsesorPanel`.
- **API:** `columnas: { id; encabezado; celda: (fila) => ReactNode; ordenable?; clave? }[]`, `filas`,
  `idDeFila`, `etiqueta` (obligatoria), `orden?: { clave; direccion }` y `onOrdenar?`, `acciones?: (fila) =>
  RowMenu`, `tarjeta: (fila) => ReactNode` (la vista móvil), `cargando?`, `vacio?: ReactNode`.
- **Reglas:** **seis columnas como máximo.** La primera es la identidad (avatar o título, con el subtexto en una
  segunda línea); el estado es **una sola** `Badge`; las acciones, un `RowMenu` en la última columna. Ordenar se
  hace desde la cabecera (botón dentro del `<th>`, con `aria-sort`), nunca con un `select`; como máximo tres
  columnas ordenables. Cargando muestra `Skeleton variante="tabla"`; sin filas, el `EmptyState` que reciba.
- **Móvil (< 640 px):** deja de ser tabla y pasa a una lista de tarjetas (`tarjeta(fila)`): identidad y menú de
  44 px arriba, insignias en medio, dato secundario abajo. El `overflow-x-auto` queda solo como red de
  seguridad.
- **A11y:** `<table>` real con `aria-label`, `<th scope="col">`; el elemento que abre el detalle es un
  `<button>` o `<Link>`, no una fila con `onClick`.
- **Tamaño:** si pasa de 150 líneas, se parte en `DataTable.tsx`, `DataTableCabecera.tsx` y `DataTableTarjetas.tsx`.

```clases
DataTable.contenedor | sm:overflow-hidden sm:rounded-xl sm:border sm:border-border sm:bg-surface sm:shadow-card
DataTable.scroll | hidden overflow-x-auto sm:block
DataTable.tabla | w-full text-left text-sm
DataTable.cabecera | bg-surface-secondary text-xs font-semibold text-on-surface-secondary
DataTable.th | px-5 py-3 font-semibold
DataTable.orden | -ml-2 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 font-semibold hover:bg-muted hover:text-on-surface
DataTable.fila | border-t border-border transition-colors hover:bg-surface-secondary
DataTable.celda | px-5 py-3 align-middle
DataTable.titulo | block truncate font-semibold text-on-surface
DataTable.subtexto | block truncate text-[13px] text-on-surface-secondary
DataTable.tarjetas | flex flex-col gap-2.5 sm:hidden
DataTable.tarjeta | flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-3.5 pr-2 shadow-card
```

- **Pruebas:** al pulsar una cabecera ordenable se llama a `onOrdenar` con la dirección que sigue.

### PaginadorListado (ampliado)

- **No se crea `Pagination`:** se amplía `src/shared/components/PaginadorListado.tsx` con el mismo nombre y las
  props de hoy, y se borran las tres copias en línea (`FichasPerfilTable`, `ConsultarFichasRepresentante`,
  `ConsultarFichasAsesor`).
- **Añade:** números de página con puntos suspensivos y `aria-current="page"`; selector «Filas» solo si el backend
  admite `tamanio` variable (`tamanosDisponibles?`, `onTamanoChange?`); en celular, «Página 2 de 10» con
  flechas de 44 px. Sigue ocultándose con una sola página.

```clases
Paginador.raiz | flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between
Paginador.texto | text-sm text-on-surface-secondary
Paginador.numero | inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium
Paginador.numeroInactivo | text-on-surface-secondary hover:bg-muted
Paginador.numeroActivo | bg-primary text-primary-foreground hover:bg-primary
Paginador.flecha | inline-flex size-11 items-center justify-center rounded-lg border border-border-strong text-on-surface hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 sm:size-9
Paginador.filas | h-9 rounded-lg border border-border-input bg-surface px-2 text-sm
```

- **Composición:** el número es `numero` más exactamente una de `numeroInactivo` o `numeroActivo`.

## Formularios y superposiciones

### FormSection, FormActions y ErrorSummary

- **`FormSection`:** `titulo`, `descripcion?`, `opcional?`, hijos. Agrupa campos relacionados con un `<h2>` y
  `aria-labelledby` (un `fieldset` con su título). Rejilla de dos columnas desde `sm` para campos cortos; el campo
  largo ocupa la fila; el valor corto (identificador, teléfono) usa `Field.corto`.
- **`FormActions`:** barra pegada al pie del panel o de la página: a la izquierda el estado («Cambios sin
  guardar», con punto), a la derecha `Cancelar` (secundario) y la acción con **su verbo** («Registrar usuario»,
  «Guardar cambios»); en celular el botón principal va arriba y a ancho completo (clase global `.actions-row`).
  **La validez no deshabilita el botón principal**: se deshabilita mientras envía y, al editar, mientras no hay
  cambios (`!isDirty`).
- **`ErrorSummary`:** `errores: { campo; mensaje }[]`, `onIrAlCampo`. Es un `Notice` `peligro` con título «Revisa
  N campos antes de continuar» y una lista cuyos elementos son botones que llevan el foco al campo (`setFocus` de
  react-hook-form). Aparece **solo** tras un envío inválido (`handleSubmit(onValido, onInvalido)`) y toma el
  foco (`tabIndex={-1}`).

```clases
FormSection.raiz | flex min-w-0 flex-col gap-4
FormSection.cabecera | border-b border-border pb-2
FormSection.titulo | text-base font-semibold text-on-surface
FormSection.descripcion | text-sm text-on-surface-secondary
FormSection.rejilla | grid gap-4 sm:grid-cols-2
FormActions.raiz | sticky bottom-0 z-10 flex flex-col gap-3 border-t border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6
FormActions.estado | inline-flex items-center gap-2 text-sm text-on-surface-secondary
FormActions.punto | size-2 rounded-full bg-tertiary
ErrorSummary.lista | mt-1 list-disc space-y-1 pl-5
ErrorSummary.enlace | text-left underline underline-offset-4
```

- **Pruebas:** `ErrorSummary` (el clic lleva el foco al campo) y `FormActions` (el botón se deshabilita enviando y
  sin cambios, pero no por validez).

### SidePanel

- **Reemplaza:** el formulario que se abría encima de las pestañas y los filtros (`registrarAbierto &&
  <RegistrarUsuarioForm />`, `usuarioEnEdicion && <ModificarUsuarioForm />`).
- **API:** `titulo`, `descripcion?`, `onCerrar`, `sucio?` (hay cambios sin guardar), `pie?: ReactNode` (el
  `FormActions`), hijos.
- **Comportamiento:** panel a la derecha sobre un fondo oscuro; la lista **se queda detrás** con sus filtros y su
  página. En celular ocupa toda la pantalla. Se cierra con ✕, Esc, clic en el fondo y «Cancelar»; con `sucio`
  pide antes «¿Descartar los cambios?» (`ConfirmDialog`). El estado de abierto/cerrado y de la entidad en
  edición vive en la `{Rol}View`, por encima del panel (regla de «Retorno tras registrar, editar o eliminar»).
- **A11y:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby`; foco atrapado, el primer campo recibe el foco,
  se bloquea el scroll del fondo y el foco vuelve al botón que lo abrió.
- Se dibuja en un portal. Necesita el token `--animate-slide-in-right` (ver `tokens.md`).

```clases
SidePanel.fondo | fixed inset-0 z-40 bg-black/40 animate-fade-in
SidePanel.panel | fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-surface shadow-lg animate-slide-in-right sm:max-w-140 sm:border-l sm:border-border
SidePanel.cabecera | flex items-start justify-between gap-4 border-b border-border py-4 pl-4 pr-2 sm:py-5 sm:pl-6
SidePanel.titulo | text-xl font-bold text-on-surface
SidePanel.descripcion | mt-1 text-sm text-on-surface-secondary
SidePanel.cuerpo | flex-1 overflow-y-auto p-4 sm:p-6
```

- **Pruebas:** Esc cierra, el foco queda atrapado y vuelve al disparador, `sucio` pide confirmación.

### ConfirmDialog (se actualiza en su sitio)

Conserva su API (`titulo`, `descripcion`, `labelConfirmar`, `labelCancelar`, `variante`, `cargando`, `onConfirmar`,
`onCancelar`) y gana `consecuencias?: string[]`. Lo que cambia:

- **Foco:** entra al diálogo y queda atrapado; en `peligro` empieza en «Cancelar». Al cerrar, vuelve al botón que
  lo abrió.
- **Teclado:** Esc cancela y el fondo también, salvo mientras `cargando`.
- **Semántica:** `role="alertdialog"` en `peligro` y `dialog` en `advertencia`; `aria-labelledby` y
  `aria-describedby` con `useId` (hoy el `id` es fijo y se repite).
- **Aspecto:** el icono usa `danger-muted` o `tertiary-muted` (hoy `text-warning`, que no existe); los botones
  son `Button` (`secundario` y `peligro` o `primario`). El botón dice la acción, no «Confirmar».

```clases
ConfirmDialog.panel | relative z-10 w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg animate-fade-up
ConfirmDialog.icono | flex size-9 shrink-0 items-center justify-center rounded-lg
ConfirmDialog.iconoPeligro | bg-danger-muted text-danger-muted-foreground
ConfirmDialog.iconoAdvertencia | bg-tertiary-muted text-tertiary-muted-foreground
ConfirmDialog.consecuencias | list-disc space-y-1 pl-5 text-sm text-on-surface-secondary
```

### Toaster (se actualiza en su sitio)

La API `toast.success|info|error(titulo, mensaje?)` **no cambia**; cambia el componente y el tipo `ToastLevel`:

- Se elimina el nivel `debug` (nadie lo usa; solo está declarado en `toastStore.ts` y `useToast.ts`).
- Posición: abajo a la derecha en escritorio y al pie, a todo el ancho, en celular. Hoy son 320 px fijos arriba a la
  derecha, sobre el encabezado y los menús. Máximo tres a la vez; el temporizador se detiene al pasar el cursor.
- Sin barra de color a la izquierda: icono en círculo con color de variante, título, mensaje, botón de cerrar de
  36 px y, opcional, una acción («Deshacer»). `role="alert"` en `error` y `role="status"` en el resto.

```clases
Toaster.region | fixed inset-x-4 bottom-4 z-[9999] flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-96
Toast.tarjeta | flex items-start gap-3 rounded-xl border border-border bg-surface p-3 pr-1.5 shadow-dropdown
Toast.icono | flex size-8 shrink-0 items-center justify-center rounded-full
Toast.exito | bg-secondary-muted text-secondary-muted-foreground
Toast.info | bg-primary-muted text-primary-muted-foreground
Toast.error | bg-danger-muted text-danger-muted-foreground
Toast.titulo | text-sm font-semibold text-on-surface
Toast.mensaje | mt-0.5 text-sm text-on-surface-secondary
Toast.accion | mt-1.5 text-sm font-semibold text-primary underline underline-offset-4
Toast.cerrar | ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-on-surface-secondary hover:bg-muted
```

## Estructura de página

### PageHeader

- **Reemplaza:** los encabezados distintos de cada pantalla (`h1` semibold, `h1` bold, `h2` xl, `h2` lg) y las
  cabeceras sin `<h1>` de las vistas de fichas. No usa las clases globales `.section-header` ni `.header-action`:
  combinadas con `PageHeader.fila`, la clase global gana y los `items-end` y `gap-4` de la fila quedan inertes.
- **API:** `titulo` (el `<h1>`), `descripcion?`, `acciones?: ReactNode`, `migas?: { etiqueta; to? }[]`.
- **Reglas:** **un solo `<h1>` por pantalla**, aquí. La acción principal va a la derecha del título, dentro de
  `PageHeader.acciones` (varias acciones quedan a 8 px); si no cabe a su lado, la fila envuelve y baja bajo el
  título. En celular puede ser un `IconButton` de 44 px con `etiqueta` (por ejemplo «Registrar usuario») o un
  `Button`. Las migas solo existen en pantallas con ruta hija (detalle, formulario en página):
  `<nav aria-label="Ruta de navegación">` con una lista; las intermedias son `Link` si traen `to`, la última lleva
  `aria-current="page"` y el separador es un `ChevronRight` decorativo.

```clases
PageHeader.raiz | flex flex-col gap-4
PageHeader.fila | flex flex-wrap items-end justify-between gap-4
PageHeader.encabezado | min-w-0
PageHeader.titulo | text-xl font-bold text-on-surface sm:text-2xl
PageHeader.descripcion | mt-1 text-sm text-on-surface-secondary
PageHeader.acciones | flex flex-wrap items-center gap-2
PageHeader.migas | flex flex-wrap items-center gap-1.5 text-[13px] text-on-surface-secondary
PageHeader.miga | inline-flex items-center gap-1.5
PageHeader.migaEnlace | hover:text-on-surface hover:underline
PageHeader.migaActual | font-medium text-on-surface
```

### Disposición con panel lateral (receta, no es un componente)

Para el detalle de una entidad y para el formulario en página con resumen. Se acomoda sola: sin breakpoint, el
panel lateral baja debajo del contenido cuando no cabe a su lado.

```clases
Layout.contenedor | flex flex-wrap items-start gap-5
Layout.principal | flex min-w-0 flex-[1_1_35rem] flex-col gap-4
Layout.lateral | flex w-full min-w-0 flex-[0_1_20rem] flex-col gap-4 max-sm:flex-[1_1_100%]
Layout.tarjetaLateral | flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-card
Layout.tituloLateral | text-xs font-semibold tracking-wider text-on-surface-secondary uppercase
```
