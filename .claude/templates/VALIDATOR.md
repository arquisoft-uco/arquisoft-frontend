<!--
Plantilla completa del reporte de validacion de frontend. La produce @4a-validator-analyze (como
mensaje) y la persiste @4b-validator-report (como archivo, tal cual, quitando cualquier linea
conversacional previa a la primera almohadilla).

A diferencia de PLAN.md, aqui no hay parte condicional: el reporte lleva siempre las mismas
secciones. Una seccion sin hallazgos se deja con "Ninguno", nunca se borra — su ausencia no se
distingue de un olvido.

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
| 3 — Type-check y build | | | | |
| 4 — Tests | | | | ⏳ N/A si no se ejecutaron |
| **Total** | | | | **XX/100** |

**Bloqueantes:** X · **Menores:** X

## Estado Final

> ✅ APROBADO — sin bloqueantes. / ⛔ RECHAZADO — hay X bloqueantes.

Un solo bloqueante = RECHAZADO, sin importar el score.

## Errores Bloqueantes

### [Nivel X.Y] — {título}
- **Archivo:** `ruta/relativa/desde/la/raiz/del/repo`
- **Problema:** {qué está mal}
- **Referencia:** {check violado}

## Errores Menores

{mismo formato que los bloqueantes, o "Ninguno"}

## Tests

{Si ✅ Completado: total de tests, presupuesto vs estimación, anti-patrones detectados (o "ninguno"),
 archivos de test añadidos, y coherencia con el Tipo de HU.}
{Si ⏳ Pendiente: "Tests no ejecutados — invoca @3-tester y repite el análisis."}

## Verificación en navegador

{Si se verificó con Claude in Chrome: rutas visitadas, roles probados, errores de consola (o
 "ninguno"), peticiones fallidas (o "ninguna").}
{Si no se verificó: "No verificada — la HU es de lógica no visual" o "No verificada — sin servidor de
 desarrollo disponible". Nunca la des por hecha.}

## Datos para la entrega

> Esta sección es el insumo de `@4c-commit`: de aquí saca el mensaje, la rama y los archivos, y del
> Score/Tests/bloqueantes de arriba saca la evidencia para marcar el checklist del PR. Un dato que no
> dejes aquí es una casilla que ese agente **no** podrá marcar.

**Mensaje:** {tipo}({feature}): {descripción corta}
**Cuerpo:** {bullets: qué se implementó, capas afectadas, rutas nuevas, endpoints consumidos}
**Rama:** `feature/{HU|HT}-{ID}-{descripcion}`
**Archivos a incluir:** {solo código, tests y documentación del repo — el plan y este reporte NO van
al repositorio de frontend, los publica `@4c-commit` en `arquisoft-docs`}
**Cambios visuales:** {Sí — adjuntar captura / N/A — la HU no cambia la UI}
**Responsive verificado:** {Sí / No / N/A}

## Próximos pasos

{Si APROBADO: "Invoca @4b-validator-report genera el reporte de {HU|HT}-{ID} y pega este reporte
completo."} {Si RECHAZADO: "El implementador corrige los bloqueantes y se repite el análisis."}
