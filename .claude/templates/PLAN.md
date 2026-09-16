<!--
Cabecera invariable de un plan de frontend. La usan @1-planificador (al generar) y
@4a-validator-analyze (al leer). Copia este bloque y sustituye los {marcadores}.

Las secciones 4 a 12 NO viven aqui: son condicionales y su forma la decide @1-planificador segun sus
preguntas. Esta plantilla fija lo que no cambia nunca.

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
- **Fuentes consultadas:** {rutas locales + arquisoft-docs + Controllers del backend}
- **Observaciones del usuario:** {o "Ninguna"}

## 1. Resumen Funcional

{2-4 oraciones: qué ve y qué puede hacer el usuario, y qué NO cubre esta HU}

## 2. Criterios de Aceptación

| # | Criterio | Resultado esperado en la UI |
|---|---|---|

## 3. Reglas de Negocio — dónde se valida cada una

> **El cliente valida forma; el backend decide conjunto.** Obligatoriedad, longitud, formato y tamaño
> de lista → schema Zod con los builders de `src/shared/validation/` y las constantes de `LIMITES`,
> nunca un número mágico. Unicidad, existencia, propiedad y transición permitida → **no se validan en
> el cliente**: llegan como 422 y se muestran con `getApiErrorMessage` o `getApiFieldErrors`.
>
> Duplicar una regla de conjunto da falsos negativos: el frontend no tiene los datos para decidirla.
> Y una regla de forma sin validar deja al usuario descubriendo por un 400 lo que el campo pudo
> decirle al teclear.
>
> Sin reglas de forma nuevas, no hay schema Zod nuevo. Si un límite no está en `LIMITES`, di de qué
> archivo del backend o del MER se copia.

| # | Regla | Dónde (Zod cliente / backend 422) | Constante o builder | Mensaje al usuario |
|---|---|---|---|---|
