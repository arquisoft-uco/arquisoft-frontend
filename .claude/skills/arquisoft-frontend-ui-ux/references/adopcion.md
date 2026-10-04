# Adopción: el plan de cinco pasos

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

### Paso 0 — Tokens (1 HT, riesgo bajo)

- **Cambia:** `src/tailwind.css` (cinco tokens y un valor), `src/index.css` (`.field-label`, `.field-input`,
  `.field-hint`; líneas exactas en `tokens.md`), el icono de `ConfirmDialog` (`text-warning`), la pastilla de
  `ComingSoon` y la tabla de tokens de «Estilos» en `arquisoft-frontend-estandares`.
- **Mejora:** 21 archivos recuperan el hover de las filas, las cabeceras de tabla y las pastillas de estado; el
  borde de los campos pasa de 1,2 a 3,6 : 1 y el aviso ámbar de 4,3 a 8,8 : 1.
- **Verificación:** el gate de siempre y una pasada visual a 390 y 1280 px por las vistas de fichas, porque
  ahora aparecen fondos que antes no se veían.

### Paso 1 — Primitivas (3 PR pequeños)

- **PR a:** `Button`, `IconButton`, `Badge` y `estado-variante.ts`. **PR b:** `Field` y `Notice`. **PR c:**
  `EmptyState`, `ErrorState`, `Skeleton`, `LoadingState`, `Tabs`, `Segmented`, `PageHeader` y `Avatar`.
- **Reemplazan:** botones a mano; `CampoTexto`; los colores crudos de `EstadosEvaluacionPanel`;
  `AvisoNoDisponible` (pasa a usar `Notice` y su texto cambia: se actualizan sus tests); `ComingSoon` dentro de
  pestañas; los spinners; las cinco pestañas.
- **Verificación:** pruebas de comportamiento solo donde hay (`Tabs`, `ErrorState`, `estado-variante`).

### Paso 2 — Listados y filtros (1 HT por feature)

- **Crea:** `DataTable`, `FilterBar` con `useDebouncedValue`, `RowMenu` y amplía `PaginadorListado`.
- **Orden:** primero Usuarios del administrador (con la decisión 1 y su precondición); después Fichas
  (coordinador, asesor, representante y estados del asesor) al tocarlas.
- **Precondición (cumplida en HT-UX-02):** abrir el `UsuarioCriteria` y confirmar la búsqueda por texto; comprobar los
  endpoints por rol como dice `patrones.md` §1.
- **Retira:** los tres paginadores copiados, `FiltrosUsuariosPanel` y, con la decisión 1, las tablas por rol.

### Paso 3 — Formularios (1 HT por formulario)

- **Crea:** `SidePanel`, `Switch`, `FormSection`, `FormActions`, `ErrorSummary` y `Combobox`; actualiza
  `ConfirmDialog` y `Toaster` (y quita el nivel `debug`).
- **Migra:** registrar y editar usuario al panel (con las decisiones 2 y 3); registrar ficha a la página
  `/fichas-perfil/nueva`.
- **Routing:** esa ruta hija exige reestructurar `router.tsx` a «padre con `guarded` + `<Outlet />` y rutas
  hijas», y el estado de los listados pasa a la URL. Quien llegue primero (este paso o el 4) lo hace y
  actualiza `arquisoft-frontend-arquitectura` («Enrutamiento») y el check 2.7 de `@4a`.
- **Fuera de alcance:** el campo «UUID del coordinador» de `EnviarSolicitudNovedadForm` depende del backend (F5
  y B4 de `docs/pendientes.md`); solo se migra su aspecto.

### Paso 4 — Detalle e inicio (2 HT)

- **Detalle:** ruta `/fichas-perfil/:id` con subrutas, `PageHeader` con migas, panel lateral por rol y las pestañas
  de lo que existe. Toca F1, F2 y F4 de `docs/pendientes.md`; al resolverlas se borran de allí.
- **Inicio:** vistas por rol con cifras reales y un `dashboardService` propio; menú en dos grupos con
  `NavItem.disponible`; avatar con iniciales; `PageSkeleton` simplificado; se borran de `index.css` las clases del
  encabezado degradado.

## Guardarraíles que acompañan a los pasos

Se agregan a `src/arquitectura.test.ts` con el mismo mecanismo de `coloresCrudos()`: una función en
`src/test-utils/arquitectura.ts`, su deuda actual en `arquitectura.baseline.ts` y la regla de que **solo decrece**.

| Regla | Entra con | Deuda de hoy |
|---|---|---|
| Ninguna utilidad de color cuya variable `--color-*` no exista en `@theme` (se vigilan los nombres de convención shadcn: `muted`, `muted-foreground`, `accent`, `card`, `popover`, `foreground`, `input`, `destructive`, `success`, `warning`, `info`) | Paso 0 | 47 usos de `bg-muted` en 21 archivos y 1 de `text-warning` |
| Un solo spinner: se prohíbe `animate-spin rounded-full border` fuera de `shared/components/ui/` | Paso 1 | 19 copias en 18 archivos (11 con `border-4` y 8 con `border-2`) |
| Nada por debajo de 12 px: se prohíben `text-[9px]`, `text-[10px]` y `text-[11px]` | Paso 1 | 16 usos |
| Tablas solo con `DataTable`: se prohíbe `<table` en las features | Paso 2 | 7 tablas (5 tras HT-UX-02: las de `fichas-perfil`) |

## Qué archivo se migra a qué

| Archivo actual | Pieza o patrón | Paso |
|---|---|---|
| `usuarios/components/AdministradorView.tsx` | `PageHeader`, `FilterBar` con chips de rol y `SidePanel` | 2 y 3 |
| `usuarios/…/FiltrosUsuariosPanel.tsx`, `UsuariosTable.tsx`, `ConsultarUsuarios.tsx` | `FilterBar`, `DataTable`, `PaginadorListado` | 2 |
| `usuarios/…/UsuariosRolTable.tsx`, `ConsultarUsuariosRol.tsx` y los seis `Consultar{Rol}.tsx` | Eliminados en HT-UX-02 (decisión 1, listado único) | 2 |
| `usuarios/…/RegistrarUsuarioForm.tsx`, `ModificarUsuarioForm.tsx` | `SidePanel` con `Field` y `FormSection`; edición con pestañas | 3 |
| `usuarios/…/RolesUsuarioFieldset.tsx`, `ConfirmarRemoverRolDialog.tsx` | `Switch` y `ConfirmDialog` | 3 |
| `usuarios/…/EstadoUsuarioFieldset.tsx` | Pestaña «Acceso» | 3 |
| `usuarios/…/CampoTexto.tsx` | `Field` | 1 |
| `fichas-perfil/…/FichasPerfilTable.tsx`, `ConsultarFichasPerfilCoordinador.tsx`, `ConsultarFichasAsesor.tsx`, `ConsultarFichasRepresentante.tsx`, `EstadosFichasAsesorPanel.tsx` | `DataTable` y `FilterBar` | 2 |
| `fichas-perfil/…/EstudiantesVinculadosPanel.tsx`, `AsignarEstudianteForm.tsx`, `CambiarAsesorForm.tsx` | Panel lateral o sección del detalle (lo decide su plan) | 3 o 4 |
| `fichas-perfil/…/RegistrarFichaPerfil.tsx`, `SelectorAsesorFicha.tsx` | Página `/fichas-perfil/nueva` con `Combobox` | 3 |
| `fichas-perfil/…/EstadosEvaluacionPanel.tsx` | `Badge` | 1 |
| `fichas-perfil/…/MiFichaHeader.tsx`, `EstudianteView.tsx`, `AsesorFichaView.tsx`, `DetalleFichaAsesor.tsx`, `DetalleFichaRepresentante.tsx`, `TiposItemPanel.tsx` | Detalle con ruta | 4 |
| `solicitudes/…/EnviarSolicitudNovedadForm.tsx` | `Field`, `FormSection` | 3 |
| `dashboard/Dashboard.tsx` | Inicio por rol | 4 |
| `layout/Sidebar.tsx`, `layout/Header.tsx`, `layout/nav-items.ts` | Grupos del menú, avatar, `disponible` | 4 |
| `shared/components/ConfirmDialog.tsx`, `Toaster.tsx`, `PageSkeleton.tsx`, `AvisoNoDisponible.tsx`, `ComingSoon.tsx`, `PaginadorListado.tsx` | Se actualizan en su sitio | 0 a 3 |

## Cómo se sabe que funcionó

| Medida | Hoy | Meta |
|---|---|---|
| Clases semánticas sin token en `@theme` | 47 usos | 0 |
| Spinners copiados | 19 | 1 |
| Paginadores copiados | 3 | 0 |
| Botones escritos a mano | 54 | Los que no sean `Button` bajan con cada archivo tocado |
| Contraste del borde de los campos | 1,2 : 1 | 3,6 : 1 |
| Módulos del menú que abren «Próximamente» | 7 de 10 | 0 como destino |
| Vistas con scroll horizontal a 390 px | Sin medir (F8 de `docs/pendientes.md`) | 0 |
