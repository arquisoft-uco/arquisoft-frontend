# HU197 — Consultar información de los ítems de una Ficha Perfil a Asesorar

## Historia de usuario

**Como** Asesor Ficha  
**Necesito** Consultar información de los ítems de una Ficha Perfil a Asesorar  
**Para** facilitar la gestión y seguimiento de las fichas de perfil, asegurando que la información esté actualizada, disponible para la revisión en tiempo real y permitiendo agregar observaciones que respalden la toma de decisiones durante el proceso.

---

## Precondiciones

- El asesor está autenticado en el sistema.
- La ficha perfil a consultar existe y está asignada al asesor autenticado.

---

## Reglas de negocio

- Solo el asesor asignado a la ficha perfil puede consultar sus ítems.
- Se retornan todos los ítems de la ficha perfil indicada, sin paginación.
- Si la ficha no tiene ítems registrados, se retorna una lista vacía (no error).
- El `fichaPerfilId` es obligatorio; sin él el servidor retorna `400 Bad Request`.

---

## Event Storming

```
[Consultar Ítems de Ficha Perfil a Asesorar]
        │  fichaPerfilId
        ▼
(Información Items del Asesor Ficha Consultada)
        │
        ├── ReadModel: Item { id, tipoItem { id, nombre }, contenido, fichaPerfilId }
        └── Políticas: Item-POL-01, Item-POL-06
```

### Actores
- **Asesor Ficha** — desencadena el comando.

### Políticas aplicadas
- **Item-POL-01**: Solo pueden consultarse los ítems de fichas asignadas al asesor autenticado.
- **Item-POL-06**: El asesor únicamente consulta los ítems; no puede modificarlos ni eliminarlos.

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
│             Item                │  ← Entity
│─────────────────────────────────│
│ + id: UUID                      │
│ + contenido: String             │
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

### Invariantes
- Un `Item` pertenece a exactamente una `FichaPerfil`.
- El asesor solo puede consultar ítems de fichas que le han sido asignadas.

---

## Modelo Entidad-Relación

```
item
────────────────────────────────
PK  id               UUID
    contenido        TEXT         NOT NULL
FK  tipo_item_id     UUID         NOT NULL
FK  ficha_perfil_id  UUID         NOT NULL

tipo_item
────────────────────────────────
PK  id     UUID
    nombre VARCHAR(50)  NOT NULL
```

**Relaciones:**
- `item.ficha_perfil_id → ficha_perfil.id` (N:1)
- `item.tipo_item_id → tipo_item.id` (N:1)

---

## Contrato de API

**`GET /fichas-perfil/asesor-items`**  
Autenticación: JWT del asesor ficha.

### Query parameters

| Parámetro      | Tipo    | Requerido | Descripción                            |
|----------------|---------|-----------|----------------------------------------|
| `fichaPerfilId` | uuid   | ✅        | ID de la ficha perfil a consultar      |

### 200 OK — `Item[]`

```json
[
  {
    "id": "717faaf2-a697-4e22-bcd9-29dddd64dd25",
    "tipoItem": {
      "id": "19a73987-5efd-4ad1-910b-5f86a6bb3c4d",
      "nombre": "Objetivo general"
    },
    "contenido": "Gestionar el flujo del ciclo de vida de los proyectos de grado",
    "fichaPerfilId": "10c355a4-56d0-484e-aa0d-8823e0a782cf"
  }
]
```

**400 Bad Request** — `fichaPerfilId` ausente o inválido.  
**404 Not Found** — la ficha perfil no existe o no está asignada al asesor.

---

## Criterios de aceptación

1. El asesor puede consultar los ítems de una ficha perfil que le ha sido asignada.
2. Cada ítem expone su tipo, contenido e identificador de ficha.
3. Si la ficha no tiene ítems, se retorna una lista vacía (no error).
4. El asesor no puede modificar ni eliminar ítems mediante este endpoint.
5. El `fichaPerfilId` es obligatorio; sin él el servidor retorna `400 Bad Request`.
6. Si la ficha no existe o no está asignada al asesor, se retorna `404 Not Found`.

---

## Evento producido

**Información Items del Asesor Ficha Consultada**
