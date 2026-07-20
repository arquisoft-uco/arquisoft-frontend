# HU033 — Modificar información de un Ítem

## Historia de usuario

**Como** Estudiante  
**Necesito** modificar el contenido de un ítem de mi ficha de perfil  
**Para** corregir o actualizar la información registrada, garantizando que la ficha refleje con precisión el estado actual del proyecto.

---

## Precondiciones

- La ficha de perfil fue registrada previamente (*Nueva Ficha Perfil Asignada*).
- El estudiante está vinculado a la ficha vía `EstudianteFichaPerfil`.
- El ítem fue agregado previamente (*Ítem Agregado a la Ficha Perfil*).

---

## Reglas de negocio

- Solo el estudiante asignado a la ficha puede modificar sus ítems.
- **Item-POL-01**: Los datos deben ser válidos en tipo de dato, longitud, obligatoriedad, formato y rango.
- **Item-POL-04**: Solo se puede modificar el campo `contenido`; el `tipoItemId` y el `fichaPerfilId` son inmutables.
- El campo `contenido` tiene una longitud mínima de 1 y máxima de 200 caracteres.
- El `itemId` viaja en el request body (no en el path).
- La respuesta exitosa es `204 No Content`; el cliente actualiza el cache local con el `contenido` enviado.

---

## Event Storming

| Elemento | Detalle |
|---|---|
| **Actor** | Estudiante |
| **Comando** | Modificar información de un Ítem |
| **Read Models** | Información Item existente · Información Ficha Perfil |
| **Políticas** | Item-POL-01 · Item-POL-04 |
| **Evento producido** | **Información Ítem Modificada** |
| **Comandos posteriores** | Consultar ítems · Remover ítem · [Asesor] Consultar ítems a asesorar · [Comité] Consultar ítems a aprobar |

---

## Modelo de dominio enriquecido — restricciones de modificación

| Campo | ¿Modificable? | Regla |
|---|---|---|
| `id` | No | Inmutable |
| `fichaPerfilId` | No | Inmutable post-creación |
| `tipoItemId` | **No** | Item-POL-04: cambiar el tipo equivale a remover y crear uno nuevo |
| `contenido` | **Sí** | min 1 · max 200 · limpiar espacios inicio/fin |

---

## Modelo Entidad-Relación

```
FichaPerfil (id) ──< Item (id, fichaPerfilId FK, tipoItemId FK, contenido)

Atributo modificable: contenido
```

---

## Contrato de API

### `PUT /fichas-perfil/estudiante/mi-ficha/items`

Autenticación: JWT del estudiante.

**Request body**
```json
{
  "itemId": "uuid",
  "contenido": "string (1–200 chars)"
}
```

**204 No Content** — modificación exitosa, sin body

El cliente actualiza el cache local usando el `contenido` enviado, sin necesitar respuesta del servidor.

**400 Bad Request** — contenido vacío o > 200 chars  
**403 Forbidden** — el ítem no pertenece a la ficha del estudiante autenticado  
**404 Not Found** — ítem no encontrado

---

## Criterios de aceptación

1. El estudiante puede editar el contenido de un ítem directamente desde la lista.
2. El campo `contenido` no puede estar vacío ni superar 200 caracteres.
3. El tipo de ítem no puede ser modificado desde este endpoint.
4. Tras la modificación exitosa, el ítem refleja el nuevo contenido sin recargar la página.
5. Si el ítem no pertenece a la ficha del estudiante, se muestra un error informativo.

---

## Evento producido

**Información Ítem Modificada**
