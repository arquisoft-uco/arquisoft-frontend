# HU035 — Modificar Ficha Perfil

## Historia de usuario

Yo como Estudiante necesito Modificar Ficha Perfil para Gestionar de manera integral la formulación de la ficha de perfil, incluyendo la modificación del título, alcance, objetivos, pregunta de investigación y otros ítems relevantes, garantizando que la ficha refleje con precisión el proyecto y facilite su revisión y seguimiento en tiempo real.

---

## Precondiciones

- La ficha de perfil fue registrada previamente (*Nueva Ficha Perfil Asignada*).
- El estudiante está vinculado a la ficha vía `EstudianteFichaPerfil`.

---

## Reglas de negocio

- Solo el Estudiante asignado a la ficha puede modificar su título.
- El `tituloProyecto` no puede estar vacío, tiene un máximo de 100 caracteres y debe ser único en el sistema.
- El campo modificable en esta HU es únicamente `tituloProyecto`. El asesor se gestiona mediante una acción separada (*Cambiar Asesor Ficha*).

---

## Contrato de API

**`PUT /fichas-perfil/estudiante/mi-ficha`**  
Autenticación: JWT del estudiante (el backend resuelve la identidad desde el token).

**Request body**
```json
{
  "fichaPerfilId": "uuid",
  "tituloProyecto": "string (1–100 chars)"
}
```

**204 No Content** — modificación exitosa.

**400 Bad Request** — datos inválidos (vacío, mayor a 100 chars).

---

## Criterios de aceptación

1. El estudiante puede editar el título de su ficha desde la cabecera de la vista.
2. El título no puede estar vacío ni superar 100 caracteres.
3. Si ya existe una ficha con el mismo título, se muestra un error informativo.
4. Tras la modificación exitosa, la vista refleja el nuevo título sin recargar la página.

---

## Evento producido

**Ficha Perfil Modificada**
