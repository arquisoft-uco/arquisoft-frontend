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
| `consultarAsesoresDisponibles` | Sin endpoint en el backend. Corresponde a la historia «Consultar todos los asesores de ficha disponibles» (`HU278-NO_SINCRONIZADA`), sin ID vigente en el catálogo maestro |
| `consultarEstudiantesDisponibles` | Sin endpoint en el backend. Corresponde a «Consultar todos los estudiantes disponibles» (`HU279-NO_SINCRONIZADA`) |
| `getFichasRepresentante` | Sin endpoint en el backend. Corresponde a `HU280-NO_SINCRONIZADA` |
| `agregarEstadoFichaPerfil` | El backend **no expone controller REST**: `AsignarEstadoInicialFichaPerfilUseCase` es un mecanismo interno que corre al registrar la ficha, no una acción invocable desde la UI |
| `getMiFichaPerfil` | El endpoint existe (`GET /fichas-perfil/{fichaPerfilId}/estudiante`) pero **exige el `fichaPerfilId` como entrada**, y el estudiante no tiene forma de descubrirlo: no hay consulta «mis fichas». Requiere una historia nueva de backend |
| `consultarItemsMiFichaPerfil` | Mismo bloqueo: `GET /fichas-perfil/{fichaPerfilId}/items/estudiante` existe, pero depende de conocer el `fichaPerfilId` |

> Las dos últimas filas no son un error de ruta: el contrato del backend está bien formado, lo que
> falta es la puerta de entrada del estudiante a su propia ficha.

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

## Otros contextos expuestos por el backend (aún sin cliente en el frontend)

Estos endpoints existen en el backend pero no se integran en esta iteración:

- **Seguridad / Autenticación:** `POST /auth/login` (deprecado, ROPC), `POST /auth/refresh`,
  `POST /auth/logout`, `POST /auth/validate`. El frontend usa `keycloak-js` directamente.
- **Usuarios:** `POST /usuarios` (`{ email, rol }` → `201 { id, email, rol }`), requiere autoridad
  `usuarios:usuario:create`.
- **Fichas / MinIO (PoC):** `/fichas/minio/guia/*` — marcado para eliminación en el backend, se ignora.

## Validación compartida alineada al backend

Módulo: `src/shared/validation/`. Centraliza únicamente lo reutilizable y alineado a las restricciones
del backend; las reglas propias de la lógica de negocio permanecen en cada formulario.

- `limites.ts` — constantes de las restricciones `@Size` del backend:
  `TITULO_PROYECTO_MAX = 100`, `ITEM_CONTENIDO_MAX = 7000`, `ESTADO_EVALUACION_ID_MAX = 50`,
  `ESTUDIANTES_MAX = 3`.
- `expresiones-regulares.ts` — `EMAIL_REGEX`, `UUID_REGEX`.
- `mensajes-validacion.ts` — mensajes de error en español reutilizables.
- `validadores-zod.ts` — builders Zod reutilizables: `textoRequerido(max)`, `opcionRequerida()`,
  `emailValido()`, `uuidValido()`, `listaConMaximo(max)`.
- `index.ts` — barrel del módulo.

Formularios que ya consumen el módulo: `RegistrarFichaPerfil` (título), `MiFichaHeader` (título),
`ItemsMiFichaPanel` (contenido de ítem).
