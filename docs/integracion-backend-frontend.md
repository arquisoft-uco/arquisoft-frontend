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
| `agregarItemFichaPerfil` | POST | `/fichas-perfil/{fichaPerfilId}/items` | `{ tipoItem, contenido }` | `201 { id }` |
| `modificarItem` | PATCH | `/fichas-perfil/items/{itemId}` | `{ contenido }` | `204` |
| `removerItem` | DELETE | `/fichas-perfil/items/{itemId}` | — | `204` |
| `consultarTodosTipoItem` | GET | `/fichas-perfil/tipos-item` | — | `200 TipoItem[]` |
| `getItemsFichaAsesor` | GET | `/fichas-perfil/{fichaPerfilId}/items` | — | `200 ItemFichaPerfilResponseDTO[]` · plano, se traduce a `Item` |
| `getItemsFichaRepresentante` | GET | `/fichas-perfil/{fichaPerfilId}/items/representante` | — | `200 ItemFichaPerfilResponseDTO[]` · plano, se traduce a `Item` |
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
| `consultarAsesoresDisponibles` | Verificado 2026-09-28: el endpoint que este método llama (`/fichas-perfil/asesores`) sigue sin existir. **Pero ya existe un sustituto viable en otro bounded context**: `POST /usuarios/asesores-ficha/vigentes` (HU-239, backend PR #148 mergeado) devuelve `{ id, identificador, nombre, email, contacto, estado }` paginado — justo lo que necesita el `<select>` de `CambiarAsesorForm`/`RegistrarFichaPerfil`. Bloqueado hoy no por el endpoint sino por Keycloak: la authority `usuarios:asesor-ficha-vigente:view` no está en `keycloak/realm-arquisoft.json`, ningún rol la tiene asignada — con login real, Coordinador recibiría `403`. Corresponde a `HU278-NO_SINCRONIZADA`, que queda desactualizada (decía "sin endpoint"; ya no es cierto) |
| `consultarEstudiantesDisponibles` | Mismo caso: `POST /usuarios/estudiantes/vigentes` existe (`ConsultarEstudiantesVigentesController`, roles asesor/coordinador/asesor-ficha/representante-comite marcados en el código), pero su authority tampoco está mapeada en el realm de Keycloak. Corresponde a `HU279-NO_SINCRONIZADA`, también desactualizada por el mismo motivo |
| `getFichasRepresentante` | Verificado 2026-09-28: sigue sin endpoint en el backend (no existe un `ConsultarFichasPerfilRepresentanteController` análogo a `.../coordinador` o `.../asesor`). Corresponde a `HU280-NO_SINCRONIZADA`, sigue vigente tal cual. **Esto bloquea toda la vista `RepresentanteView` en producción**: aunque `ItemsFichaRepresentantePanel`, `RegistrarEvaluacionPanel`, `AgregarEstadoEvaluacionPanel` y `EstadosEvaluacionPanel` están completamente implementados y usan endpoints reales, nadie puede llegar a ellos porque `ConsultarFichasRepresentante` (la puerta de entrada) no tiene de dónde traer el listado |
| `agregarEstadoFichaPerfil` | Verificado 2026-09-28: el backend **sigue sin exponer controller REST** para esto (confirmado revisando todos los `*Controller.java` de `fichas/infrastructure`; solo existe `AgregarEstadoEvaluacionFichaController`, que es de **evaluación**, no de estado de ficha). `AsignarEstadoInicialFichaPerfilUseCase` sigue siendo un mecanismo interno que corre al registrar la ficha |
| `getMiFichaPerfil` | Verificado 2026-09-28, sigue bloqueado: existe `GET /fichas-perfil/{fichaPerfilId}/estudiante` (`ConsultarFichaPerfilEstudianteController`), pero **exige el `fichaPerfilId` como entrada**, y no hay ningún endpoint tipo "mis fichas" para que el estudiante lo descubra desde su JWT (a diferencia de `POST /coordinador` o `POST /asesor`, que sí derivan al usuario del token). **Esto bloquea toda la vista `EstudianteView` en producción**: `ItemsMiFichaPanel` (con `agregar`/`modificar`/`remover` ya wireados a `agregarItemFichaPerfil`/`modificarItem`/`removerItem`, los tres reales) nunca recibe un `fichaId` con el que operar |
| `consultarItemsMiFichaPerfil` | Mismo bloqueo que `getMiFichaPerfil`: `GET /fichas-perfil/{fichaPerfilId}/items/estudiante` (`ConsultarItemsFichaPerfilEstudianteController`) existe, pero depende del mismo `fichaPerfilId` que el estudiante no puede descubrir |

> Ninguna de las dos últimas filas es un error de ruta: el contrato del backend está bien formado, lo
> que falta es la puerta de entrada del estudiante a su propia ficha — y lo mismo aplica al
> representante con `getFichasRepresentante`.

### Grupos con UI implementada pero bloqueados en su punto de entrada

Hallazgo del 2026-09-28: `fichas-perfil` no es la única feature con UI completa — **`EstudianteView` y
`RepresentanteView` ya están implementadas de punta a punta**, nunca pasaron por el flujo de agentes
(sin plan, sin tests, sin validación) y hoy son inalcanzables en producción real por el bloqueo de su
endpoint de entrada:

| Vista | Componentes reales, ya conectados a endpoints reales | Bloqueo de entrada |
|---|---|---|
| `EstudianteView` | `ItemsMiFichaPanel` (agregar/modificar/remover ítem — HU031/033/034; catálogo de tipos — HU193), `MiFichaHeader` (modificar título) | `getMiFichaPerfil` — sin discovery de "mi ficha" |
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

Como el backend no expone los catálogos de asesores ni de estudiantes, el flujo de **registro de ficha
por coordinador no puede completarse** (se requieren `asesorFichaId` y `estudiantesIds` como UUID).
Para evitar desplegables vacíos sin explicación, los formularios afectados muestran el componente
compartido `AvisoNoDisponible` (`src/shared/components/AvisoNoDisponible.tsx`) y deshabilitan el envío:

- `RegistrarFichaPerfil` — catálogos de asesores y estudiantes.
- `CambiarAsesorForm` — catálogo de asesores.
- `AsignarEstudianteForm` — catálogo de estudiantes.

**Dependencia de backend:** exponer los endpoints de consulta de asesores y estudiantes disponibles
para desbloquear el flujo del coordinador.

## Endpoints de Usuarios

Servicio: `src/features/usuarios/services/usuariosService.ts`.

### Implementados y alineados

| Método del servicio | Método HTTP | Ruta backend | Body | Respuesta |
|---|---|---|---|---|
| `registrarUsuario` | POST | `/usuarios` | `{ identificador, nombres, apellidos, email, contacto, roles? }` | `201 { id }` |
| `consultarCoordinadoresAdministrador` | POST | `/usuarios/coordinadores/administrador` | `{ pagina, tamanio }` (el body admite además `ordenamiento` y `filtros`, que el frontend no envía) | `200 Page<Coordinador>` |
| `consultarEstudiantesAdministrador` | POST | `/usuarios/estudiantes/administrador` | `{ pagina, tamanio }` (el body admite además `ordenamiento` y `filtros`, que el frontend no envía) | `200 Page<Estudiante>` |

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

No hay `GET /usuarios` hoy: no hay edición de usuarios en esta iteración. Los listados de coordinadores
y de estudiantes son los únicos listados de la feature.

### Sin cliente en el frontend

- `POST /usuarios/coordinadores/vigentes` existe en el backend y queda sin cliente por decisión de
  alcance de HU-245: ninguna ruta del frontend lleva a asesor, estudiante o coordinador a `/usuarios`.
- `POST /usuarios/estudiantes/vigentes` existe en el backend (roles asesor, coordinador, asesor-ficha y
  representante-comite; la fila no trae `vigente`) y queda sin cliente por decisión de alcance de HU-249.

### Dependencia operativa: client roles en Keycloak

Los client roles `usuarios:coordinador-administrador:view`, `usuarios:coordinador-vigente:view`,
`usuarios:estudiante-administrador:view` y `usuarios:estudiante-vigente:view` no
están en el realm export de `arquisoft-infra`, que solo define `usuarios:usuario:create`. Con login
real, un administrador puede recibir `403` (el interceptor lo lleva a `/forbidden`) hasta que se creen y
mapeen en Keycloak. No se ve con `VITE_AUTH_BYPASS=true`. El Keycloak desplegado no se pudo verificar.

## Endpoints de Evaluaciones

Servicio: `src/features/evaluaciones/services/evaluacionesService.ts`.

### Implementados y alineados

| Método del servicio | Método HTTP | Ruta backend | Body | Respuesta |
|---|---|---|---|---|
| `getItemsCualitativosJurado` | GET | `/evaluaciones/items-cualitativos-jurado` | — | `200 ItemCualitativoJuradoResponseDTO[]` (`{ id, nombre, descripcion }`) · **lista plana** sin `Page`, ordenada por `nombre` asc; `[]` si no hay filas |

Verificado el 2026-09-29 contra `ConsultarItemsCualitativosJuradoController.java` y
`ItemCualitativoJuradoResponseDTO.java` de `../arquisoft-backend`, y contra `VALIDATOR-HU-225.md`
(✅ APROBADO, PR `arquisoft-backend#89` mergeado). Sin traducción de nombres en el service: el modelo del
frontend coincide 1:1 con el DTO real. Roles con acceso: `administrador` y `jurado` (client role
`evaluaciones:item-cualitativo-jurado:view`). Una colección vacía responde `200 []`, no `404`.

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
