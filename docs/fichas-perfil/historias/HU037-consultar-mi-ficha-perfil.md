# HU037 — Consultar información de una Ficha Perfil al que Pertenece

## Historia de usuario

**Como** Estudiante  
**Necesito** consultar la información de la Ficha de Perfil a la que estoy asignado  
**Para** gestionar de manera integral la formulación de la ficha de perfil, incluyendo la modificación del título, alcance, objetivos, pregunta de investigación y otros ítems relevantes, garantizando que la ficha refleje con precisión el proyecto y facilite su revisión y seguimiento en tiempo real.

---

## Precondiciones

- La ficha de perfil fue registrada previamente (*Nueva Ficha Perfil Asignada*).
- El estudiante está vinculado a la ficha vía `EstudianteFichaPerfil` (*Estudiante asignado a Ficha Perfil*).

---

## Reglas de negocio

- Un estudiante solo puede consultar la ficha a la que está vinculado.
- Si el estudiante no está vinculado a ninguna ficha, se notifica que no tiene ficha asignada.
- La respuesta incluye el asesor con nombre y correo, y el estado actual de la ficha (último estado registrado).

---

## Contrato de API

**`GET /fichas-perfil/estudiante/{estudianteId}/mi-ficha`**  
El `estudianteId` corresponde al `sub` del JWT del estudiante autenticado.

**200 OK**
```json
{
  "id": "uuid",
  "tituloProyecto": "string",
  "asesor": {
    "id": "uuid",
    "nombre": "string",
    "email": "string"
  },
  "estadoActual": {
    "id": "uuid",
    "nombre": "string",
    "fechaActualizacion": "ISO 8601"
  },
  "integrantes": [
    {
      "id": "uuid",
      "nombre": "string",
      "email": "string"
    }
  ]
}
```

**404 Not Found** — el estudiante no está vinculado a ninguna ficha.

---

## Criterios de aceptación

1. Se muestra la ficha a la que está asignado el estudiante con: título del proyecto, asesor (nombre y correo), integrantes del grupo (nombre y correo) y estado actual.
2. Si el estudiante no tiene ficha asignada, se muestra un mensaje indicando que debe contactar al coordinador.
3. La información del asesor corresponde al asesor actualmente asignado.
4. El estado actual es el último estado registrado para la ficha.

---

## Evento producido

**Información de Ficha Perfil del Estudiante Consultada**
