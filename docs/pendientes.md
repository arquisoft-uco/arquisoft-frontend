# Pendientes

Registro de lo que quedó abierto en el frontend. No es fuente de contrato: el contrato real de cada
endpoint sale de `../arquisoft-backend` y las historias y reportes viven en `arquisoft-uco/arquisoft-docs`.
Al resolver un pendiente, se borra de aquí.

Última revisión: 2026-10-10.

## Bloqueados por el backend

| # | Pendiente | Detalle | Responsable |
|---|---|---|---|
| B2 | **Catálogo de estados del representante incompleto** | `GET /fichas-perfil/estados-ficha` filtra por rol y al representante no le llega `DISPONIBLE_PARA_EVALUACION`, por lo que el filtro del listado no lo ofrece. El inicio del representante filtra su bandeja «Fichas por evaluar» con el id fijo `DISPONIBLE_PARA_EVALUACION` (`dashboardService`) y la ordena por título: `FichaPerfilCriteria` no admite orden por fecha de actualización | Backend (Juan Fernando) |
| B3 | **Client roles de Keycloak sin confirmar** | Pueden faltar en el realm desplegado (no se pudo verificar; el export de `arquisoft-infra` es del 2026-09-11 y está desactualizado). Si faltan, con login real se llega a `/forbidden`; con `VITE_AUTH_BYPASS=true` no se nota. Ver lista abajo | Infra / backend |
| B4 | Mejoras menores del backend | Consulta de fichas del estudiante con `INNER JOIN`: una ficha sin estado o sin asesor se omite. Falta `esJurado` en el listado unificado de usuarios (a la espera de HU-252). No hay endpoint para que el estudiante obtenga su coordinador (solicitudes). El endpoint de estados del asesor (HU-205) solo ordena por título: el detalle ordena por fecha en el cliente | Backend |
| B5 | **Detalle de ficha para asesor y representante** | (a) No existe `GET /fichas-perfil/{id}` para estos roles: abrir el detalle por URL directa o recargar en otra pestaña muestra el título genérico «Ficha de perfil», sin estado ni asesor. (b) `FichaPerfilCriteria` no filtra por `id`, así que tampoco se puede recuperar la ficha por el listado. (c) `fichas:estudiante-ficha-perfil-coordinador:view` no la tienen `asesor-ficha` ni `representante-comite`, por eso el detalle omite la sección «Equipo». (d) El backend no lista el historial de estados de una evaluación (el listado de observaciones ya existe: HU-281) | Backend |

Client roles a confirmar en el realm desplegado:

- `fichas:ficha-perfil-coordinador:view` para `representante-comite` (listado de HU-160). Con `dev-user` carga; falta probar con un usuario que solo tenga ese rol.
- `fichas:estado-ficha:view` para los roles que consultan el catálogo de estados.
- `fichas:estado-ficha-perfil-asesor:view` para el asesor de ficha (historial de estados de una ficha en su detalle, HU-205), sin verificar en el realm export: un 403 con login real lleva a `/forbidden`.
- `fichas:estudiante-ficha-perfil-estudiante:view` para el estudiante (compañeros de su ficha, HU-039); el frontend ya no consume el endpoint (Equipo sale de `integrantes` de «mi ficha»); falta el permiso en el realm si se quiere volver a usar.
- `fichas:evaluacion-ficha-perfil-estudiante:view` para el estudiante (evaluaciones de su ficha, HU-038), sin verificar en el realm desplegado: un 403 con login real lleva a `/forbidden` y con `VITE_AUTH_BYPASS=true` no se nota. El `estudiante` no tiene `fichas:estado-evaluacion:view`, por eso la pantalla no consulta el catálogo de estados de evaluación.
- `fichas:observacion-evaluacion-representante:view` para el representante (observaciones de una evaluación propia, HU-281), sin verificar en el realm desplegado: un 403 con login real lleva a `/forbidden` y con `VITE_AUTH_BYPASS=true` no se nota.
- `fichas:observacion-evaluacion:update` para el representante (modificar una observación de su evaluación, HU-188), sin verificar en el realm desplegado: un 403 con login real lleva a `/forbidden` y con `VITE_AUTH_BYPASS=true` no se nota.
- `fichas:revision-item:create` para el asesor de ficha (agregar una revisión a un ítem, HU-195), sin verificar en el realm desplegado. Si falta, con login real el botón «Agregar revisión» responde 403 y lleva a `/forbidden`; con `VITE_AUTH_BYPASS=true` no se nota.
- `fichas:item-ficha-perfil-coordinador:view` para el coordinador (ítems de una ficha, HU-284), sin verificar en el realm desplegado: un 403 con login real lleva a `/forbidden` y con `VITE_AUTH_BYPASS=true` no se nota.
- `usuarios:usuario-administrador:view`, `usuarios:*-vigente:view`, `usuarios:estado-usuario:view`, `usuarios:usuario-estado:update`, `usuarios:usuario:update` y `usuarios:*:delete` para el administrador.
- `solicitudes:solicitud:create` para el estudiante.
- `solicitudes:solicitud-novedad-coordinador-enviada:view` para el estudiante (pestaña «Enviadas», HU-096). Si falta, con login real la pestaña lleva a `/forbidden`; con `VITE_AUTH_BYPASS=true` no se nota.
- `solicitudes:solicitud-novedad-coordinador:delete` para el estudiante (eliminar una solicitud enviada, HU-086). Si falta, con login real el botón de eliminar responde 403 y lleva a `/forbidden`.
- `solicitudes:respuesta-novedad-coordinador:create` para el coordinador (responder una solicitud recibida, HU-056). Si falta, con login real «Enviar respuesta» responde 403 y lleva a `/forbidden`; con `VITE_AUTH_BYPASS=true` no se nota.
- `solicitudes:respuesta-novedad-coordinador:delete` para el coordinador (eliminar una respuesta enviada, HU-061). Si falta, con login real la acción «Eliminar respuesta» responde 403 y lleva a `/forbidden`; con `VITE_AUTH_BYPASS=true` no se nota.
- `solicitudes:respuesta-novedad-coordinador:update` para el coordinador (aprobar o marcar como no aprobada una respuesta enviada, HU-076). Si falta, con login real las acciones «Aprobar respuesta» y «Marcar como no aprobada» responden 403 y llevan a `/forbidden`; con `VITE_AUTH_BYPASS=true` no se nota.
- `solicitudes:respuesta-novedad-coordinador-enviada:view` para el coordinador (pestaña «Respuestas enviadas», HU-071). Si falta, con login real la pestaña lleva a `/forbidden`; con `VITE_AUTH_BYPASS=true` no se nota.
- `solicitudes:respuesta-novedad-coordinador-recibida:view` para el estudiante (pestaña «Respuestas», HU-066). Si falta, con login real la pestaña lleva a `/forbidden`; con `VITE_AUTH_BYPASS=true` no se nota.

## Del frontend

| # | Pendiente | Detalle |
|---|---|---|
| F3 | **HU que el backend ya entregó y no tienen frontend** | Revisado el 2026-10-03 contra `origin/develop` del backend (HU-281, consulta de observaciones del representante, entregada el 2026-10-08). **Revisiones y observaciones de ítem:** 198, 199, 200, 204 y HU-026 (consulta del estudiante). **Solicitudes:** HU-057, 062, 067, 082 a 084, 087, 091, 092, 097 y 101; HU-081 y HU-082 están mergeadas. **Evaluaciones (jurado):** HU-212, 215, 225, 226, 267 y 268 (HU-225 en el PR #50). **Usuarios sin cliente:** `POST /usuarios/coordinadores/vigentes`, `/asesores/vigentes` y `/representantes-comite/vigentes` |
| F4 | **Pantallas en construcción** | Pestaña Evaluaciones oculta para el asesor hasta que exista su historia (su pestaña Revisiones, HU-194, ya existe, igual que las pestañas Revisiones, HU-027, y Evaluaciones, HU-038, del estudiante); `AdministradorView` de fichas; `Solicitudes` para los roles distintos del estudiante, y los módulos con `disponible: false` en el menú |
| F5 | **Solicitudes** | `EnviarSolicitudNovedadForm` pide el UUID del coordinador a mano, con aviso y sin deshabilitar el envío |
| F6 | **Revisar el PR #175 del backend** | "Filtro por estado actual en el listado de fichas de perfil", ya mergeado. Puede cambiar cómo filtra HU-160 por estado |
| F7 | **Prueba funcional manual** | Checklist en `.workspace/pruebas/prueba-funcional-representante.md` (HU-036, 160, 182, 185, 186, 187, 190 y 191). Falta ejecutarla con un usuario que tenga el rol `representante-comite` |
| F8 | **Verificación visual a 390 px** | Solo falta medir el detalle de ficha del representante a 390 px; los listados, el detalle del asesor, las evaluaciones y el inicio ya se midieron a 390 y 320 px |
| F9 | **Deuda tolerada por el test de arquitectura** | `src/test-utils/arquitectura.baseline.ts` lista lo que `src/arquitectura.test.ts` acepta por ser anterior al test, y solo puede decrecer: 2 `as unknown as` (`api/axiosInstance.test.ts` y `auth/devAuth.ts`), 1 spinner fuera de `shared/components/ui/` (`AppLoader`, la pantalla de arranque) y JSDoc previo en 12 archivos (29 bloques, en `auth/`, `config/`, `guards/`, `hooks/` y `shared/`). Ya no hay deuda de query keys, componentes grandes, colores crudos, textos de menos de 12 px ni tablas. Al corregir un archivo se elimina su entrada |

## Gestión (tablero y documentación)

- **Tablero de GitHub Projects:** HU-182, 185, 186, 187, 190 y 191 siguen en *In progress* aunque están mergeadas. Quedan por revisar asignados incompletos (HU-231, 232, 233, 254 y 255 solo con Juan Fernando) y los campos Priority, Size y Labels, vacíos en varias HU.
- **`arquisoft-docs`:** falta publicar `PLAN-HU-206` (sin reporte de validación), `PLAN-FIX-001` y `validator-FIX-001`. El reporte de HU-243 está publicado con nombre en minúsculas (`validator-HU-243.md`).
- **HU-160 columnas (PR #98):** sin plan ni reporte, porque no pasó por la cadena de agentes.
- **Orquestador:** el paso de cierre (`contexto.html`) no se generó en los lotes de HU-036, 160 y del representante.
- **PR de otras personas** abiertos en este repo: #89 y #50.
