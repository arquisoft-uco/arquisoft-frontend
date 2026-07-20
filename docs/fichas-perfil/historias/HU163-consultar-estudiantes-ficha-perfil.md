# HU163 — Consultar información de los estudiantes vinculados a una Ficha Perfil

## Historia de usuario

**Como** Coordinador  
**Necesito** consultar la información de los estudiantes vinculados a una Ficha Perfil  
**Para** gestionar roles dentro del desarrollo de un proyecto de grado, facilitando la relación y la comunicación entre los miembros del equipo, contando con miembros activos.

---

## Precondiciones

- El coordinador está autenticado en el sistema.
- La ficha de perfil identificada por `fichaPerfilId` existe en el sistema.

---

## Reglas de negocio

- **FichaPerfil-POL-01**: Solo el Coordinador puede consultar la información de los estudiantes vinculados a una ficha.
- La respuesta incluye el `idVinculo` (ID del registro `EstudianteFichaPerfil`) para permitir operaciones posteriores (ej. remover vínculo) sin ambigüedad.
- El resultado no está paginado: se devuelve la lista completa (máximo 3 estudiantes por ficha).

---

## Event Storming

```
[Consultar Estudiantes de una Ficha Perfil]
        │
        ├── Comando desencadenado por: Coordinador
        │
        ▼
(Estudiantes de una Ficha Perfil Consultados)
        │
        └── ReadModel: EstudianteVinculadoResponse { idVinculo, id, nombre, email }
```

### Actores
- **Coordinador** — desencadena el comando.

### Política aplicada
| Código | Descripción |
|--------|-------------|
| FichaPerfil-POL-01 | Solo el Coordinador puede consultar estudiantes vinculados a una ficha |

---

## Modelo de dominio enriquecido

```
┌─────────────────────────────────────┐
│           FichaPerfil               │  ← Aggregate Root
│─────────────────────────────────────│
│ + id: UUID                          │
│ + titulo: String                    │
└─────────────────┬───────────────────┘
                  │ 1:N
                  ▼
┌─────────────────────────────────────┐
│       EstudianteFichaPerfil         │  ← Vínculo (idVinculo)
│─────────────────────────────────────│
│ + id: UUID        ← idVinculo       │
│ + fichaPerfilId: UUID               │
│ + estudianteId: UUID                │
└─────────────────┬───────────────────┘
                  │ N:1
                  ▼
┌─────────────────────────────────────┐
│           Estudiante                │
│─────────────────────────────────────│
│ + id: UUID                          │
│ + nombre: String                    │
│ + email: String                     │
└─────────────────────────────────────┘
```

### Invariantes
- Una `FichaPerfil` tiene entre 0 y 3 estudiantes vinculados.
- El `idVinculo` identifica de manera única el registro de unión (útil para remover estudiantes).

---

## Modelo Entidad-Relación

```
ficha_perfil
────────────────────────────────────
PK  id                UUID

estudiante_ficha_perfil
────────────────────────────────────
PK  id                UUID           ← idVinculo
FK  ficha_perfil_id   UUID          NOT NULL  → ficha_perfil.id
FK  estudiante_id     UUID          NOT NULL  → estudiante.id

estudiante
────────────────────────────────────
PK  id                UUID
    nombre            VARCHAR(100)  NOT NULL
    email             VARCHAR(100)  NOT NULL
```

---

## Contrato de API

**`GET /fichas-perfil/{fichaPerfilId}/estudiantes`**  
Autenticación: JWT del Coordinador.

### Path parameters

| Parámetro      | Tipo | Descripción                            |
|----------------|------|----------------------------------------|
| `fichaPerfilId`| uuid | ID de la ficha perfil a consultar      |

### 200 OK — `EstudianteVinculadoResponse[]`

```json
[
  {
    "idVinculo": "5fb69c38-13c5-41b1-b365-3b2aca91099f",
    "id": "0ea42337-9899-4190-a7ad-9c0f319151f8",
    "nombre": "Cristian Monsalve Mejía",
    "email": "cristian.monsalve1234@soyuco.edu.co"
  }
]
```

| Campo       | Tipo   | Descripción                                                   |
|-------------|--------|---------------------------------------------------------------|
| `idVinculo` | uuid   | ID del registro `EstudianteFichaPerfil` (para remover vínculo)|
| `id`        | uuid   | ID del estudiante                                             |
| `nombre`    | string | Nombre completo del estudiante                                |
| `email`     | string | Correo institucional del estudiante                           |

### Errores

| Código | Condición |
|--------|-----------|
| `404`  | La ficha perfil con el `fichaPerfilId` indicado no existe |

---

## Criterios de aceptación

1. La respuesta incluye todos los estudiantes vinculados a la ficha especificada.
2. Cada elemento incluye `idVinculo`, `id`, `nombre` y `email`.
3. Si la ficha no existe, el sistema responde con 404.
4. Solo el coordinador puede invocar este endpoint.
5. La lista nunca tiene más de 3 elementos (invariante de dominio).

---

## Evento producido

**Estudiantes de una Ficha Perfil Consultados**
