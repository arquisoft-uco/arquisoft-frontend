# HU190 — Registrar nueva evaluación de ficha de perfil

## Historia de usuario

**Como** Representante Comité Currículum  
**Necesito** registrar una nueva evaluación de ficha de perfil  
**Para** proveer un mecanismo centralizado con la información de las fichas de trabajo de grado que se deben aprobar, permitiendo posteriormente registrar una aprobación y/o denegación con revisión en tiempo real de manera individual.

---

## Criterios de aceptación

| # | Criterio |
|---|----------|
| 1 | El representante puede iniciar una evaluación desde el tab "Evaluaciones" dentro del detalle de una ficha. |
| 2 | Se presenta un diálogo de confirmación antes de registrar la evaluación. |
| 3 | El sistema envía `POST /representante/evaluaciones-ficha-perfil` con `{ fichaPerfilId }`. El `representanteId` es extraído automáticamente del token JWT por el backend. |
| 4 | Al recibir respuesta `201`, se muestra el ID generado, la fecha de creación y el estado inicial `En Evaluación` como badge. |
| 5 | Si ya existe una evaluación para la misma ficha/representante (409), se muestra mensaje de error claro. |

---

## Contrato de API

### Registrar evaluación

**Endpoint:** `POST /fichas-perfil/representante/evaluaciones-ficha-perfil`

**Request body:**
```json
{
  "fichaPerfilId": "uuid"
}
```
> El `representanteId` se extrae del token JWT (campo `sub`) en el backend.

**Response 201:**
```json
{
  "id": "uuid",
  "fechaCreacion": "04/05/2026 14:30:00",
  "estadoActual": "En Evaluación"
}
```

**Errores:**
- `400` — Datos inválidos.
- `409` — Ya existe una evaluación para esta ficha/representante.

---

## Artefactos implementados

| Archivo | Descripción |
|---------|-------------|
| `models/fichas-perfil.ts` | Interfaz `EvaluacionCreadaResponse { id: string }` |
| `services/fichasPerfilService.ts` | Método `registrarEvaluacion(req)` |
| `hooks/useRegistrarEvaluacion.ts` | `useMutation` que invalida `['evaluacion-representante', fichaPerfilId]` |
| `components/representante/RegistrarEvaluacionPanel.tsx` | Panel con botón "Iniciar evaluación" + `ConfirmDialog` + confirmación visual |
| `components/representante/DetalleFichaRepresentante.tsx` | Tab Evaluaciones reemplaza `ComingSoon` con `RegistrarEvaluacionPanel` |
| `docs/fichas-perfil-openapi.yaml` | Endpoint y schema `EvaluacionCreadaResponse` actualizados con HU190 |

---

## Flujo de UI

```
[Tab Evaluaciones]
  └── Sin evaluación registrada
        ├── Mensaje informativo
        └── Botón "Iniciar evaluación"
              └── ConfirmDialog "¿Iniciar evaluación?"
                    ├── [Confirmar] → POST → muestra tarjeta con ID generado
                    └── [Cancelar]  → cierra el diálogo
  └── Con evaluación registrada
        └── Tarjeta "Evaluación registrada" con ID
```

---

## Políticas de negocio

- `EvaluacionFichaPerfil-POL-1`: Solo fichas en estado "Disponible Para Evaluación" pueden ser evaluadas.
- `EvaluacionFichaPerfil-POL-02`: Un representante no puede tener dos evaluaciones activas para la misma ficha.
