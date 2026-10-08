# Kit de componentes

Lo que cada pieza hace, cómo se llama su API y con qué clases se pinta. Las clases salen de
`tokens.md` (todas son semánticas y mobile first). Las de las 11 piezas del kit base se **comprobaron contra el
compilador de Tailwind y en el navegador con `getComputedStyle`**. Las de las piezas de listado (`Avatar`, `RowMenu`,
`DataTable`, `FilterBar` y `PaginadorListado`) están copiadas del código tal como quedó: se compilaron, se vieron en
`/usuarios` con datos reales a 1280, 390 y 320 px y se midió su cascada con `getComputedStyle` (campo de búsqueda, chips,
ítem de peligro, números del paginador, contador del botón «Filtros», filtros aplicados, popover y hoja). **No se vieron en
pantalla** los puntos suspensivos del paginador ni el paginador ampliado (no se ve en ninguna pantalla actual con una sola página), y
la acción deshabilitada del menú y la insignia «Dado de baja» se midieron en un DOM temporal, no en la pantalla. Las de las
piezas de formularios y superposiciones (`FormSection`, `FormActions`, `ErrorSummary`, `SidePanel`, `Switch`, `ConfirmDialog`,
`Toaster` y `Field.corto`) también están copiadas del código tal como quedó: se compilaron (`@tailwindcss/node` 4.2.2, sin
conflictos entre utilidades de la misma propiedad) y se vieron en `/usuarios` con la sesión real del administrador a 1280, 390 y
320 px, con teclado y ratón reales. Se midió su cascada con `getComputedStyle` (el panel a cada ancho, el `Switch` encendido,
apagado y deshabilitado, el icono y el panel de `ConfirmDialog` en sus dos variantes, el nivel y la tarjeta del `Toaster` y el
pie en celular) y se comprobó la trampa de foco de la hoja de `FilterBar` con su telón (a 390, 320, 639 y 640 px). **No se
vieron en pantalla** ningún envío ni mutación (éxito, error del backend, `ocupado`, «Procesando...») ni el `alertdialog` «¿Quitar
el rol…?»: la verificación no acciona nada sobre cuentas reales y los cubren las pruebas. El `Switch` `pendiente` y el peor caso
de la cabecera de `SidePanel` se midieron en un DOM temporal, y de los avisos solo se leyó la animación de entrada: la de salida
(`animate-toast-out`) no se vio. `Combobox` y la disposición con panel lateral se construyeron en HT-UX-05 y sus
recetas coinciden con el código. `Segmented` aún no existe (sin consumidor) y su receta queda como referencia: aplica la regla
«Composición de clases» de abajo, no la reinventes ni la sustituyas por colores crudos.

**Lista `src/shared/components/ui/` antes de crear nada**: el estado real del kit está ahí, no en esta
página. Lo que sigue es la receta para escribir lo que falte.

## Convenciones del kit

- Un archivo por pieza, `PascalCase.tsx`, `export default function`, `interface Props` y **sin JSDoc**.
  Menos de 150 líneas: si crece, la lógica sube a un hook de `src/shared/hooks/` y lo visual se parte en
  subcomponentes de la misma carpeta.
- **Nombre del componente en inglés** (sufijo técnico) y **props en español**, como `ConfirmDialog`
  (`titulo`, `variante`, `cargando`). La variante de aviso se llama `advertencia`, igual que allí.
- Iconos de `lucide-react` con `size={16}` y `aria-hidden` (salvo el recuadro de `EmptyState` y de `ErrorState`, que
  usa 22, y el mensaje de error de `Field`, el separador de las migas, el check del chip de `FilterChip`, el ✕ del filtro
  aplicado de `FilterBar` y las flechas de orden de la cabecera de `DataTable`, que usan 14). Un botón que solo tiene
  icono lleva `etiqueta`.
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
| `Button`, `IconButton`, `Badge` (+ `estado-variante.ts`), `Field`, `Notice`, `EmptyState`, `ErrorState`, `Skeleton`, `PageHeader`, `Avatar`, `Tabs` | `src/shared/components/ui/` | Usuarios y Fichas ya las necesitan |
| `Segmented` | no creada | Sin consumidor aún: se crea con la receta de abajo cuando una pantalla cambie la vista de los mismos datos |
| `DataTable`, `FilterBar`, `RowMenu`, `FormSection`, `FormActions`, `ErrorSummary` | `src/shared/components/ui/` | Usuarios y Fichas tienen listados y formularios |
| `PaginadorListado` ampliado | se queda en `src/shared/components/` | Ya lo importan dos features |
| `SidePanel` | `src/shared/components/ui/` | Excepción de la adopción a la regla de abajo: nació con Usuarios (HT-UX-03) y su segundo consumidor, `fichas-perfil` (paneles «Estudiantes de la ficha» y «Cambiar asesor» del coordinador), llegó en HT-UX-04 |
| `Switch` | `features/usuarios/components/` | Solo Usuarios lo usa; sube a `ui/` con el segundo consumidor |
| `Combobox` | `features/fichas-perfil/components/` | Solo Fichas lo usa; sube a `ui/` con el segundo consumidor. Su lógica, `useCombobox`, vive en `src/shared/hooks/` |
| `ConfirmDialog`, `Toaster`, `PageSkeleton`, `AvisoNoDisponible`, `ComingSoon` | siguen en `src/shared/components/` | Se **actualizan en su sitio**; no se mueven |

Una pieza «feature primero» sube a `shared/components/ui/` cuando una segunda feature la necesita: se mueve
el archivo y se ajustan los imports, sin cambiar su API. Si un plan declara en `shared/` una pieza con un
solo consumidor, es una ambigüedad: pregunta, no la crees. La lógica de foco que comparten las superposiciones
(`SidePanel`, `ConfirmDialog` y la hoja de `FilterBar`) vive en el hook `useTrampaDeFoco`, de `src/shared/hooks/`
(ver «useTrampaDeFoco»).

## Piezas base

### Button

- **Reemplaza:** los botones escritos a mano; quedan 13 en 9 archivos fuera de `ui/`, que se migran al tocarlos.
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
- **API:** `etiqueta: string` (obligatoria, va a `aria-label`), `icono: LucideIcon`, `tono?: 'neutro' | 'primario' | 'peligro'`, `rotulo?: string` (etiqueta visible al pasar el cursor o enfocar, a la izquierda del botón; solo para botones que viven en el borde derecho de una fila; el nombre accesible sigue siendo `etiqueta`).
- **Regla:** 44 px de área en celular y 36 px desde `sm`.
- **Composición:** `base` + **un** tono. Cada tono trae su color de texto y su hover: con el hover de `neutro` en
  la base, `peligro` no cambiaría de color al pasar el cursor.

```clases
IconButton.base | inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:w-9
IconButton.neutro | text-on-surface-secondary hover:bg-muted hover:text-on-surface
IconButton.primario | text-on-surface-secondary hover:bg-primary-muted hover:text-primary-muted-foreground focus-visible:bg-primary-muted focus-visible:text-primary-muted-foreground
IconButton.rotulo | pointer-events-none absolute right-full top-1/2 z-10 mr-2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-border bg-surface-elevated px-2 py-1 text-xs font-medium text-on-surface opacity-0 shadow-dropdown transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 (el botón suma `group relative` solo con `rotulo`)
IconButton.peligro | text-on-surface-secondary hover:bg-danger-muted hover:text-danger-muted-foreground
```

### Badge y `estado-variante.ts`

- **Reemplaza:** las pastillas hechas con `bg-green-100`, `bg-red-100`… (`EstadosEvaluacionPanel`, ya migrada) y con
  `bg-muted` (ya migradas a `Badge`: `FichaCeldas`, `EstadosEvaluacionPanel` y `EstadosFichaPanel`).
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
| Revisión de ítem | `NUEVA` → info · `VISUALIZADA` → neutro · `EN_PROGRESO` → advertencia · `CORRECCION_DISPONIBLE` → advertencia · `CERRADA` → exito |
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

- **Reemplaza:** `CampoTexto` (solo Usuarios; ya eliminado), `.field-label`/`.field-input` armados a mano y los campos con
  clases propias (los formularios de fichas; `EstadosFichaPanel` y los de evaluación ya usan `Field`).
- **API:** `etiqueta`, `ayuda?`, `error?`, `opcional?`, `corto?`, `contador?: { actual: number; max: number }` y un
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
- **Ancho corto:** `corto` suma `max-w-60` (240 px) a la raíz, para un valor corto (identificador, teléfono); sin la prop el
  campo ocupa el ancho de su contenedor.
- **Composición:** la raíz es `raiz` y, solo con `corto`, suma `corto` (una sola utilidad de ancho); el contador es `contador` +
  **uno** de `contadorReposo` o `contadorCerca`; sumados, el color lo decidiría el orden de la hoja y no el estado.
- **Con react-hook-form:** `useForm({ mode: 'onTouched' })`; el error aparece al salir del campo y se limpia
  al corregir (ver §2 «Formulario en panel lateral» en `patrones.md`).

```clases
Field.raiz | flex min-w-0 flex-col
Field.corto | max-w-60
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
sin capa. Un campo con icono a la izquierda o con una acción a la derecha usa dos clases globales que HT-UX-02 creó en
`src/index.css` con `FilterBar`, la primera pieza que las usa. Van **después** del bloque `@media (min-width: 640px)` (el
final de la sección «Mobile first»), no justo después de `.field-input`: ese bloque vuelve a declarar el `padding` de
`.field-input` con la misma especificidad y, como va después, vencería a las clases desde 640 px: el relleno del icono
desaparecería y el icono pisaría el texto. Medido con `getComputedStyle`: el campo de búsqueda tiene `padding-left` y
`padding-right` de 40 px a 390, 500, 639, 640 y 1280 px.

```css
/* Van después del bloque de 640 px: este vuelve a declarar el padding de .field-input. */
.field-input--icono {
  padding-left: 2.5rem;
}

.field-input--accion {
  padding-right: 2.5rem;
}
```

**`select` en un `Field`.** El `select` usa la clase global `select.field-input` (`index.css`, tras `.field-input--accion`,
por el mismo motivo que `--icono` y `--accion`: va después del bloque de 640 px): quita la flecha nativa
(`appearance: none`), dibuja una propia con dos `linear-gradient` del color `on-surface-secondary` y reserva 2.5 rem a la
derecha. La regla vive solo en `index.css`: un `select` no repite flecha ni `padding-right`. Con un icono a la izquierda
suma `field-input--icono` y el icono sigue `Combobox.icono` (16 px, `text-on-surface-secondary`, dentro de un contenedor
`relative`); el ancho por contenido (`w-fit max-w-full`) se resuelve en ese contenedor, no con `corto`. Referencia:
`NuevaSolicitudPanel`. Sin medir: la flecha en modo de contraste forzado del sistema (los degradados no se pintan).

```css
/* Va después del bloque de 640 px, igual que --icono y --accion. */
select.field-input {
  padding-right: 2.5rem;
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, var(--color-on-surface-secondary) 50%),
    linear-gradient(135deg, var(--color-on-surface-secondary) 50%, transparent 50%);
  background-position:
    calc(100% - 1.25rem) 50%,
    calc(100% - 0.9rem) 50%;
  background-size:
    0.35rem 0.35rem,
    0.35rem 0.35rem;
  background-repeat: no-repeat;
}
```

`Field.valido` (`border-secondary pr-10`) no está en el código: ningún prop lo activa. Se agrega cuando una
pantalla lo pida.

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

### EmptyState, ErrorState y Skeleton

- **Reemplazan:** los 18 spinners copiados que se migraron (`AppLoader`, la pantalla de arranque, sigue en el baseline), `PageSkeleton` con forma de dashboard dentro de una pantalla,
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
- **Un solo spinner:** el de `Button` (`cargando`). `src/arquitectura.test.ts` rechaza otro fuera de
  `shared/components/ui/`; solo `AppLoader` (arranque de la app) queda en el baseline. Una carga de forma desconocida se
  resuelve con la forma de `Skeleton` más cercana (`lineas`).
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
```

- **Pruebas:** `ErrorState` (el clic en «Reintentar» llama a `onReintentar`).

### Avatar

- **API:** `nombre` y `className?` (solo disposición). **No tiene `tamano`**: la receta solo trae el tamaño de 36 px y el
  `sm` se agrega cuando un consumidor lo pida. Muestra las iniciales de las dos primeras palabras, en mayúscula (con una
  sola palabra, una inicial; sin nombre, «?»). Decorativo: el nombre ya está al lado, así que va con `aria-hidden`.

```clases
Avatar.base | inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-muted text-xs font-bold text-primary-muted-foreground
```

## Navegación y selección

### Tabs y Segmented (esta última sin crear)

- **Reemplazan:** las cinco pestañas copiadas (una con subrayado en `AdministradorView`, cuatro segmentadas
  cuya pista `bg-muted/50` no se pintaba).
- **`Tabs`** (subrayado): genérico, `Tabs<T extends string>`: `items: { id: T; etiqueta; contador?; icono?; to? }[]`,
  `valor: T`, `etiqueta` (va a `aria-label`), `onCambiar?: (id: T) => void`, `children?` y `className?`.
  Si **todos** los ítems traen `to` (subrutas) renderiza `<nav aria-label>` con un `Link` por ítem y
  `aria-current="page"` solo en el de `valor` (no `NavLink`: así `valor` es la única fuente de la pestaña
  activa): **las pestañas navegan y cambian la URL**, y `children` no se usa. Si no (secciones dentro de la
  misma página) usa `role="tablist"` y `role="tab"` (botones `type="button"`), `aria-selected`, solo la activa
  es tabulable, y las flechas (que dan la vuelta), Inicio y Fin mueven el foco y la selección.
  Los `children` se envuelven en `<div role="tabpanel" aria-labelledby>` ligado a la pestaña activa, y la activa
  lleva `aria-controls` hacia él (solo si hay `children`): sin el panel, `aria-controls` apuntaría a nada y cada
  consumidor repetiría los ids.
- **`icono` (opcional):** un `LucideIcon` que va **antes** de la etiqueta, a 16 px y con `aria-hidden`, en los dos
  modos (`tablist` y `to`): el nombre accesible de la pestaña sigue siendo solo la etiqueta. `ContenidoPestana`
  (`shared/components/ui/ContenidoPestana.tsx`) dibuja ese contenido común (icono, etiqueta y contador) y `Tabs` lo usa
  dentro del `<button>` y del `Link`. Es opcional y no lleva clase propia: `Tabs.pestana` ya trae `gap-2`. Una sola
  pestaña con icono (el «+» de «Nueva solicitud») es aceptable si las demás no lo llevan.
- **Modo `to` y `state`:** `to` es una cadena, así que el `state` de la navegación (por ejemplo, el resumen que viaja
  desde el listado) **no** pasa de una pestaña a otra. Quien lo necesite lo lee una vez y lo guarda en un contenedor
  que siga montado (`useResumenFicha`). En este modo el contenido va en un `<Outlet />` hermano, no en `children`.
- **`idBase`:** opcional (por defecto `useId()`). Sin `children`, la pestaña activa lleva `aria-controls` al id
  `${idBase}-panel-${id}`: el consumidor monta sus paneles, con ese `id` y `aria-labelledby` hacia `${idBase}-pestana-${id}`.
  Con `children` el comportamiento no cambia.
- **Sin `-mb-px`:** la pestaña no se monta sobre el borde de la lista. Ese solape de 1 px desborda la lista (que
  lleva `overflow-x-auto`), abre una barra vertical y recorta el subrayado.
- **Composición de `Tabs`:** `pestana` + **una** de `activa` o `inactiva`; `contador` + **una** de
  `contadorActiva` o `contadorInactiva`. La activa no lleva hover. `raiz` envuelve la lista y el panel solo en el
  modo `tablist`; en el modo `to` la raíz es el `<nav>`.
- **`Segmented` (sin consumidor aún, no creada: la receta queda como referencia):** `opciones: { id; etiqueta }[]`, `valor`, `onCambiar`, `etiqueta`. Cambia la **vista** de los
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

- **Pruebas:** `Tabs` en modo `tablist` (flechas mueven el foco y la selección; solo la activa es tabulable) y el
  `icono` decorativo (no cambia el nombre accesible y queda fuera del árbol de accesibilidad).

### Switch

- **Reemplaza:** las casillas que guardan al instante (`RolesUsuarioFieldset`, ya eliminado).
- **API:** `marcado: boolean`, `onCambiar: (valor: boolean) => void`, `etiqueta: string`, `descripcion?: string`,
  `insignia?: ReactNode`, `pendiente?` y `deshabilitado?`. Vive en `features/usuarios/components/Switch.tsx`.
- **Estructura:** una `fila` con, a la izquierda, los textos (un `<label htmlFor>` con la `etiqueta` y, si hay `descripcion`, un
  `<span>` que describe al botón con `aria-describedby`), la `insignia` (por ejemplo `<Badge variante="neutro">Pronto</Badge>`; no
  entra en `aria-describedby`) y el `<button type="button" role="switch" aria-checked>` con la pista y el pulgar. Un clic en la
  etiqueta también alterna. La fila mide 64 px como mínimo y la pista, 44×26 px.
- **Reglas:** **se aplica al instante y la mutación avisa con toast** (`Rol agregado` / `Rol quitado`); quitar algo que da
  acceso pide `ConfirmDialog`. Solo el interruptor cuya mutación corre queda `pendiente`; los demás siguen operables. Lo que aún
  no existe se muestra `deshabilitado` con la insignia «Pronto» (al ser `disabled`, no recibe el foco con Tab). Una casilla
  (`checkbox`) o un radio se usa solo cuando el valor viaja con el botón del formulario.
- **`pendiente`:** pone `aria-busy` y `aria-disabled`, ignora los clics y atenúa la pista (0,5 de opacidad), pero **no** pone el
  atributo `disabled`. Desvío de la receta anterior, que deshabilitaba el interruptor: un botón enfocado que pasa a `disabled`
  puede perder el foco, y quien opera con teclado tendría que recorrer el panel de nuevo. `deshabilitado` sí usa `disabled`.

```clases
Switch.pista | relative inline-flex h-6.5 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50
Switch.pistaOff | bg-border-input
Switch.pistaOn | bg-primary
Switch.pulgar | absolute left-0.75 size-5 rounded-full bg-surface shadow-sm transition-transform
Switch.pulgarOn | translate-x-4.5
Switch.fila | flex min-h-16 items-center gap-3 border-t border-border py-2.5 first:border-t-0
Switch.textos | flex min-w-0 flex-1 flex-col
Switch.etiqueta | text-sm font-semibold text-on-surface
Switch.descripcion | text-[13px] text-on-surface-secondary
```

- **Composición:** la pista es `pista` más exactamente una de `pistaOff` o `pistaOn`; el pulgar, `pulgar` más `pulgarOn` solo
  cuando está marcado. `pista` trae el atenuado de los dos estados (`disabled:` y `aria-disabled:`) porque `pendiente` usa
  `aria-disabled` y debe verse igual. El pulgar se desplaza con la propiedad CSS `translate` (en Tailwind 4, `translate-x-4.5`
  son 18 px), no con `transform`: se verifica con `getComputedStyle(...).translate`.

### Combobox

- **Reemplazó (HT-UX-05):** el `select` con «nombre — correo» (`SelectorAsesorFicha`) y el muro de botones para elegir
  estudiantes (`RegistrarFichaPerfil`), ya eliminados. Lo usan `NuevaFichaAsesorSeccion` y `NuevaFichaEstudiantesSeccion` (dentro de `RegistrarFichaPerfilPanel`, HT-UX-05-AJ1), `CambiarAsesorPanel` y `AsignarEstudianteForm`.
- **Cuándo:** hasta 5 opciones, radio o chips; de 6 a 8, `select` nativo; más de 8, o cuando hay que reconocer
  personas, `Combobox`.
- **API:** `opciones: { id; etiqueta; descripcion? }[]`, `valor` (un `id` o `id[]`), `onCambiar`, `multiple?`,
  `max?`, `textoVacio`, `etiquetaElegidos` (nombre accesible de la lista de elegidos), `placeholder?`, `deshabilitado?`, `onBlur?`, `ref?` (React 19) y los
  atributos de `Field` (`id`, `aria-invalid`, `aria-describedby`); se envuelve en `Field` para su etiqueta. El tipo `OpcionCombobox` vive en
  `useCombobox.ts` y `Combobox.tsx` lo reexporta.
- **Modo único:** con valor, el input se oculta y se muestra una tarjeta (`Combobox.elegido`) con el nombre, el correo y «Cambiar», que recibe el
  `id` del `Field`, vacía el valor y devuelve el foco al input. **Modo múltiple:** al llegar a `max` el input se deshabilita y el foco pasa al ✕ de la
  última fila.
- **Archivos:** `Combobox.tsx` (campo), `ComboboxLista.tsx` (listbox, «Agregada» y texto vacío), `ComboboxElegidos.tsx` (filas con ✕, contador y
  tarjeta única) y `useCombobox` (texto, filtrado, índice activo, teclado, clic fuera). Esc con la lista abierta llama `preventDefault()` para no
  cerrar el `SidePanel` o el `ConfirmDialog` que la contiene (dos pasos: la lista, luego el panel).
- **Dentro de un `SidePanel`:** la lista flotante (`absolute inset-x-0 top-full`) vive en el cuerpo con scroll del panel: su ancho es el
  del campo (sin barra horizontal) y se alcanza con el scroll del panel. Si en una pantalla futura la lista queda inalcanzable, la salida
  prevista es pintarla en línea (empuja el contenido); hoy no hace falta.
- **Comportamiento:** filtra en el cliente por etiqueta y descripción, sin distinguir mayúsculas ni tildes
  (normaliza con `NFD`). Lo elegido se ve debajo como filas con ✕ (`IconButton`, «Quitar a {nombre}») y un
  contador «2 de 3»; lo ya elegido aparece en la lista deshabilitado con «Agregada»; al llegar a `max` el
  campo se deshabilita con una frase. Sin virtualización: más de unos cientos de opciones piden búsqueda en
  el servidor (otra historia).
- **A11y:** patrón ARIA combobox/listbox: `role="combobox"`, `aria-expanded`, `aria-controls`,
  `aria-autocomplete="list"`, `aria-activedescendant`; opciones en `<li role="option">`; el foco no sale del
  campo; flechas, Enter, Esc, Inicio y Fin. La lógica de teclado y filtrado vive en `useCombobox`
  (`src/shared/hooks/`, un solo consumidor por decisión de HT-UX-05).

```clases
Combobox.input | field-input field-input--icono
Combobox.icono | pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-secondary
Combobox.lista | absolute inset-x-0 top-full z-30 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-dropdown
Combobox.opcion | flex min-h-12 w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left text-sm cursor-pointer
Combobox.opcionActiva | bg-muted
Combobox.opcionAgregada | opacity-60 cursor-not-allowed
Combobox.elegido | flex items-center gap-3 rounded-lg border border-border-input bg-surface py-2 pl-3 pr-2
```

- **Composición:** `opcion` más, a lo sumo, una de `opcionActiva` u `opcionAgregada`. El campo de texto usa
  `field-input field-input--icono`: los `pl-10`/`pr-10` de utilidad pierden contra el `padding` de `.field-input`, así que el
  espacio del icono se pide con las clases globales de campo (ver «Field», «Modificadores de campo»).
- **Pruebas:** filtrar escribiendo, elegir con Enter, quitar con ✕ y el tope `max`.

## Listados

### FilterBar

- **Reemplaza:** `FiltrosUsuariosPanel`, el formulario de filtros de `ConsultarFichasRepresentante`, el de
  la lista de estados del asesor (eliminada en HT-UX-06-AJ1) y las pestañas por rol de Usuarios.
- **Archivos:** `FilterBar.tsx` (la tarjeta, el botón «Filtros», los chips y los aplicados), `FilterBarBusqueda.tsx` (el campo; su
  borrador y su retardo viven en el hook `useTextoConRetardo`), `FilterChip.tsx` (chip de selección, `aria-pressed`; declara
  `OpcionFiltro = { id; etiqueta }`), `FilterBarPanel.tsx` (popover y hoja, con su trampa de foco; recibe `retorno`, el botón
  «Filtros»), `FilterBarSecciones.tsx` (declara `SeccionFiltro` —unión de tres tipos— y `OrdenFiltro`; trae `SeccionChips`,
  `SeccionDeFiltro`, que despacha por `tipo`, y `limpiarSeccion`) y `FilterBarSeccionTexto.tsx` (la sección de texto).
  `FilterBar` y `FilterBarPanel` reexportan los tipos.
- **API:** `busqueda: { valor; onCambiar; etiqueta; placeholder }`, `chips?: { etiqueta; opciones; seleccionados; onAlternar(id);
  onTodos() }`, `popover?: { secciones: SeccionFiltro[] }`, `orden?: OrdenFiltro`, `aplicados: { id; etiqueta; onQuitar }[]`,
  `onLimpiar` y `totalResultados?: number`. `SeccionFiltro` es una unión por `tipo`, todas con `id` y `etiqueta`: **opciones** (`tipo?: 'opciones'`, el ausente; `opciones`, `valor`,
  `onCambiar(id)`, `deshabilitada?`, `aviso?`) es de **selección única**: `valor` es el `id` elegido, «Todos» es una opción más (con `id`
  vacío) que pone quien la usa y `''` significa «sin filtro»; **multiple** (`tipo: 'multiple'`, `opciones`, `valores: string[]`,
  `onAlternar(id)`, `onLimpiar()`, `deshabilitada?`, `aviso?`) pinta chips con `aria-pressed` y **sin «Todos»**: sin selección significa
  todos; **texto** (`tipo: 'texto'`, `valor`, `onCambiar(texto)`, `placeholder?`) pinta una etiqueta y un `field-input` con el mismo
  retardo de 300 ms que la búsqueda (`useTextoConRetardo`) y sin ✕ propio (se vacía con «Limpiar» o con el ✕ del filtro aplicado).
  `deshabilitada` deshabilita los chips de la sección y `aviso` (un `ReactNode`, por ejemplo `AvisoNoDisponible` o un `Notice`) se
  dibuja debajo. Un borrador de texto con el retardo pendiente se pierde si se cierra el popover antes de 300 ms (el panel solo se
  monta abierto). `OrdenFiltro = { etiqueta; opciones; valor; onCambiar(id) }` es la sección «Ordenar por» de
  la hoja y se ve **solo bajo 640 px**: la tabla pasa a tarjetas sin cabecera y sin ella no habría cómo ordenar. `totalResultados`
  da el «Ver N resultados» del pie del panel.
- **Búsqueda:** el campo (`type="text"`, `inputMode="search"`, `autoComplete="off"`; su etiqueta va en un `<label>` `sr-only`) se
  controla con un **borrador local** y el retardo de 300 ms (`useDebouncedValue`, en `src/shared/hooks/`) vive **aquí**, no en el
  hook del listado: `busqueda.onCambiar` recibe el texto crudo (sin recortar) 300 ms después de la última tecla y solo si difiere
  del último valor emitido, y `busqueda.valor` es el texto ya confirmado, así que el hook del listado guarda el valor que recibe, sin
  segunda espera. El borrador solo sigue a `valor` cuando el cambio no lo emitió el propio campo. El ✕ «Borrar búsqueda» (visible
  solo con texto) vacía el borrador, cancela el retardo pendiente, emite `''` **de inmediato** y devuelve el foco al campo.
- **Reglas:** un solo paradigma, **todo filtra al instante** y el texto con retardo de 300 ms; no hay botón «Buscar» ni «Filtrar».
  Los filtros principales (uno o dos, con 7 opciones como máximo) están a la vista como chips (`role="group"` con
  `aria-label={chips.etiqueta}`; «Todos» es un chip más, con `aria-pressed` mientras no hay ninguno seleccionado, y llama a
  `onTodos`); los secundarios, en el panel. En celular los chips se desplazan en horizontal y miden 44 px; desde `sm` envuelven y
  miden 36 px. El botón «Filtros» (`Button` secundario con `SlidersHorizontal`, `aria-haspopup="dialog"`, `aria-expanded` y,
  abierto, `aria-controls`) **solo existe si llega `popover`** (y `orden` solo se dibuja dentro de su panel); su contador es
  `aplicados.length`.
- **Aplicados:** la fila existe si hay `aplicados` o más de un filtro activo en total (texto, chips y aplicados). Muestra solo lo
  que está en el panel (los chips ya se ven marcados): «Filtros aplicados:» (solo con aplicados), un chip por aplicado con ✕
  («Quitar filtro {etiqueta}») y «Limpiar todo» (solo con más de un filtro activo). «Limpiar todo» llama a `onLimpiar()` y
  **remonta el buscador** (cambia su `key`) para descartar el borrador y el retardo pendientes.
- **Panel:** un solo `div role="dialog" aria-label="Filtros"` con `tabIndex={-1}` y **sin `aria-modal`** (la hoja es modal solo en
  celular y eso lo decide el CSS), para celular y escritorio. Bajo 640 px es una hoja inferior (`fixed`) con su telón, una
  cabecera «Filtros y orden» y el cierre «Cerrar filtros» (`IconButton` de 44 px), y **atrapa el foco**; desde `sm` es un popover
  `absolute` anclado al botón (de ahí `fwrap`) y **no es modal**. El cuerpo trae una sección por
  `SeccionFiltro` (chips de selección única o múltiple en un `role="group"` con `aria-labelledby` hacia su etiqueta, o un campo de texto) y, solo en celular, la de
  `orden`; el pie, «Limpiar» (`Button` fantasma que recorre `limpiarSeccion`: `onCambiar('')` en opciones y en texto, `onLimpiar()` en múltiple; deshabilitado sin aplicados) y un
  `Button` primario «Ver N resultados» («Ver 1 resultado»; «Sin resultados» con 0; «Listo» sin `totalResultados`) que cierra.
- **Foco y cierre:** el panel usa `useTrampaDeFoco` (ver «useTrampaDeFoco», en «Formularios y superposiciones») con `retorno` = el
  botón «Filtros», `alEscape` = cerrar y `esModal` = «el telón se ve» (`getComputedStyle(telón).display !== 'none'`): así la trampa
  sigue al `sm:hidden` sin repetir el punto de corte en JavaScript ni usar `matchMedia`. Al abrir, el foco va al primer control
  visible (en celular, «Cerrar filtros»; en escritorio, como el cierre de celular está oculto, el primer chip).
  - **Hoja de celular:** Tab y Mayús+Tab dan la vuelta dentro de ella y el foco no sale hacia atrás del telón. **Esc se escucha en
    `document`**, así que cierra con el foco en cualquier control. **Todo cierre devuelve el foco a «Filtros»**: Esc, «Cerrar
    filtros», «Ver N resultados», «Listo» y el clic o toque en el telón. El telón cierra en `click` y no en `pointerdown` (su
    `onPointerDown` detiene la propagación para que `useClicFuera`, que escucha `pointerdown` en `document`, no cierre antes): al
    cerrar en `pointerdown`, el `mousedown` siguiente caía en lo que queda debajo y el foco terminaba en el `body` o en el control
    de detrás. Como el telón cubre la pantalla, un toque sobre el ✕ de un filtro aplicado o sobre «Limpiar todo» con la hoja
    abierta cae en el telón: solo la cierra y no los activa (hace falta otro toque con la hoja cerrada).
  - **Popover de escritorio (no modal):** Tab sale de él y lo deja abierto. Esc lo cierra con el foco donde esté (si estaba dentro,
    vuelve a «Filtros»; si estaba en un control de fuera, ahí se queda) y «Ver N resultados» lo cierra y devuelve el foco al
    botón. Un clic fuera (`useClicFuera`, de `src/shared/hooks/`) lo cierra **sin** mover el foco: queda en el control que se
    pulsó, o en el `body` si fue una zona sin controles.
- **Límites que quedan:** el panel no declara `aria-modal`; quitar un filtro con su ✕ o con «Limpiar todo» deja el foco en el
  `body` (el control desaparece). Las áreas táctiles de 44 px en celular las resolvió HT-UX-04: el ✕ de un filtro aplicado, «Limpiar
  todo» y el ✕ del buscador (recetas `quitar`, `aplicado`, `limpiarTodo` y `limpiarBusqueda`). El relleno derecho del campo
  (`field-input--accion`, 40 px) queda 4 px por debajo del ✕ de 44 px del buscador; si se ve texto bajo el ✕, el arreglo es subir ese
  relleno a 2.75rem solo en celular.
- **Estado:** vive en el hook del listado (o en la URL, ver `patrones.md`), nunca dentro del panel; cualquier cambio de filtro,
  búsqueda u orden vuelve a la página 0.

```clases
FilterBar.raiz | relative flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-4 shadow-card
FilterBar.fila | flex flex-wrap gap-3
FilterBar.fwrap | relative flex-1 sm:flex-none
FilterBar.botonFiltros | w-full sm:w-auto
FilterBar.contador | inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground
FilterBar.busqueda | relative min-w-0 flex-[1_1_17.5rem]
FilterBar.busquedaIcono | pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-secondary
FilterBar.busquedaInput | field-input field-input--icono field-input--accion
FilterBar.limpiarBusqueda | absolute right-0 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-secondary hover:bg-muted sm:right-1 sm:size-9
FilterBar.chips | flex gap-2 overflow-x-auto -mx-4 px-4 py-1 -my-1 sm:mx-0 sm:my-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0
FilterBar.chip | inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-9
FilterBar.chipInactivo | border-border-strong bg-surface text-on-surface enabled:hover:bg-muted
FilterBar.chipActivo | border-primary bg-primary-muted text-primary-muted-foreground hover:bg-primary-muted
FilterBar.aplicados | flex flex-wrap items-center gap-2 border-t border-border pt-3
FilterBar.aplicadosEtiqueta | text-sm text-on-surface-secondary
FilterBar.aplicado | inline-flex h-11 items-center gap-1 rounded-full bg-primary-muted pl-3 pr-1 text-sm font-medium text-primary-muted-foreground sm:h-8
FilterBar.quitar | inline-flex size-11 items-center justify-center rounded-full hover:bg-primary/10 sm:size-6
FilterBar.limpiarTodo | inline-flex items-center text-sm font-semibold text-primary underline underline-offset-4 max-sm:min-h-11
FilterBar.panel | fixed inset-x-0 bottom-0 z-50 flex max-h-[86dvh] flex-col rounded-t-2xl bg-surface shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:bottom-auto sm:top-full sm:z-30 sm:mt-2 sm:max-h-none sm:w-85 sm:max-w-[calc(100vw-3rem)] sm:rounded-xl sm:border sm:border-border sm:shadow-dropdown
FilterBar.telon | fixed inset-0 z-40 bg-black/40 animate-fade-in sm:hidden
FilterBar.panelCabecera | flex shrink-0 items-center justify-between py-1 pl-5 pr-2 sm:hidden
FilterBar.panelTitulo | text-lg font-semibold text-on-surface
FilterBar.panelCuerpo | flex min-h-0 flex-col gap-5 overflow-y-auto px-5 pb-4 pt-2 sm:gap-4 sm:overflow-visible sm:p-4
FilterBar.panelSeccion | flex flex-col gap-2.5 sm:gap-2
FilterBar.soloCelular | sm:hidden
FilterBar.panelEtiqueta | text-sm font-semibold text-on-surface sm:font-medium
FilterBar.panelOpciones | flex flex-wrap gap-2
FilterBar.panelPie | flex shrink-0 items-center justify-between gap-3 border-t border-border px-5 pb-4 pt-3 sm:mx-4 sm:px-0
FilterBar.panelCierre | grow sm:grow-0
```

- **Composición:** el chip (`FilterChip.tsx`) es `chip` más exactamente una de `chipInactivo` o `chipActivo` (el fondo, el borde y el
  color del chip activo no pueden convivir con los del inactivo); el hover del inactivo va con `enabled:` para que un chip
  deshabilitado no se ilumine. La búsqueda usa `field-input field-input--icono field-input--accion` (clases globales: ninguna
  utilidad de `padding` en el campo). El panel es **una sola cadena**, con la hoja de celular de base y el popover detrás de `sm:`
  (sin `matchMedia`); la sección «Ordenar por» es `panelSeccion` más `soloCelular`. `botonFiltros` y `panelCierre` son el `className` de
  disposición de sus `Button`.
- **Sin `z-10` en `raiz`:** crearía un contexto de apilamiento que dejaría el telón (`z-40`) y la hoja (`z-50`) de celular por debajo
  del `Header` (`relative z-20`); el popover (`z-30`) ya queda sobre la tabla sin él.
- **`panel` en lugar de `hoja` y `popover`:** eran dos recetas; un solo elemento sirve a celular y escritorio. Con `inset-x-0` de base,
  Tailwind emite `sm:inset-x-auto` antes que `sm:right-0`, así que desde `sm` la derecha queda en 0.
- **`telon` y `fwrap` son nuevas:** el telón oscurece lo que queda detrás de la hoja (solo celular, como `SidePanel.fondo`) y `fwrap`
  ancla el popover al botón y, en celular, lo estira.
- **`chips` se desplaza en horizontal en celular** (la receta anterior era `flex flex-wrap gap-2`), como piden `patrones.md` §1 y el
  lienzo móvil; `-mx-4 px-4` lo lleva hasta el borde de la tarjeta. `py-1 -my-1` (antes `pb-0.5` y `sm:pb-0`) deja sitio al anillo de
  foco, que ocupa 4 px y el `overflow-x-auto` recortaba (4 px arriba y 2 abajo); el margen negativo devuelve ese espacio. Desde `sm`,
  `sm:my-0 sm:py-0`.
- **`chip` suma `shrink-0` y el estado deshabilitado** (`disabled:cursor-not-allowed disabled:opacity-50`, más el `enabled:hover:`
  del inactivo): `shrink-0` deja cada chip a su ancho dentro del carril desplazable y el estado deshabilitado lo exige
  `SeccionFiltro.deshabilitada`.
- **Áreas táctiles (HT-UX-04):** bajo 640 px el chip aplicado crece a `h-11` y su ✕ a `size-11` (44 px); «Limpiar todo» fija `max-sm:min-h-11` y el ✕ del buscador `size-11` pegado al borde (`right-0`). Desde `sm` quedan en 32, 24, 20 y 36 px, como antes.
- **Pruebas:** escribir y esperar el retardo antes de llamar a `onCambiar`; quitar un aplicado; «Limpiar todo»; en las secciones, texto con retardo, alternar una múltiple y «Limpiar». Las áreas táctiles no se prueban en jsdom (sin layout).

### RowMenu

- **Reemplaza:** los iconos sueltos de lápiz y papelera y los botones de 12 px («Estudiantes», «Cambiar Asesor») que
  abrían formularios dentro de la fila.
- **API:** `etiqueta` (va a `aria-label` del disparador y del menú: «Acciones de {nombre}») y `acciones: AccionMenu[]`, con
  `AccionMenu = { etiqueta; icono?; onSeleccionar; peligro?; deshabilitada? }`, que declara `RowMenuLista.tsx` y `RowMenu`
  reexporta. La `etiqueta` de cada acción es su `key`: no repitas una en el mismo menú. El disparador (`RowMenu.tsx`) es un
  `IconButton` con `Ellipsis`.
- **Reglas:** la fila abre el detalle o el panel con su título; el menú ⋯ agrupa las acciones secundarias **con etiqueta**. La
  acción que da de baja o elimina (`peligro`) va al final, en rojo, y un `role="separator"` la separa de las demás (no se dibuja si
  es la primera). Se dibuja en un portal (`createPortal` en `document.body`, como `ConfirmDialog`) con posición calculada, para que
  el `overflow-x-auto` de la tabla no lo recorte; las coordenadas calculadas son el único `style={{}}` admitido. El borde derecho del
  menú (`w-56`, 224 px) se alinea con el del disparador, 4 px debajo y con 8 px de margen al borde del viewport; si no cabe debajo,
  se abre encima.
- **A11y y teclado:** disparador con `aria-haspopup="menu"`, `aria-expanded` y, mientras está abierto, `aria-controls` hacia el menú;
  `role="menu"` y un `role="menuitem"` por acción. Al abrir, el foco va al primer ítem habilitado; ↓ y ↑ mueven el foco entre los
  habilitados (dan la vuelta), Inicio y Fin saltan al primero y al último, y los deshabilitados se saltan. Esc y Tab cierran y
  devuelven el foco al disparador (Tab no pasa a otro elemento). Un clic fuera (`useClicFuera`, de `src/shared/hooks/`), el scroll de
  cualquier contenedor y el cambio de tamaño de la ventana cierran **sin** mover el foco. Seleccionar cierra, devuelve el foco y
  **después** llama a `onSeleccionar`; un clic en el disparador con el menú abierto lo cierra y devuelve el foco.

```clases
RowMenu.menu | fixed z-40 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-dropdown
RowMenu.item | flex h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:h-10
RowMenu.itemNormal | text-on-surface enabled:hover:bg-muted
RowMenu.itemPeligro | text-danger-muted-foreground enabled:hover:bg-danger-muted
RowMenu.separador | my-1.5 h-px bg-border
```

- **Composición:** el ítem es `item` más exactamente una de `itemNormal` o `itemPeligro`. El hover va con `enabled:` y `item` trae el
  estado deshabilitado: una acción deshabilitada («Dar de baja…» de quien ya no está vigente) se ve atenuada y no se ilumina al pasar el
  cursor (la receta anterior no tenía estado deshabilitado y su `hover:` iluminaba cualquier ítem).
- **Pruebas:** abrir, moverse con flechas, seleccionar y Esc con retorno del foco.

### DataTable

- **Reemplaza:** `UsuariosTable`, `UsuariosRolTable`, `FichasPerfilTable`, las tablas de `ConsultarFichasAsesor`,
  `ConsultarFichasRepresentante` y la lista de estados del asesor (eliminada en HT-UX-06-AJ1).
- **API:** `columnas: ColumnaTabla<T>[]` (`{ id; encabezado; celda: (fila) => ReactNode; ordenable?; clave? }`), `filas`,
  `idDeFila: (fila) => string`, `etiqueta` (obligatoria; va al `aria-label` de la tabla y de la lista de tarjetas), `orden?: { clave;
  direccion: 'ASC' | 'DESC' }`, `onOrdenar?: (clave, direccion) => void`, `acciones?: (fila) => ReactNode` (una función que devuelve
  el `RowMenu` de la fila; la tabla y la tarjeta usan **la misma**, así que ofrecen las mismas acciones), `tarjeta: (fila) =>
  ReactNode` (obligatoria: la vista móvil), `cargando?` y `vacio?: ReactNode`. Reexporta `ColumnaTabla`, `DireccionOrden` y
  `OrdenTabla`, que declara `DataTableCabecera.tsx`.
- **Orden:** el `<th>` de una columna `ordenable` lleva `aria-sort` (`ascending` o `descending` en la ordenada y `none` en las demás
  ordenables; nada en las que no lo son) y un `<button>` con el encabezado y un icono de 14 px (`ArrowUp` o `ArrowDown` en la
  ordenada, `ArrowUpDown` atenuado en las demás). `onOrdenar(clave, direccion)` recibe `clave = columna.clave ?? columna.id` y
  `'DESC'` si esa clave ya estaba en `ASC`, `'ASC'` en cualquier otro caso: el ciclo es ASC → DESC → ASC y **no existe «sin
  ordenar»**, porque el listado siempre parte de un orden por defecto. `clave` llega como `string`: quien usa la tabla la estrecha a
  su propio tipo con una función guardia, sin `as`.
- **Reglas:** **seis columnas como máximo**, la de acciones incluida (la pieza no lo valida). La primera es la identidad (avatar o
  título, con el subtexto en una segunda línea); el estado es **una sola** `Badge`; las acciones, un `RowMenu` en la última columna
  (su `<th>` solo trae «Acciones» en `sr-only`). Ordenar se hace desde la cabecera, nunca con un `select`; como máximo tres columnas
  ordenables. Cargando muestra `Skeleton variante="tabla"` con la etiqueta «Cargando {etiqueta en minúscula}…» (la misma forma en
  celular y escritorio); sin filas, el `vacio` que reciba (un `EmptyState`).
- **Móvil (< 640 px):** deja de ser tabla y pasa a una lista (`<ul aria-label>`) de tarjetas: en cada una, `tarjeta(fila)` a la
  izquierda (identidad arriba, insignias en medio, dato secundario abajo) y `acciones(fila)` arriba a la derecha, con el botón de
  44 px. El `overflow-x-auto` de la tabla queda solo como red de seguridad.
- **A11y:** `<table>` real con `aria-label`, `<th scope="col">`; el elemento que abre el detalle es un
  `<button>` o `<Link>`, no una fila con `onClick`.
- **Archivos:** `DataTable.tsx` (la tabla, el esqueleto y el vacío), `DataTableCabecera.tsx` (el `<thead>`; declara los tipos) y
  `DataTableTarjetas.tsx` (la lista de celular). Es el **único** archivo que puede escribir `<table`: `src/arquitectura.test.ts`
  rechaza otra, y ya no queda deuda de tablas en el baseline.

```clases
DataTable.contenedor | sm:overflow-hidden sm:rounded-xl sm:border sm:border-border sm:bg-surface sm:shadow-card
DataTable.scroll | relative hidden overflow-x-auto sm:block
DataTable.tabla | w-full text-left text-sm
DataTable.cabecera | bg-surface-secondary text-xs font-semibold text-on-surface-secondary
DataTable.th | px-4 py-3 font-semibold
DataTable.orden | -ml-2 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 font-semibold hover:bg-muted hover:text-on-surface
DataTable.iconoSinOrden | opacity-30
DataTable.fila | border-t border-border transition-colors hover:bg-surface-secondary
DataTable.celda | px-4 py-3 align-middle
DataTable.celdaAcciones | text-right
DataTable.tarjetas | flex flex-col gap-2.5 sm:hidden
DataTable.tarjeta | flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-3.5 pr-2 shadow-card
DataTable.tarjetaFila | flex items-start gap-1.5
DataTable.tarjetaContenido | flex min-w-0 flex-1 flex-col gap-2.5
```

- **Composición:** la celda de acciones es `celda` más `celdaAcciones` (alinea el menú a la derecha); el icono de una columna sin
  orden es `iconoSinOrden`. Cada tarjeta anida `tarjeta` > `tarjetaFila` > `tarjetaContenido` (el contenido, que puede encoger) junto al
  menú de 44 px: `tarjeta` trae `pr-2` para ese botón.
- **`scroll` lleva `relative`:** contiene el `sr-only` «Acciones» de la última cabecera (`position: absolute`); sin un ancestro
  posicionado escapa al `overflow-x-auto` y, cuando la tabla es más ancha que la pantalla, desplaza el documento entero (239 px a
  1024 px).
- **`th` y `celda` con `px-4`** (la receta anterior era `px-5`): con seis columnas, `px-5` y una identidad de hasta 320 px dejaban la
  tabla en 1026 px (1086 con la insignia «Representante del Comité»), que no cabe en los 944 px de contenedor de 1280 px y esconde el
  menú ⋯ tras un desplazamiento. Con `px-4` y la identidad de Usuarios limitada a `sm:max-w-56` (bloque siguiente) cabe a 1280 px; con
  el menú lateral visible (desde 1024 px) cabe desde 1218 px (1278 px con esa insignia); con esa insignia y una «Dado de baja» en la
  misma página, hacen falta unos 1317 px (medido en un DOM temporal, no en la pantalla). Donde no cabe, desplaza solo dentro de su
  contenedor, nunca el documento.

**Celda de identidad.** La primera columna la escribe quien usa la tabla, no la pieza; estas son las clases que dejó `UsuarioCeldas.tsx`
en Usuarios. El nombre es un `<button>` (abre la edición): lleva `text-left` porque el botón centra su texto, y el hover lo marca
como acción. El tope `sm:max-w-56` (224 px solo desde 640 px; la tarjeta de celular no lo tiene) es el de esa tabla de seis columnas:
otra tabla ajusta el suyo según las suyas.

```clases
DataTable.identidad | flex min-w-0 items-center gap-3 sm:max-w-56
DataTable.textos | flex min-w-0 flex-col
DataTable.titulo | block truncate text-left font-semibold text-on-surface hover:text-primary hover:underline hover:underline-offset-4
DataTable.subtexto | block truncate text-[13px] text-on-surface-secondary
```

- **Pruebas:** al pulsar una cabecera ordenable se llama a `onOrdenar` con la dirección que sigue. En jsdom no hay CSS: la tabla y la
  lista de tarjetas están **las dos** en el DOM y el contenido se duplica, así que acota cada consulta con
  `within(screen.getByRole('table', { name }))` o `within(screen.getByRole('list', { name }))`.

### PaginadorListado (ampliado)

- **No se crea `Pagination`:** se amplió `src/shared/components/PaginadorListado.tsx` con el mismo nombre y las props de hoy (`page`,
  desde 0; `pageSize`, `totalPages`, `totalElements`, `cantidadEnPagina`, `etiquetaPlural` y `onPageChange(page)`). Las tres copias
  en línea (`FichasPerfilTable`, `ConsultarFichasRepresentante`, `ConsultarFichasAsesor`) las borró HT-UX-04.
- **Añade:** números de página con puntos suspensivos y `aria-current="page"`; en celular, «Página 2 de 10» entre dos flechas de
  44 px. Sigue ocultándose (devuelve `null`) con una sola página.
- **Todavía no:** el selector «Filas» (`tamanosDisponibles?` y `onTamanoChange?`) no existe; se agrega cuando el backend admita
  `tamanio` variable, con la receta `Paginador.filas` (`h-9 rounded-lg border border-border-input bg-surface px-2 text-sm`), que no
  está en el código.
- **Estructura:** `<nav aria-label="Paginación">` con el texto «{desde}–{hasta} de {total} {etiquetaPlural}» (visible desde `sm`), la
  flecha anterior (`aria-label="Página anterior"`), el resumen de celular «Página {n} de {total}», la lista de números (oculta en
  celular) y la flecha siguiente (`aria-label="Página siguiente"`). Las flechas son las mismas en celular y escritorio (44 px; 36 px
  desde `sm`).
- **Ventana de siete casillas:** con siete páginas o menos se muestran todas; con más, siempre la primera y la última y, entre ellas:
  si la actual es una de las cuatro primeras, las páginas 2 a 5 y «…»; si es una de las cuatro últimas, «…» y las cuatro anteriores a
  la última; en el medio, «…», la anterior, la actual, la siguiente y «…». Cada número lleva `aria-label="Página N"` y los puntos
  suspensivos son decorativos (`aria-hidden`).

```clases
Paginador.raiz | flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between
Paginador.texto | hidden text-sm text-on-surface-secondary sm:block
Paginador.resumenMovil | text-sm text-on-surface-secondary sm:hidden
Paginador.navegacion | flex items-center justify-between gap-1 sm:justify-end
Paginador.numeros | hidden items-center gap-1 sm:flex
Paginador.flecha | inline-flex size-11 items-center justify-center rounded-lg border border-border-strong text-on-surface hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 sm:size-9
Paginador.numero | inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium
Paginador.numeroInactivo | text-on-surface-secondary hover:bg-muted
Paginador.numeroActivo | bg-primary text-primary-foreground hover:bg-primary
Paginador.numeroPuntos | text-on-surface-secondary
```

- **Composición:** el número es `numero` más exactamente una de `numeroInactivo` o `numeroActivo`; los puntos suspensivos, `numero`
  más `numeroPuntos`.
- **Visibilidad por breakpoint:** la receta anterior no definía el resumen de celular ni qué se oculta bajo 640 px. `texto` y `numeros`
  están ocultos en celular, `resumenMovil` lo está desde `sm`, y `navegacion` reparte flechas y resumen en una fila (`justify-between`)
  que desde `sm` se junta a la derecha.

## Formularios y superposiciones

### FormSection, FormActions y ErrorSummary

- **`FormSection`:** `titulo`, `descripcion?`, `opcional?`, hijos. Agrupa campos relacionados en un `fieldset` con
  `aria-labelledby` hacia el `<h2>` del título (con `opcional`, « (opcional)» con el estilo de `Field.opcional`); la
  `descripcion` va en un `<p>` bajo el título, dentro de la misma cabecera con borde inferior. Exporta también
  `RejillaDeCampos({ children })` (la receta `rejilla`): dos columnas desde `sm` para campos cortos que van en pareja
  (Nombres y Apellidos); el campo largo va fuera de ella y ocupa la fila, y el valor corto (identificador, teléfono) usa
  `Field.corto`.
- **`FormActions`:** `accion?` (el verbo: «Registrar usuario», «Guardar cambios»), `accionEnviando?` (el gerundio,
  «Registrando…»: lo pone quien la usa), `enviando?`, `sucio?`, `sinCambios?`, `nota?`, `formId?` y `onCancelar`. Barra pegada
  al pie del panel o de la página: a la izquierda el estado y, a la derecha (dentro de la clase global `.actions-row`), el
  botón secundario y la acción con **su verbo**. El estado es `nota` si llega; si no, «Cambios sin guardar», con punto, cuando
  `sucio`, y «Sin cambios» en caso contrario. El secundario dice «Cancelar» con `sucio` y «Cerrar» sin él, y se deshabilita
  mientras `enviando`.
- **La validez no deshabilita el botón principal:** es `type="submit"` con `form={formId}` (el pie vive fuera del `<form>`,
  en el `pie` de `SidePanel`) y `cargando={enviando}`, y solo se deshabilita mientras envía o con `sinCambios` (al editar,
  `!isDirty`); no hay prop de validez. Sin `accion` no hay botón principal: las pestañas que actúan al instante pasan solo
  `nota`. En celular `.actions-row` apila los botones con la acción arriba (`column-reverse`), pero en el DOM
  «Cancelar»/«Cerrar» va primero, así que Tab recorre ese orden.
- **`ErrorSummary`:** `errores: ErrorDeCampo[]` (`{ campo; etiqueta; mensaje }`) y `onIrAlCampo(campo)`. Sin errores no dibuja
  nada. Es un `Notice` `peligro` (`role="alert"`, se anuncia al aparecer) con título «Revisa N campos antes de continuar»
  («Revisa 1 campo antes de continuar») y una lista con un `<button type="button">` por error, «{etiqueta}: {mensaje}», que
  llama a `onIrAlCampo(campo)` (quien lo usa lo conecta con `setFocus` de react-hook-form). Aparece **solo** tras un envío
  inválido (`handleSubmit(onValido, onInvalido)`). Exporta `resumirErrores(errores, etiquetas)`: recorre `etiquetas` (un
  `Record` de campo a etiqueta, en el orden del formulario en pantalla) y devuelve los campos que tienen mensaje; su `errores`
  es estructural (`Record<string, { message?: string } | undefined>`) para aceptar el `formState.errors` de react-hook-form
  sin importar sus tipos.
- **Desvíos de la receta anterior:** (1) `ErrorSummary` **no toma el foco** (la receta decía que sí, con `tabIndex={-1}`),
  porque `handleSubmit(onValido, onInvalido)` ya enfoca el primer campo con error (`patrones.md` §2) y un segundo foco en el
  resumen lo movería otra vez. (2) Cada error trae `etiqueta`, porque el resumen dice «Contacto: …» (como el lienzo) y el nombre
  del campo de react-hook-form no es un texto de persona. (3) El secundario de `FormActions` dice «Cerrar» cuando no hay cambios
  (`tokens.md` §6) y `nota` reemplaza el estado, porque las pestañas Roles y Acceso no tienen botón de guardar y su pie dice
  cómo se guarda cada cosa.

```clases
FormSection.raiz | flex min-w-0 flex-col gap-4
FormSection.cabecera | border-b border-border pb-2
FormSection.titulo | text-base font-semibold text-on-surface
FormSection.opcional | font-normal text-on-surface-secondary
FormSection.descripcion | text-sm text-on-surface-secondary
FormSection.rejilla | grid gap-4 sm:grid-cols-2
FormActions.raiz | sticky bottom-0 z-10 flex flex-col gap-3 border-t border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6
FormActions.estado | inline-flex items-center gap-2 text-sm text-on-surface-secondary
FormActions.punto | size-2 rounded-full bg-tertiary
ErrorSummary.lista | mt-1 list-disc space-y-1 pl-5
ErrorSummary.enlace | text-left underline underline-offset-4
```

- **Composición:** ninguna de las tres tiene estados que excluir: cada región es una sola cadena (el punto de `FormActions`
  aparece o no; no cambia de clase).
- **Pruebas:** `ErrorSummary` (el clic llama a `onIrAlCampo` con el campo; `resumirErrores` respeta el orden de las etiquetas) y
  `FormActions` (el botón se deshabilita enviando y sin cambios, pero no por validez).

### useTrampaDeFoco (foco de las superposiciones)

`src/shared/hooks/useTrampaDeFoco.ts`. Lo usan `SidePanel`, `ConfirmDialog` y la hoja de `FilterBarPanel`; una superposición nueva
lo usa también en vez de manejar el foco a mano. No importa `lucide-react` ni componentes.

- **API:** `useTrampaDeFoco(opciones: OpcionesTrampaDeFoco)` con `{ contenedor, focoInicial?, retorno?, alEscape?, esModal? }`, sin valor
  de retorno. `contenedor`, `focoInicial` y `retorno` son `RefObject<HTMLElement | null>`. `contenedor` es
  la `ref` del elemento de la capa y lleva `tabIndex={-1}` (es el último recurso del foco inicial). `focoInicial` es el control, o
  un contenedor de controles (el cuerpo de `SidePanel`), que recibe el foco al montar; sin él, el primer control visible del
  `contenedor` y, sin controles, el propio `contenedor`. `retorno` es a dónde vuelve el foco al cerrar; por omisión, el control
  que lo tenía al montar. `alEscape` es lo que hace Esc. `esModal` es un `() => boolean`, `true` por omisión, que se evalúa en
  cada evento y deja que la trampa siga al CSS (`FilterBarPanel` mide el `display` de su telón); con `false`, Tab no se atrapa ni
  el foco que cae fuera vuelve adentro, pero Esc sigue actuando.
- **Sin parámetro `activo`:** la capa dura lo que dure el componente que lo llama, y las tres superposiciones se montan al abrir
  y se desmontan al cerrar. `alEscape` y `esModal` se leen desde una `ref` actualizada en cada render (el patrón de
  `useClicFuera`), así que el efecto corre una sola vez.
- **Una superposición sobre otra solo atiende la capa de arriba.** Hay una pila de capas a nivel de módulo: cada instancia se
  apunta al montar y se quita al desmontar, y Tab, Esc y `focusin` solo los atiende la última. Con un `ConfirmDialog` sobre un
  `SidePanel`, el diálogo gana la trampa: su Esc cierra solo el diálogo y, al cerrarse, el foco vuelve al control del panel que
  lo tenía. El orden visual lo da el DOM, no el `z-index`: los dos son `z-50` y el portal del diálogo se agrega después.
- **Tab y foco:** Tab da la vuelta dentro del `contenedor` (del último control al primero y, con Mayús+Tab, al revés). Cuenta
  `button`, `a[href]`, `input` (menos `hidden`), `select`, `textarea` y `[tabindex]`, todos con `tabIndex >= 0` (un `tabIndex={-1}` no cuenta), que no estén
  deshabilitados ni tengan un ancestro con `display: none` hasta el contenedor: por eso lo que lleva `hidden` o `sm:hidden` no
  entra en el recorrido. Si el foco cae fuera de la capa de arriba, vuelve al último control que tuvo dentro. Esc se escucha en
  `document`, en la fase de burbuja (un menú o un combo interno atiende primero su Esc), y se ignora si el evento ya está
  manejado (`defaultPrevented`) o es de composición. Límite: un grupo de radios cuenta un control por radio, no una sola parada.
- **Al cerrar:** devuelve el foco al disparador solo si sigue en el documento y el foco se perdió (`body`) o seguía dentro del
  contenedor; si la persona ya lo movió a otro control (un clic fuera), no se lo quita. En el desmontaje simulado de `StrictMode`
  no lo devuelve (el nodo sigue en el documento) y recuerda el disparador entre las dos pasadas: sin eso, en desarrollo el primer
  campo de un panel perdía el foco al abrir y mostraba «Este campo es requerido» sin haberlo tocado.

### SidePanel

- **Reemplaza:** el formulario que se abría encima de las pestañas y los filtros (`RegistrarUsuarioForm` y
  `ModificarUsuarioForm`, ya eliminados).
- **API:** `titulo`, `descripcion?`, `inicio?: ReactNode` (a la izquierda del título: el `Avatar`), `fin?: ReactNode` (junto al ✕:
  la `Badge` de estado), `onCerrar`, `sucio?` (hay cambios sin guardar), `ocupado?` (está enviando), `pie?: (solicitarCierre: () =>
  void) => ReactNode` (el `FormActions`) y hijos.
- **Comportamiento:** panel a la derecha sobre un fondo oscuro; la lista **se queda detrás** con sus filtros y su página. En
  celular ocupa toda la pantalla (`w-full`) y desde 640 px mide 560 px. `solicitarCierre()` atiende el ✕ «Cerrar panel», el clic
  en el fondo, Esc y el «Cancelar»/«Cerrar» del `pie`: no hace nada si `ocupado` y, con `sucio`, pide antes «¿Descartar los
  cambios?»; si no, llama a `onCerrar()`. El estado de abierto/cerrado y de la entidad en edición vive en la `{Rol}View`, por
  encima del panel (regla de «Retorno tras registrar, editar o eliminar»); tras un éxito, quien usa el panel llama a `onCerrar()`
  directo, sin pasar por la confirmación.
- **Descartar:** un `ConfirmDialog` `advertencia` («¿Descartar los cambios?», «Tienes cambios sin guardar. Si cierras ahora, se
  perderán.», «Descartar» y «Seguir editando»). «Descartar» llama a `onCerrar()`; «Seguir editando» (o Esc) lo cierra y el foco
  vuelve al control que lo tenía. Se dibuja como **hermano** del fondo y no dentro de él: un portal burbujea los eventos por el
  árbol de React, y el clic en el fondo del diálogo llegaría también al fondo del panel.
- **A11y y foco:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (el `<h2>` del título) y `aria-describedby` (la
  descripción). Usa `useTrampaDeFoco({ contenedor, focoInicial: cuerpo, alEscape: solicitarCierre })` (ver «useTrampaDeFoco»): el
  foco entra al primer control del cuerpo, queda atrapado y vuelve al botón o la fila que abrió el panel. Mientras está abierto, el
  `overflow` del `body` del documento es `hidden` (se restaura al cerrar) y el `body` lleva el atributo `data-panel-abierto`, que usa el
  `Toaster` para colocar los avisos sobre el pie del panel. El fondo es `aria-hidden` y lleva `onMouseDown` con
  `preventDefault`: sin él, pulsarlo (no es enfocable) quitaba el foco al campo y «Seguir editando» lo dejaba en el `body`.
- **Pestañas de edición:** van **dentro del cuerpo**, en una barra `sticky` que se queda bajo la cabecera al desplazar (`-top-4 sm:-top-6` y
  márgenes negativos iguales al relleno del cuerpo: el offset de un `sticky` cuenta el relleno del contenedor) con la lista de `Tabs`, sin `children`, que solo dibuja la lista, y debajo un
  `role="tabpanel"` con `aria-label` por pestaña), las tres **montadas siempre** y las inactivas con `hidden`. Si solo se montara
  la activa, lo escrito en el formulario y el interruptor de rol que acaba de cambiar volverían a su valor inicial al cambiar de
  pestaña, y una mutación en curso perdería su aviso al desmontarse. Como van en el cuerpo, se desplazan con él: con el cuerpo
  desplazado, la lista sale de la vista (medido a 320×800, 320×480 y 1280×500). El foco inicial cae en la pestaña activa, porque
  es el primer control del cuerpo, y un Tab más llega al primer campo.
- Se dibuja en un portal (`createPortal` en `document.body`). Necesita el token `--animate-slide-in-right`, que ya está en `@theme`
  de `src/tailwind.css` (0,25 s).
- **Desvíos de la receta anterior:** (1) `pie` es una **función** y no un `ReactNode`, porque el pie necesita el cierre
  protegido para que su «Cancelar» también pida «¿Descartar los cambios?». (2) `inicio` y `fin` existen porque un título de texto
  no admite el `Avatar` ni la `Badge` de la cabecera de edición. (3) `ocupado` ignora el cierre mientras envía, para que no se
  pierda el aviso de éxito de un `mutate` cuyo componente se desmontó. (4) Las pestañas van en el cuerpo y no fijas bajo la
  cabecera como en el lienzo: `SidePanel` solo ofrece `children` para el cuerpo, sin una ranura entre la cabecera y él. (5) El
  contenedor de los textos de la cabecera lleva `min-w-0 break-words` (`textos`), porque un correo largo junto a la insignia
  desbordaba la cabecera a 320–390 px: el lienzo trunca, pero truncar cortaría las descripciones que son frases (el coste es de
  altura y de palabras partidas).

```clases
SidePanel.fondo | fixed inset-0 z-40 bg-black/40 animate-fade-in
SidePanel.panel | fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-surface shadow-lg animate-slide-in-right sm:max-w-140 sm:border-l sm:border-border
SidePanel.cabecera | flex items-start justify-between gap-4 border-b border-border py-4 pl-4 pr-2 sm:py-5 sm:pl-6
SidePanel.encabezado | flex min-w-0 flex-1 items-start gap-3
SidePanel.textos | min-w-0 break-words
SidePanel.titulo | text-xl font-bold text-on-surface
SidePanel.descripcion | mt-1 text-sm text-on-surface-secondary
SidePanel.acciones | flex shrink-0 items-center gap-1
SidePanel.cuerpo | flex-1 overflow-y-auto p-4 sm:p-6
SidePanel.pie | shrink-0
```

- **Composición:** cada región es una sola cadena (no hay estados que excluir). `fondo` (`z-40`) y `panel` (`z-50`) son hermanos;
  `encabezado` aloja `inicio` y los `textos`, y `acciones`, `fin` y el ✕. El panel y el `ConfirmDialog` son ambos `z-50`: el
  diálogo queda encima porque su portal se agrega después.
- **Pruebas:** Esc cierra, el foco queda atrapado y vuelve al disparador, `sucio` pide confirmación y `ocupado` ignora el cierre.

### ConfirmDialog (se actualiza en su sitio)

Conserva su API (`titulo`, `descripcion?`, `labelConfirmar?`, `labelCancelar?`, `variante?`, `cargando?`, `onConfirmar`,
`onCancelar`) y gana `consecuencias?: string[]` (lo que pasa al confirmar, en una lista). Lo que cambió:

- **Foco:** usa `useTrampaDeFoco` (ver «useTrampaDeFoco») con el botón «Cancelar» como `focoInicial` y `alEscape` = cancelar: el
  foco entra al diálogo, queda atrapado y, al cerrar, vuelve a quien lo tenía; si ese control ya no existe (la fila que lo abrió),
  no se enfoca nada. Desde el menú de fila el disparador es el ⋯, porque `RowMenu` le devuelve ahí el foco antes de llamar a
  `onSeleccionar`. **El foco inicial es «Cancelar» en las dos variantes**, no solo en `peligro` (desvío de la receta anterior):
  con `advertencia` el primer control del DOM ya es ese botón, y un Enter repetido al abrirlo cancela en lugar de confirmar.
- **Teclado:** Esc y el clic en el fondo cancelan, salvo mientras `cargando`.
- **Semántica:** `role="alertdialog"` en `peligro` y `dialog` en `advertencia`, puesto en el panel y no en el contenedor de
  pantalla completa; `aria-modal="true"`, `aria-labelledby` hacia el `<h2>` y, si hay descripción o consecuencias,
  `aria-describedby` hacia el bloque `detalle`. Los ids salen de `useId` (antes el `id` era fijo y se repetía).
- **Aspecto:** el icono (`TriangleAlert` de 16 px) va en un recuadro `iconoPeligro` (`danger-muted`) o `iconoAdvertencia`
  (`tertiary-muted`), junto al título; **debajo de esa fila** va el bloque `detalle` con la descripción y las consecuencias
  (desvío de la receta anterior, que no lo traía: así lo dibuja el lienzo). Los botones son `Button` (`secundario` y `peligro` o
  `primario`); el de acción dice la acción, no «Confirmar», y mientras `cargando` dice «Procesando...» y «Cancelar» se
  deshabilita.
- **Margen de pantalla y botones:** el contenedor suma `p-4`, porque sin él, a 384 px de ancho o menos, el panel (`max-w-sm`)
  tocaba el borde (medido: 16 px de margen por lado a 320, 384 y 390 px); y la fila de botones envuelve (`flex-wrap`), porque a
  320 px el contenido mide 240 px y «Seguir editando» con «Descartar» (o «Cancelar» con «Cambiar estado») no caben en una línea.
- **Apilado:** sobre un `SidePanel` ambos son `z-50` y el diálogo queda encima porque su portal se agrega después; la trampa solo
  atiende al de arriba, así que su Esc no cierra el panel.

```clases
ConfirmDialog.raiz | fixed inset-0 z-50 flex items-center justify-center p-4
ConfirmDialog.fondo | absolute inset-0 bg-black/40
ConfirmDialog.panel | relative z-10 w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg animate-fade-up
ConfirmDialog.cabecera | flex items-start gap-3
ConfirmDialog.icono | flex size-9 shrink-0 items-center justify-center rounded-lg
ConfirmDialog.iconoPeligro | bg-danger-muted text-danger-muted-foreground
ConfirmDialog.iconoAdvertencia | bg-tertiary-muted text-tertiary-muted-foreground
ConfirmDialog.titulo | text-base font-semibold text-on-surface
ConfirmDialog.detalle | mt-3.5 flex flex-col gap-3.5
ConfirmDialog.descripcion | text-sm text-on-surface-secondary
ConfirmDialog.consecuencias | list-disc space-y-1 pl-5 text-sm text-on-surface-secondary
ConfirmDialog.acciones | mt-5 flex flex-wrap justify-end gap-2
```

- **Composición:** el icono es `icono` más exactamente una de `iconoPeligro` o `iconoAdvertencia`; el resto de regiones son una
  sola cadena. Los colores del botón de acción salen de la variante de `Button`, no de estas clases.

### Toaster (se actualiza en su sitio)

La API `toast.success|info|error(titulo, mensaje?)` y `toast.dismiss(id)` **no cambia**; cambian el componente, el tipo
`ToastLevel` y el store:

- **Sin el nivel `debug`:** `ToastLevel = 'success' | 'info' | 'error'` (nadie lo usaba) y `toast.debug` ya no existe. Duraciones:
  `success` e `info`, 4 s; `error`, 6 s.
- **El store aplica el tope de tres:** `push` conserva los tres últimos (`toastStore.ts`); si el componente solo los ocultara, volverían
  a verse cuando otro se cerrara. Se dibujan en orden de llegada: el más viejo arriba y el más nuevo abajo.
- **Pausa:** el temporizador de cierre se detiene con el cursor encima **y** con el foco dentro (WCAG 2.2.1) y se reanuda con el
  **tiempo restante**, no con uno nuevo; salir con el cursor teniendo el foco dentro no lo reanuda.
- **Posición:** un portal `fixed` en `document.body`, abajo a la derecha en escritorio (a 16 px de los bordes y de 384 px de ancho) y
  al pie, a todo el ancho con 16 px de margen, en celular. Antes eran 320 px fijos arriba a la derecha, sobre el encabezado y los
  menús. La región es un `div` con `aria-label="Notificaciones"` y sin `role`: lo que se anuncia es el `role` de cada aviso,
  `alert` en `error` y `status` en el resto.
- **Tarjeta:** sin barra de color a la izquierda; icono en círculo de 32 px con el color del nivel (`CircleCheck`, `Info` y
  `CircleAlert`, de 16 px), título, mensaje y un botón de cerrar de 36 px («Cerrar notificación»). Entra con `animate-toast-in`
  (0,25 s) y sale con `animate-toast-out` (200 ms, y luego se quita del store); cerrar a mano usa la misma salida. Los dos
  tokens de animación ya existían en `@theme`.
- **Sin la acción «Deshacer»:** la receta `Toast.accion` (`mt-1.5 text-sm font-semibold text-primary underline underline-offset-4`)
  **no está en el código**: ningún consumidor la usa, así que el aviso no tiene una prop de acción. Se agrega cuando una
  pantalla la pida.
- **Con un panel abierto:** mientras el `body` tiene `data-panel-abierto` (lo pone `SidePanel`), la región sube a `bottom-24` desde
  640 px, para quedar sobre el pie del panel, y en celular pasa a la parte de arriba (`top-4`, sin `bottom`), porque allí el pie
  ocupa casi 150 px. Así un aviso nunca tapa el botón principal. Las clases usan `in-data-[panel-abierto]:`.

```clases
Toaster.region | fixed inset-x-4 bottom-4 z-[9999] flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-96 max-sm:in-data-[panel-abierto]:top-4 max-sm:in-data-[panel-abierto]:bottom-auto sm:in-data-[panel-abierto]:bottom-24
Toast.tarjeta | flex items-start gap-3 rounded-xl border border-border bg-surface p-3 pr-1.5 shadow-dropdown
Toast.entrada | animate-toast-in
Toast.salida | animate-toast-out
Toast.icono | flex size-8 shrink-0 items-center justify-center rounded-full
Toast.exito | bg-secondary-muted text-secondary-muted-foreground
Toast.info | bg-primary-muted text-primary-muted-foreground
Toast.error | bg-danger-muted text-danger-muted-foreground
Toast.textos | min-w-0 flex-1
Toast.titulo | text-sm font-semibold text-on-surface
Toast.mensaje | mt-0.5 text-sm text-on-surface-secondary
Toast.cerrar | ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-on-surface-secondary hover:bg-muted
```

- **Composición:** la tarjeta es `tarjeta` más **una** de `entrada` o `salida`, y el icono, `icono` más exactamente una de `exito`,
  `info` o `error`. Desde `sm` la región pasa de `inset-x-4` a `left-auto right-4 w-96`: las utilidades con `sm:` salen después en la
  hoja (medido a 1280 px: `right` de 16 px y 384 px de ancho).

## Estructura de página

### PageHeader

- **Reemplaza:** los encabezados distintos de cada pantalla (`h1` semibold, `h1` bold, `h2` xl, `h2` lg) y las
  cabeceras sin `<h1>` de las vistas de fichas. No usa las clases globales `.section-header` ni `.header-action`:
  combinadas con `PageHeader.fila`, la clase global gana y los `items-end` y `gap-4` de la fila quedan inertes.
- **API:** `titulo` (el `<h1>`), `descripcion?`, `acciones?: ReactNode`, `insignia?: ReactNode` (junto al `<h1>`, fuera de
  él; envuelve en celular), `meta?: ReactNode` (línea bajo el título, antes de la descripción) y
  `migas?: { etiqueta; to? }[]`.
- **Reglas:** **un solo `<h1>` por pantalla**, aquí. La acción principal va a la derecha del título, dentro de
  `PageHeader.acciones` (varias acciones quedan a 8 px); si no cabe a su lado, la fila envuelve y baja bajo el
  título. En celular puede ser un `IconButton` de 44 px con `etiqueta` (por ejemplo «Registrar usuario») o un
  `Button`. Las migas solo existen en pantallas con ruta hija (detalle):
  `<nav aria-label="Ruta de navegación">` con una lista; las intermedias son `Link` si traen `to`, la última lleva
  `aria-current="page"` y el separador es un `ChevronRight` decorativo.

```clases
PageHeader.raiz | flex flex-col gap-4
PageHeader.fila | flex flex-wrap items-end justify-between gap-4
PageHeader.encabezado | min-w-0
PageHeader.titulo | text-xl font-bold text-on-surface sm:text-2xl
PageHeader.encabezadoConInsignia | flex flex-wrap items-center gap-x-3 gap-y-1
PageHeader.meta | mt-1 text-sm text-on-surface-secondary
PageHeader.descripcion | mt-1 text-sm text-on-surface-secondary
PageHeader.acciones | flex flex-wrap items-center gap-2
PageHeader.migas | flex flex-wrap items-center gap-1.5 text-[13px] text-on-surface-secondary
PageHeader.miga | inline-flex items-center gap-1.5
PageHeader.migaEnlace | hover:text-on-surface hover:underline
PageHeader.migaActual | font-medium text-on-surface
```

### Disposición con panel lateral (receta, no es un componente)

En `fichas-perfil` las cinco clases viven en `components/disposicion.ts` (`DISPOSICION`), que usan el detalle y el inicio
del estudiante; otra feature las copia a su propio módulo hasta tener un segundo consumidor.

Para el detalle de una entidad y para el inicio del estudiante. Se acomoda sola: sin breakpoint, el
panel lateral baja debajo del contenido cuando no cabe a su lado.

```clases
Layout.contenedor | flex flex-wrap items-start gap-5
Layout.principal | flex min-w-0 flex-[1_1_35rem] flex-col gap-4
Layout.lateral | flex w-full min-w-0 flex-[0_1_20rem] flex-col gap-4 max-sm:flex-[1_1_100%]
Layout.tarjetaLateral | flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-card
Layout.tituloLateral | text-xs font-semibold tracking-wider text-on-surface-secondary uppercase
```
