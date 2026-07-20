# HU279 — Consultar todos los estudiantes disponibles

## Historia de usuario

**Como** Coordinador  
**Necesito** consultar la lista de todos los estudiantes disponibles  
**Para** seleccionar estudiantes al registrar una nueva Ficha Perfil o asignar un estudiante adicional.

---

## Precondiciones

- El coordinador está autenticado en el sistema.

---

## Reglas de negocio

- **Estudiante-POL-01**: El listado de estudiantes disponibles es accesible para el Coordinador.
- El resultado no está paginado: se devuelve la lista completa de estudiantes registrados en el sistema.
- Cada estudiante se identifica por `id`, `nombre` y `email`.

---

## Event Storming

```
[Consultar Estudiantes Disponibles]
        │
        ├── Comando desencadenado por: Coordinador
        │
        ▼
(Estudiantes Disponibles Consultados)
        │
        └── ReadModel: Estudiante[] { id, nombre, email }
```

### Actores
- **Coordinador** — usa la lista para seleccionar estudiantes en el formulario de registro de ficha y asignación de estudiantes.

### Política aplicada
| Código | Descripción |
|--------|-------------|
| Estudiante-POL-01 | El Coordinador puede consultar el listado de estudiantes disponibles |

---

## Modelo de dominio enriquecido

```
┌─────────────────────────────────────┐
│           Estudiante                │
│─────────────────────────────────────│
│ + id: UUID                          │
│ + nombre: String                    │
│ + email: String                     │
└─────────────────────────────────────┘
```

---

## Modelo Entidad-Relación

```
estudiante
────────────────────────────────────
PK  id      UUID
    nombre  VARCHAR(100)  NOT NULL
    email   VARCHAR(100)  NOT NULL
```

---

## Contrato de API

**`GET /fichas-perfil/estudiantes`**  
Autenticación: JWT del Coordinador.

### 200 OK — `Estudiante[]`

```json
[
  {
    "id": "7f9b789b-19c6-4a13-8416-f71e281d59e4",
    "nombre": "Alberto Zuluaga Gomez",
    "email": "alberto.zuluaga1234@soyuco.edu.co"
  },
  {
    "id": "9f25825f-2b89-4b84-b149-a2e8599e2b62",
    "nombre": "Yenifer Gomez Palacios",
    "email": "yenifer.gomez1234@soyuco.edu.co"
  }
]
```

| Campo    | Tipo   | Descripción                            |
|----------|--------|----------------------------------------|
| `id`     | uuid   | Identificador único del estudiante     |
| `nombre` | string | Nombre completo del estudiante         |
| `email`  | string | Correo institucional del estudiante    |

---

## Criterios de aceptación

1. El listado incluye todos los estudiantes registrados en el sistema.
2. Cada elemento incluye `id`, `nombre` y `email`.
3. Solo el Coordinador puede invocar este endpoint.
4. La lista se usa para poblar selectores en los formularios de registro y asignación de estudiantes.

---

## Evento producido

**Estudiantes Disponibles Consultados**
