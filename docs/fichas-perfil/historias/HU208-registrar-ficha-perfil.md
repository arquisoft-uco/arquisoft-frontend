# HU208 — Registrar Nueva información Ficha Perfil

## Historia de usuario

**Como** Asesor Ficha o Coordinador  
**Necesito** registrar una nueva Ficha de Perfil  
**Para** facilitar la gestión y seguimiento de las fichas de perfil, asegurando que la información esté actualizada, disponible para la revisión en tiempo real y permitiendo agregar observaciones que respalden la toma de decisiones durante el proceso.

---

## Precondiciones

- El actor (Asesor Ficha o Coordinador) está autenticado en el sistema.
- El `idAsesorFicha` referencia a un asesor existente en el sistema.
- Los `idEstudiantes` referencian estudiantes existentes y disponibles (sin ficha asignada activa).

---

## Reglas de negocio

- **FichaPerfil-POL-01**: Solo el Asesor Ficha y el Coordinador pueden registrar fichas.
- **FichaPerfil-POL-02**: El `titulo` del proyecto debe ser único en el sistema.
- **FichaPerfil-POL-03**: Se deben asignar entre **1 y 3 estudiantes** por ficha. No se permiten listas vacías ni de más de 3.
- **FichaPerfil-POL-04**: No se puede asignar el mismo estudiante más de una vez en la misma ficha (`idEstudiantes` sin duplicados).
- Al registrar la ficha, el sistema crea automáticamente el primer `EstadoFichaPerfil` con el estado inicial (*En elaboración*).

---

## Event Storming

```
[Registrar Nueva Ficha Perfil]
        │
        ├── Comando desencadenado por: Asesor Ficha | Coordinador
        │
        ▼
(Nueva Ficha Perfil Asignada)
        │
        ├── Agrega: FichaPerfil { id, titulo, asesorFichaId }
        ├── Agrega: EstudianteFichaPerfil × N (1–3)
        └── Agrega: EstadoFichaPerfil { estado: 'En elaboración' }
```

### Políticas aplicadas
| Código | Descripción |
|--------|-------------|
| FichaPerfil-POL-01 | Solo Asesor Ficha o Coordinador pueden registrar fichas |
| FichaPerfil-POL-02 | El título debe ser único en el sistema |
| FichaPerfil-POL-03 | Entre 1 y 3 estudiantes por ficha |
| FichaPerfil-POL-04 | No se permite el mismo estudiante más de una vez en la misma ficha |

---

## Modelo de dominio enriquecido

```
┌─────────────────────────────────────┐
│           FichaPerfil               │  ← Aggregate Root
│─────────────────────────────────────│
│ + id: UUID                          │
│ + titulo: String[1–100]   (UNIQUE)  │
│ + asesorFichaId: UUID               │
└──────────┬───────────────┬──────────┘
           │ 1:N           │ N:1
           ▼               ▼
┌──────────────────┐  ┌──────────────────────┐
│EstudianteFicha   │  │    AsesorFicha        │
│Perfil            │  │──────────────────────│
│──────────────────│  │+ id: UUID            │
│+ id: UUID        │  │+ nombre: String      │
│+ fichaPerfilId   │  │+ email: String       │
│+ estudianteId    │  └──────────────────────┘
└──────────────────┘
           │ N:1
           ▼
┌──────────────────┐
│   Estudiante     │
│──────────────────│
│+ id: UUID        │
│+ nombre: String  │
│+ email: String   │
└──────────────────┘
```

### Invariantes
- Una `FichaPerfil` nace con 1–3 `EstudianteFichaPerfil`.
- El título es único en todo el bounded context.
- La ficha siempre inicia con un `EstadoFichaPerfil` de estado *En elaboración*.

---

## Modelo Entidad-Relación

```
ficha_perfil
────────────────────────────────────
PK  id                UUID
    titulo_proyecto   VARCHAR(100)  NOT NULL  UNIQUE
FK  asesor_ficha_id   UUID          NOT NULL  → asesor_ficha.id

estudiante_ficha_perfil
────────────────────────────────────
PK  id                UUID
FK  ficha_perfil_id   UUID          NOT NULL  → ficha_perfil.id
FK  estudiante_id     UUID          NOT NULL  → estudiante.id
    UNIQUE (ficha_perfil_id, estudiante_id)

estado_ficha_perfil
────────────────────────────────────
PK  id                UUID
FK  ficha_perfil_id   UUID          NOT NULL  → ficha_perfil.id
FK  estado_ficha_id   UUID          NOT NULL  → estado_ficha.id
    fecha_actualizacion TIMESTAMP   NOT NULL
```

---

## Contrato de API

**`POST /fichas-perfil`**  
Autenticación: JWT del Asesor Ficha o Coordinador.

### Request body — `RegistrarFichaPerfilRequest`

```json
{
  "titulo": "Arquisoft",
  "idAsesorFicha": "17e9008b-e443-461a-af3d-794b243f90ba",
  "idEstudiantes": ["cf9b2474-bb4d-4fbc-80c2-5ba2f46eeff3"]
}
```

| Campo          | Tipo     | Requerido | Restricciones                        |
|----------------|----------|-----------|--------------------------------------|
| `titulo`       | string   | ✅        | 1–100 caracteres, único              |
| `idAsesorFicha`| uuid     | ✅        | Debe existir en `asesor_ficha`       |
| `idEstudiantes`| uuid[]   | ✅        | 1–3 elementos, sin duplicados        |

### 201 Created — `FichaPerfilCreadaResponse`

```json
{
  "id": "4c0d4551-6e5e-4c91-9f5c-ffbdf4db43fb"
}
```

### Errores

| Código | Condición |
|--------|-----------|
| `400`  | Datos inválidos (título vacío, `idEstudiantes` fuera de rango) |
| `409`  | El título ya existe en el sistema (FichaPerfil-POL-02) |

---

## Criterios de aceptación

1. El formulario permite ingresar título, seleccionar asesor y agregar entre 1 y 3 estudiantes.
2. No se puede enviar el formulario con título vacío, sin asesor o sin al menos 1 estudiante.
3. El selector de estudiantes no permite seleccionar el mismo estudiante dos veces.
4. Al registrar exitosamente, se muestra una notificación de éxito y el listado se actualiza.
5. Si el título ya existe, se muestra un mensaje de error informativo.
6. El campo asesor es de solo lectura cuando el actor es el Asesor Ficha (se usa su propio ID).

---

## Evento producido

**Nueva Ficha Perfil Asignada**
