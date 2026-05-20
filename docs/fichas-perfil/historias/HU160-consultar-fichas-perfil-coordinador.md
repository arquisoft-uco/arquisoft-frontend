# HU160 — Consultar información de una Ficha Perfil generada por el Coordinador

## Historia de usuario

**Como** Coordinador  
**Necesito** consultar la información de las Fichas de Perfil que he generado  
**Para** gestionar de manera centralizada los proyectos de grado y fichas de perfil bajo mi responsabilidad, permitiendo la incorporación de nuevos proyectos y el monitoreo continuo de evaluaciones para garantizar un control académico efectivo.

---

## Precondiciones

- Existen fichas de perfil registradas en el sistema (*Nueva Ficha Perfil Asignada*).
- El coordinador está autenticado en el sistema.

---

## Reglas de negocio

- Se listan únicamente las fichas de perfil registradas en el sistema (sin filtro por coordinador, pues el rol tiene visibilidad total).
- El resultado se devuelve paginado: por defecto **página 0**, tamaño **10 fichas**.
- Cada ficha incluye su asesor con nombre y correo para identificación rápida.
- El campo de respuesta para el título es `titulo` (alias de `titulo_proyecto` en la capa de presentación).

---

## Event Storming

```
[Consultar Fichas Perfil]
        │
        ▼
(Información de Fichas Perfil Generadas por Coordinador Consultadas)
        │
        ├── ReadModel: FichaPerfilResumen { id, titulo, asesor { id, nombre, email } }
        └── Política: FichaPerfil-POL-01 — Solo el Coordinador puede consultar el listado completo
```

### Actores
- **Coordinador** — desencadena el comando.

### Política aplicada
- **FichaPerfil-POL-01**: El acceso al listado general de fichas está restringido al rol Coordinador.

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
               │ N:1
               ▼
┌─────────────────────────────────┐
│          AsesorFicha            │  ← Entity (identidad externa)
│─────────────────────────────────│
│ + id: UUID                      │
│ + nombre: String                │
│ + email: String                 │
└─────────────────────────────────┘
```

### Invariantes
- Una `FichaPerfil` siempre tiene exactamente un `AsesorFicha` asignado.
- El listado devuelve una proyección `FichaPerfilResumen` (no el agregado completo).

---

## Modelo Entidad-Relación

```
ficha_perfil
────────────────────────────────
PK  id               UUID
    titulo_proyecto  VARCHAR(100)  NOT NULL  UNIQUE
FK  asesor_ficha_id  UUID          NOT NULL

asesor_ficha
────────────────────────────────
PK  id               UUID
    nombre           VARCHAR(50)   NOT NULL
    email            VARCHAR(50)   NOT NULL
```

**Relación:** `ficha_perfil.asesor_ficha_id → asesor_ficha.id` (N:1)

---

## Contrato de API

**`GET /fichas-perfil/coordinador`**  
Autenticación: JWT del coordinador.

### Query parameters

| Parámetro | Tipo    | Defecto | Descripción             |
|-----------|---------|---------|-------------------------|
| `page`    | integer | `0`     | Número de página (0-based) |
| `size`    | integer | `10`    | Fichas por página       |

### 200 OK — `Page<FichaPerfilResumen>`

```json
{
  "content": [
    {
      "id": "10c355a4-56d0-484e-aa0d-8823e0a782cf",
      "titulo": "Arquisoft",
      "asesor": {
        "id": "98e9a2ec-0d93-420e-b5f5-81bd3b444b92",
        "nombre": "Juan Esteban Salazar Ramirez",
        "email": "juan.salazar1234@soyuco.edu.co"
      }
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

**400 Bad Request** — parámetros de paginación inválidos.

---

## Criterios de aceptación

1. El coordinador visualiza el listado de fichas de perfil paginado con máximo 10 registros por página.
2. Cada fila muestra: título del proyecto y nombre + correo del asesor asignado.
3. El componente permite navegar entre páginas con controles de paginación.
4. Si no existen fichas registradas, se muestra un estado vacío informativo.
5. El coordinador puede refrescar el listado manualmente.

---

## Evento producido

**Información de Fichas Perfil Generadas por Coordinador Consultadas**
