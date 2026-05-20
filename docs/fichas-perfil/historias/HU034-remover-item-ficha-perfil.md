# HU034 — Remover información de un Ítem

## Historia de usuario

**Como** Estudiante  
**Necesito** remover un ítem de mi ficha de perfil  
**Para** eliminar información incorrecta o desactualizada, manteniendo la ficha alineada con la realidad del proyecto.

---

## Precondiciones

- La ficha de perfil fue registrada previamente (*Nueva Ficha Perfil Asignada*).
- El estudiante está vinculado a la ficha vía `EstudianteFichaPerfil`.
- El ítem fue agregado previamente (*Ítem Agregado a la Ficha Perfil*).

---

## Reglas de negocio

- Solo el estudiante asignado a la ficha puede remover sus ítems.
- **Item-POL-01**: Los datos deben ser válidos en tipo de dato, longitud, obligatoriedad, formato y rango.
- **Item-POL-05**: **No se puede remover un ítem que ya tiene al menos una `RevisionItem` generada por el asesor.** El backend retorna `409 Conflict` en ese caso.
- El `itemId` viaja como parámetro de path.
- La respuesta exitosa es `204 No Content`.

---

## Event Storming

| Elemento | Detalle |
|---|---|
| **Actor** | Estudiante |
| **Comando** | Remover información de un Ítem |
| **Read Models** | Información Item · Información Revisión Item (verificar si tiene revisión) |
| **Políticas** | Item-POL-01 · Item-POL-05 |
| **Evento producido** | **Información Ítem Removida** |
| **Comandos posteriores** | ninguno |

---

## Modelo de dominio enriquecido — restricción de eliminación

> **Item-POL-05**: Si existe al menos un registro `RevisionItem` con `itemId` igual al ítem a remover, la operación es rechazada con `409 Conflict`. La eliminación solo es posible si el ítem no ha sido revisado por el asesor.

---

## Modelo Entidad-Relación

```
FichaPerfil (id) ──< Item (id, fichaPerfilId FK, tipoItemId FK, contenido)
Item (id)        ──< RevisionItem (id, itemId FK, estadoRevisionId FK, fechaCreacion)

Restricción: no se puede eliminar Item si EXISTS RevisionItem WHERE itemId = Item.id
```

---

## Contrato de API

### `DELETE /fichas-perfil/estudiante/mi-ficha/items/{itemId}`

Autenticación: JWT del estudiante.

**Path param**: `itemId` — UUID del ítem a remover

**204 No Content** — eliminación exitosa  
**403 Forbidden** — el ítem no pertenece a la ficha del estudiante autenticado  
**404 Not Found** — ítem no encontrado  
**409 Conflict** — el ítem tiene revisiones generadas por el asesor (Item-POL-05)

---

## Criterios de aceptación

1. El estudiante puede remover un ítem desde la lista de ítems de su ficha.
2. Si el ítem tiene revisiones del asesor, la operación es rechazada y se muestra un mensaje explicativo.
3. Tras la eliminación exitosa, el ítem desaparece de la lista sin recargar la página.
4. Si el ítem no pertenece a la ficha del estudiante, se muestra un error informativo.

---

## Evento producido

**Información Ítem Removida**
