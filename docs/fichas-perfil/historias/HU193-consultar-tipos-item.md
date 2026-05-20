# HU193 — Consultar todos los tipos ítem disponibles

## Historia de usuario

**Como** Estudiante, Representante Comité Currículum o Asesor Ficha  
**Necesito** consultar todos los tipos de ítem disponibles  
**Para** facilitar la gestión y seguimiento de las fichas de perfil, asegurando que la información esté actualizada, disponible para la revisión en tiempo real y permitiendo agregar observaciones que respalden la toma de decisiones durante el proceso.

---

## Precondiciones

- Existen tipos de ítem registrados en el sistema.

---

## Reglas de negocio

- El catálogo de tipos de ítem es global; no está filtrado por rol ni por ficha.
- Cada tipo de ítem tiene un nombre y una descripción que orienta al usuario sobre qué información registrar.
- El catálogo cambia con poca frecuencia; se puede cachear en el cliente (recomendado: 30 minutos).

---

## Contrato de API

**`GET /fichas-perfil/tipos-item`**  
Sin autenticación requerida (catálogo global).

**200 OK**
```json
[
  {
    "id": "uuid",
    "nombre": "string",
    "descripcion": "string"
  }
]
```

---

## Criterios de aceptación

1. Se retorna la lista completa de tipos de ítem disponibles en el sistema.
2. Cada tipo incluye `id`, `nombre` y `descripcion`.
3. Si no hay tipos registrados, se retorna una lista vacía.

---

## Evento producido

> *Tipos Ítem Consultados* (solo lectura, sin efecto de dominio).
