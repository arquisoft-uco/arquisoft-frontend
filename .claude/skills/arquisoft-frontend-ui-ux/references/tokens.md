# Tokens, tipografía y voz

`src/tailwind.css` (`@theme`) es el único sitio de color, radio, sombra y animación; `src/index.css` es
el de las clases globales de campo y de fila de acciones. Es la regla de «una decisión, un solo lugar»
de `arquisoft-frontend-estandares`.

## 1. Paso 0: tokens y clases de campo (aplicado en HT-UX-00)

Aplicado en HT-UX-00: los cinco tokens (`--color-muted`, `--color-muted-foreground`,
`--color-border-input`, `--color-danger-muted` y `--color-danger-muted-foreground`) y el valor nuevo de
`--color-tertiary-muted-foreground` ya están en `@theme`. Tailwind descarta en silencio una utilidad cuya
variable no existe (así se perdieron el hover de las filas, las cabeceras de tabla y las pastillas de 21
archivos): `src/arquitectura.test.ts` lo vigila para los nombres de shadcn (`muted`, `accent`, `card`,
`popover`, `input`, `destructive`, `success`, `warning`, `info` y `foreground`). Para cualquier otro token,
compruébalo antes de usarlo: `grep -n "color-<nombre>" src/tailwind.css`.

```css
/* src/tailwind.css · dentro de @theme */
--color-muted: oklch(95% 0.01 230);
--color-muted-foreground: oklch(40% 0.02 230);
--color-border-input: oklch(62% 0.02 230);
--color-danger-muted: oklch(96% 0.03 27);
--color-danger-muted-foreground: oklch(45% 0.19 27);

/* y cambia un valor que ya existe (el texto ámbar llegaba a 4,3 : 1): */
--color-tertiary-muted-foreground: oklch(38% 0.09 70); /* antes oklch(55% 0.12 75) */

/* solo cuando exista SidePanel (paso 3): */
--animate-slide-in-right: slide-in-right 0.25s cubic-bezier(0.23, 1, 0.32, 1);
/* con @keyframes slide-in-right { from { opacity: 0; transform: translateX(2rem); } to { opacity: 1; transform: translateX(0); } } */
```

```css
/* src/index.css · clases globales de campo */
.field-label { margin-bottom: 0.375rem; font-size: 0.8125rem; font-weight: 500; color: var(--color-on-surface); }
.field-input { border: 1px solid var(--color-border-input); }   /* antes var(--color-border): 1,2 : 1 */
.field-hint  { margin-top: 0.25rem; font-size: 0.75rem; color: var(--color-on-surface-secondary); }
@media (min-width: 640px) { .field-input { min-height: 2.5rem; } }   /* dentro del bloque de 640 px que ya existe */
```

Usos corregidos en el mismo paso: `text-warning` en `ConfirmDialog` pasó a
`text-tertiary-muted-foreground`; la pastilla «Próximamente» de `ComingSoon` pasó de `text-secondary` a
`text-secondary-muted-foreground`. La tabla de tokens de «Estilos» en `arquisoft-frontend-estandares` ya
incluye los cinco tokens nuevos.

## 2. Contraste verificado

Texto: mínimo 4,5 : 1 (3 : 1 desde 24 px). Borde de un control de formulario: mínimo 3 : 1. Un par nuevo
se calcula con la fórmula de luminancia relativa de WCAG 2.2 sobre los valores oklch, no a ojo.

| Par | Contraste |
|---|---|
| `on-surface-secondary` sobre `surface` / `background` / `muted` | 7,1 / 6,5 / 6,1 |
| `muted-foreground` sobre `muted` / `surface` | 7,9 / 9,2 |
| `primary-muted-foreground` sobre `primary-muted` | 9,6 |
| `secondary-muted-foreground` sobre `secondary-muted` | 7,1 (`secondary` solo como texto: 3,7, **no se usa**) |
| `tertiary-muted-foreground` sobre `tertiary-muted` | 8,8 (antes de HT-UX-00: 4,3) |
| `danger-muted-foreground` sobre `danger-muted` | 7,0 |
| `danger` (texto de error de campo) sobre `surface` | 5,4 |
| `border-input` sobre `surface` / `background` | 3,6 / 3,3 (el `border` anterior sobre el fondo del campo: 1,2) |
| `primary-foreground` sobre `primary` | 11,0 |

## 3. Qué clase para qué

| Rol | Clases |
|---|---|
| Fondo de página | `bg-background` (ya lo pone `AppLayout`) |
| Tarjeta, tabla, panel | `rounded-xl border border-border bg-surface shadow-card` (`shadow-card`, no `shadow-sm`) |
| Control de formulario | `.field-input` (ya lleva `border-border-input` y `bg-background`) |
| Hover y pista neutra | `bg-muted` (o `bg-surface-secondary` en hover de filas) |
| Tinte de marca (activo, chip, avatar) | `bg-primary-muted text-primary-muted-foreground` |
| Texto | `text-on-surface`; secundario `text-on-surface-secondary` |
| Error de campo | `.field-error` (`text-danger`) |
| Aviso o insignia de error | `bg-danger-muted text-danger-muted-foreground` |
| Acción peligrosa | `bg-danger text-danger-foreground` |
| Separadores | `border-border`; más marcado `border-border-strong` |

Nunca un color crudo de paleta (`red-500`, `green-100`…): lo cubre `src/arquitectura.test.ts` y el
validador lo marca ❌. Nunca el color como único portador del significado: insignias y avisos llevan
icono o punto, más texto.

## 4. Escala tipográfica

Títulos en Plus Jakarta Sans (ya global para `h1`–`h6` en `index.css`) y texto en Inter. No se cambian.

| Estilo | Clases | Dónde |
|---|---|---|
| Título de página | `text-xl font-bold sm:text-2xl` | Un solo `<h1>` por pantalla, dentro de `PageHeader` |
| Título de sección | `text-lg font-semibold` | `<h2>` de una sección de página o de un panel |
| Título de tarjeta | `text-base font-semibold` | Tarjetas y panel lateral de resumen |
| Cuerpo | `text-sm` | Tablas, párrafos y campos (en celular, `.field-input` sube a 16 px) |
| Secundario | `text-sm text-on-surface-secondary` | Descripciones, correos, fechas. En el subtexto de una fila se admite `text-[13px]` |
| Etiqueta | `text-xs font-medium` | Cabeceras de tabla, insignias, contadores, ayudas |
| Piso | 12 px | **Nada por debajo**: ni `text-[10px]` ni `text-[11px]`; `uppercase` con tracking también ≥ 12 px |

## 5. Espaciado, radio y elevación

| Qué | Regla |
|---|---|
| Padding de página | `p-4 sm:p-6 lg:p-8` (lo da `AppLayout`; una feature no lo repite) |
| Entre bloques de una pantalla | `gap-6` |
| Padding de tarjeta | `p-4 sm:p-5` |
| Entre campos | `gap-4`; entre botones, `gap-2` |
| Radio | `rounded-lg` (12 px) controles y botones · `rounded-xl` (16 px) tarjetas, tablas, paneles · `rounded-full` insignias y chips |
| Elevación | `shadow-card` tarjetas · `shadow-dropdown` menús y popovers · `shadow-lg` diálogos y panel lateral |
| Área táctil | 44 px en celular (`h-11`), que baja a 36–40 px desde `sm` |
| Punto de corte | Solo 640 px (`sm`), y únicamente para agregar. Los paneles laterales se acomodan con `flex-wrap`, sin un breakpoint propio |

## 6. Voz y vocabulario

Seis reglas:

1. **Mayúscula solo al inicio**: «Título del proyecto», «Asesor de ficha», «Estado actual». Los nombres
   propios y los roles del enum conservan la suya donde ya se escriben así.
2. **Nombra la acción por su efecto.** Si el sistema desactiva, dice «Dar de baja», no «Eliminar».
3. **Sin jerga de desarrollo**: ni «endpoint», «backend» ni «UUID» en pantalla.
4. **El error trae salida**: qué pasó y qué puede hacer la persona, más «Reintentar» si aplica.
5. **Se marca lo opcional, no lo obligatorio**: «Roles (opcional)», sin asteriscos, porque casi todo es
   obligatorio.
6. **Se pide lo que la persona sabe**: «Tu coordinador», no «UUID del coordinador».

| Concepto | Texto | Nunca |
|---|---|---|
| Crear una entidad | «Registrar usuario», «Registrar ficha» | «Crear», «Nuevo», «Guardar» |
| Editar una entidad | «Editar» en el menú, «Guardar cambios» | «Modificar», «Actualizar» |
| Añadir a una colección | «Agregar ítem», «Agregar estudiante» | «Registrar» |
| Quitar de una colección sin borrar la entidad | «Quitar» (estudiante de la ficha, rol de un usuario) | «Remover», «Eliminar» |
| Desactivar un usuario | «Dar de baja»; estado «Dado de baja»; deshacer: «Restaurar usuario» | «Eliminar» |
| Borrar de verdad (un ítem de ficha) | «Eliminar», con «No se puede deshacer» | |
| Reintentar tras un fallo | «Reintentar» | «Actualizar», «Recargar» |
| Salir de un formulario | «Cancelar» si hay cambios; «Cerrar» si no | |
| Estado de cuenta | «Activo», «Inactivo», «Dado de baja» | «Vigente» como estado (la vigencia se deriva) |

Patrones de texto:

| Pieza | Patrón | Ejemplo |
|---|---|---|
| Toast de éxito | Título: lo ocurrido en pasado. Mensaje: nombre o detalle | «Usuario registrado» · «Ana María Gómez fue registrada correctamente.» |
| Toast de error | Título: «No se pudo {verbo}…». Mensaje: `getApiErrorMessage(err, 'Inténtalo nuevamente.')` | «No se pudo registrar el usuario» |
| Confirmación | Título en pregunta con el nombre; cuerpo con las consecuencias; botón con el verbo | «¿Dar de baja a Ana María Gómez?» · «Dar de baja» |
| Vacío | Título: la situación. Descripción: qué hacer. Acción con verbo | «Tu ficha aún no tiene ítems» · «Agregar ítem» |
| Aviso de no disponible | Una frase | «Esta opción aún no está disponible.» |
| Fechas | `Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' })`, como hoy | |
| Plurales | «1 usuario», «2 usuarios» | |
