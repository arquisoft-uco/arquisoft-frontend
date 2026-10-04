---
name: arquisoft-frontend-ui-ux
description: Diseño UI/UX de Arquisoft Frontend — tokens, tipografía y voz, kit de componentes compartidos (Button, Badge, Field, Notice, EmptyState, ErrorState, Skeleton, Tabs, DataTable, FilterBar, SidePanel, Combobox, Switch), patrones de pantalla (listado con filtros, formulario en panel o en página, detalle con ruta, inicio por rol, estados) y las reglas que los gobiernan, con el lienzo de diseño aprobado como referencia pública de solo lectura. Cargar junto con arquisoft-frontend-arquitectura y arquisoft-frontend-estandares al planificar o implementar cualquier cosa que se vea: pantallas, listados, filtros, formularios, estados vacíos o de error, navegación o piezas de shared/components/ui.
---

# Skill: arquisoft-frontend-ui-ux

Fuente de verdad de **lo que se ve y de cómo se comporta**. `arquisoft-frontend-arquitectura` y
`arquisoft-frontend-estandares` mandan en dónde vive el código y cómo se escribe; esta manda en el diseño y la
interacción.

**Precedencia.** Donde una regla de aquí contradiga un detalle de esas dos, gana esta **en pantallas nuevas o
migradas**. Hoy hay un solo caso: en un formulario nuevo, el momento de validar y el botón principal
(`mode: 'onTouched'` y sin deshabilitar por validez; ver `references/patrones.md` §2). Lo ya escrito se migra
cuando se toca por otra razón, nunca en una pasada aparte.

**El diseño está aprobado** (2026-10-03) y vive en un lienzo público de solo lectura:
https://claude.ai/artifact/TPmx9vR2cnHtkbt75NkAFC. Sirve de documentación y de ejemplo vivo (los tableros
interactivos se pueden probar), pero **esta skill y sus referencias lo recogen completo**: no hace falta abrirlo
para implementar. Nunca publiques sobre él ni lo borres. Detalle y mapa de tableros en `references/lienzo.md`.

## Qué abrir

| Si la tarea… | Abre |
|---|---|
| Toca color, tipografía, espaciado, contraste o redacción de textos | `references/tokens.md` |
| Usa o crea una pieza del kit (botón, campo, tabla, panel, aviso…) | `references/componentes.md` |
| Es un listado, un formulario, un detalle, el inicio, el menú o un estado | `references/patrones.md` |
| Planifica un paso de la adopción o decide si migrar un archivo | `references/adopcion.md` |
| Necesita una medida o un detalle visual que no está en las anteriores | `references/lienzo.md` |

## Siete principios

1. **Un patrón por problema.** Listar, filtrar, crear, editar, confirmar y avisar tienen una sola forma en todo el
   producto. Si dos pantallas resuelven lo mismo de manera distinta, una está mal.
2. **La acción principal, siempre en el mismo sitio:** arriba a la derecha de la cabecera de página o de panel; en
   celular baja a su propia línea (la cabecera envuelve) o es un botón de icono de 44 px.
3. **Filtrar no es navegar.** Los filtros son chips y un popover; las pestañas cambian de sección y de URL.
4. **El formulario no tapa la lista:** se abre en un panel lateral o en su propia página, nunca encima de lo que
   ya se estaba viendo.
5. **Cada cosa se guarda de una sola manera, y la pantalla lo dice:** con el botón, al instante (interruptor y
   toast) o con confirmación.
6. **Lo que no existe no se ofrece.** Un módulo o una pestaña sin pantalla no es destino de navegación: se agrupa
   bajo «Próximamente» o no se muestra.
7. **Texto de persona, no de desarrollo:** sin «endpoint», «backend» ni «UUID»; nada por debajo de 12 px; áreas
   táctiles de 44 px.

## Qué patrón aplica

| Situación | Patrón | Piezas |
|---|---|---|
| Lista de entidades, con o sin filtros | §1 Listado con filtros | `PageHeader`, `FilterBar`, `DataTable`, `PaginadorListado`, `RowMenu`, `Badge` |
| Crear o editar desde un listado, hasta 5 campos simples | §2 Formulario en panel lateral | `SidePanel`, `FormSection`, `Field`, `FormActions`, `ErrorSummary` |
| Crear con selectores de muchas opciones, más de 5 campos o varias secciones | §3 Formulario en página | `PageHeader`, `FormSection`, `Field`, `Combobox`, `FormActions` |
| Ver una entidad con sus partes (ítems, estados…) | §4 Detalle con ruta | `PageHeader` con migas, `Tabs`, disposición con panel lateral |
| Pantalla de entrada de cada rol | §5 Inicio por rol | Tarjetas, `Badge`, cifras de `totalElements` |
| Menú lateral o encabezado | §6 | `NavItem.disponible`, `Avatar` |
| Cargando, vacío, error, no disponible | §7 Estados | `Skeleton`, `LoadingState`, `EmptyState`, `ErrorState`, `Notice` |
| Cambio que se aplica al instante (roles, preferencias) | §8 | `Switch` y toast |
| Acción que quita acceso o no se deshace | §8 | `ConfirmDialog` `peligro`, con consecuencias |
| Elegir entre ≤ 5 / 6 a 8 / más de 8 opciones | — | Chips o radio / `select` nativo / `Combobox` |
| Cambiar la vista de los mismos datos | — | `Segmented` |
| Cambiar de sección con URL propia | — | `Tabs` con `to` |

## Para el planificador

Invoca esta skill en la FASE 0 si la HU toca algo que se ve. **El plan nombra el patrón y las piezas; no copia
recetas, clases ni reglas** (el plan decide qué y dónde; el cómo está aquí).

- **Sección 7 (Detalle por archivo):** cada pantalla o panel declara `Patrón: §N` y `Piezas: …`. Una pieza nueva
  del kit aparece en el árbol de la sección 6 con su ruta y su motivo de «dónde nace» (`componentes.md`).
- **Sección 9 (Estados de la UI):** nombra la pieza de cada estado: la forma del `Skeleton`, el tipo de
  `EmptyState` y el `ErrorState` con `onReintentar`.
- **Sección 8:** declara `NavItem.disponible` y, si hay rutas hijas, que cuelgan del módulo y **no** llevan
  `NavItem` propio (`patrones.md` §4).
- **Archivos de `adopcion.md`:** si la HU toca uno, el plan dice si se migra a la pieza o se deja (migrar al tocar).
- **Preguntas al usuario:** solo las de producto que la tabla de arriba no resuelve (qué campos busca el listado,
  qué acciones lleva cada fila). El estilo no se pregunta: está decidido.
- **Verifica contra el backend lo que el patrón promete:** campos filtrables y ordenables del criterio, y que los
  endpoints por rol existan (`patrones.md` §1). Lo que falte es una dependencia de backend, no un supuesto.

## Para el implementador

1. **Antes de teclear UI:** lista `src/shared/components/ui/` y `src/shared/components/`, y mira si el paso 0 ya
   está (`grep -n "color-muted" src/tailwind.css`). El estado real del kit está en el código, no aquí.
2. **Kit primero.** Si la pieza existe, úsala. Si el plan declara una pieza nueva, créala con las clases de
   `componentes.md` (están verificadas contra el Tailwind del proyecto) y su prueba de comportamiento. Si el caso
   no está cubierto, es una ambigüedad: usa el protocolo del agente, no inventes una variante.
3. **Sin el paso 0**, no uses `bg-muted`, `text-muted-foreground`, `border-border-input`, `bg-danger-muted` ni
   `text-danger-muted-foreground`: no generan estilo. Usa `bg-surface-secondary` o `hover:bg-nav-hover-bg`.
4. **Al cerrar una pantalla:** la lista de abajo y la verificación a 390, 320 y 1280 px de los estándares. Una
   pantalla que no viste no se reporta como verificada.

## Lo que un plan o un PR nunca hace

- Escribir a mano un botón, una insignia, un campo, un aviso, un spinner, un esqueleto, un vacío o un error si la
  pieza existe; o inventar una variante que la receta no tiene.
- Abrir un formulario encima de la lista, o un panel o una página sin «Cancelar» y una acción principal con verbo.
- Poner un botón «Actualizar», «Buscar» o «Filtrar»; ordenar con un `select`; filtrar con casillas sueltas.
- Mezclar en un formulario casillas que guardan al instante con un botón de guardar, sin separarlos.
- Ofrecer como destino un módulo o una pestaña sin pantalla.
- Usar `window.confirm`, emoji como icono, el color como único portador del significado, texto de menos de 12 px,
  un ancho fijo o un breakpoint propio (el único es 640 px, y los paneles laterales se acomodan solos).
- Escribir «endpoint», «backend» o «UUID» en pantalla; Title Case; «Eliminar» cuando se da de baja.
- Elegir personas con un `select` de más de ocho opciones o con un botón por persona.
- Reescribir archivos solo por «normalizar»: se migra al tocar, y un paso migra únicamente lo que su plan lista.

## Checklist de una pantalla

1. Un solo `<h1>`, dentro de `PageHeader`, en sentence case; la acción principal a la derecha.
2. Solo tokens semánticos; ningún color crudo; texto de 12 px o más; radios de 12 y 16 px.
3. Piezas del kit en lugar de clases sueltas para botón, insignia, campo y aviso.
4. Los tres estados y el degradado: esqueleto con la forma de la pantalla, vacío con siguiente paso, error con
   «Reintentar».
5. Filtros al instante (el texto con retardo de 300 ms), lo aplicado visible y «Limpiar todo».
6. Formulario en panel o página; error al salir del campo; resumen al fallar el envío; una forma de guardar por
   sección y dicha en pantalla.
7. Mobile first verificado: sin scroll horizontal, tablas como tarjetas, áreas táctiles de 44 px.
8. Teclado: el foco entra y sale de paneles, diálogos y menús, Esc cierra y el orden es lógico.
9. Voz: verbos exactos, sin jerga, mensajes con salida.
10. Vista real en el navegador si hay uno (`arquisoft-frontend-mcps`).
