# HU186 — Consultar información de todos los estados disponibles para las evaluaciones de ficha de perfil

## Historia de usuario

**Como** Representante Comité Currículum  
**Necesito** consultar todos los estados disponibles para las evaluaciones de ficha de perfil  
**Para** las evaluaciones de ficha de perfil para Proveer un mecanismo centralizado con la información de las fichas de trabajo de grado que se deben aprobar, para posteriormente registrar una aprobación y/o denegación, permitiendo la revisión en tiempo real de manera individual.

---

## Criterios de aceptación

| # | Criterio |
|---|----------|
| 1 | El sistema retorna los 5 estados de evaluación disponibles. |
| 2 | Cada estado muestra su nombre y descripción. |
| 3 | El nombre de cada estado se presenta como badge con color semántico (verde, amarillo, rojo, azul, gris). |
| 4 | Los estados se muestran en el tab "Evaluaciones" del detalle de una ficha, debajo de la tarjeta de evaluación. |
| 5 | Durante la carga se muestra un skeleton animado. |

---

## Contrato de API

**Endpoint:** `GET /fichas-perfil/estados-evaluacion`

**Response 200:**
```json
[
  {
    "id": "0a70777b-8a41-430c-b12f-78d6a4fee14f",
    "nombre": "Aprobada",
    "descripcion": "La ficha de perfil pasó por revisión de un representante del comité de currículum y fue aprobada."
  },
  {
    "id": "d0db58ec-341d-4025-a961-3dfb18b4910e",
    "nombre": "Aprobada Con Observaciones",
    "descripcion": "La ficha de perfil pasó por revisión de un representante del comité de currículum y fue aprobada con observaciones."
  },
  {
    "id": "56f001cb-d57f-4469-99f6-dad5e8b81a56",
    "nombre": "No Aprobada",
    "descripcion": "La ficha de perfil pasó por revisión de un representante del comité de currículum y no fue aprobada."
  },
  {
    "id": "8317e6d5-fcb5-4b31-871f-83f43e8a9feb",
    "nombre": "En Evaluación",
    "descripcion": "La ficha de perfil se encuentra en evaluación por un representante del comité del currículum."
  },
  {
    "id": "36a26082-caa3-4a66-bd78-810ac7774a29",
    "nombre": "Descartada",
    "descripcion": "La ficha de perfil pasó por revisión de un representante del comité de currículum y fue descartada."
  }
]
```

---

## Catálogo de estados

| ID | Nombre | Descripción |
|----|--------|-------------|
| `0a70777b-8a41-430c-b12f-78d6a4fee14f` | Aprobada | La ficha pasó por revisión y fue aprobada. |
| `d0db58ec-341d-4025-a961-3dfb18b4910e` | Aprobada Con Observaciones | La ficha fue aprobada pero con observaciones. |
| `56f001cb-d57f-4469-99f6-dad5e8b81a56` | No Aprobada | La ficha no fue aprobada. |
| `8317e6d5-fcb5-4b31-871f-83f43e8a9feb` | En Evaluación | La ficha se encuentra en proceso de evaluación. |
| `36a26082-caa3-4a66-bd78-810ac7774a29` | Descartada | La evaluación fue descartada para no tenerla en cuenta. |

---

## Artefactos implementados

| Archivo | Descripción |
|---------|-------------|
| `services/fichasPerfilService.ts` | Método `getEstadosEvaluacion()` → `GET /fichas-perfil/estados-evaluacion` |
| `hooks/useEstadosEvaluacion.ts` | `useQuery` con `staleTime: Infinity` (catálogo estático) |
| `components/representante/EstadosEvaluacionPanel.tsx` | Lista de estados con badge de color semántico por nombre |
| `components/representante/RegistrarEvaluacionPanel.tsx` | Integra `EstadosEvaluacionPanel` debajo de la tarjeta/botón de evaluación |
| `docs/fichas-perfil-openapi.yaml` | Path `/fichas-perfil/estados-evaluacion` con tag HU186 y ejemplo de respuesta |
