# Integración Backend ↔ Frontend

El backend (`arquisoft-backend`) es la **fuente oficial** del contrato de API. Este documento mapea
los endpoints realmente expuestos por el backend contra los servicios del cliente web, e indica el
estado de cada integración.

## Configuración base

- **URL base:** `VITE_API_URL` (ej. `http://localhost:8082/api`). El backend usa `context-path` `/api`,
  por lo que las rutas de los servicios comienzan después de `/api` (ej. `/fichas-perfil`).
- **Autenticación:** `Authorization: Bearer <token>` (JWT de Keycloak), adjuntado por el interceptor
  de `src/api/axiosInstance.ts`.
- **Sin envelope de éxito global:** el backend responde el DTO directamente. Solo están estandarizados:
  - Paginación: `PageResponseDTO<T>` → `Page<T>` en `src/shared/models/api-response.ts`
    (`content, page, size, totalElements, totalPages, first, last, empty`).
  - Errores: `ErrorResponseDTO` → `ApiError` (`error, errorCode, message, status, path, timestamp, fieldErrors`).
- **Códigos de error:** 422 incluye `fieldErrors[]` (validación de dominio); 400/401/403 usan el
  `ErrorResponseDTO` base. Helpers en `src/shared/utils/api-error.ts`.

## Endpoints de Fichas de Perfil

Servicio: `src/features/fichas-perfil/services/fichasPerfilService.ts`.

### Implementados y alineados

| Método del servicio | Método HTTP | Ruta backend | Body | Respuesta |
|---|---|---|---|---|
**El body es el del DTO real del backend**, no el del modelo del frontend: la traducción de nombres
ocurre en el service. Verificado contra los `*Controller.java` y `*RequestDTO/*ResponseDTO.java` de
`../arquisoft-backend` el 2026-09-12.

| Método del servicio | Método HTTP | Ruta backend | Body | Respuesta |
|---|---|---|---|---|
| `registrarFichaPerfil` | POST | `/fichas-perfil` | `{ tituloProyecto, asesorFicha, estudiantes[] }` | `201 { id }` |
| `modificarTituloFichaPerfil` | PATCH | `/fichas-perfil/{id}` | `{ tituloProyecto }` | `204` |
| `cambiarAsesor` | PATCH | `/fichas-perfil/{id}/asesor-ficha` | `{ asesorFicha }` | `204` |
| `getFichasCoordinador` | POST | `/fichas-perfil/coordinador` | `{ pagina, tamanio }` | `200 PageResponseDTO<FichaPerfil>` |
| `getFichasAsesor` | POST | `/fichas-perfil/asesor` | `{ pagina, tamanio }` | `200 PageResponseDTO<FichaPerfil>` — el asesor sale del JWT |
| `agregarItemFichaPerfil` | POST | `/fichas-perfil/{fichaPerfilId}/items` | `{ tipoItem, contenido }` | `201 { id }` · Errores de dominio 422 con `code` (`ITEM_TIPO_DUPLICADO`, `ESTADO_FICHA_PERFIL_ESTADO_TERMINAL`); `contenido` máx. 7000 |
| `modificarItem` | PATCH | `/fichas-perfil/items/{itemId}` | `{ contenido }` | `204` · Errores de dominio 422 con `code` (`ITEM_FICHA_NO_AUTORIZADA`, `ITEM_NO_ENCONTRADO`, `ESTADO_FICHA_PERFIL_ESTADO_TERMINAL`); `contenido` máx. 7000 |
| `removerItem` | DELETE | `/fichas-perfil/items/{itemId}` | — | `204` · Errores: 400 ítem inexistente · 403 sin authority `fichas:item-ficha-perfil:delete` o no propietario · 422 con `code` `ITEM_CON_REVISIONES` o estado terminal de la ficha |
| `consultarTodosTipoItem` | GET | `/fichas-perfil/tipos-item` | — | `200 TipoItem[]` |
| `consultarFichasPerfilEstudiante` | GET | `/fichas-perfil/estudiante` | — | `200 FichaPerfilEstudianteResponseDTO[]` (puede ser `[]`). Mergeado en `develop` del backend (PR #168, VALIDATOR-HU-037 100/100); el estudiante sale del JWT, sin id de entrada. Una ficha sin estado o sin asesor se omite del listado (`INNER JOIN`), sin 500: el estudiante la ve como lista vacía. Mejora abierta del backend: pasar a `LEFT JOIN` |
| `getEstadosFichaPerfilEstudiante` | GET | `/fichas-perfil/{fichaPerfilId}/estados-ficha/estudiante` | — | `200 [{ id, nombre, fechaActualizacion }]` · lista plana, orden `fechaActualizacion` DESC (el primero es el vigente). Errores 400/401/403, sin 404. Requiere el client role `fichas:estado-ficha-perfil-estudiante:view` (HU-040) |
| `getItemsFichaAsesor` | GET | `/fichas-perfil/{fichaPerfilId}/items` | — | `200 ItemFichaPerfilResponseDTO[]` · plano, se traduce a `Item` |
| `getItemsFichaRepresentante` | GET | `/fichas-perfil/{fichaPerfilId}/items/representante` | — | `200 ItemFichaPerfilResponseDTO[]` · plano, se traduce a `Item` |
| `consultarItemsMiFichaPerfil` | GET | `/fichas-perfil/{fichaPerfilId}/items/estudiante` | — | `200 ItemFichaPerfilResponseDTO[]` · plano, se traduce a `Item`. Lista vacía si no hay ítems o vínculo (no 404). Requiere el client role `fichas:item-ficha-perfil-estudiante:view` (HU-032) |
| `consultarEstudiantesVinculados` | GET | `/fichas-perfil/{fichaPerfilId}/estudiantes` | — | `200 EstudianteFichaPerfilResponseDTO[]` · `id` es el vínculo, `estudianteId` el estudiante |
| `asignarEstudiantes` | POST | `/fichas-perfil/{fichaPerfilId}/estudiantes` | `{ estudiantes: string[] }` | `204` — asigna **por lote** |
| `removerEstudiante` | DELETE | `/fichas-perfil/{fichaPerfilId}/estudiantes/{estudianteId}` | — | `204` |
| `registrarEvaluacion` | POST | `/fichas-perfil/{fichaId}/evaluaciones` | _(sin body)_ | `201 { id }` |
| `getEvaluacionFicha` | GET | `/fichas-perfil/{fichaPerfilId}/evaluaciones/representante` | — | `200 EvaluacionFichaPerfilResponseDTO[]` · **lista**, ordenada por `fechaCreacion` asc |
| `agregarEstadoEvaluacion` | POST | `/fichas-perfil/estado-evaluacion-ficha` | `{ evaluacionFichaPerfil, estadoEvaluacion }` | `201 { id }` |
| `getEstadosFicha` | GET | `/fichas-perfil/estados-ficha` | — | `200 EstadoFicha[]` |
| `getEstadosEvaluacion` | GET | `/fichas-perfil/estados-evaluacion` | — | `200 EstadoEvaluacion[]` |

> **Respuestas que devuelven menos de lo que parece.** `registrarEvaluacion` y
> `agregarEstadoEvaluacion` responden **solo** `{ id }`: no traen `fechaCreacion` ni el estado. Quien
> necesite esos datos después de la mutación invalida la query y los relee, no los deduce de la
> respuesta.

### Pendientes (el backend aún no expone el endpoint o el contrato difiere)

Estos métodos permanecen en el servicio anotados como pendientes para no romper la UI existente, pero
**no deben considerarse funcionales** hasta que el backend los exponga:

| Método del servicio | Motivo |
|---|---|
| `getFichasRepresentante` | Verificado 2026-09-28: sigue sin endpoint en el backend (no existe un `ConsultarFichasPerfilRepresentanteController` análogo a `.../coordinador` o `.../asesor`). Corresponde a `HU280-NO_SINCRONIZADA`, sigue vigente tal cual. **Esto bloquea toda la vista `RepresentanteView` en producción**: aunque `ItemsFichaRepresentantePanel`, `RegistrarEvaluacionPanel`, `AgregarEstadoEvaluacionPanel` y `EstadosEvaluacionPanel` están completamente implementados y usan endpoints reales, nadie puede llegar a ellos porque `ConsultarFichasRepresentante` (la puerta de entrada) no tiene de dónde traer el listado |
| `agregarEstadoFichaPerfil` | Verificado 2026-09-28: el backend **sigue sin exponer controller REST** para esto (confirmado revisando todos los `*Controller.java` de `fichas/infrastructure`; solo existe `AgregarEstadoEvaluacionFichaController`, que es de **evaluación**, no de estado de ficha). `AsignarEstadoInicialFichaPerfilUseCase` sigue siendo un mecanismo interno que corre al registrar la ficha |

> `consultarItemsMiFichaPerfil` no es un error de ruta del backend: solo falta apuntar el método a la ruta real. La puerta de entrada del representante sigue bloqueada por `getFichasRepresentante`.

### Grupos con UI implementada pero bloqueados en su punto de entrada

Hallazgo del 2026-09-28: `fichas-perfil` no es la única feature con UI completa — **`EstudianteView` y
`RepresentanteView` ya están implementadas de punta a punta**, nunca pasaron por el flujo de agentes
(sin plan, sin tests, sin validación) y hoy son inalcanzables en producción real por el bloqueo de su
endpoint de entrada:

| Vista | Componentes reales, ya conectados a endpoints reales | Bloqueo de entrada |
|---|---|---|
| `EstudianteView` | `ItemsMiFichaPanel` (agregar/modificar/remover ítem — HU031/033/034; selector del catálogo de tipos), `TiposItemPanel` (HU193, pestaña propia), `MiFichaHeader` (modificar título) | Resuelto: `consultarFichasPerfilEstudiante` (`GET /fichas-perfil/estudiante`) |
| `RepresentanteView` | `ItemsFichaRepresentantePanel` (HU185, ya cerrada), `RegistrarEvaluacionPanel` (HU190), `AgregarEstadoEvaluacionPanel` (HU191), `EstadosEvaluacionPanel` (HU186) | `getFichasRepresentante` — sin endpoint de listado |

`EstudianteView` además tiene dos tabs en `ComingSoon` real (`RevisionesMiFichaPanel`,
`EvaluacionesMiFichaPanel` — mensaje "en construcción"), a diferencia de las anteriores que sí están
terminadas. Ninguna de las dos vistas tiene tests hoy.

### Por qué los pendientes responden 405 y no 404

Varias rutas pendientes de 2 segmentos (`/fichas-perfil/asesores`, `/fichas-perfil/estudiantes`)
colisionan con el mapping `PATCH /fichas-perfil/{id}` de `ModificarFichaPerfilInputAdapter`: Spring
resuelve la ruta tomando `id = "asesores"` o `id = "estudiantes"`, encuentra que el método no coincide
y responde **405 Method Not Allowed** (`El método HTTP no está permitido en este endpoint`) en lugar de
404. Es un síntoma de que el endpoint no existe, no de que exista con otro verbo.

### Degradación en la interfaz

Los catálogos de asesores y de estudiantes ya no degradan por "backend no expone el endpoint": ambos
consumen endpoints reales de `usuarios` a través de servicios compartidos —
`src/shared/services/asesoresFichaService.ts` (`useAsesoresFichaVigentes`, HU-239, `POST
/usuarios/asesores-ficha/vigentes`) y `src/shared/services/estudiantesVigentesService.ts`
(`useEstudiantesVigentes`, adenda 2026-09-29 de HU-249, `POST /usuarios/estudiantes/vigentes`). El
bloqueo real hoy es Keycloak: las authorities `usuarios:asesor-ficha-vigente:view` y
`usuarios:estudiante-vigente:view` no están mapeadas en el realm export de `arquisoft-infra` — con
login real, el interceptor resolvería el `403` navegando a `/forbidden` antes de que la feature lo
vea, no con un desplegable degradado.

`AvisoNoDisponible` (`src/shared/components/AvisoNoDisponible.tsx`) sigue cubriendo el caso de error
genuino (red o `5xx`) en los formularios afectados, con el envío deshabilitado mientras dure:

- `RegistrarFichaPerfil` — catálogos de asesores y estudiantes.
- `CambiarAsesorForm` — catálogo de asesores.
- `AsignarEstudianteForm` — catálogo de estudiantes.

## Endpoints de Usuarios

Servicio: `src/features/usuarios/services/usuariosService.ts`.

### Implementados y alineados

| Método del servicio | Método HTTP | Ruta backend | Body | Respuesta |
|---|---|---|---|---|
| `registrarUsuario` | POST | `/usuarios` | `{ identificador, nombres, apellidos, email, contacto, roles? }` | `201 { id }` |
| `modificarUsuario` | PATCH | `/usuarios/{usuarioId}` | `{ identificador?, nombre?, email?, contacto? }` (sin `roles`; el DTO real acepta además `nombres?`/`apellidos?`, que el frontend no envía) | `204` sin cuerpo |
| `agregarRol(usuarioId, rol)` (HU-243 coordinador, HU-247 estudiante, HU-234 asesor, HU-237 asesor de ficha, HU-253 representante del comité) | PATCH | `/usuarios/{usuarioId}` | `{ roles: ['coordinador'] }`, `{ roles: ['estudiante'] }`, `{ roles: ['asesor'] }`, `{ roles: ['asesor-ficha'] }` o `{ roles: ['representante-comite'] }` | `204` sin cuerpo (aditivo; 400 `USUARIO_ROL_NO_VALIDO`; 422 `USUARIO_NO_ENCONTRADO`, `USUARIO_ELIMINADO`, `COORDINADOR_USUARIO_DUPLICADO` (coordinador), `ASESOR_USUARIO_DUPLICADO` (asesor vigente), duplicado vigente de asesor de ficha (`AsesorFichaUsuarioUnicoRule`; código exacto sin verificar; si su fila estaba eliminada lógicamente se reactiva), `REPRESENTANTE_COMITE_USUARIO_DUPLICADO` (representante del comité vigente; una fila eliminada lógicamente se reactiva); un estudiante vigente se rechaza con 422 (el cliente ya bloquea su checkbox); 503 `USUARIO_IDP_NO_DISPONIBLE`). No hay endpoint propio: es el mismo PATCH con solo roles |
| `removerCoordinador` (HU-244) | DELETE | `/usuarios/{usuarioId}/coordinador` | — | `204` sin cuerpo (baja lógica del coordinador y revocación del realm role; 400 id no UUID; 422 sin rol coordinador vigente, `COORDINADOR_NO_ENCONTRADO`, `USUARIO_NO_ENCONTRADO`; 503 `USUARIO_IDP_NO_DISPONIBLE`). Verificado contra `RemoverCoordinadorController`; client role `usuarios:coordinador:delete` |
| `removerEstudiante` (HU-248) | DELETE | `/usuarios/{usuarioId}/estudiante` | — | `204` sin cuerpo (baja lógica del estudiante y revocación del realm role; 400 id no UUID; 422 sin rol estudiante vigente, `ESTUDIANTE_NO_ENCONTRADO`, `USUARIO_NO_ENCONTRADO`; 503 `USUARIO_IDP_NO_DISPONIBLE`). Verificado contra `RemoverEstudianteController`; client role `usuarios:estudiante:delete`. Lo consume el hook `useRemoverRol`, que sustituye a `useRemoverCoordinador` y despacha por rol |
| `removerAsesor` (HU-235) | DELETE | `/usuarios/{usuarioId}/asesor` | — | `204` sin cuerpo (baja lógica del asesor y revocación del realm role; 400 id no UUID; 422 sin rol asesor vigente, `ASESOR_NO_ENCONTRADO`, `USUARIO_NO_ENCONTRADO`; 503 `USUARIO_IDP_NO_DISPONIBLE`). Verificado contra `RemoverAsesorController`; client role `usuarios:asesor:delete`. Lo consume `useRemoverRol` |
| `removerAsesorFicha` (HU-238) | DELETE | `/usuarios/{usuarioId}/asesor-ficha` | — | `204` sin cuerpo (baja lógica del asesor de ficha; 400 id no UUID; 422 sin rol asesor de ficha vigente, `ASESOR_FICHA_NO_ENCONTRADO`, `USUARIO_NO_ENCONTRADO`; 503 `USUARIO_IDP_NO_DISPONIBLE`). Verificado contra `RemoverAsesorFichaController`; client role `usuarios:asesor-ficha:delete`. Lo consume `useRemoverRol` |
| `removerRepresentanteComite` (HU-254) | DELETE | `/usuarios/{usuarioId}/representante-comite` | — | `204` sin cuerpo (baja lógica del representante del comité; 400 id no UUID; 422 `REPRESENTANTE_COMITE_NO_ENCONTRADO`, `USUARIO_NO_ENCONTRADO`; 503 `USUARIO_IDP_NO_DISPONIBLE`). Verificado contra `RemoverRepresentanteComiteController`; client role `usuarios:representante-comite:delete`. Lo consume `useRemoverRol` |
| `eliminarUsuario` | DELETE | `/usuarios/{usuarioId}` | — | `204` sin cuerpo (eliminación lógica; 422 `USUARIO_NO_ENCONTRADO`, `USUARIO_ELIMINADO`, `USUARIO_ROLES_VIGENTES`; 503 `USUARIO_IDP_NO_DISPONIBLE`) |
| `consultarCoordinadoresAdministrador` | POST | `/usuarios/coordinadores/administrador` | `{ pagina, tamanio }` (el body admite además `ordenamiento` y `filtros`, que el frontend no envía) | `200 Page<Coordinador>` |
| `consultarEstudiantesAdministrador` | POST | `/usuarios/estudiantes/administrador` | `{ pagina, tamanio }` (el body admite además `ordenamiento` y `filtros`, que el frontend no envía) | `200 Page<Estudiante>` |
| `consultarAsesoresAdministrador` | POST | `/usuarios/asesores/administrador` | `{ pagina, tamanio }` (el body admite además `ordenamiento` y `filtros`, que el frontend no envía) | `200 Page<Asesor>` |
| `consultarAsesoresFichaAdministrador` | POST | `/usuarios/asesores-ficha/administrador` | `{ pagina, tamanio }` (el body admite además `ordenamiento` y `filtros`, que el frontend no envía) | `200 Page<AsesorFicha>` |
| `consultarRepresentantesComiteAdministrador` | POST | `/usuarios/representantes-comite/administrador` | `{ pagina, tamanio }` (el body admite además `ordenamiento` y `filtros`, que el frontend no envía) | `200 Page<RepresentanteComite>` |
| `consultarAdministradoresAdministrador` (HU-233) | POST | `/usuarios/administradores/administrador` | `{ pagina, tamanio }` (el body admite además `ordenamiento` y `filtros`, que el frontend no envía) | `200 Page<Administrador>` · verificado contra `ConsultarAdministradoresAdministradorController`; client role `usuarios:administrador-administrador:view` |
| `consultarUsuariosAdministrador` | POST | `/usuarios/administrador` | `{ pagina, tamanio, ordenamiento?: string[], filtros?: NodoFiltroDTO }` | `200 Page<Usuario>` |

Verificado contra `RegistrarUsuarioController.java`, `RegistrarUsuarioRequestDTO.java` y
`RegistrarUsuarioResponseDTO.java` de `../arquisoft-backend`, y contra `VALIDATOR-HU-256.md`
(✅ APROBADO, PR `arquisoft-backend#111` mergeado). Sin traducción de nombres en el service: el modelo
del frontend coincide 1:1 con el DTO real.

Errores mapeados por `errorCode` (`ErrorResponseDTO`): 422 `USUARIO_IDENTIFICADOR_DUPLICADO`,
`USUARIO_EMAIL_DUPLICADO`, `USUARIO_CONTACTO_DUPLICADO`; 503 `USUARIO_IDP_NO_DISPONIBLE` (Keycloak no
disponible).

`consultarCoordinadoresAdministrador` (HU-245) verificado contra
`ConsultarCoordinadoresAdministradorController.java` y `CoordinadorResponseDTO.java` de
`../arquisoft-backend`, y contra `VALIDATOR-HU-245.md` (✅ APROBADO, PR #149
mergeado). Es `POST` aunque sea una lectura porque los filtros viajan en el body. Devuelve
`{ id, identificador, nombre, email, contacto, estado, vigente }` por fila, incluidos los coordinadores
dados de baja. Sin traducción de nombres en el service.

`consultarEstudiantesAdministrador` (HU-249) verificado contra
`ConsultarEstudiantesAdministradorController.java` y `EstudianteResponseDTO.java` de
`../arquisoft-backend`, y contra `VALIDATOR-HU-249.md` (✅ APROBADO, PR #149 mergeado). Es `POST`
aunque sea una lectura porque los filtros viajan en el body. Devuelve
`{ id, identificador, nombre, email, contacto, estado, vigente }` por fila, incluidos los estudiantes
dados de baja; `estado` llega como `id` del catálogo `estado_usuario` (`ACTIVO`/`INACTIVO`). Sin
traducción de nombres en el service. Discrepancia con el plan del backend: una paginación inválida
(`tamanio` fuera de 1-100) se normaliza en silencio, no responde `400`.

`consultarAsesoresAdministrador` (HU-236) verificado contra
`ConsultarAsesoresAdministradorController.java` y `AsesorResponseDTO.java` de `../arquisoft-backend`,
y contra `VALIDATOR-HU-236.md` (✅ APROBADO, PR backend #149). Es `POST` aunque sea una lectura porque
los filtros viajan en el body. Devuelve `{ id, identificador, nombre, email, contacto, estado, vigente }`
por fila, incluidos los asesores dados de baja. Sin traducción de nombres en el service. Es el rol
`asesor`, no `asesor-ficha`. Solo consulta: eliminar el rol es HU-235.

`consultarAsesoresFichaAdministrador` (HU-237) verificado contra
`ConsultarAsesoresFichaAdministradorController.java` y `AsesorFichaResponseDTO.java` de
`../arquisoft-backend`, y contra `VALIDATOR-HU-237.md` (APROBADO, PR backend #116). `POST` por los
filtros en el body. Devuelve `{ id, identificador, nombre, email, contacto, estado, vigente }` por fila,
incluidos los dados de baja, sin traducción. Es el rol `asesor-ficha` (con guion), distinto de `asesor`
y del `/vigentes` de HU-239. Quitar el rol es HU-238 (`removerAsesorFicha`).

`consultarRepresentantesComiteAdministrador` (HU-255) verificado contra
`ConsultarRepresentantesComiteAdministradorController.java` y `RepresentanteComiteResponseDTO.java` de
`../arquisoft-backend`, y contra `VALIDATOR-HU-255.md` (APROBADO, PR backend #157). `POST` por los
filtros en el body. Devuelve `{ id, identificador, nombre, email, contacto, estado, vigente }` por fila,
incluidos los dados de baja, sin traducción. El client role
`usuarios:representante-comite-administrador:view` puede faltar en el realm (403 con login real, no con
bypass). Quitar el rol es HU-254 (`removerRepresentanteComite`).

`consultarAdministradoresAdministrador` (HU-233) verificado contra
`ConsultarAdministradoresAdministradorController` y `AdministradorResponseDTO` de `../arquisoft-backend`,
y contra `VALIDATOR-HU-233.md` (APROBADO, PR backend #163). `POST` por los filtros en el body. Devuelve
`{ id, identificador, nombre, email, contacto, estado, vigente }` por fila, incluidos los dados de baja,
sin traducción. El client role `usuarios:administrador-administrador:view` probablemente falta en
`realm-arquisoft.json` (inferido, no verificado): 403 con login real, no con bypass. Es solo consulta:
eliminar es HU-232 y habilitar el checkbox de edición es HU-231.

`consultarUsuariosAdministrador` (HU-260) verificado contra
`ConsultarUsuariosAdministradorController.java`, `UsuarioResponseDTO.java` y `UsuarioCriteria.java` de
`../arquisoft-backend`, y contra `VALIDATOR-HU-260.md` (✅ APROBADO, PR backend #152 mergeado). Es
`POST` aunque sea una lectura porque los filtros viajan como árbol genérico (`NodoFiltroDTO`) en el
body. A diferencia de los dos listados anteriores, devuelve **todos** los usuarios del sistema sin
importar el rol, incluidos los dados de baja, con 13 campos: `id, identificador, nombre, email,
contacto, estado, vigente, esEstudiante, esAsesor, esAsesorFicha, esCoordinador,
esRepresentanteComite, esAdministrador`. Dos commits posteriores al de la HU (`cd81688c`, `0b1dc5a9`)
agregaron `esRepresentanteComite` y `esAdministrador` al DTO real: el modelo del frontend usa el
contrato de hoy, no el de 11 campos que describen el plan y el validador originales de la HU. Faltan
`esBibliotecario` (`// TODO HU242`) y `esJurado` (`// TODO HU252`) en el backend — no se modelan ni se
ofrecen como filtro hasta que esas HU entreguen. Whitelist de filtro/orden (`UsuarioCriteria.Campo`):
12 campos filtrables, 3 ordenables (`identificador, nombre, email`); un campo o valor fuera de
whitelist responde `400` (`FiltroException`), pero la UI nunca puede producirlo porque todos sus
controles de filtro/orden son de opciones cerradas. Sin traducción de nombres en el service: el
`ConsultarUsuariosRequest` que arma el hook ya tiene la forma exacta que espera el backend.

Riesgo operativo: el client role `usuarios:usuario-administrador:view` no aparece en
`arquisoft-infra/components/keycloak/config/realm-arquisoft.json` — mismo patrón ya documentado más
abajo para los demás roles `usuarios:*-administrador:view` de este contexto. Con login real, un
administrador sin ese client role recibe `403` y el interceptor lo lleva a `/forbidden`; no se ve con
`VITE_AUTH_BYPASS=true`.

No hay `GET /usuarios` hoy. La edición de usuarios (`modificarUsuario`) y el agregado de roles coordinador, estudiante, asesor, asesor de ficha y representante del comité (`agregarRol`, HU-243, HU-247, HU-234, HU-237 y HU-253) usan `PATCH /usuarios/{id}`; el client role `usuarios:usuario:update` puede no estar en el realm (403 con login real, no con bypass). Quitar el rol coordinador (`removerCoordinador`), estudiante (`removerEstudiante`, HU-248), asesor (`removerAsesor`, HU-235), asesor de ficha (`removerAsesorFicha`, HU-238) y representante del comité (`removerRepresentanteComite`, HU-254) usan sus propios `DELETE /usuarios/{id}/coordinador`, `/estudiante`, `/asesor`, `/asesor-ficha` y `/representante-comite`; los client roles `usuarios:coordinador:delete`, `usuarios:estudiante:delete`, `usuarios:asesor:delete`, `usuarios:asesor-ficha:delete` y `usuarios:representante-comite:delete` pueden faltar igual. Los listados de
coordinadores, estudiantes, asesores, asesores de ficha, representantes del comité, administradores y el unificado de "todos los usuarios" son los únicos listados de la
feature.

### Sin cliente en el frontend

- `POST /usuarios/coordinadores/vigentes` existe en el backend y queda sin cliente por decisión de
  alcance de HU-245: ninguna ruta del frontend lleva a asesor, estudiante o coordinador a `/usuarios`.

### Dependencia operativa: client roles en Keycloak

Los client roles `usuarios:coordinador-administrador:view`, `usuarios:coordinador-vigente:view`,
`usuarios:estudiante-administrador:view`, `usuarios:estudiante-vigente:view` y
`usuarios:asesor-administrador:view` y `usuarios:asesor-ficha-administrador:view` no
están en el realm export de `arquisoft-infra`, que solo define `usuarios:usuario:create`. Con login
real, un administrador puede recibir `403` (el interceptor lo lleva a `/forbidden`) hasta que se creen y
mapeen en Keycloak. No se ve con `VITE_AUTH_BYPASS=true`. El Keycloak desplegado no se pudo verificar.

## Otros contextos expuestos por el backend (aún sin cliente en el frontend)

Estos endpoints existen en el backend pero no se integran en esta iteración:

- **Seguridad / Autenticación:** `POST /auth/login` (deprecado, ROPC), `POST /auth/refresh`,
  `POST /auth/logout`, `POST /auth/validate`. El frontend usa `keycloak-js` directamente.
- **Fichas / MinIO (PoC):** `/fichas/minio/guia/*` — marcado para eliminación en el backend, se ignora.

## Validación compartida alineada al backend

Módulo: `src/shared/validation/`. Centraliza únicamente lo reutilizable y alineado a las restricciones
del backend; las reglas propias de la lógica de negocio permanecen en cada formulario.

- `limites.ts` — constantes de las restricciones `@Size` del backend:
  `TITULO_PROYECTO_MAX = 100`, `ITEM_CONTENIDO_MAX = 7000`, `ESTADO_EVALUACION_ID_MAX = 50`,
  `ESTUDIANTES_MAX = 3`, `USUARIO_IDENTIFICADOR_MIN/MAX = 4/30`, `USUARIO_NOMBRE_MIN/MAX = 2/50`,
  `USUARIO_EMAIL_MIN/MAX = 6/50`, `USUARIO_CONTACTO_MIN/MAX = 10/15`.
- `expresiones-regulares.ts` — `EMAIL_REGEX` (alineado a `PATRON_CORREO` del backend), `UUID_REGEX`,
  `DIGITOS_REGEX`, `NOMBRE_COMPLETO_REGEX`.
- `mensajes-validacion.ts` — mensajes de error en español reutilizables.
- `validadores-zod.ts` — builders Zod reutilizables: `textoRequerido(max)`, `opcionRequerida()`,
  `emailValido(min?, max?)`, `uuidValido()`, `listaConMaximo(max)`, `textoEntre(min, max)`,
  `textoNoVacio()`, `soloDigitosEntre(min, max)`.
- `index.ts` — barrel del módulo.

Formularios que ya consumen el módulo: `RegistrarFichaPerfil` (título), `MiFichaHeader` (título),
`ItemsMiFichaPanel` (contenido de ítem), `RegistrarUsuarioForm` (identificador, nombres/apellidos,
email, contacto).
