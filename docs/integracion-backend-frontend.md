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
| `registrarFichaPerfil` | POST | `/fichas-perfil` | `{ tituloProyecto, asesorFichaId, estudiantesIds }` | `201 { id }` |
| `modificarTituloFichaPerfil` | PATCH | `/fichas-perfil/{id}` | `{ tituloProyecto }` | `204` |
| `cambiarAsesor` | PATCH | `/fichas-perfil/{id}/asesor-ficha` | `{ asesorFichaId }` | `204` |
| `getFichasCoordinador` | POST | `/fichas-perfil/coordinador` | `{ pagina, tamanio }` | `200 PageResponseDTO<FichaPerfil>` |
| `agregarItemFichaPerfil` | POST | `/fichas-perfil/{fichaPerfilId}/items` | `{ tipoItem, contenido }` | `201 { id }` |
| `modificarItem` | PATCH | `/fichas-perfil/{itemId}/items` | `{ contenido }` | `204` |
| `registrarEvaluacion` | POST | `/fichas-perfil/{fichaId}/evaluaciones` | _(sin body)_ | `201 { id }` |
| `agregarEstadoEvaluacion` | POST | `/fichas-perfil/estado-evaluacion-ficha` | `{ evaluacionFichaPerfilId, estadoEvaluacionId }` | `201 { id }` |
| `getEstadosFicha` | GET | `/fichas-perfil/estados-ficha` | — | `200 EstadoFicha[]` |

> Nota: `registrarEvaluacion` responde únicamente `{ id }` en el backend actual; los campos
> `fechaCreacion` y `estadoActual` que consume la UI aún no llegan en la respuesta.

### Pendientes (el backend aún no expone el endpoint o el contrato difiere)

Estos métodos permanecen en el servicio anotados como pendientes para no romper la UI existente, pero
**no deben considerarse funcionales** hasta que el backend los exponga:

| Método del servicio | Motivo |
|---|---|
| `getMiFichaPerfil` | Sin endpoint en el backend |
| `consultarItemsMiFichaPerfil` | Sin endpoint en el backend |
| `removerItem` | Sin endpoint en el backend |
| `consultarTodosTipoItem` | Sin endpoint en el backend |
| `consultarAsesoresDisponibles` | Sin endpoint en el backend |
| `consultarEstudiantesDisponibles` | Sin endpoint en el backend |
| `getFichasAsesor` | Sin endpoint en el backend |
| `getFichasRepresentante` | Sin endpoint en el backend |
| `getItemsFichaAsesor` | Sin endpoint en el backend |
| `getItemsFichaRepresentante` | Sin endpoint en el backend |
| `getEvaluacionFicha` | Sin endpoint en el backend |
| `getEstadosEvaluacion` | Sin endpoint en el backend |
| `agregarEstadoFichaPerfil` | Sin endpoint en el backend |
| `consultarEstudiantesVinculados` | Sin endpoint de lectura por ficha en el backend |
| `asignarEstudiante` | El backend recibe `{ estudiantesIds }` en `/fichas-perfil/{fichaPerfilId}/estudiantes` y responde `204`; el flujo por vínculo individual requiere rediseño |
| `removerEstudiante` | El backend elimina por `/fichas-perfil/{fichaPerfilId}/estudiantes/{estudianteId}`; el flujo por vínculo individual requiere rediseño |

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
