# HU206 — Agregar Estado Ficha Perfil

## Historia de usuario

**Como** Asesor Ficha o Estudiante  
**Necesito** Agregar Estado Ficha Perfil  
**Para** facilitar la gestión y seguimiento de las fichas de perfil, asegurando que la información esté actualizada, disponible para la revisión en tiempo real y permitiendo agregar observaciones que respalden la toma de decisiones durante el proceso.

---

## Precondiciones

- El usuario está autenticado con rol Asesor Ficha o Estudiante.
- La ficha perfil sobre la que se actúa existe y está asignada al usuario autenticado.
- El catálogo de estados ficha está disponible (`GET /fichas-perfil/estados-ficha`).
- La ficha perfil **no tiene evaluaciones asignadas** aún.

---

## Reglas de negocio

- Solo se permiten dos estados ficha: **"En Construcción"** y **"Disponible Para Evaluación"**.
- El usuario puede alternar entre estos dos estados — ambas transiciones están permitidas.
- Si la ficha ya tiene evaluaciones asignadas, el cambio de estado **no está permitido** (`409 Conflict`).
- El estudiante actúa sobre su propia ficha enviando su `fichaPerfilId` en el cuerpo.
- El asesor actúa sobre una ficha que le ha sido asignada enviando su `fichaPerfilId` en el cuerpo.
- En ambos casos, la operación registra un nuevo `EstadoFichaPerfil` con la fecha y hora del cambio.

---

## Event Storming

```
[Agregar Estado Ficha Perfil]
        │  fichaPerfilId + estadoFichaId
        ▼
(Nuevo Estado Ficha Perfil Agregado)
        │
        ├── Command: AgregarEstadoFichaPerfil
        ├── Policy: EstadoFichaPerfil-POL-01 a POL-06
        └── Event: EstadoFichaPerfilAgregado { fichaPerfilId, estadoFichaId, fechaActualizacion }
```

### Actores
- **Estudiante** — cambia el estado de su propia ficha.
- **Asesor Ficha** — cambia el estado de una ficha que asesora.

### Políticas aplicadas
- **EstadoFichaPerfil-POL-01**: Solo el estudiante dueño o el asesor asignado pueden cambiar el estado.
- **EstadoFichaPerfil-POL-02**: Solo se permiten los estados "En Construcción" y "Disponible Para Evaluación".
- **EstadoFichaPerfil-POL-03**: No se puede cambiar el estado si la ficha ya tiene evaluaciones asignadas.
- **EstadoFichaPerfil-POL-04**: El cambio queda registrado con fecha y hora en `EstadoFichaPerfil`.
- **EstadoFichaPerfil-POL-05**: El nuevo estado no puede ser igual al estado ficha del registro más reciente.
- **EstadoFichaPerfil-POL-06**: Ambos actores envían `fichaPerfilId` y `estadoFichaId` en el cuerpo; el backend valida el rol del token y el acceso a la ficha.

---

## Modelo de dominio enriquecido

```
┌─────────────────────────────────┐
│         FichaPerfil             │  ← Aggregate Root
│─────────────────────────────────│
│ + id: UUID                      │
│ + tituloProyecto: String[1-100] │
│ + estudianteId: UUID            │
│ + asesorFichaId: UUID           │
└──────────────┬──────────────────┘
               │ 1:N
               ▼
┌─────────────────────────────────┐
│       EstadoFichaPerfil         │  ← Entity
│─────────────────────────────────│
│ + id: UUID                      │
│ + fichaPerfilId: UUID           │
│ + estadoFichaId: UUID           │
│ + fechaActualizacion: DateTime  │
└──────────────┬──────────────────┘
               │ N:1
               ▼
┌─────────────────────────────────┐
│          EstadoFicha            │  ← Value Object (catálogo)
│─────────────────────────────────│
│ + id: UUID                      │
│ + nombre: String                │  "En Construcción" | "Disponible Para Evaluación"
└─────────────────────────────────┘
```

### Invariantes
- Cada cambio de estado crea un nuevo registro `EstadoFichaPerfil` — no se sobreescribe el anterior.
- Solo se aceptan `estadoFichaId` que correspondan a "En Construcción" o "Disponible Para Evaluación".
- Si la ficha tiene evaluaciones, el agregado rechaza el comando.

---

## Modelo Entidad-Relación

```
estado_ficha_perfil
────────────────────────────────
PK  id                    UUID
FK  ficha_perfil_id        UUID    NOT NULL  → ficha_perfil.id
FK  estado_ficha_id        UUID    NOT NULL  → estado_ficha.id
    fecha_actualizacion   TIMESTAMP NOT NULL DEFAULT now()

estado_ficha
────────────────────────────────
PK  id      UUID
    nombre  VARCHAR(20)   NOT NULL
```

**Relaciones:**
- `estado_ficha_perfil.ficha_perfil_id → ficha_perfil.id` (N:1)
- `estado_ficha_perfil.estado_ficha_id → estado_ficha.id` (N:1)

---

## Contrato de API

**`POST /fichas-perfil/estados`**  
Autenticación: JWT (roles: Estudiante, Asesor Ficha).

> Endpoint único para ambos actores. El backend determina el rol del token y valida el acceso.

#### Request body — `AgregarEstadoFichaPerfilRequest`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `fichaPerfilId` | uuid | ✅ | ID de la ficha perfil a actualizar |
| `estadoFichaId` | uuid | ✅ | ID del estado ficha a asignar (solo "En Construcción" o "Disponible Para Evaluación") |

```json
{
  "fichaPerfilId": "10c355a4-56d0-484e-aa0d-8823e0a782cf",
  "estadoFichaId": "a1b2c3d4-0000-0000-0000-000000000002"
}
```

#### 201 Created — `EstadoFichaPerfil`

Retorna únicamente el registro recién creado.

```json
{
  "id": "f1f2f3f4-aaaa-bbbb-cccc-000000000002",
  "fichaPerfilId": "10c355a4-56d0-484e-aa0d-8823e0a782cf",
  "estadoFichaId": "a1b2c3d4-0000-0000-0000-000000000002",
  "fechaActualizacion": "2026-04-28T10:35:00Z"
}
```

**400 Bad Request** — campos requeridos ausentes o `estadoFichaId` no corresponde a un estado permitido.  
**403 Forbidden** — la ficha no está asignada al usuario autenticado (aplica al asesor).  
**404 Not Found** — la ficha perfil no existe.  
**409 Conflict** — la ficha ya tiene evaluaciones asignadas o el estado enviado es igual al estado actual.
```

**400 Bad Request** — campos requeridos ausentes o `estadoFichaId` no válido.  
**403 Forbidden** — la ficha no está asignada al asesor autenticado.  
**404 Not Found** — la ficha perfil no existe.  
**409 Conflict** — la ficha ya tiene evaluaciones asignadas o el estado enviado es igual al actual.

---

## Criterios de aceptación

1. El estudiante puede cambiar el estado de su ficha a "En Construcción" o "Disponible Para Evaluación".
2. El asesor puede cambiar el estado de una ficha que asesora a "En Construcción" o "Disponible Para Evaluación".
3. Si la ficha ya tiene evaluaciones asignadas, el servidor retorna `409 Conflict` y el estado no cambia.
4. Si el `estadoFichaId` enviado no corresponde a "En Construcción" ni "Disponible Para Evaluación", el servidor retorna `400 Bad Request`.
5. Si el estado enviado es igual al estado ficha del registro más reciente, el servidor retorna `409 Conflict`.
6. El cambio queda registrado con fecha y hora en `EstadoFichaPerfil`.
7. El asesor no puede cambiar el estado de fichas que no le han sido asignadas (`403 Forbidden`).

---

## Evento producido

**Nuevo Estado Ficha Perfil Agregado**
