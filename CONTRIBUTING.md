# Guía de Contribución — Arquisoft Frontend

## Antes de Contribuir

1. Lee los [Estándares de Código](https://github.com/arquisoft-uco/arquisoft-docs/blob/main/docs/architecture/coding-standards.md)
2. Asegúrate de tener asignada la tarea correspondiente

## Flujo de Trabajo

1. Crea una rama desde `develop` siguiendo la convención: `<prefijo>/<id>-<descripcion_snake_case>`
   - Ejemplo: `feature/HT-010-scaffolding_react`
2. Implementa los cambios siguiendo las convenciones del proyecto
3. Ejecuta tests y linting: `npm run test && npm run lint`
4. Crea un Pull Request hacia `develop` usando el template provisto
5. Espera al menos 1 review aprobado antes de mergear

## Convenciones

- **Commits:** Conventional Commits en español — `feat(componente): descripción`
- **Branching:** GitFlow simplificado
  - Prefijos válidos: `feature/`, `fix/`, `refactor/`, `hotfix/`, `docs/`, `test/`, `chore/`, `spike/`
  - Formato: `<prefijo>/<id>-<descripcion_snake_case>`
- **Nomenclatura:** Español para términos de negocio, inglés para sufijos técnicos

## Estructura del PR

Usa el template de PR incluido en `.github/PULL_REQUEST_TEMPLATE.md`.
