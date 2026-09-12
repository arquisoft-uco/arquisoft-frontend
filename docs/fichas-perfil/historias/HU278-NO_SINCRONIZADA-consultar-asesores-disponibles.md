# HU278 — Consultar todos los asesores de ficha disponibles

## Historia de usuario

**Como** Coordinador
**Necesito** consultar la lista de todos los asesores de ficha disponibles  
**Para** seleccionar un asesor al registrar o modificar una Ficha Perfil.

---

## Precondiciones

- El actor (Coordinador o Asesor Ficha) está autenticado en el sistema.

---

## Reglas de negocio

- **AsesorFicha-POL-01**: El listado de asesores disponibles es accesible para el Coordinador y el Asesor Ficha.
- El resultado no está paginado: se devuelve la lista completa de asesores registrados en el sistema.
- Cada asesor se identifica por `id`, `nombre` y `email`.

---

## Event Storming

```
[Consultar Asesores de Ficha Disponibles]
        │
        ├── Comando desencadenado por: Coordinador | Asesor Ficha
        │
        ▼
(Asesores de Ficha Disponibles Consultados)
        │
        └── ReadModel: Asesor[] { id, nombre, email }
```

### Actores
- **Coordinador** — usa la lista para seleccionar asesor al registrar ficha o al cambiar asesor.
- **Asesor Ficha** — usa la lista para visualizar asesores en el formulario de registro de ficha.

### Política aplicada
| Código | Descripción |
|--------|-------------|
| AsesorFicha-POL-01 | El Coordinador y el Asesor Ficha pueden consultar el listado de asesores |

---

## Modelo de dominio enriquecido

```
┌─────────────────────────────────────┐
│           AsesorFicha               │
│─────────────────────────────────────│
│ + id: UUID                          │
│ + nombre: String                    │
│ + email: String                     │
└─────────────────────────────────────┘
```

---

## Modelo Entidad-Relación

```
asesor_ficha
────────────────────────────────────
PK  id      UUID
    nombre  VARCHAR(100)  NOT NULL
    email   VARCHAR(100)  NOT NULL
```

---

## Contrato de API

**`GET /fichas-perfil/asesores`**  
Autenticación: JWT del Coordinador o Asesor Ficha.

### 200 OK — `Asesor[]`

```json
[
  {
    "id": "98e9a2ec-0d93-420e-b5f5-81bd3b444b92",
    "nombre": "Juan Esteban Salazar Ramirez",
    "email": "juan.salazar1234@soyuco.edu.co"
  },
  {
    "id": "a8a3c9c4-eff8-468c-a6c2-11f533bd9030",
    "nombre": "Camilo Arias Jaramillo",
    "email": "camilo.arias1234@soyuco.edu.co"
  }
]
```

| Campo    | Tipo   | Descripción                         |
|----------|--------|-------------------------------------|
| `id`     | uuid   | Identificador único del asesor      |
| `nombre` | string | Nombre completo del asesor          |
| `email`  | string | Correo institucional del asesor     |

---

## Criterios de aceptación

1. El listado incluye todos los asesores registrados en el sistema.
2. Cada elemento incluye `id`, `nombre` y `email`.
3. El Coordinador y el Asesor Ficha pueden invocar este endpoint.
4. La lista se usa para poblar selectores en los formularios de registro y cambio de asesor.

---

## Evento producido

**Asesores de Ficha Disponibles Consultados**
