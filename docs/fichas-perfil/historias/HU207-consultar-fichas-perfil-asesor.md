# HU207 — Consultar fichas de perfil que asesora

## Historia de usuario

**Como** Asesor Ficha  
**Necesito** Consultar información de las Ficha Perfil las cuales asesora  
**Para** facilitar la gestión y seguimiento de las fichas de perfil, asegurando que la información esté actualizada, disponible para la revisión en tiempo real y permitiendo agregar observaciones que respalden la toma de decisiones durante el proceso.

---

## Precondiciones

- El asesor está autenticado en el sistema.
- Existen fichas de perfil asignadas al asesor en el sistema.

---

## Reglas de negocio

- Se listan **únicamente** las fichas de perfil asignadas al asesor autenticado (filtrado por `asesorId`).
- El `asesorId` se obtiene del claim `sub` del token JWT.
- El resultado se devuelve paginado: por defecto **página 0**, tamaño **10 fichas**.
- Cada ficha expone su estado actual para orientar al asesor sobre el progreso.
- Si el asesor no tiene fichas asignadas, se retorna una página vacía (no error).

---

## Event Storming

```
[Consultar Fichas Perfil que Asesora]
        │  asesorId (del token JWT)
        ▼
(Información de Ficha Perfil Consultada Por Asesor Ficha)
        │
        ├── ReadModel: FichaPerfilAsesor { id, titulo, estadoActual }
        └── Política: FichaPerfil-POL-01 — Solo el Asesor Ficha puede consultar sus fichas
```

### Actores
- **Asesor Ficha** — desencadena el comando.

### Política aplicada
- **FichaPerfil-POL-01**: Cada asesor solo puede ver las fichas que le han sido asignadas.

---

## Modelo de dominio enriquecido

```
┌─────────────────────────────────┐
│         FichaPerfil             │  ← Aggregate Root
│─────────────────────────────────│
│ + id: UUID                      │
│ + tituloProyecto: String[1-100] │
│ + asesorFichaId: UUID           │
└──────────────┬──────────────────┘
               │ 1:N
               ▼
┌─────────────────────────────────┐
│       EstadoFichaPerfil         │  ← Entity
│─────────────────────────────────│
│ + id: UUID                      │
│ + estadoFichaId: UUID           │
│ + fechaAsignacion: Date         │
└──────────────┬──────────────────┘
               │ N:1
               ▼
┌─────────────────────────────────┐
│         EstadoFicha             │  ← Value Object (catálogo)
│─────────────────────────────────│
│ + id: UUID                      │
│ + nombre: String                │
└─────────────────────────────────┘
```

### Invariantes
- Una `FichaPerfil` siempre tiene exactamente un `AsesorFicha` asignado.
- El `estadoActual` corresponde al nombre del estado ficha más reciente registrado.
- El listado devuelve una proyección `FichaPerfilAsesor` (no el agregado completo).

---

## Modelo Entidad-Relación

```
ficha_perfil
────────────────────────────────
PK  id               UUID
    titulo_proyecto  VARCHAR(100)  NOT NULL
FK  asesor_ficha_id  UUID          NOT NULL

estado_ficha_perfil
────────────────────────────────
PK  id                UUID
FK  ficha_perfil_id   UUID         NOT NULL
FK  estado_ficha_id   UUID         NOT NULL
    fecha_asignacion  TIMESTAMP    NOT NULL

estado_ficha
────────────────────────────────
PK  id     UUID
    nombre VARCHAR(50)  NOT NULL
```

**Relaciones:**
- `ficha_perfil.asesor_ficha_id → asesor_ficha.id` (N:1)
- `estado_ficha_perfil.ficha_perfil_id → ficha_perfil.id` (N:1)
- `estado_ficha_perfil.estado_ficha_id → estado_ficha.id` (N:1)

---

## Contrato de API

**`GET /fichas-perfil/asesor-ficha`**  
Autenticación: JWT del asesor ficha.

### Query parameters

| Parámetro  | Tipo    | Requerido | Defecto | Descripción                                      |
|------------|---------|-----------|---------|--------------------------------------------------|
| `asesorId` | uuid    | ✅        | —       | UUID del asesor (claim `sub` del token JWT)      |
| `page`     | integer | ❌        | `0`     | Número de página (0-based)                       |
| `size`     | integer | ❌        | `10`    | Fichas por página                                |

### 200 OK — `Page<FichaPerfilAsesor>`

```json
{
  "content": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "titulo": "Sistema de monitoreo de calidad del agua",
      "estadoActual": "En Revisión"
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

**400 Bad Request** — parámetros de paginación inválidos o `asesorId` ausente.

---

## Criterios de aceptación

1. El asesor visualiza únicamente las fichas de perfil que le han sido asignadas.
2. Cada ficha muestra su título del proyecto y su estado actual.
3. El resultado se entrega paginado con máximo 10 registros por página.
4. Si no existen fichas asignadas al asesor, se retorna una página vacía (no error).
5. El filtrado por `asesorId` es obligatorio; sin él el servidor retorna `400 Bad Request`.

---

## Evento producido

**Información de Ficha Perfil Consultada Por Asesor Ficha**


---

## Precondiciones

- El asesor está autenticado en el sistema (token Keycloak válido con `sub` = asesorId).
- Existen fichas de perfil asignadas al asesor en el sistema.

---

## Reglas de negocio

- Se listan **únicamente** las fichas de perfil asignadas al asesor autenticado (filtrado por `asesorId`).
- El `asesorId` se obtiene del claim `sub` del token JWT (Keycloak).
- El resultado se devuelve paginado: por defecto **página 0**, tamaño **10 fichas**.
- Cada ficha incluye su `estadoActual` para orientar al asesor sobre el progreso.
- Si el asesor no tiene fichas asignadas, se retorna una página vacía (no error).

---

## Event Storming

```
[Consultar Fichas Perfil que Asesora]
        │  asesorId (del token JWT)
        ▼
(Información de Ficha Perfil Consultada Por Asesor Ficha)
        │
        ├── ReadModel: FichaPerfilAsesor { id, titulo, estadoActual }
        └── Política: FichaPerfil-POL-01 — Solo el Asesor Ficha puede consultar sus fichas
```

### Actores
- **Asesor Ficha** — desencadena el comando.

### Política aplicada
- **FichaPerfil-POL-01**: Cada asesor solo puede ver las fichas que le han sido asignadas.

---

## Modelo de datos

```
FichaPerfilAsesor {
  id:           UUID     -- identificador de la ficha
  titulo:       String   -- título del proyecto (alias de tituloProyecto)
  estadoActual: String   -- nombre del estado actual de la ficha perfil
}
```

---

## API REST

### Endpoint

```
GET /fichas-perfil/asesor-ficha?asesorId={uuid}&page=0&size=10
```

### Parámetros de query

| Parámetro  | Tipo    | Requerido | Descripción                                      |
|------------|---------|-----------|--------------------------------------------------|
| `asesorId` | uuid    | ✅        | UUID del asesor (claim `sub` del token Keycloak) |
| `page`     | integer | ❌        | Número de página (0-indexed, defecto: 0)          |
| `size`     | integer | ❌        | Tamaño de página (defecto: 10)                   |

### Respuesta `200 OK`

```json
{
  "content": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "titulo": "Sistema de monitoreo de calidad del agua",
      "estadoActual": "En Revisión"
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

---

## Implementación frontend

### Archivos modificados / creados

| Archivo | Cambio |
|---------|--------|
| `models/FichaPerfilAsesor.ts` | **Nuevo** — Interface `{ id, titulo, estadoActual }` |
| `services/fichasPerfilService.ts` | `getFichasAsesor(asesorId, page, size)` — nuevo path y tipo |
| `hooks/useFichasAsesor.ts` | Lee `asesorId` de `useAuthStore`, pasa a servicio, `enabled: !!asesorId` |
| `components/asesor-ficha/ConsultarFichasAsesor.tsx` | Columna `estadoActual` + paginador |
| `components/asesor-ficha/DetalleFichaAsesor.tsx` | Usa `FichaPerfilAsesor`, header muestra `estadoActual` |
| `components/AsesorFichaView.tsx` | Estado local tipado como `FichaPerfilAsesor` |

### Flujo de datos

```
AsesorFichaView
  └── ConsultarFichasAsesor
        └── useFichasAsesor()
              └── useAuthStore → asesorId (tokenParsed.sub)
              └── fichasPerfilService.getFichasAsesor(asesorId, page, size)
                    └── GET /fichas-perfil/asesor-ficha?asesorId=...
```

---

## Criterios de aceptación

| # | Criterio |
|---|----------|
| 1 | Al acceder a la sección, se carga automáticamente el listado de fichas del asesor autenticado |
| 2 | Cada fila muestra título del proyecto y estado actual |
| 3 | Si hay más de 10 fichas, se muestra el paginador con conteo y botones anterior/siguiente |
| 4 | Si no hay fichas asignadas, se muestra mensaje vacío (no error) |
| 5 | El botón "Ver detalle" navega al detalle de la ficha seleccionada |
| 6 | El estado actual se muestra como badge visual |
