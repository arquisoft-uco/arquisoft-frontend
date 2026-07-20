# HU036 — Consultar todos los estados ficha

## Historia de usuario

**Como** Estudiante o Representante Comité Currículum o Asesor Ficha  
**Necesito** Consultar todos los estados ficha  
**Para** gestionar de manera integral la formulación de la ficha de perfil, incluyendo la modificación del título, alcance, objetivos, pregunta de investigación y otros ítems relevantes, garantizando que la ficha refleje con precisión el proyecto y facilite su revisión y seguimiento en tiempo real.

---

## Precondiciones

- El usuario está autenticado en el sistema con alguno de los roles: Estudiante, Representante Comité Currículum o Asesor Ficha.

---

## Reglas de negocio

- Se retornan **todos** los estados ficha disponibles en el catálogo del sistema, sin filtros.
- El resultado no está paginado — es una lista completa de referencia.
- Si no hay estados registrados, se retorna una lista vacía (no error).
- Este endpoint es de solo lectura; ningún actor puede modificar el catálogo de estados ficha a través de él.

---

## Event Storming

```
[Consultar Todos los Estados Ficha]
        │  (sin parámetros)
        ▼
(Todos los Estados Ficha Consultados)
        │
        └── ReadModel: EstadoFicha { id, nombre, descripcion }
```

### Actores
- **Estudiante** — para seleccionar el estado al agregar un estado ficha perfil.
- **Asesor Ficha** — para seleccionar el estado al agregar un estado ficha perfil.
- **Representante Comité Currículum** — para seleccionar el estado al registrar una evaluación o aprobación.

### Política aplicada
- No aplican restricciones de acceso por actor — cualquier usuario autenticado con los roles indicados puede consultar el catálogo.

---

## Modelo de dominio enriquecido

```
┌─────────────────────────────────┐
│          EstadoFicha            │  ← Value Object (catálogo)
│─────────────────────────────────│
│ + id: UUID                      │
│ + nombre: String[1-20]          │
│ + descripcion: String[1-200]    │
└─────────────────────────────────┘
```

### Invariantes
- `EstadoFicha` es un catálogo administrado por el sistema — no se crea ni modifica desde este endpoint.
- El catálogo contiene exactamente 5 estados: **En Construcción**, **Disponible Para Evaluación**, **Aprobada**, **Aprobada Con Observaciones**, **No Aprobada**.
- Los estados "Aprobada", "Aprobada Con Observaciones" y "No Aprobada" solo los asigna el Representante Comité Currículum.
- Los estados "En Construcción" y "Disponible Para Evaluación" los asignan el Estudiante o el Asesor Ficha.

---

## Modelo Entidad-Relación

```
estado_ficha
────────────────────────────────
PK  id           UUID
    nombre       VARCHAR(20)   NOT NULL
    descripcion  VARCHAR(200)
```

---

## Contrato de API

**`GET /fichas-perfil/estados-ficha`**  
Autenticación: JWT (roles: Estudiante, Representante Comité Currículum, Asesor Ficha).

### Parámetros
Ninguno.

### 200 OK — `EstadoFicha[]`

```json
[
  {
    "id": "a1b2c3d4-0000-0000-0000-000000000001",
    "nombre": "En Construcción",
    "descripcion": "Se refiere a que la ficha de perfil se encuentra en construcción o desarrollo."
  },
  {
    "id": "a1b2c3d4-0000-0000-0000-000000000002",
    "nombre": "Disponible Para Evaluación",
    "descripcion": "Se refiere a que la ficha de perfil se encuentra disponible para ser evaluada por los representantes del comité de currículum."
  },
  {
    "id": "a1b2c3d4-0000-0000-0000-000000000003",
    "nombre": "Aprobada",
    "descripcion": "Se refiere a que la ficha de perfil pasó por revisión del comité de currículum y tuvo una calificación mayor de 3.0."
  },
  {
    "id": "a1b2c3d4-0000-0000-0000-000000000004",
    "nombre": "Aprobada Con Observaciones",
    "descripcion": "Se refiere a que la ficha de perfil pasó por la revisión del comité de currículum, pero debe ser revisada debido a que necesita una mejora."
  },
  {
    "id": "a1b2c3d4-0000-0000-0000-000000000005",
    "nombre": "No Aprobada",
    "descripcion": "Se refiere a que la ficha de perfil pasó por la revisión del comité de currículum, pero no obtuvo una calificación mayor a 3.0."
  }
]
```

---

## Criterios de aceptación

1. El sistema retorna la lista completa de estados ficha registrados en el catálogo.
2. Cada estado incluye `id`, `nombre` y `descripcion`.
3. Si no hay estados en el catálogo, se retorna una lista vacía sin error.
4. Solo usuarios autenticados con los roles indicados pueden consumir el endpoint.

---

## Evento producido

**Todos los Estados Ficha Consultados**
