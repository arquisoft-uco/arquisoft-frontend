# HU182 — Consultar información de evaluación de ficha de perfil generada

## Historia de usuario

**Como** Representante Comité Currículum  
**Necesito** consultar la información de la evaluación de ficha de perfil generada  
**Para** proveer un mecanismo centralizado con la información de las fichas de trabajo de grado que se deben aprobar, permitiendo la revisión en tiempo real de manera individual.

---

## Criterios de aceptación

| # | Criterio |
|---|----------|
| 1 | Al abrir el tab "Evaluaciones" del detalle de una ficha, el sistema consulta automáticamente si existe una evaluación registrada. |
| 2 | Si existe evaluación (200), se muestra tarjeta con ID, fecha de creación y badge con el estado actual. |
| 3 | Si no existe evaluación (404), se muestra el botón "Iniciar evaluación" (flujo HU190). |
| 4 | Durante la carga se muestra un spinner. |
| 5 | Ante error de servidor (distinto de 404), se muestra mensaje de error. |

---

## Contrato de API

### Consultar evaluación de ficha

**Endpoint:** `GET /fichas-perfil/representante/evaluacion?fichaPerfilId={uuid}`

> El `representanteId` se extrae del token JWT (campo `sub`) en el backend.

**Response 200:**
```json
{
  "id": "uuid",
  "representanteComiteId": "uuid",
  "fichaPerfilId": "uuid",
  "fechaCreacion": "04/05/2026 14:30:00",
  "estadoActual": "En Evaluación"
}
```

**Errores:**
- `404` — No existe evaluación para esta ficha/representante (se trata como estado vacío, no como error de UI).

---

## Artefactos implementados

| Archivo | Descripción |
|---------|-------------|
| `models/fichas-perfil.ts` | `EvaluacionFichaPerfil` ampliado con `estadoActual: string` y `fechaCreacion: string` en formato `DD/MM/YYYY HH:mm:ss` |
| `services/fichasPerfilService.ts` | Método `getEvaluacionFicha(fichaPerfilId)` |
| `hooks/useEvaluacionFicha.ts` | `useQuery` — 404 retorna `undefined`; otros errores propagan |
| `components/representante/RegistrarEvaluacionPanel.tsx` | Integra `useEvaluacionFicha`: muestra tarjeta si hay datos del servidor, botón si 404 |
| `docs/fichas-perfil-openapi.yaml` | Endpoint GET `/fichas-perfil/representante/evaluacion` con tag HU182; schema `EvaluacionFichaPerfil` actualizado |

---

## Flujo de UI

```
[Tab Evaluaciones]
  ├── Cargando          → spinner
  ├── 200 (con datos)   → tarjeta: ID · fecha de creación · badge estado
  ├── 404 (sin datos)   → botón "Iniciar evaluación" (flujo HU190)
  └── Otro error        → mensaje de error
```

---

## Políticas de negocio

- `EvaluacionFichaPerfil-POL-1`: El representante solo puede consultar evaluaciones de fichas que le fueron asignadas.
