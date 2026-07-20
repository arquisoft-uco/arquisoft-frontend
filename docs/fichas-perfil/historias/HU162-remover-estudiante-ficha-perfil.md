# HU162 — Remover información de un estudiante de una Ficha Perfil

## Historia de usuario

**Como** Coordinador  
**Necesito** remover un estudiante vinculado a una Ficha Perfil  
**Para** gestionar roles dentro del desarrollo de un proyecto de grado, facilitando la relación y la comunicación entre los miembros del equipo, contando con miembros activos.

---

## Precondiciones

- El coordinador está autenticado en el sistema.
- El vínculo identificado por `idVinculo` existe en el sistema (es decir, el estudiante está actualmente asignado a la ficha).

---

## Reglas de negocio

- **FichaPerfil-POL-01**: Solo el Coordinador puede remover estudiantes de una ficha.
- **FichaPerfil-POL-06**: Al remover un estudiante, la ficha puede quedar con 0 estudiantes asignados (el mínimo de 1 aplica solo al momento del registro inicial).

---

## Event Storming

```
[Remover Estudiante de Ficha Perfil]
        │
        ├── Comando desencadenado por: Coordinador
        │
        ├── Política: FichaPerfil-POL-06 — se identifica el vínculo por idVinculo
        │
        ▼
(Estudiante Removido de Ficha Perfil)
        │
        └── Elimina: EstudianteFichaPerfil { id = idVinculo }
```

### Actores
- **Coordinador** — desencadena el comando.

### Políticas aplicadas
| Código | Descripción |
|--------|-------------|
| FichaPerfil-POL-01 | Solo el Coordinador puede gestionar los estudiantes de una ficha |
| FichaPerfil-POL-06 | El vínculo se identifica por `idVinculo`, no por el ID del estudiante |

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
│       EstudianteFichaPerfil         │  ← se elimina por idVinculo
│─────────────────────────────────────│
│ + id: UUID        ← idVinculo       │
│ + fichaPerfilId: UUID               │
│ + estudianteId: UUID                │
└─────────────────────────────────────┘
```

### Invariantes
- El `idVinculo` es el identificador único del registro `EstudianteFichaPerfil`, independiente del estudiante o la ficha. Permite remover sin conocer el `idFichaPerfil`.

---

## Modelo Entidad-Relación

```
estudiante_ficha_perfil
────────────────────────────────────
PK  id                UUID           ← idVinculo (se elimina)
FK  ficha_perfil_id   UUID          NOT NULL  → ficha_perfil.id
FK  estudiante_id     UUID          NOT NULL  → estudiante.id
```

---

## Contrato de API

**`DELETE /fichas-perfil/estudiantes/{idVinculo}`**  
Autenticación: JWT del Coordinador.

### Path parameters

| Parámetro   | Tipo | Descripción                                        |
|-------------|------|----------------------------------------------------|
| `idVinculo` | uuid | ID del registro `EstudianteFichaPerfil` a eliminar |

### 204 No Content

Sin cuerpo de respuesta. El vínculo fue eliminado exitosamente.

### Errores

| Código | Condición |
|--------|-----------|
| `404`  | El vínculo con el `idVinculo` indicado no existe |

---

## Criterios de aceptación

1. El coordinador puede remover un estudiante de cualquier ficha usando el `idVinculo`.
2. Al remover exitosamente, se muestra una notificación de éxito y la lista de estudiantes se actualiza.
3. Si el `idVinculo` no existe, el sistema responde con 404.
4. Solo el coordinador puede invocar esta operación.

---

## Evento producido

**Estudiante Removido de Ficha Perfil**
