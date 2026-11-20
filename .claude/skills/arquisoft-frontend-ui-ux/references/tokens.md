# Tokens, tipografía y voz

`src/tailwind.css` (`@theme`) es el único sitio de color, radio, sombra y animación; `src/index.css` es
el de las clases globales de campo y de fila de acciones. Es la regla de «una decisión, un solo lugar»
de `arquisoft-frontend-estandares`.

## 1. Identidad institucional (HT-UX-10)

La paleta sale del «Manual de diseño institucional UCO (lineamientos de desarrollo)».
Los valores institucionales viven **una sola vez** en `src/uco-tokens.css` (`--uco-*`, copia literal del
manual, sin ajustar) y `@theme` los referencia con `var(--uco-*)`; los derivados (tintes, grises,
`danger-strong`, `primary-hover`) están en `@theme` como hex de 6 dígitos. Nunca se escribe un hex
institucional a mano fuera de esos dos archivos: `src/tema-contraste.test.ts` lo vigila.

```css
/* src/tailwind.css · dentro de @theme */
--color-primary: var(--uco-verde-oscuro);      /* #024426, texto blanco 11,31 */
--color-secondary: var(--uco-verde);           /* #008b50: acento y éxito, texto negro 4,81 */
--color-tertiary: var(--uco-amarillo);         /* #ffca00: solo relleno, texto negro */
--color-danger: var(--uco-naranja);            /* #e28210: solo relleno, texto negro */
--color-danger-strong: #5a3100;                /* texto y borde de error sobre fondo claro */
--color-info: var(--uco-azul);                 /* #1d3475: «en curso», texto blanco */
--color-focus: var(--uco-verde);               /* anillo de foco */
```

Reglas del manual que cambian el uso:

- **Sin rojo.** El peligro es naranja con texto negro; el texto y el borde de error sobre fondo claro usan
  `danger-strong`, porque el naranja sobre blanco da 2,82 : 1.
- **El amarillo nunca es color de texto**, y el verde `#008b50` no admite texto blanco: solo foco, acento y éxito.
- **Sin tema oscuro.**
- Un token nuevo se comprueba con `grep -n "color-<nombre>" src/tailwind.css` antes de usarlo: una utilidad sin su
  variable no genera estilo (`src/arquitectura.test.ts` lo vigila).
- Los pares de texto, el borde de control y el foco los mide `src/tema-contraste.test.ts` en `npm test`: si un
  token rompe el contraste, se ajusta el valor, no la prueba.

## 2. Contraste verificado

Texto: mínimo 4,5 : 1 (3 : 1 desde 24 px). Borde de un control de formulario y anillo de foco: mínimo 3 : 1.
Se calcula con la fórmula de luminancia relativa de WCAG 2.1 sobre los hex, y la prueba automática lo repite.

| Par | Contraste |
|---|---|
| `primary-foreground` sobre `primary` | 11,31 |
| `secondary-foreground` (negro) sobre `secondary` | 4,81 (**no** blanco: 4,37) |
| `tertiary-foreground` (negro) sobre `tertiary` | 13,70 |
| `danger-foreground` (negro) sobre `danger` | 7,43 (blanco: 2,82, no se usa) |
| `info-foreground` sobre `info` | 11,66 |
| `on-surface-secondary` sobre `surface` / `background` / `muted` | 7,46 / 6,87 / 6,27 |
| `muted-foreground` sobre `muted` / `surface` | 10,62 / 12,63 |
| `primary-muted-foreground` sobre `primary-muted` | 12,58 |
| `secondary-muted-foreground` sobre `secondary-muted` | 9,40 |
| `tertiary-muted-foreground` sobre `tertiary-muted` | 10,76 |
| `danger-muted-foreground` sobre `danger-muted` | 8,13 |
| `danger-strong` sobre `surface` | 11,21 |
| `border-input` sobre `surface` / `background` / `muted` | 4,54 / 4,18 / 3,82 |
| `focus` sobre `surface` / `background` / `muted` | 4,37 / 4,02 / 3,67 |

## 3. Qué clase para qué

| Rol | Clases |
|---|---|
| Fondo de página | `bg-background` (ya lo pone `AppLayout`) |
| Tarjeta, tabla, panel | `rounded-xl border border-border bg-surface shadow-card` (`shadow-card`, no `shadow-sm`) |
| Control de formulario | `.field-input` (ya lleva `border-border-input` y `bg-background`) |
| Hover y pista neutra | `bg-muted` (o `bg-surface-secondary` en hover de filas) |
| Tinte de marca (activo, chip, avatar) | `bg-primary-muted text-primary-muted-foreground` |
| Texto | `text-on-surface`; secundario `text-on-surface-secondary` |
| Error de campo | `.field-error` y borde inválido (`danger-strong`) |
| Foco | `focus-visible:outline-focus` o `focus-visible:ring-focus`; nunca `outline-primary` |
| Aviso o insignia de error | `bg-danger-muted text-danger-muted-foreground` |
| Acción peligrosa | `bg-danger text-danger-foreground` (naranja con texto negro) |
| En curso | `Badge` `info`: `bg-info text-info-foreground` |
| Separadores | `border-border`; más marcado `border-border-strong` |

Nunca un color crudo de paleta (`red-500`, `green-100`…): lo cubre `src/arquitectura.test.ts` y el
validador lo marca ❌. Nunca el color como único portador del significado: insignias y avisos llevan
icono o punto, más texto.

## 4. Escala tipográfica

Títulos en Montserrat (400, 600, 700 y 800; ya global para `h1`–`h6` en `index.css`) y texto en Poppins (400, 500 y 600), servidos con `@fontsource` desde el propio despliegue, nunca desde Google Fonts. En Poppins, `font-bold` (700) resuelve al 600. Poppins es más ancha que la fuente anterior: revisa desbordes a 320 px.

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
