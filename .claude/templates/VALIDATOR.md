<!--
Reporte de validacion de frontend. Lo produce @4a-validator-analyze (como mensaje) y lo persiste
@4b-validator-report (como archivo, tal cual, quitando la linea conversacional previa a la primera
almohadilla).

Aqui no hay parte condicional: siempre las mismas secciones. Una seccion sin hallazgos lleva
"Ninguno", nunca se borra — su ausencia no se distingue de un olvido.

Destino: .workspace/validator/validator-{HU|HT}-{ID}.md
-->

# Reporte de Validación — {HU|HT}-{ID}

## Metadata
- **Feature:** `src/features/{feature}/`
- **Fecha:** {yyyy-MM-dd} · **Rama propuesta:** `feature/{HU|HT}-{ID}-{descripcion}`
- **Plan validado:** `.workspace/h-plan/PLAN-{HU|HT}-{ID}.md`

## Score

| Nivel | Checks | Pasados | Fallados | Score |
|---|---|---|---|---|
| 1 — Completitud del plan | | | | |
| 2 — Convenciones de arquitectura y código | | | | |
| 3 — Type-check, tests y build | | | | |
| 4 — Testing (Nivel 2.12) | | | | ⏳ N/A si no se ejecutaron |
| **Total** | | | | **XX/100** |

**Bloqueantes:** X · **Menores:** X

## Estado Final

> ✅ APROBADO — sin bloqueantes. / ⛔ RECHAZADO — hay X bloqueantes.

Un solo bloqueante = RECHAZADO, sin importar el score.

## Entrega

> Misma forma que usa backend en sus reportes — así cualquiera que cruce `docs/hus/validaciones/` y
> `docs/hus/validaciones/frontend/` encuentra la prueba de entrega en el mismo lugar. Al analizar
> (`@4a-validator-analyze`) queda en blanco/`⏳ Pendiente`; `@4c-commit` la completa en su FASE 10,
> **después** del push y el PR — nunca antes, porque hasta ese punto no existen hash ni URL.

- **Estado:** ⏳ Pendiente / ✅ Entregado
- **Hash:** `{7 caracteres del commit, o "—" si aún no hay}`
- **Fecha:** {yyyy-MM-dd}
- **PR:** {URL completa a `arquisoft-uco/arquisoft-frontend/pull/{N}`, o "—"}

## Errores Bloqueantes

### [Nivel X.Y] — {título}
- **Archivo:** `ruta/relativa/desde/la/raiz`
- **Problema:** {qué está mal}
- **Referencia:** {check violado}

## Errores Menores

{mismo formato, o "Ninguno"}

## Tests

{✅ Completado: total, presupuesto vs estimación, anti-patrones detectados (o "ninguno"), archivos
 añadidos, coherencia con el Tipo de HU.}
{⏳ Pendiente: "Tests no ejecutados — invoca @3-tester y repite el análisis."}

## Verificación en navegador

{Rutas visitadas, roles probados, errores de consola (o "ninguno"), peticiones fallidas (o "ninguna").}
{Si no se hizo: el motivo — "la HU es de lógica no visual" o "sin servidor de desarrollo disponible".
 Nunca la des por hecha.}

## Datos para la entrega

> Insumo de `@4c-commit`: de aquí saca mensaje, rama y archivos, y del Score/Tests/bloqueantes la
> evidencia para el checklist del PR. Un dato ausente es una casilla que **no** podrá marcar.

**Mensaje:** {tipo}({feature}): {descripción corta}
**Cuerpo:** {bullets: qué se implementó, capas afectadas, rutas nuevas, endpoints consumidos}
**Rama:** `feature/{HU|HT}-{ID}-{descripcion}`
**Archivos a incluir:** {solo código, tests y documentación del repo — el plan y este reporte los
publica `@4c-commit` en `arquisoft-docs`}
**Cambios visuales:** {Sí — adjuntar captura / N/A}
**Responsive verificado:** {Sí / No / N/A}

## Próximos pasos

{APROBADO: "Invoca @4b-validator-report genera el reporte de {HU|HT}-{ID} y pega este reporte completo."}
{RECHAZADO: "El implementador corrige los bloqueantes y se repite el análisis."}
