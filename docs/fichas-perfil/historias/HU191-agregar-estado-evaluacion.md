# HU191 — Agregar información de un nuevo Estado Evaluación Ficha

## Historia de usuario

**Como** Representante Comité Currículum  
**Necesito** Agregar información de un nuevo Estado Evaluación Ficha  
**Para** Proveer un mecanismo centralizado con la información de las fichas de trabajo de grado que se deben aprobar, para posteriormente registrar una aprobación y/o denegación, permitiendo la revisión en tiempo real de manera individual.

---

## Criterios de aceptación

| # | Criterio |
|---|----------|
| 1 | El panel solo es visible cuando ya existe una evaluación registrada para la ficha. |
| 2 | El selector muestra únicamente los estados válidos de destino: **Aprobada**, **Aprobada Con Observaciones** y **No Aprobada**. No se muestran "En Evaluación" ni "Descartada". |
| 3 | Al confirmar, se envía `POST /fichas-perfil/representante/evaluaciones/estados` con `evaluacionFichaPerfilId` y `estadoEvaluacionId`. |
| 4 | El campo `evaluacionFichaPerfilId` y `estadoEvaluacionId` se envían en el body, sin path variable. |
| 5 | Tras el éxito, la query `evaluacion-representante` se invalida para reflejar el nuevo estado. |
| 6 | Si el botón se presiona sin seleccionar un estado, permanece deshabilitado. |
| 7 | Durante la mutación el botón muestra "Registrando..." y queda deshabilitado. |
| 8 | Un `ConfirmDialog` pide confirmación antes de ejecutar la mutación. |
| 9 | La `fechaActualizacion` de la respuesta se muestra en formato `DD/MM/YYYY HH:mm:ss` tal como llega del servidor. |

---

## Contrato de API

**Endpoint:** `POST /fichas-perfil/representante/evaluaciones/estados`

**Request body:**
```json
{
  "evaluacionFichaPerfilId": "c3d9a1b2-1234-5678-abcd-ef0123456789",
  "estadoEvaluacionId": "0a70777b-8a41-430c-b12f-78d6a4fee14f"
}
```

**Response 201:**
```json
{
  "id": "a1b2c3d4-0000-1111-2222-333344445555",
  "evaluacionFichaPerfilId": "c3d9a1b2-1234-5678-abcd-ef0123456789",
  "estadoEvaluacionId": "0a70777b-8a41-430c-b12f-78d6a4fee14f",
  "fechaActualizacion": "04/05/2026 10:30:00"
}
```

---

## Artefactos implementados

| Archivo | Descripción |
|---------|-------------|
| `models/fichas-perfil.ts` | `AgregarEstadoEvaluacionRequest` con campos `evaluacionFichaPerfilId` y `estadoEvaluacionId` |
| `services/fichasPerfilService.ts` | Método `agregarEstadoEvaluacion(req)` → `POST /fichas-perfil/representante/evaluaciones/estados` |
| `hooks/useAgregarEstadoEvaluacion.ts` | `useMutation` con `invalidateQueries` a `['evaluacion-representante', fichaPerfilId]` |
| `components/representante/AgregarEstadoEvaluacionPanel.tsx` | Selector de estado + botón "Registrar estado" + `ConfirmDialog` |
| `components/representante/RegistrarEvaluacionPanel.tsx` | Integra `AgregarEstadoEvaluacionPanel` cuando hay evaluación activa, antes de `EstadosEvaluacionPanel` |
| `docs/fichas-perfil-openapi.yaml` | Path `POST /fichas-perfil/representante/evaluaciones/estados` con tag HU191, schema `AgregarEstadoEvaluacionRequest` actualizado |
