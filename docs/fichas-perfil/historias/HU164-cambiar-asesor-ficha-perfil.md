# HU164 — Cambiar Asesor Ficha para Ficha Perfil

## Historia de usuario

**Como** Coordinador  
**Necesito** cambiar el Asesor Ficha asignado a una Ficha Perfil  
**Para** gestionar roles dentro del desarrollo de un proyecto de grado, facilitando la relación y la comunicación entre los miembros del equipo, contando con miembros activos.

---

## Precondiciones

- El coordinador está autenticado en el sistema.
- La ficha de perfil identificada por `idFicha` existe en el sistema.
- El asesor identificado por `idAsesorFicha` existe en el sistema.

---

## Reglas de negocio

- **FichaPerfil-POL-01**: Solo el Coordinador puede cambiar el asesor de una ficha.
- **FichaPerfil-POL-05**: El nuevo asesor debe ser distinto al asesor actual de la ficha.

---

## Event Storming

```
[Cambiar Asesor Ficha]
        │
        ├── Comando desencadenado por: Coordinador
        │
        ├── Política: FichaPerfil-POL-05 — nuevo asesor ≠ asesor actual
        │
        ▼
(Asesor Ficha Cambiado)
        │
        └── Modifica: FichaPerfil { asesorFichaId ← idAsesorFicha }
```

### Actores
- **Coordinador** — desencadena el comando.

### Políticas aplicadas
| Código | Descripción |
|--------|-------------|
| FichaPerfil-POL-01 | Solo el Coordinador puede gestionar el asesor de una ficha |
| FichaPerfil-POL-05 | El nuevo asesor debe ser distinto al asesor actual |

---

## Modelo de dominio enriquecido

```
┌─────────────────────────────────────┐
│           FichaPerfil               │  ← Aggregate Root
│─────────────────────────────────────│
│ + id: UUID                          │
│ + titulo: String                    │
│ + asesorFichaId: UUID  ← se modifica│
└──────────────────┬──────────────────┘
                   │ N:1
                   ▼
┌─────────────────────────────────────┐
│           AsesorFicha               │
│─────────────────────────────────────│
│ + id: UUID                          │
│ + nombre: String                    │
│ + email: String                     │
└─────────────────────────────────────┘
```

### Invariantes
- `asesorFichaId` nunca puede ser nulo en una `FichaPerfil`.
- El nuevo `asesorFichaId` debe ser diferente al valor previo (POL-05).

---

## Modelo Entidad-Relación

```
ficha_perfil
────────────────────────────────────
PK  id                UUID
    titulo_proyecto   VARCHAR(100)  NOT NULL
FK  asesor_ficha_id   UUID          NOT NULL  → asesor_ficha.id  ← se actualiza

asesor_ficha
────────────────────────────────────
PK  id                UUID
    nombre            VARCHAR(100)  NOT NULL
    email             VARCHAR(100)  NOT NULL
```

---

## Contrato de API

**`PUT /fichas-perfil/asesor`**  
Autenticación: JWT del Coordinador.

### Request body — `CambiarAsesorRequest`

```json
{
  "idFicha": "ca3997c5-6dae-417f-8bb0-db721396f59b",
  "idAsesorFicha": "93c1b393-acad-4d4c-8155-99f19a4c7173"
}
```

| Campo          | Tipo | Requerido | Restricciones                          |
|----------------|------|-----------|----------------------------------------|
| `idFicha`      | uuid | ✅        | La ficha debe existir en el sistema    |
| `idAsesorFicha`| uuid | ✅        | Distinto al asesor actual (POL-05)     |

### 204 No Content

Sin cuerpo de respuesta. El cambio fue aplicado exitosamente.

### Errores

| Código | Condición |
|--------|-----------|
| `400`  | Datos inválidos (campos faltantes o formato incorrecto) |
| `404`  | La ficha o el nuevo asesor no existen |
| `409`  | El nuevo asesor es el mismo que el actual (FichaPerfil-POL-05) |

---

## Criterios de aceptación

1. El coordinador puede seleccionar un nuevo asesor para cualquier ficha del sistema.
2. No se puede seleccionar el mismo asesor que ya está asignado a la ficha.
3. Al cambiar exitosamente, se muestra una notificación de éxito y la vista se actualiza.
4. Si el asesor nuevo es igual al actual, se muestra un mensaje de error informativo.
5. Solo el coordinador puede invocar esta operación.

---

## Evento producido

**Asesor Ficha Cambiado**
