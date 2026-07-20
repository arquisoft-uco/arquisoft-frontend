# HU032 — Consultar ítems de la Ficha Perfil

## Historia de usuario

**Como** Estudiante  
**Necesito** consultar los ítems de mi Ficha de Perfil  
**Para** gestionar de manera integral la formulación de la ficha de perfil, incluyendo la modificación del título, alcance, objetivos, pregunta de investigación y otros ítems relevantes, garantizando que la ficha refleje con precisión el proyecto y facilite su revisión y seguimiento en tiempo real.

---

## Precondiciones

- La ficha de perfil fue registrada previamente (*Nueva Ficha Perfil Registrada*).
- El estudiante está vinculado a la ficha (*Estudiante Asignado a Ficha Perfil*).

---

## Reglas de negocio

- Un estudiante solo puede consultar los ítems de la ficha a la que está vinculado.
- Cada ítem tiene un tipo (`TipoItem`) que determina su semántica (ej: alcance, objetivo general, pregunta de investigación).
- La lista se devuelve sin paginación; el número de ítems es acotado por la estructura de la ficha.
- El catálogo de tipos de ítem es compartido y cambia con poca frecuencia; se puede cachear en el cliente con un `staleTime` largo (ej: 30 minutos) para evitar peticiones redundantes entre vistas.

---

## Contrato de API

### Ítems de la ficha del estudiante

**`GET /fichas-perfil/estudiante/mi-ficha/items?estudianteId={uuid}`**  
Autenticación: JWT del estudiante.

**200 OK**
```json
[
  {
    "id": "uuid",
    "tipoItem": {
      "id": "uuid",
      "nombre": "Objetivo general"
    },
    "contenido": "string",
    "fichaPerfilId": "uuid"
  }
]```

**404 Not Found** — el estudiante no está vinculado a ninguna ficha.

---

### Catálogo de tipos de ítem

No requerido para esta HU. El backend retorna `tipoItem` embebido en cada ítem, eliminando la necesidad de un segundo request al frontend.

---

## Criterios de aceptación

1. Se listan todos los ítems de la ficha del estudiante autenticado, agrupados o identificados por su tipo.
2. Cada ítem muestra el nombre del tipo y el contenido actual.
3. Si la ficha no tiene ítems registrados aún, se muestra un estado vacío que invita a agregar el primero.
4. Si el estudiante no está vinculado a ninguna ficha, se notifica que debe contactar al coordinador.

---

## Evento producido

> *Ítems Ficha Perfil Consultados* (solo lectura, sin efecto de dominio).
