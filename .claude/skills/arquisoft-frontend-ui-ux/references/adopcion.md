# Adopción: el plan de cinco pasos

**Estado (2026-10-04):** los pasos 0 a 4 están hechos (HT-UX-00 a 09; PR pendiente). Este documento queda como historial y como guía de migración al tocar: lo único que sigue abierto está en «Qué archivo se migra a qué» y en «Cómo se sabe que funcionó».

El usuario aprobó el diseño completo el 2026-10-03, junto con cuatro decisiones: (1) un solo listado de usuarios
con chips de rol en lugar de las seis pestañas (precondición comprobada en HT-UX-02, ver `patrones.md` §1); (2) los roles pasan
de casillas a interruptores con efecto inmediato; (3) panel lateral para registrar y editar usuarios y página
completa para registrar fichas; (4) los módulos «Próximamente» salen del menú y se agrupan aparte.

## Reglas de la adopción

- **Cada paso es una HT con su propio ID y su propio PR hacia `develop`**, y entrega valor por sí solo. El
  planificador la crea como cualquier HT (tipo D «Plataforma» o C «Mixta»).
- **Nunca una pasada de «normalizar todo».** Lo escrito a mano antes del kit se migra cuando se toca por otra
  razón (regla de «Una decisión, un solo lugar» de los estándares). Un paso migra **solo los archivos que su
  plan lista**; el resto, cuando otra HU los toque.
- **Qué hace una HU que toca un archivo de la tabla de abajo:** si la pieza del kit ya existe, el archivo se
  migra a ella en esa misma HU; si no existe, se escribe con las clases y el comportamiento de la receta, para
  que la migración posterior sea mecánica. Nunca se inventa una variante nueva.
- **Una pieza sube a `shared/` con dos features consumidoras.** Cada PR que crea una pieza genérica la estrena en
  una vista de Usuarios y una de Fichas.

## Los pasos

### Paso 0 — Tokens (hecho en HT-UX-00)

- **Cambió:** `src/tailwind.css` (cinco tokens y un valor), `src/index.css` (`.field-label`, `.field-input`,
  `.field-hint`; líneas exactas en `tokens.md`), el icono de `ConfirmDialog` (`text-warning`), la pastilla de
  `ComingSoon` y la tabla de tokens de «Estilos» en `arquisoft-frontend-estandares`.
- **Mejoró:** 21 archivos recuperaron el hover de las filas, las cabeceras de tabla y las pastillas de estado; el
  borde de los campos pasó de 1,2 a 3,6 : 1 y el aviso ámbar de 4,3 a 8,8 : 1.
- **Verificación:** el gate de siempre y una pasada visual a 390 y 1280 px por las vistas de fichas, porque
  ahora aparecen fondos que antes no se veían.

### Paso 1 — Primitivas (hecho en HT-UX-01)

- **PR a:** `Button`, `IconButton`, `Badge` y `estado-variante.ts`. **PR b:** `Field` y `Notice`. **PR c:**
  `EmptyState`, `ErrorState`, `Skeleton`, `Tabs`, `PageHeader` y `Avatar`. `Segmented` no se creó (sin consumidor, pendiente) y `LoadingState`, creada en este paso, se eliminó en HT-UX-09 por lo mismo.
- **Reemplazan:** botones a mano; `CampoTexto`; los colores crudos que tenían las pastillas de evaluación (`EstadosEvaluacionPanel` ya usa `Badge`);
  `AvisoNoDisponible` (pasa a usar `Notice` y su texto cambia: se actualizan sus tests); `ComingSoon` dentro de
  pestañas; los spinners; las cinco pestañas.
- **Verificación:** pruebas de comportamiento solo donde hay (`Tabs`, `ErrorState`, `estado-variante`).

### Paso 2 — Listados y filtros (hecho en HT-UX-02 y 04)

- **Creó:** `DataTable`, `FilterBar` con `useDebouncedValue`, `RowMenu` y amplía `PaginadorListado`.
- **Orden:** primero Usuarios del administrador (con la decisión 1 y su precondición); después Fichas
  (coordinador, asesor, representante y estados del asesor) al tocarlas.
- **Precondición (cumplida en HT-UX-02):** abrir el `UsuarioCriteria` y confirmar la búsqueda por texto; comprobar los
  endpoints por rol como dice `patrones.md` §1.
- **Retiró:** los tres paginadores copiados, `FiltrosUsuariosPanel` y, con la decisión 1, las tablas por rol.

### Paso 3 — Formularios (hecho en HT-UX-03 y 05)

- **Creó:** `SidePanel`, `Switch`, `FormSection`, `FormActions`, `ErrorSummary` y `Combobox`; actualizó
  `ConfirmDialog` y `Toaster` (y quitó el nivel `debug`).
- **Migró:** registrar y editar usuario al panel (con las decisiones 2 y 3); registrar ficha primero a una página y, en HT-UX-05-AJ1 (2026-10-04), a un
  `SidePanel` como el resto de los formularios.
- **Routing:** esa ruta hija (hoy eliminada) exigió reestructurar `router.tsx` a «padre con `guarded` + `<Outlet />` y rutas
  hijas», que se conserva para el detalle; y el estado de los listados pasó a la URL; ya está descrito en `arquisoft-frontend-arquitectura`
  («Enrutamiento») y en el check 2.7 de `@4a`.
- **Fuera de alcance:** el campo «UUID del coordinador» de `SolicitudNovedadForm` depende del backend (F5
  y B4 de `docs/pendientes.md`); solo se migra su aspecto.

### Paso 4 — Detalle e inicio (hecho en HT-UX-06, 07 y 08)

- **Detalle:** ruta `/fichas-perfil/:id` con subrutas, `PageHeader` con migas, panel lateral por rol y las pestañas
  de lo que existe. Resolvió F1 y F2 de `docs/pendientes.md`; F4 sigue abierto.
- **Inicio:** vistas por rol con cifras reales y un `dashboardService` propio; menú en dos grupos con
  `NavItem.disponible`; avatar con iniciales; `PageSkeleton` simplificado; se borran de `index.css` las clases del
  encabezado degradado.

## Guardarraíles que acompañan a los pasos

Se agregaron a `src/arquitectura.test.ts` con el mismo mecanismo de `coloresCrudos()`: una función en
`src/test-utils/arquitectura.ts`, su deuda actual en `arquitectura.baseline.ts` y la regla de que **solo decrece**.

| Regla | Entró con | Deuda tras HT-UX-09 |
|---|---|---|
| Ninguna utilidad de color cuya variable `--color-*` no exista en `@theme` (se vigilan los nombres de convención shadcn: `muted`, `muted-foreground`, `accent`, `card`, `popover`, `foreground`, `input`, `destructive`, `success`, `warning`, `info`) | Paso 0 | 0 (eran 48: 47 de `bg-muted` y 1 de `text-warning`; `text-warning` solo queda como fixture del propio test) |
| Un solo spinner: se prohíbe `animate-spin rounded-full border` fuera de `shared/components/ui/` | Paso 1 | 1 (`AppLoader.tsx`, pantalla de arranque, en el baseline; eran 19 copias en 18 archivos) |
| Nada por debajo de 12 px: se prohíben `text-[9px]`, `text-[10px]` y `text-[11px]` | Paso 1 | 0 (eran 16 usos en 7 archivos) |
| Tablas solo con `DataTable`: se prohíbe `<table` en las features | Paso 2 | 0 (solo `DataTable.tsx` escribe `<table`; eran 7 tablas en 6 archivos) |

## Qué archivo se migra a qué

Estado: todo hecho.

| Archivo actual | Pieza o patrón | Paso |
|---|---|---|
| `usuarios/components/AdministradorView.tsx` | `PageHeader`, `FilterBar` con chips de rol y `SidePanel` | 2 y 3 |
| `usuarios/…/FiltrosUsuariosPanel.tsx`, `UsuariosTable.tsx`, `ConsultarUsuarios.tsx` | `FilterBar`, `DataTable`, `PaginadorListado` | 2 |
| `usuarios/…/UsuariosRolTable.tsx`, `ConsultarUsuariosRol.tsx` y los seis `Consultar{Rol}.tsx` | Eliminados en HT-UX-02 (decisión 1, listado único) | 2 |
| `usuarios/…/RegistrarUsuarioForm.tsx`, `ModificarUsuarioForm.tsx` | Reemplazados en HT-UX-03 por `RegistrarUsuarioPanel` y `EditarUsuarioPanel` (`SidePanel` con `Field` y `FormSection`; edición con pestañas) | 3 |
| `usuarios/…/RolesUsuarioFieldset.tsx`, `ConfirmarRemoverRolDialog.tsx` | Eliminados en HT-UX-03: `Switch` y `ConfirmDialog` | 3 |
| `usuarios/…/EstadoUsuarioFieldset.tsx` | Eliminado en HT-UX-03: pestaña «Acceso» | 3 |
| `usuarios/…/CampoTexto.tsx` | Eliminado en HT-UX-03: `Field` | 1 |
| `fichas-perfil/…/FichasPerfilTable.tsx`, `ConsultarFichasPerfilCoordinador.tsx`, `ConsultarFichasAsesor.tsx`, `ConsultarFichasRepresentante.tsx` | `DataTable` y `FilterBar` (hecho en HT-UX-04; HT-UX-06-AJ1: la lista «Estados de mis fichas» se eliminó; `FilterBar` ganó las secciones `texto` y `multiple`). HT-UX-04-AJ1: los listados muestran estado y fecha con las columnas compartidas de `columnasFicha.tsx` | 2 |
| `fichas-perfil/…/CoordinadorView.tsx`, `AsesorFichaView.tsx`, `RepresentanteView.tsx` | `PageHeader` con el `<h1>` del módulo (hecho en HT-UX-04; el formulario de ficha ya no va encima de la lista: hecho en HT-UX-05) | 2 |
| `fichas-perfil/…/EstudiantesVinculadosPanel.tsx`, `AsignarEstudianteForm.tsx`, `CambiarAsesorForm.tsx` | Hecho en HT-UX-04: `EstudiantesVinculadosPanel` y `CambiarAsesorPanel` (reemplaza a `CambiarAsesorForm`) en `SidePanel`; `AsignarEstudianteForm` restilado con el kit. HT-UX-05: ambos usan `Combobox` | 3 o 4 |
| `fichas-perfil/…/RegistrarFichaPerfil.tsx`, `SelectorAsesorFicha.tsx` | Hecho en HT-UX-05: eliminados; HT-UX-05-AJ1: registrar ficha en `SidePanel` con `Combobox` (`RegistrarFichaPerfilPanel`), sin página | 3 |
| `fichas-perfil/…/EstadosEvaluacionPanel.tsx` | `Badge` (ya lo usaba); HT-UX-06 le sumó `ErrorState` con reintento y `EmptyState` | 1 |
| `fichas-perfil/…/MiFichaHeader.tsx`, `EstudianteView.tsx` | Hecho en HT-UX-07: `MiFichaHeader`, `EstadosMiFichaPanel`, `RevisionesMiFichaPanel` y `EvaluacionesMiFichaPanel` se eliminaron; `EstudianteView` compone `PageHeader`, `Tabs` en modo `tablist` y `ResumenFichaPanel` con «Equipo» (de `integrantes`), y los formularios de ítem y título son `SidePanel` | 4 |
| `fichas-perfil/…/AsesorFichaView.tsx`, `TiposItemPanel.tsx`, `DetalleFichaAsesor.tsx`, `DetalleFichaRepresentante.tsx` | Hecho en HT-UX-06: el detalle del asesor y del representante es la ruta `/fichas-perfil/:id/{items,estados,evaluaciones}` (`DetalleFicha`, `DetalleFichaEstructura`, `AsesorFichaDetalleView`, `RepresentanteDetalleView`); los dos `DetalleFicha*` se eliminaron, `AsesorFichaView` quedó con «Mis fichas» sin pestañas (HT-UX-06-AJ1); el historial de una ficha es la pestaña «Estados» de su detalle (`EstadosFichaAsesorPanel`) y `TiposItemPanel` es una lista que abre `AyudaTiposItem` | 4 |
| `solicitudes/…/SolicitudNovedadForm.tsx` | Hecho: el archivo se renombró; usa `FormSection`, `ErrorSummary`, `Button` y `Field` (con contador), y su lógica vive en `useSolicitudNovedadForm`. Su schema pasó a `solicitudes/utils/enviar-solicitud-schema.ts`. `EstudianteView` usa `Tabs` y `EmptyState` | 3 |
| `dashboard/Dashboard.tsx` | Hecho en HT-UX-08: fan-out por rol (`EstudianteView`, `RepresentanteView`, `AdministradorView`, `BasicaView`) sobre un `dashboardService` propio; se borraron `hero-gradient`, `hero-pattern` y `quick-card` | 4 |
| `layout/Sidebar.tsx`, `layout/Header.tsx`, `layout/nav-items.ts` | Hecho en HT-UX-08: `Sidebar` con `SidebarGrupo` («Trabajo» y «Próximamente»), `Header` partido en `SelectorRol` y `MenuCuenta` (con `Avatar`), `NavItem.disponible` y los helpers `estaDisponible`, `navItemsDelRol` y `agruparNavItems` | 4 |
| `shared/components/ConfirmDialog.tsx`, `Toaster.tsx`, `PageSkeleton.tsx`, `AvisoNoDisponible.tsx`, `ComingSoon.tsx`, `PaginadorListado.tsx` | Se actualizan en su sitio | 0 a 3 |

## Cómo se sabe que funcionó

| Medida | Hoy (antes de la adopción) | Después (HT-UX-09) | Meta |
|---|---|---|---|
| Clases semánticas sin token en `@theme` | 47 usos (48 con `text-warning`) | 0 | 0 |
| Spinners copiados | 19 en 18 archivos | 1 (`AppLoader.tsx`) | 1 |
| Paginadores copiados | 3 | 0 | 0 |
| Botones escritos a mano (conteo reproducible de `<button` en producción) | 77 en 41 archivos (la cifra de 54 era una estimación anterior) | 24 en 19 archivos: 11 son las piezas de `ui/` y 13 en 9 archivos quedan fuera | Bajan con cada archivo tocado |
| `<table` fuera de `DataTable` | 6 archivos | 0 | 0 |
| Texto de menos de 12 px | 16 usos en 7 archivos | 0 | 0 |
| Contraste del borde de los campos | 1,2 : 1 | 3,6 : 1 | 3,6 : 1 |
| Módulos del menú que abren «Próximamente» | 7 de 10 | 0 como destino (7 en un grupo sin enlace) | 0 como destino |
| Vistas con scroll horizontal a 390 px | Sin medir (F8) | Medidas salvo el detalle del representante (residual de F8 en `docs/pendientes.md`) | 0 |
