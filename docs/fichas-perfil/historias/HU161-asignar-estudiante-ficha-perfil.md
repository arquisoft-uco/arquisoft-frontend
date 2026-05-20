# HU161 — Asignar información de un estudiante en una Ficha Perfil

## Historia de usuario

**Como** Coordinador  
**Necesito** asignar un estudiante a una Ficha Perfil  
**Para** gestionar roles dentro del desarrollo de un proyecto de grado, facilitando la relación y la comunicación entre los miembros del equipo, contando con miembros activos.

---

## Precondiciones

- El coordinador está autenticado en el sistema.
- La ficha de perfil identificada por `idFichaPerfil` existe en el sistema.
- El estudiante identificado por `idEstudiante` existe en el sistema.

---

## Reglas de negocio

- **FichaPerfil-POL-01**: Solo el Coordinador puede asignar estudiantes a una ficha.
- **FichaPerfil-POL-03**: Una ficha puede tener entre **1 y 3 estudiantes** asignados. No se permite superar el límite de 3.
- **FichaPerfil-POL-04**: No se puede asignar el mismo estudiante más de una vez en la misma ficha.

---

## Event Storming

```
[Asignar Estudiante a Ficha Perfil]
        │
        ├── Comando desencadenado por: Coordinador
        │
        ├── Política: FichaPerfil-POL-03 — máximo 3 estudiantes
        ├── Política: FichaPerfil-POL-04 — no duplicados
        │
        ▼
(Estudiante Asignado a Ficha Perfil)
        │
        └── Agrega: EstudianteFichaPerfil { id (idVinculo), fichaPerfilId, estudianteId }
```

### Actores
- **Coordinador** — desencadena el comando.

### Políticas aplicadas
| Código | Descripción |
|--------|-------------|
| FichaPerfil-POL-01 | Solo el Coordinador puede gestionar los estudiantes de una ficha |
| FichaPerfil-POL-03 | Máximo 3 estudiantes por ficha |
| FichaPerfil-POL-04 | No se puede asignar el mismo estudiante más de una vez |

---

## Modelo de dominio enriquecido

```
┌─────────────────────────────────────┐
│           FichaPerfil               │  ← Aggregate Root
│─────────────────────────────────────│
│ + id: UUID                          │
│ + titulo: String                    │
└─────────────────┬───────────────────┘
                  │ 1:N (máx. 3)
                  ▼
┌─────────────────────────────────────┐
│       EstudianteFichaPerfil         │  ← se crea aquí
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
- Una `FichaPerfil` nunca puede tener más de 3 `EstudianteFichaPerfil`.
- La combinación `(fichaPerfilId, estudianteId)` debe ser única en `EstudianteFichaPerfil`.

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
    UNIQUE (ficha_perfil_id, estudiante_id)

estudiante
────────────────────────────────────
PK  id                UUID
    nombre            VARCHAR(100)  NOT NULL
    email             VARCHAR(100)  NOT NULL
```

---

## Contrato de API

**`POST /fichas-perfil/estudiantes`**  
Autenticación: JWT del Coordinador.

### Request body — `AsignarEstudianteRequest`

```json
{
  "idFichaPerfil": "605237ec-f71f-4753-a56d-6166250ee7b6",
  "idEstudiante": "b2efd2af-a100-483c-9ca7-6bb60f83ba45"
}
```

| Campo          | Tipo | Requerido | Restricciones                            |
|----------------|------|-----------|------------------------------------------|
| `idFichaPerfil`| uuid | ✅        | La ficha debe existir en el sistema      |
| `idEstudiante` | uuid | ✅        | El estudiante debe existir en el sistema |

### 200 OK — `AsignarEstudianteResponse`

```json
{
  "idVinculo": "5fb69c38-13c5-41b1-b365-3b2aca91099f"
}
```

| Campo       | Tipo | Descripción                                                     |
|-------------|------|-----------------------------------------------------------------|
| `idVinculo` | uuid | ID del registro `EstudianteFichaPerfil` creado (para removerlo) |

### Errores

| Código | Condición |
|--------|-----------|
| `400`  | Datos inválidos (campos faltantes o formato incorrecto) |
| `404`  | La ficha o el estudiante no existen |
| `409`  | El estudiante ya está asignado a la ficha (POL-04) o se alcanzó el límite de 3 (POL-03) |

---

## Criterios de aceptación

1. El coordinador puede asignar un estudiante disponible a cualquier ficha del sistema.
2. No se puede asignar más de 3 estudiantes a la misma ficha.
3. No se puede asignar el mismo estudiante dos veces en la misma ficha.
4. Al asignar exitosamente, se retorna el `idVinculo` del registro creado.
5. Al asignar exitosamente, la vista se actualiza reflejando el nuevo estudiante vinculado.
6. Solo el coordinador puede invocar esta operación.

---

## Evento producido

**Estudiante Asignado a Ficha Perfil**
