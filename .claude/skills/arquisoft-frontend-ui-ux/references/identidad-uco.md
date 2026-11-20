# Identidad institucional UCO

Fuente de color, tipografía y marca del producto. Sale del «Manual de diseño institucional UCO,
lineamientos-desarrollo v8.0» (el manual no se versiona en este repo). **Primera pasada (HT-UX-10):** cuando
Comunicaciones entregue los archivos oficiales (SVG del logo, favicon y `uco-tokens.css`) se reemplaza lo
provisional; el pendiente está en `docs/pendientes.md` (F10). Esta referencia manda en color, tipografía y marca
sobre el lienzo de 2026-10-03; el lienzo sigue valiendo para estructura, patrones y medidas.

## 1. Paleta y pares verificados

Los valores institucionales **no se ajustan** y viven una sola vez en `src/uco-tokens.css` (`--uco-*`).
`src/tailwind.css` los referencia con `var(--uco-*)`; nunca se escribe un hex institucional a mano.

| Color | Hex | Texto encima | Contraste |
|---|---|---|---|
| Verde | `#008b50` | negro | 4,81 |
| Verde oscuro | `#024426` | blanco | 11,31 |
| Amarillo | `#ffca00` | negro | 13,70 |
| Azul | `#1d3475` | blanco | 11,66 |
| Turquesa | `#04b5ac` | negro | 8,21 |
| Naranja | `#e28210` | negro | 7,43 |

Los tokens semánticos (`primary`, `secondary`, `tertiary`, `danger`, `info`, `focus`) y sus pares están en
`tokens.md` §1 y §2.

## 2. Las reglas que contradicen la intuición

- **No existe rojo.** El peligro es naranja con texto negro (`bg-danger text-danger-foreground`). El texto y el
  borde de error sobre fondo claro usan `danger-strong` (el naranja sobre blanco da 2,82 y no cumple). Ni acciones
  ni estados llevan rojo.
- **Verde + blanco no cumple** para texto normal (4,37). Un botón corriente va en verde oscuro (`primary`); el
  verde `#008b50` es acento, éxito y foco, con texto negro si lleva texto.
- **El amarillo solo es fondo con texto negro.** Como color de texto no cumple en ningún tamaño (1,53).
- **El color nunca es el único portador del significado:** insignia y aviso llevan texto y punto o icono.
- Una acción irreversible exige confirmación; un solo elemento de peso visual máximo por pantalla.

## 3. Colores de estado

| Significado | Color | Variante de `Badge` |
|---|---|---|
| Terminado con éxito | verde, texto negro | `exito` |
| En curso o que solo informa | azul, texto blanco | `info` |
| Exige una acción o atención (incluye un rechazo que deja algo por hacer) | naranja, texto negro | `peligro` |
| Inactivo, anulado o archivado | gris neutro | `neutro` |

La correspondencia estado → variante vive en **un solo lugar**, `src/shared/utils/estado-variante.ts`. Un mismo
estado nunca recibe colores distintos en dos vistas; ninguna vista decide el color de un estado por su cuenta.

## 4. Foco

Anillo de 2 px en verde (`focus`), separado 2 px del elemento (`focus-visible:outline-focus` con offset de 2 px).
Sobre fondo blanco da 4,37 (mínimo 3). Donde el verde no alcanza (sobre verde oscuro: 2,59) se usa el amarillo
del tema. Nunca se quita el indicador sin un reemplazo equivalente.

## 5. Fuentes

Montserrat para títulos y encabezados; Poppins para el texto general. Se sirven **desde el propio despliegue**
con `@fontsource/*` (importadas en `src/index.css`): nunca desde una CDN ni con un `<link>` a Google Fonts (expone
la navegación a un tercero). Las fuentes de la marca (Swis721, Franklin Gothic, Nimbus Sans) no se usan en la
interfaz.

## 6. Logo y favicon

- **Logo:** se lee de una sola ruta, `public/brand/` (constante en `src/config/marca.ts`). Ningún componente
  escribe la ruta a mano ni referencia otra copia. No se recolorea, no se recorta, no se deforma; mínimo
  2,5 × 0,77 cm en pantalla equivalente y sobre fondo que lo haga visible. Provisional: PNG hasta recibir el SVG.
- **Favicon:** el institucional completo, `public/favicon.ico` (seis resoluciones), declarado con
  `<link rel="icon" href="/favicon.ico" sizes="any">`. No se sustituye por un ícono propio ni por el del andamiaje.

## 7. Tokens y pruebas

- Los valores se copian tal cual en `src/uco-tokens.css`; los derivados (tintes, grises, `danger-strong`,
  `primary-hover`) están en `@theme` como hex de 6 dígitos y se justifican por su par de contraste.
- `src/tema-contraste.test.ts` (con `src/test-utils/contraste.ts`) mide cada par de texto, el borde de control y el
  foco con la fórmula de WCAG 2.1, y falla ante colores literales fuera de los tokens. Si un token rompe el
  contraste se ajusta el valor, nunca la prueba.
- Sin tema oscuro.

## 8. Qué se revisa

Un plan o un PR con UI no pasa si: introduce un rojo; usa texto blanco sobre verde, amarillo como texto o blanco
sobre naranja; pinta un estado fuera de `estado-variante.ts`; carga fuentes de una CDN; referencia el logo fuera
de `public/brand/`; o escribe un hex institucional fuera de `src/uco-tokens.css` y `src/tailwind.css`.
