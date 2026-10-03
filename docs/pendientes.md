# Pendientes

Registro de lo que quedó abierto en el frontend. No es fuente de contrato: el contrato real de cada
endpoint sale de `../arquisoft-backend` y las historias y reportes viven en `arquisoft-uco/arquisoft-docs`.
Al resolver un pendiente, se borra de aquí.

Última revisión: 2026-10-03.

## Bloqueados por el backend

| # | Pendiente | Detalle | Responsable |
|---|---|---|---|
| B1 | **HU-206 — cambiar el estado de una ficha** | El backend no tiene endpoint para esto: solo asigna el estado inicial al registrar la ficha (PR #55 y #56). El service apunta a `POST /fichas-perfil/estados`, que responde 405 (reproducido en la UI el 2026-10-02). Hace falta ruta, rol que lo ejecuta y reglas de transición (qué estados puede asignar el asesor). Al publicarse, el cambio en el frontend es apuntar `agregarEstadoFichaPerfil` a la ruta real y quitar el `// Pendiente` | Backend (Juan Fernando) |
| B2 | **Catálogo de estados del representante incompleto** | `GET /fichas-perfil/estados-ficha` filtra por rol y al representante no le llega `DISPONIBLE_PARA_EVALUACION`, por lo que el filtro del listado no lo ofrece | Backend (Juan Fernando) |
| B3 | **Client roles de Keycloak sin confirmar** | Pueden faltar en el realm desplegado (no se pudo verificar; el export de `arquisoft-infra` es del 2026-09-11 y está desactualizado). Si faltan, con login real se llega a `/forbidden`; con `VITE_AUTH_BYPASS=true` no se nota. Ver lista abajo | Infra / backend |
| B4 | Mejoras menores del backend | Consulta de fichas del estudiante con `INNER JOIN`: una ficha sin estado o sin asesor se omite. Faltan `esBibliotecario` y `esJurado` en el listado unificado de usuarios (a la espera de HU-242 y HU-252). No hay endpoint para que el estudiante obtenga su coordinador (solicitudes) | Backend |

Client roles a confirmar en el realm desplegado:

- `fichas:ficha-perfil-coordinador:view` para `representante-comite` (listado de HU-160). Con `dev-user` carga; falta probar con un usuario que solo tenga ese rol.
- `fichas:estado-ficha:view` para los roles que consultan el catálogo de estados.
- `usuarios:*-administrador:view`, `usuarios:*-vigente:view`, `usuarios:estado-usuario:view`, `usuarios:usuario-estado:update`, `usuarios:usuario:update` y `usuarios:*:delete` para el administrador.
- `solicitudes:solicitud:create` para el estudiante.

## Del frontend

| # | Pendiente | Detalle |
|---|---|---|
| F1 | **Pestaña Estados ofrece un cambio que siempre falla** | Mientras exista B1, el selector "Nuevo estado" lista estados que no se pueden enviar. Opción: mostrar `AvisoNoDisponible` con el envío deshabilitado |
| F2 | **Panel "Cambiar estado" visible para el estudiante** | `EstadosMiFichaPanel` reutiliza el panel del asesor. El backend no asigna estados de ficha al rol estudiante, así que su selector queda vacío. Decidir si se oculta |
| F3 | **HU que el backend ya entregó y no tienen frontend** | Revisado el 2026-10-03 contra `origin/develop` del backend. **Representante:** HU-188 (modificar observación de evaluación) y HU-189 (remover observación de evaluación), con `PATCH` y `DELETE /fichas-perfil/observaciones-evaluacion/{id}`. **Bibliotecario:** HU-240 (agregar bibliotecario). **Revisiones y observaciones de ítem:** HU-195, 196, 198, 199, 200, 204 y HU-026 (consulta del estudiante). **Estados:** HU-205 (PR #88 abierto) y compañeros de ficha HU-039 (PR #87 abierto). **Solicitudes:** HU-056, 057, 061, 062, 066, 067, 071, 076, 082 a 084, 086, 087, 091, 092, 096, 097 y 101; solo HU-081 y HU-082 tienen PR (el #89 abierto). **Evaluaciones (jurado):** HU-212, 215, 225, 226, 267 y 268 (HU-225 en el PR #50). **Usuarios sin cliente:** `POST /usuarios/coordinadores/vigentes`, `/asesores/vigentes` y `/representantes-comite/vigentes` |
| F4 | **Pantallas en construcción** | Pestañas Revisiones y Evaluaciones del estudiante (`RevisionesMiFichaPanel`, `EvaluacionesMiFichaPanel`) y del asesor (`DetalleFichaAsesor`); `AdministradorView` de fichas |
| F5 | **Solicitudes** | `EnviarSolicitudNovedadForm` pide el UUID del coordinador a mano, con aviso y sin deshabilitar el envío |
| F6 | **Revisar el PR #175 del backend** | "Filtro por estado actual en el listado de fichas de perfil", ya mergeado. Puede cambiar cómo filtra HU-160 por estado |
| F7 | **Prueba funcional manual** | Checklist en `.workspace/pruebas/prueba-funcional-representante.md` (HU-036, 160, 182, 185, 186, 187, 190 y 191). Falta ejecutarla con un usuario que tenga el rol `representante-comite` |
| F8 | **Verificación visual a 390 px** | Pendiente en las HU del representante (la tabla de HU-160 pasó a 6 columnas) |

## Gestión (tablero y documentación)

- **Tablero de GitHub Projects:** HU-182, 185, 186, 187, 190 y 191 siguen en *In progress* aunque están mergeadas. Quedan por revisar asignados incompletos (HU-231, 232, 233, 254 y 255 solo con Juan Fernando) y los campos Priority, Size y Labels, vacíos en varias HU.
- **`arquisoft-docs`:** falta publicar `PLAN-HU-206` (sin reporte de validación), `PLAN-FIX-001` y `validator-FIX-001`. El reporte de HU-243 está publicado con nombre en minúsculas (`validator-HU-243.md`).
- **HU-160 columnas (PR #98):** sin plan ni reporte, porque no pasó por la cadena de agentes.
- **Orquestador:** el paso de cierre (`contexto.html`) no se generó en los lotes de HU-036, 160 y del representante.
- **PR de otras personas** abiertos en este repo: #87, #88, #89 y #50.
