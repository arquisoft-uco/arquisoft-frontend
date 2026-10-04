# El lienzo de diseño (solo lectura)

**URL:** https://claude.ai/artifact/TPmx9vR2cnHtkbt75NkAFC · título «Análisis UI/UX Arquisoft» · creado el
2026-10-03 con `/design` a partir del análisis del código del frontend.

## Reglas de uso

- **Es de solo lectura.** El usuario pidió conservarlo intacto como referencia. Nunca publiques sobre esa
  URL, no lo borres y no agregues ni quites tableros. Si el diseño debe cambiar, lo pide el usuario y se
  hace con su aprobación explícita.
- **Es público** (el usuario lo hizo público el 2026-10-03): cualquiera del equipo lo abre con el enlace y
  sirve como **documentación, ejemplo y contexto extra**. Los tableros marcados «interactivo» son ejemplos
  vivos de comportamiento: se puede escribir en la búsqueda, activar chips, abrir el popover y el menú de
  fila, cambiar de pestaña en el panel de edición, accionar los interruptores y cambiar de rol en el inicio.
  Para una persona, es la forma más rápida de entender el patrón.
- **Aun así, esta skill es autosuficiente:** `tokens.md`, `componentes.md` y `patrones.md` recogen todo lo que
  el lienzo muestra, porque un agente puede no tener la herramienta `Artifact` y el enlace puede cambiar de
  permisos. **Una regla escrita aquí gana sobre una impresión visual del lienzo**; ábrelo para una medida o un
  detalle que falte, y si encuentras una diferencia, repórtala en vez de elegir.
- **Cómo leerlo**, si la sesión tiene la herramienta `Artifact`: `action: "read"` con la `url` y
  `path: "project/{Archivo}.dc.html"`. Cada tablero es un HTML autocontenido; sus clases están en el
  `<helmet><style>`. Léelo, no lo publiques. Tradúcelo a las clases de Tailwind de `componentes.md`: el lienzo
  usa variables CSS y clases de maqueta, no las del proyecto.
- **Los nombres, correos, cifras y estados son datos de muestra**, no información real. Los identificadores de
  estado de ficha, evaluación y usuario son los del código; las variantes de color son propuesta aprobada.
- **Copia local:** si existe, está en `.workspace/diseno/lienzo-2026-10-03/` (ignorada por git; solo en la máquina de
  quien la generó). No la edites.

## Tableros

| Archivo | Qué muestra | Léelo para |
|---|---|---|
| `Main` | Diagnóstico: cifras, hallazgos por área, qué se conserva, mapa del lienzo | Entender por qué existe cada regla |
| `Antes-Usuarios` | Pantalla actual de Usuarios con ocho problemas numerados | Saber qué reemplaza el patrón de listado |
| `Antes-Formularios` | Tres formularios actuales con once problemas numerados | Saber qué reemplaza el patrón de formulario |
| `Tokens` | Tokens nuevos y corregidos, escala tipográfica, espaciado, voz | Colores, contrastes y redacción |
| `Controles` | Botón, icono, insignia y su mapa de estados, pestañas, chips, interruptor, menú de fila, paginador | Estados y medidas de cada control |
| `Campos` | Campo en seis estados, área de texto con contador, combobox, estructura del formulario, guardado y resumen de errores | Anatomía de un campo y de un formulario |
| `Estados` | Esqueletos, vacíos, errores, avisos, toast y diálogos de confirmación | Qué se ve en cada estado |
| `Listado` (interactivo) | Usuarios con búsqueda, chips, popover de filtros, orden por cabecera y menú de fila | Comportamiento del patrón de listado |
| `Listado-Movil` (interactivo) | Tarjetas, chips con desplazamiento y hoja inferior de filtros | Versión de celular |
| `Panel-Crear` | Registrar usuario en panel lateral de 560 px | Estructura de un formulario en panel |
| `Panel-Editar` (interactivo) | Edición con pestañas Datos, Roles y Acceso; interruptores; «Dar de baja» | Los tres modelos de guardado |
| `Ficha-Formulario` | Nueva ficha en página con `Combobox`, estudiantes con tope y resumen | Formulario en página |
| `Formulario-Movil` | Registrar usuario a pantalla completa con pie fijo | Formulario en celular |
| `Detalle-Ficha` (interactivo) | Detalle con migas, pestañas, ítems y panel lateral | Patrón de detalle |
| `Inicio` (interactivo) | Inicio por rol con el selector «Ver como» | Patrón de inicio y menú en dos grupos |
| `Plan` | Cinco pasos, guardarraíles y métricas | Orden de la adopción |

## Diferencias conocidas con el lienzo

Cuando el lienzo y esta skill discrepan en un dato, **vale la skill**: se contó de nuevo contra el código.

| Dato | Lienzo | Skill |
|---|---|---|
| Spinners copiados | 11 (solo los de `border-4`) | 19 en 18 archivos (11 con `border-4` y 8 con `border-2`) |
| Pie de formulario de edición | El prototipo `Panel-Editar` apaga «Guardar cambios» también con datos inválidos | Solo se deshabilita enviando y sin cambios; la validez no lo apaga (`patrones.md` §2) |
| Dónde viven `SidePanel`, `Switch` y `Combobox` | El tablero `Plan` los lista en el paso 3 sin ruta | `SidePanel` nació en `shared/components/ui/` por la excepción declarada (su segundo consumidor llega en HT-UX-04); `Switch` en `usuarios/` y `Combobox` en `fichas-perfil/` (`componentes.md`, «Dónde nace cada pieza») |

## Decisiones aprobadas (2026-10-03)

1. Un solo listado de usuarios con chips de rol en lugar de las seis pestañas (con la precondición de
   `patrones.md` §1).
2. Roles como interruptores con efecto inmediato en lugar de casillas.
3. Panel lateral para registrar y editar usuarios; página completa para registrar fichas.
4. Los módulos sin pantalla salen del menú y se agrupan en «Próximamente».
