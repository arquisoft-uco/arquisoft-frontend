<!--
Plantilla de la cabecera invariable de un plan de frontend. La usan @1-planificador (al generar) y
@4a-validator-analyze (al leer). Copia este bloque tal cual y sustituye los {marcadores}.

Lo que sigue a la seccion 3 NO vive aqui: las secciones 4 a 12 son condicionales — dependen de si la
HU crea una vista, un formulario, una integracion nueva o solo trabajo de plataforma — y su forma la
decide @1-planificador segun sus preguntas. Esta plantilla fija lo que no cambia nunca: el titulo, la
metadata y las tres secciones que toda HU/HT tiene, haga lo que haga.

Destino: .workspace/h-plan/PLAN-{HU|HT}-{ID}.md
-->

# PLAN: {Título}

## Metadata
- **ID Historia:** {HU|HT}-{ID}
- **Feature:** `src/features/{feature}/`
- **Tipo de HU:** {Vista de solo lectura / Formulario de escritura / Mixta / Plataforma}
- **Rutas afectadas:** `{/ruta}` {o "ninguna — componente interno"}
- **Roles que la consumen:** {valores del enum `Rol`}
- **Endpoints del backend:** {implementados / pendientes / ninguno — ver sección 5}
- **Fecha de plan:** {yyyy-MM-dd}
- **Rama sugerida:** `feature/{HU|HT}-{ID}-{descripcion_snake_case}`
- **Fuentes consultadas:** {rutas locales + archivos de arquisoft-docs + Controllers del backend}
- **Observaciones del usuario:** {o "Ninguna"}

## 1. Resumen Funcional

{2-4 oraciones: qué ve y qué puede hacer el usuario, y qué NO cubre esta HU}

## 2. Criterios de Aceptación

| # | Criterio | Resultado esperado en la UI |
|---|---|---|

## 3. Reglas de Negocio — dónde se valida cada una

> **El frontend valida forma; el backend decide.** Una restricción de **forma** (obligatoriedad,
> longitud, formato de correo o UUID, tamaño de una lista) se valida en el cliente con el schema Zod
> del formulario, usando los builders de `src/shared/validation/` y las constantes de `LIMITES` —
> nunca un número mágico. Una restricción de **conjunto** (unicidad de un título, existencia de un
> recurso, propiedad, transición de estado permitida) **no se valida en el cliente**: el backend
> responde 422 y la UI muestra ese mensaje con `getApiErrorMessage(err, '…')` o pinta los
> `fieldErrors[]` con `getApiFieldErrors(err)`.
>
> Duplicar una regla de conjunto en el cliente es un hallazgo, no una mejora: el frontend no tiene
> los datos para decidirla, así que la copia se desincroniza y da falsos negativos. Y una regla de
> forma que el cliente **no** valide deja al usuario descubriendo por un 400 lo que el campo pudo
> decirle al teclear.
>
> **Si la HU no introduce ninguna regla de forma, no hay schema Zod nuevo** — no planifiques una
> validación vacía. Y si el límite que necesitas no está en `LIMITES`, el plan dice de qué archivo
> del backend o del MER se copia el valor.

| # | Regla | Dónde se valida (Zod cliente / backend 422) | Constante o builder | Mensaje al usuario |
|---|---|---|---|---|
