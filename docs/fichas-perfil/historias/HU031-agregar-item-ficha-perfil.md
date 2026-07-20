# HU031 — Agregar Ítem a Ficha Perfil

## Historia de usuario

**Como** Estudiante  
**Necesito** agregar un ítem a mi ficha de perfil  
**Para** gestionar de manera integral la formulación de la ficha, registrando el título, alcance, objetivos, pregunta de investigación y otros ítems relevantes que garanticen que la ficha refleje con precisión el proyecto.

---

## Precondiciones

- La ficha de perfil fue registrada previamente (*Nueva Ficha Perfil Asignada*).
- El estudiante está vinculado a la ficha vía `EstudianteFichaPerfil` (*Estudiante asignado a Ficha Perfil*).
- Existen `TipoItem` registrados en el catálogo (`GET /tipos-item`).

---

## Reglas de negocio

- Solo el estudiante asignado a la ficha puede agregar ítems.
- **Item-POL-1**: Los datos deben ser válidos en tipo de dato, longitud, obligatoriedad, formato y rango.
- **Item-POL-02**: No se puede repetir el mismo `TipoItem` en una misma ficha de perfil (`UNIQUE(fichaPerfilId, tipoItemId)`).
- **Item-POL-03**: Debe existir una ficha de perfil válida asociada al ítem.
- El campo `contenido` tiene una longitud mínima de 1 y máxima de 200 caracteres.
- El campo `fichaPerfilId` se incluye en el request body (no en el path); el backend lo valida contra la ficha del estudiante autenticado.

---

## Event Storming

| Elemento | Detalle |
|---|---|
| **Actor** | Estudiante |
| **Comando** | Agregar Ítem a Ficha Perfil |
| **Read Models** | Información Ficha Perfil · Información Tipo Item (catálogo) |
| **Políticas** | Item-POL-1 · Item-POL-02 · Item-POL-03 |
| **Evento producido** | **Ítem Agregado a la Ficha Perfil** |
| **Comandos posteriores** | Consultar ítems · Modificar ítem · Remover ítem · [Asesor] Consultar ítems a asesorar |

---

## Modelo de dominio enriquecido — `Item`

| Atributo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| `id` | UUID | Sí (autogenerado) | Inmutable |
| `tipoItemId` | UUID | Sí | Referencia a `TipoItem`; no repetible dentro de la misma `fichaPerfilId` |
| `contenido` | string | Sí | min 1 · max 200 caracteres · se limpian espacios inicio/fin |
| `fichaPerfilId` | UUID | Sí (del request) | Inmutable post-creación; validado vs. JWT del estudiante |

---

## Modelo Entidad-Relación

```
FichaPerfil (id) ──< Item (id, fichaPerfilId FK, tipoItemId FK, contenido)
TipoItem (id)    ──< Item

Restricción: UNIQUE(fichaPerfilId, tipoItemId)
```

---

## Contrato de API

### `POST /fichas-perfil/estudiante/mi-ficha/items`

Autenticación: JWT del estudiante.

**Request body**
```json
{
  "fichaPerfilId": "uuid",
  "tipoItemId": "uuid",
  "contenido": "string (1–200 chars)"
}
```

**201 Created** — respuesta mínima con el id generado
```json
{
  "id": "uuid"
}
```

El cliente reconstruye el objeto `Item` completo combinando:
- `id` ← retornado por el backend
- `tipoItemId` + `contenido` + `fichaPerfilId` ← conocidos desde el formulario

**400 Bad Request** — datos inválidos (vacío, > 200 chars, tipos incorrectos)  
**409 Conflict** — el `tipoItemId` ya existe en la ficha (Item-POL-02)  
**404 Not Found** — estudiante no vinculado a ninguna ficha

---

## Criterios de aceptación

1. El estudiante puede agregar un ítem seleccionando un tipo del catálogo y escribiendo el contenido.
2. El campo `contenido` no puede estar vacío ni superar 200 caracteres.
3. No se puede agregar un ítem con un `TipoItem` que ya existe en la ficha; se muestra un error informativo.
4. Tras agregar exitosamente, el ítem aparece en la lista sin recargar la página.
5. Si el estudiante no tiene ficha asignada, se notifica que debe contactar al coordinador.

---

## Evento producido

**Ítem Agregado a la Ficha Perfil**
