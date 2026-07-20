# HU280 — Consultar Fichas Perfil a evaluar

## Historia de usuario

**Como** Representante Comité Currículum  
**Necesito** Consultar información de las Fichas Perfil a evaluar  
**Para** facilitar la gestión y seguimiento de las fichas de perfil, asegurando que la información esté actualizada y disponible para la revisión en tiempo real.

---

## Precondiciones

- El representante está autenticado en el sistema.
- Existen fichas de perfil asignadas al representante para evaluación.

---

## Reglas de negocio

- Se listan **únicamente** las fichas de perfil asignadas al representante autenticado (filtrado por `representanteId`).
- El `representanteId` se obtiene del claim `sub` del token JWT.
- El resultado se devuelve paginado: por defecto **página 0**, tamaño **10 fichas**.
- Cada ficha expone su estado actual para orientar al representante sobre el progreso.
- Si el representante no tiene fichas asignadas, se retorna una página vacía (no error).

---

## Event Storming

```
[Consultar Fichas Perfil a Evaluar]
        │  representanteId (del token JWT)
        ▼
(Información de Ficha Perfil Consultada Por Representante)
        │
        ├── ReadModel: FichaPerfilRepresentante { id, titulo, estadoActual }
        └── Política: EvaluacionFichaPerfil-POL-1
```

### Actores
- **RepresentanteComiteCurriculum** — desencadena el comando.

---

## Modelo de dominio enriquecido

```
┌─────────────────────────────────┐
│         FichaPerfil             │  ← Aggregate Root
│─────────────────────────────────│
│ + id: UUID                      │
│ + tituloProyecto: String[1-100] │
└──────────────┬──────────────────┘
               │ 1:N (a través de evaluacion_ficha_perfil)
               ▼
┌────────────────────────────────────────┐
│       EvaluacionFichaPerfil            │  ← Entity
│────────────────────────────────────────│
│ + id: UUID                             │
│ + representanteComiteId: UUID          │
│ + fichaPerfilId: UUID                  │
│ + fechaCreacion: Date                  │
└────────────────────────────────────────┘
```

---

## Modelo Entidad-Relación

```
ficha_perfil
────────────────────────────────
PK  id                  UUID
    titulo_proyecto     VARCHAR(100)  NOT NULL

evaluacion_ficha_perfil
────────────────────────────────
PK  id                      UUID
FK  representante_comite_id  UUID  NOT NULL → representante_comite_curriculum(id)
FK  ficha_perfil_id          UUID  NOT NULL → ficha_perfil(id)
    fecha_creacion           TIMESTAMP NOT NULL

estado_ficha_perfil
────────────────────────────────
PK  id                UUID
FK  ficha_perfil_id   UUID  NOT NULL
FK  estado_ficha_id   UUID  NOT NULL
    fecha_actualizacion TIMESTAMP NOT NULL
```

---

## Contrato de API

**`GET /fichas-perfil/representante`**  
Autenticación: JWT del representante comité currículum.

### Query parameters

| Parámetro          | Tipo    | Requerido | Defecto | Descripción                                            |
|--------------------|---------|-----------|---------|--------------------------------------------------------|
| `representanteId`  | uuid    | ✅        | —       | UUID del representante (claim `sub` del token JWT)     |
| `page`             | integer | ❌        | `0`     | Número de página (0-based)                             |
| `size`             | integer | ❌        | `10`    | Fichas por página                                      |

### 200 OK — `Page<FichaPerfilRepresentante>`

```json
{
  "content": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "titulo": "Sistema de monitoreo de calidad del agua",
      "estadoActual": "Disponible Para Evaluación"
    }
  ],
  "totalElements": 3,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

**400 Bad Request** — `representanteId` ausente o parámetros de paginación inválidos.

---

## Criterios de aceptación

1. El representante visualiza únicamente las fichas de perfil que le han sido asignadas para evaluación.
2. Cada ficha muestra su título del proyecto y su estado actual.
3. El resultado se entrega paginado con máximo 10 registros por página.
4. Si no existen fichas asignadas, se retorna una página vacía (no error).
5. El filtrado por `representanteId` es obligatorio; sin él el servidor retorna `400 Bad Request`.

---

## Evento producido

**Información de Ficha Perfil Consultada Por Representante Comité Curriculum**
