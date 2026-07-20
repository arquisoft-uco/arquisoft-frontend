# HU185 — Consultar ítems de la Ficha Perfil a aprobar

## Historia de usuario

**Como** Representante Comité Currículum  
**Necesito** Consultar información de los ítems de la Ficha Perfil a aprobar  
**Para** proveer un mecanismo centralizado con la información de las fichas de trabajo de grado que se deben aprobar, permitiendo la revisión en tiempo real de manera individual.

---

## Precondiciones

- El representante está autenticado en el sistema.
- La ficha perfil a consultar existe y está asignada al representante para evaluación.

---

## Reglas de negocio

- Solo el representante asignado a la ficha puede consultar sus ítems.
- Se retornan todos los ítems de la ficha perfil indicada, sin paginación.
- Si la ficha no tiene ítems registrados, se retorna una lista vacía (no error).
- El `fichaPerfilId` es obligatorio; sin él el servidor retorna `400 Bad Request`.

---

## Event Storming

```
[Consultar Ítems de Ficha Perfil a Aprobar]
        │  fichaPerfilId
        ▼
(Información Items del Representante Consultada)
        │
        ├── ReadModel: Item { id, tipoItem { id, nombre }, contenido, fichaPerfilId }
        └── Políticas: Item-POL-01, Item-POL-06
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
               │ 1:N
               ▼
┌─────────────────────────────────┐
│             Item                │  ← Entity
│─────────────────────────────────│
│ + id: UUID                      │
│ + contenido: String[1-200]      │
│ + tipoItemId: UUID              │
│ + fichaPerfilId: UUID           │
└──────────────┬──────────────────┘
               │ N:1
               ▼
┌─────────────────────────────────┐
│           TipoItem              │  ← Value Object (catálogo)
│─────────────────────────────────│
│ + id: UUID                      │
│ + nombre: String                │
└─────────────────────────────────┘
```

---

## Modelo Entidad-Relación

```
item
────────────────────────────────
PK  id               UUID
    contenido        VARCHAR(200)  NOT NULL
FK  tipo_item_id     UUID          NOT NULL → tipo_item(id)
FK  ficha_perfil_id  UUID          NOT NULL → ficha_perfil(id)

tipo_item
────────────────────────────────
PK  id     UUID
    nombre VARCHAR(20)  NOT NULL
```

---

## Contrato de API

**`GET /fichas-perfil/representante-items`**  
Autenticación: JWT del representante comité currículum.

### Query parameters

| Parámetro       | Tipo | Requerido | Descripción                        |
|-----------------|------|-----------|------------------------------------|
| `fichaPerfilId` | uuid | ✅        | ID de la ficha perfil a consultar  |

### 200 OK — `Item[]`

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "tipoItem": { "id": "...", "nombre": "Objetivo General" },
    "contenido": "Desarrollar un sistema de monitoreo...",
    "fichaPerfilId": "..."
  }
]
```

**400 Bad Request** — `fichaPerfilId` ausente.  
**404 Not Found** — ficha perfil no encontrada.

---

## Criterios de aceptación

1. El representante visualiza todos los ítems de la ficha seleccionada agrupados por tipo.
2. Cada ítem muestra su tipo y contenido.
3. Si la ficha no tiene ítems, se muestra un mensaje vacío (no error).
4. El `fichaPerfilId` es obligatorio; sin él el servidor retorna `400 Bad Request`.

---

## Evento producido

**Información Items del Representante Comité Curriculum Consultada**
