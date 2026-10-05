# Patrones de pantalla

Cada patrón dice qué estructura tiene, cómo se comporta y qué reemplaza. Las piezas están en
`componentes.md`. Las reglas de capas, estado y toasts siguen siendo las de `arquisoft-frontend-arquitectura`
y `arquisoft-frontend-estandares`; aquí no se repiten.

## 1. Listado con filtros

```
PageHeader   titulo + descripcion ........................ [Acción principal]
FilterBar    [ buscar por nombre, correo o identificador ]  [Filtros (2)]
             [Todos] [Estudiantes] [Asesores] …                       <- chips principales
             Filtros aplicados: [Estado: Activo x] [Vigencia: Vigentes x]  Limpiar todo
Resumen      12 usuarios                                              <- aria-live="polite"
DataTable    Usuario ↑ | Identificador | Contacto | Roles | Estado | ⋯
PaginadorListado   1–10 de 98 usuarios · ‹ 1 2 3 … ›
```

- **Un solo paradigma:** todo filtra al instante; el texto, con retardo de 300 ms. Nada de «Buscar»,
  «Filtrar» ni «Actualizar» (React Query ya refresca; si falla, `ErrorState` con «Reintentar»).
- **Dónde vive el estado:** en el hook del listado (`use{Recurso}`), por encima de cualquier panel o
  formulario, como ya piden los estándares. Cualquier cambio de búsqueda, filtro u orden vuelve a la página 0.
  El valor con retardo es el que entra en la query key.
- **Si el listado tiene rutas hijas** (detalle, formulario en página), el estado vive en la URL con
  `useSearchParams` (`q`, `rol`, `estado`, `vigencia`, `orden`, `pagina`): un estado en `useState` se pierde al
  desmontar la vista y «Volver» dejaría al usuario sin su filtro. Con panel lateral no hace falta, porque la
  lista no se desmonta.
- **Qué se busca y qué se ordena sale del criterio del backend.** Usuarios: `UsuarioCriteria` expone `nombre`,
  `email` e `identificador` como texto filtrable y ordenable (`contacto` solo filtrable). La búsqueda es un
  `GRUPO` `OR` de predicados `CONTIENE` sobre esos campos, unido por `AND` al resto en `construirFiltro`. Antes
  de prometer un campo en un plan, ábrelo en el `*Criteria` del backend; si no es filtrable u ordenable, es
  una dependencia de backend.
- **Fichas del representante** conserva sus filtros (`titulo`, nombre y correo del asesor, estados con `IN`): la
  búsqueda cubre el título; el asesor y los estados van en el popover como secciones.
- **Chips principales:** uno o dos filtros, con 7 opciones como máximo, a la vista (el rol en Usuarios, el estado en
  fichas). **Popover:** los demás (estado, vigencia). Los aplicados muestran solo lo del popover.
- **Orden:** desde la cabecera; el plan declara el orden por defecto (`ordenamiento: ['nombre:ASC']`).
- **Columnas (máximo seis):** identidad (avatar o título + subtexto) · dos o tres datos · estado (**una**
  `Badge`) · menú de fila. La fila abre el detalle o el panel desde su título; las acciones secundarias van en el
  `RowMenu`, la destructiva al final.
- **Móvil (< 640 px):** la tabla se vuelve lista de tarjetas; la búsqueda ocupa el ancho; un botón «Filtros y
  orden» abre una hoja inferior con «Limpiar» y «Ver N resultados»; los chips de rol se desplazan en
  horizontal y miden 44 px.
- **Estados:** carga con `Skeleton variante="tabla"`; sin datos, `EmptyState` con la acción que crea el primero;
  sin resultados (solo con búsqueda o filtros activos), `EmptyState` con «Limpiar filtros»; error, `ErrorState`.
- **Pestañas por rol de Usuarios → un solo listado con chips de rol (hecho en HT-UX-02).** La precondición se
  comprobó contra el backend: `POST /usuarios/administrador` admite los filtros de los seis roles, la búsqueda por
  texto y el orden; los endpoints por rol solo añadían las bajas de rol (una vista de auditoría) y siete client roles
  propios, así que se eliminaron las vistas por rol y «Vigencia» es la del usuario. «Quitar rol» vive en el
  formulario de edición y pasa a su pestaña «Roles» con el panel lateral.

## 2. Formulario en panel lateral

Para crear o editar desde un listado una entidad de **hasta cinco campos simples**.

```
SidePanel  [Título · descripción]                                   [x]
           (edición, dentro del cuerpo y fijas al desplazar) Tabs: Datos | Roles | Acceso
           FormSection «Cuenta»          Identificador · Correo
           FormSection «Datos personales» Nombres | Apellidos · Contacto
           FormSection «Roles (opcional)» chips
           ErrorSummary (solo tras un envío inválido)
FormActions  Cambios sin guardar                  [Cancelar] [Registrar usuario]
```

- **La lista se queda detrás** con sus filtros y su página. Ya no se abre encima de las pestañas ni de los filtros.
- **Cierre:** ✕, Esc, clic en el fondo y «Cancelar». Con cambios sin guardar pide «¿Descartar los cambios?».
  Al cancelar se resetean el formulario **y** la mutación (regla de los estándares).
- **Éxito:** toast y cierra el panel; el listado se invalida por prefijo y conserva filtro y página («Retorno tras
  registrar, editar o eliminar»). **Fallo:** el panel sigue abierto con los datos intactos, el error junto al
  campo, el `ErrorSummary` y el toast de error (siempre, aunque el campo esté a la vista).
- **Validación** (esta skill manda sobre el detalle de los estándares en formularios nuevos o migrados):
  `useForm({ mode: 'onTouched' })`; el error aparece al salir del campo y se limpia al corregir. El botón
  principal **no se deshabilita por validez**: solo mientras envía y, al editar, mientras `!isDirty`. Al enviar con
  errores, `handleSubmit(onValido, onInvalido)` enfoca el primer campo con error y muestra el `ErrorSummary`.
  Las reglas siguen siendo los builders de `shared/validation` y `LIMITES`, con la granularidad del DTO.
- **Edición con pestañas, una forma de guardar por pestaña, dicha en pantalla:**
  - **Datos:** se guarda con el botón; el pie muestra «Cambios sin guardar» y «Guardar cambios».
  - **Roles:** un `Switch` por rol, **al instante** con toast; quitar un rol pide `ConfirmDialog`. Los roles que
    aún no se pueden asignar (`ROLES_AGREGABLES`/`ROLES_QUITABLES` de hoy) se ven deshabilitados con «Pronto».
  - **Acceso:** el estado de la cuenta con radio y «Aplicar cambio de estado» (con confirmación) y, aparte, la
    zona «Dar de baja» (confirmación con consecuencias). Restaurar es volver el estado a `ACTIVO`, como hoy.
- **Móvil:** el panel ocupa toda la pantalla; el pie queda fijo con el botón principal a ancho completo.

## 3. Formulario en página

Para crear con **selectores de muchas opciones, más de cinco campos o varias secciones** (la ficha de perfil).

- **Ruta hija del módulo** (`/fichas-perfil/nueva`), con migas «Fichas de perfil › Nueva ficha», un `<h1>` y una
  descripción de una línea. Cuerpo con `Layout.contenedor`: tarjeta del formulario (máximo `max-w-3xl`) y, si
  aporta, un panel lateral de resumen con la lista de lo ya completo.
- **Secciones** con `FormSection` («Proyecto», «Asesor», «Estudiantes»). Los selectores con muchas opciones son
  `Combobox`; el asesor ya elegido se muestra como tarjeta con «Cambiar»; los estudiantes, como filas con ✕ y el
  contador «2 de 3» (`LIMITES.ESTUDIANTES_MAX`).
- **Pie** con `FormActions`, sticky. Mismas reglas de validación, éxito y fallo que el panel; al registrar se
  vuelve al listado **con su filtro y página**, que sobreviven porque viven en la URL.
- **Móvil:** una columna; el resumen baja debajo del formulario o se omite.
- **Si el formulario lo abre un rol que ya es el asesor** (hoy ninguno: `asesorFijoId` salió con `RegistrarFichaPerfil`), el campo
  asesor sería solo lectura con el texto «Eres tú», no un `select` deshabilitado.

## 4. Detalle con ruta

```
PageHeader   migas: Fichas de perfil › {título}
             h1 título  [Badge de estado]  ·  actualizada el … · 3 estudiantes
Layout       principal                                  | lateral (resumen)
             Tabs: Ítems 4 | Historial de estados       | Estado · Asesor · Equipo
             contenido de la pestaña                    | acciones propias del rol
```

- **Es una ruta, no un estado de React:** `/fichas-perfil/:id`, con las pestañas como subrutas
  (`/items`, `/estados`). Tiene URL compartible y «Volver» (las migas y el botón del navegador) conserva el
  filtro y la página del listado, porque el listado los guarda en la URL.
- **Rutas hijas y guardas.** Las hijas cuelgan de la ruta del módulo: el `guarded('fichas-perfil', <Outlet />)`
  va en el padre y cubre a los hijos; **no llevan `NavItem` ni guardia propia**. El plan lo escribe expresamente
  (sin eso, el check 2.7 de `@4a` marcaría una «ruta nueva sin `NavItem`»), y el HT que lo implemente actualiza la
  sección «Enrutamiento» de `arquisoft-frontend-arquitectura` y ese check. Si el contenido cambia por rol, la
  página hija repite el fan-out `VIEW_POR_ROL` a nivel de módulo.
- **`Tabs` no lleva `state`.** Si el resumen viaja en el `state` del `Link` del listado, se lee una vez en el
  contenedor de `:id`; sin `state` (URL directa o recarga en otra pestaña) la pantalla muestra el título genérico y
  solo lo que depende del id, sin inventar datos.
- **Panel lateral de resumen:** estado actual con su `Badge`, asesor, equipo (`equipo?: ReactNode` de `ResumenFichaPanel`; el estudiante lo toma de `integrantes` de «mi ficha» porque su rol no tiene el permiso del endpoint de compañeros, y se omite en un rol que no pueda consultarlo) y, según el rol, **su** acción
  (asesor: «Cambiar estado»; representante: «Iniciar evaluación»; estudiante: ninguna).
- **Pestañas solo de lo que existe.** Revisiones y Evaluaciones reaparecen cuando exista su historia. El
  catálogo «Tipos de ítem» no es una pestaña: es una ayuda («¿Qué tipos de ítem existen?», diálogo) y, en el
  formulario de ítem, los tipos que aún no se usan como atajos.
- **Ítems:** tarjetas con el tipo (`Badge neutro`), el contenido y `IconButton` de editar y eliminar (44 px);
  «Agregar ítem» abre un `SidePanel` (formulario corto). Eliminar pide confirmación («No se puede deshacer»).
- **El estudiante** ve su ficha en la raíz del módulo (`EstudianteView`, sin ruta propia: las pestañas «Ítems» e
  «Historial de estados» son estado de React). Con varias fichas, un `select` nativo dentro de `Field` (`max-w-sm`) cambia
  de ficha; no se usa `Segmented`. «Editar título», «Agregar ítem» y «Editar ítem» abren un `SidePanel`; el historial es
  una línea de tiempo (`<ol>`) con «Actual» en el estado más reciente.

## 5. Inicio por rol

- **Fan-out** por rol con `VIEW_POR_ROL` a nivel de módulo (como `FichasPerfil.tsx`) y una vista por rol en
  `features/dashboard/components/`. Cabecera: «Hola, {nombre}» y una frase con la situación del usuario. Sin
  emoji, sin degradado.
- **Cada cifra sale de un listado que ya existe** (`totalElements` con el filtro del rol y el tamaño de página
  mínimo). Nunca un número escrito a mano. La feature `dashboard` tiene su propio service y sus hooks para esas
  consultas: **no importa hooks de otra feature**.
- **Estudiante:** tarjeta «Tu ficha de perfil» (título, `Badge` de estado, asesor, equipo, «Abrir ficha»), actividad
  reciente, «Tu ruta académica» (pasos del flujo de gestión: el que existe «En curso», los demás «Pronto») y
  atajos (enviar una solicitud). **Representante:** bandeja «Fichas por evaluar» (título, asesor, `Badge`, fecha,
  «Revisar») y dos cifras. **Administrador:** usuarios vigentes y dados de baja, «Registrar usuario» y los
  usuarios por rol. Los demás roles reciben su bandeja cuando su módulo exista.
- Al reescribir `Dashboard.tsx` se borran de `index.css` las clases que dejan de usarse (`hero-gradient`,
  `hero-pattern`, `quick-card`).

## 6. Menú lateral y encabezado

- **Dos grupos:** «Trabajo» (módulos con pantalla) y «Próximamente» (los que no, en tono atenuado y sin enlace).
  `NavItem` gana `disponible?: boolean` (por defecto `true`); la HU que entrega el primer pantallazo de un
  módulo lo pone en `true` (o quita la propiedad) y lo declara en la sección 8 del plan. La ruta del módulo vacío
  sigue existiendo por URL y muestra `ComingSoon` (escrito sobre `PageHeader` y `EmptyState`, con «Volver al inicio»), pero **no es destino del menú**.
- Etiquetas de grupo y de ítem de al menos 12 px; ítems de 40 px. El encabezado conserva el selector de rol y
  muestra el avatar con las iniciales (`Avatar`); el título de la página lo pone `PageHeader`, no el encabezado.

## 7. Estados

| Estado | Pieza | Nota |
|---|---|---|
| Cargando una forma conocida | `Skeleton` de esa forma | Tabla, tarjetas o formulario; con `aria-busy` |
| Cargando sin forma | `LoadingState` | El spinner de página; el de `Button cargando` va dentro del botón y no se escribe ningún otro |
| Enviando | `Button cargando` | Cambia el icono por el spinner y se deshabilita; quien lo usa pone el texto («Guardando…») |
| Aún no hay datos | `EmptyState` | Con la acción que crea el primero |
| Sin resultados | `EmptyState` | Solo con filtros activos; «Limpiar filtros» |
| Todavía no disponible | `EmptyState` o `Notice advertencia` | «Esta opción aún no está disponible.» Sustituye a `AvisoNoDisponible` y a `ComingSoon` dentro de una pantalla; el envío sigue deshabilitado como pide la skill de arquitectura |
| Error al cargar | `ErrorState` con `onReintentar` | El detalle técnico, si hay, va en texto pequeño bajo el botón |
| Error en una sección o campo | `Notice peligro` / `Field error` | El envío fallido además da toast y `ErrorSummary` |

Los atributos ARIA de cada estado (`role="status"`, `role="alert"`, `aria-busy`) son los de los estándares y los
llevan ya las piezas.

## 8. Acciones que se aplican al instante y confirmaciones

- **Al instante** (roles, preferencias): `Switch` + toast. Cada interruptor es una mutación; el pendiente
  marca ese interruptor como ocupado (`aria-busy` y `aria-disabled`, sin `disabled` para no perder el foco), no el formulario.
- **Con botón:** datos de un formulario. **Con confirmación:** lo que quita acceso o no se deshace
  (`ConfirmDialog peligro` con consecuencias y el verbo exacto: «Dar de baja», «Quitar», «Eliminar»);
  lo que cambia algo reversible pide `advertencia`.
- Un mismo formulario **no mezcla** los tres modelos sin separarlos en pestañas o secciones con título.
