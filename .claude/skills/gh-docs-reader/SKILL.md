---
name: gh-docs-reader
description: Localiza las fuentes de una Historia de Usuario o Tecnica para Arquisoft Frontend — historias locales en docs/fichas-perfil/historias/, el contrato real en docs/integracion-backend-frontend.md, el codigo del repo hermano arquisoft-backend, el repositorio privado arquisoft-uco/arquisoft-docs via GitHub CLI, y como descubrir ahi que HU ya entrego el equipo de backend (docs/hus/validaciones/) para desarrollar su contraparte de frontend. Usar en la FASE 1 del planificador, antes de preguntar nada al usuario.
---

# Skill: gh-docs-reader

Un plan de frontend necesita tres cosas: **qué pide la historia**, **qué expone el backend de
verdad** y **quién puede verlo**. Esta skill dice dónde está cada una.

El orden importa: **local → repo hermano → GitHub**. Lo local es más rápido y ya viene filtrado a lo
que el frontend consume.

## Nivel 0 — Descubrir qué HU ya entregó el backend (sin un ID en mente)

Cuando el pedido es del estilo "desarrolla la contraparte de lo que ya hizo el equipo de backend",
sin una HU puntual: el backend publica su propio plan y su propio reporte de validación en el
**mismo repo** que usa este proyecto para publicar los suyos (`4c-commit`, Fase 10) —
`arquisoft-uco/arquisoft-docs` — pero en carpetas separadas por equipo: backend en la raíz de
`docs/hus/planes/` y `docs/hus/validaciones/`, frontend en `docs/hus/planes/frontend/` y
`docs/hus/validaciones/frontend/`. La separación es deliberada para no volver a mezclar el plan
gemelo de backend con el de frontend bajo el mismo nombre de archivo — no publiques frontend fuera de
su subcarpeta.

```bash
# Cada VALIDATOR-HU-{ID}.md con "Veredicto: APROBADO" y un PR a arquisoft-backend = HU entregada
gh api "repos/arquisoft-uco/arquisoft-docs/contents/docs/hus/validaciones" --jq ".[].name"
gh api "repos/arquisoft-uco/arquisoft-docs/contents/docs/hus/validaciones/VALIDATOR-HU-{ID}.md" \
  -H "Accept: application/vnd.github.raw+json"
```

- `## Veredicto: APROBADO` + una línea `**PR:**` apuntando a
  `github.com/arquisoft-uco/arquisoft-backend/pull/...` → el endpoint ya está mergeado y usable.
- `PLAN-HU-{ID}.md` en `docs/hus/planes/` (misma carpeta) es el plan gemelo — pero es del **equipo de
  backend** (arquitectura hexagonal, módulos Gradle: `{contexto}:domain`, `:application`,
  `:infrastructure`). Sirve para entender el endpoint real (rutas, DTOs, roles, reglas), **no** como
  plantilla del plan de frontend — la Metadata y la sección de reglas de negocio son las partes más
  útiles para no adivinar el contrato.
- Un `PLAN-HU-{ID}.md` sin `VALIDATOR-HU-{ID}.md` (o con veredicto distinto de APROBADO) es un HU que
  el backend aún no entregó — no lo tomes como base para planificar frontend todavía.

Cruza esa lista contra lo que el frontend ya tiene, para encontrar la diferencia (backend listo, sin
contraparte de frontend):

- **`docs/hus/planes/frontend/PLAN-{HU|HT}-{ID}.md`** → si ya existe para ese ID, frontend ya lo
  planificó (o lo entregó, revisa su `VALIDATOR-.../frontend/VALIDATOR-{ID}.md`). Dilo al usuario en
  vez de replanificar desde cero.
- `docs/fichas-perfil/historias/` (Nivel 1) → ya cubiertas o en curso por `fichas-perfil`
- Las nueve rutas en `<ComingSoon />` (`src/features/*`, ver `arquisoft-frontend-arquitectura`) → sin
  feature de frontend todavía; su bounded context sale de la tabla "Feature del frontend → archivos"
  más abajo
- **`// Pendiente:` en el service de una feature ya construida** (hoy, `fichasPerfilService.ts`) → no
  es solo "falta planificar algo nuevo": puede ser una HU que backend **ya entregó** después de que el
  frontend adivinara o marcara el endpoint como no disponible. Un `// Pendiente` cuya HU aparece
  `APROBADO` en `docs/hus/validaciones/` es una corrección, no una historia nueva — verifícalo con los
  tres pasos de "Verificar Nivel 2 es tres pasos, no uno" de `arquisoft-frontend-arquitectura` antes de
  tocar el service, y actualiza `docs/integracion-backend-frontend.md` cuando lo resuelvas: ese
  documento no se actualiza solo cuando cambia el service.

El resultado de ese cruce es la lista real de HU por planificar. Cita en el plan el `VALIDATOR-HU-{ID}.md`
consultado como evidencia de que el endpoint existe — así el Nivel 2 (repo hermano) confirma el DTO
exacto, no si el endpoint existe.

## Nivel 1 — Fuentes locales

| Ruta | Aporta | Cuándo |
|---|---|---|
| `docs/fichas-perfil/historias/HU{NNN}-*.md` | 23 HU ya extraídas: historia, precondiciones, reglas `POL-XX`, event storming, modelo enriquecido | HU de `fichas-perfil` |
| `docs/integracion-backend-frontend.md` | **Fuente autoritativa del contrato vigente**: método → verbo → ruta → body → respuesta, más los pendientes con su motivo y la degradación con `AvisoNoDisponible` (no cites cuántos son — se desactualiza) | **Siempre**, antes de tocar un service |
| `docs/fichas-perfil/fichas-perfil-openapi.yaml` | Diseño **objetivo**; su cabecera avisa de que no coincide con lo expuesto | Para entender la intención de un endpoint futuro. **Nunca para planificar** |
| `docs/fichas-perfil/contexto/Ficha Perfil - Event Storming.md` | Comandos, políticas, eventos | HU ausente de `historias/`, o política ambigua |
| `.../contexto/06_fichas_trabajos_grado_modelo_enriquecido.md` | Atributos, tipos, longitudes, obligatoriedad | Derivar modelos TS y límites |
| `.../contexto/03_tablas_fichas_perfil.sql` | DDL real: anchos, `NOT NULL`, únicos | Alinear `LIMITES` |
| `docs/permisos-granulares.md` | Permisos por rol | La HU restringe por rol |

```bash
ls docs/fichas-perfil/historias/ docs/fichas-perfil/contexto/
```

### IDs no sincronizados con el catálogo maestro

El catálogo maestro (`historias_usuario_priorizadas.md`) se reconsolida con el tiempo y **reutiliza
números de HU** para historias completamente distintas (ver `HU278`/`HU279`/`HU280`: hoy son "Enviar
Correcciones de Revisión Ítem", "Cerrar Observación Ítem" y "Reabrir Observación Ítem" — nada que ver
con lo que esos archivos locales documentan). Antes de tomar un ID local como válido:

1. Busca el título exacto del archivo local en el catálogo maestro vigente (`grep` por el comando, no
   solo por el número).
2. **Coincide** → el ID está sincronizado, úsalo tal cual.
3. **El número existe pero apunta a otra historia** → busca si el concepto tiene un ID nuevo en el
   catálogo (renombrado/reordenado). Si lo encuentra, ese es el ID correcto — renombra el archivo
   local al nuevo número.
4. **No aparece con ningún ID en el catálogo vigente** (ni con el número viejo ni con uno nuevo) →
   conserva el ID local tal cual, pero agrega el sufijo `-NO_SINCRONIZADA` al nombre de archivo
   (`HU278-NO_SINCRONIZADA-consultar-asesores-disponibles.md`) y una nota `⚠️ NO_SINCRONIZADA` al
   inicio del archivo explicando qué se buscó y no se encontró. No lo cites como `HU-{N}` sin esa
   salvedad en un plan — es un identificador de conveniencia, no confirmado contra backend.

Esto aplica a cualquier HU local de cualquier feature, no solo a las tres ya marcadas en
`fichas-perfil`.

Los `LIMITES` salen de este nivel, no de tu criterio. Si la HU introduce uno nuevo, cita su fuente
(DDL o modelo enriquecido) en el plan.

## Nivel 2 — El repo hermano `../arquisoft-backend`

Está en disco, al mismo nivel. Es la **única forma de confirmar** una ruta, un verbo, la forma de un
DTO o el rol que autoriza un endpoint.

```bash
BE=../arquisoft-backend
grep -rn "Mapping" "$BE"/fichas/infrastructure/src/main/java --include=*Controller.java
grep -rn "" "$BE"/fichas/infrastructure/src/main/java/com/arquisoft/fichas/infrastructure/security/FichasAuthorities.java
grep -rn "Limits" "$BE"/shared/message/src/main/java --include=*.java
```

**El nombre de un campo del body lo manda el backend**, no el modelo del frontend; el service es
donde se traduce. Confírmalo abriendo el DTO real: adivinarlo produce un 400 que parece bug de UI.

Si `ls ../arquisoft-backend` falla, dilo en el plan y marca el contrato como **no verificado**.

## Nivel 3 — `arquisoft-uco/arquisoft-docs` por `gh`

Solo cuando la HU **no** es de `fichas-perfil`, o para el catálogo completo de historias priorizadas.

```bash
gh auth status   # si falla: "ejecuta gh auth login con acceso a arquisoft-uco"

# Contenido crudo, sin decodificar base64 (funciona en Windows y Linux)
gh api "repos/arquisoft-uco/arquisoft-docs/contents/{ruta}" -H "Accept: application/vnd.github.raw+json"

# Listar una carpeta
gh api "repos/arquisoft-uco/arquisoft-docs/contents/{carpeta}" --jq ".[].name"
```

Rutas útiles:

- HU priorizadas: `artefactos/estrategicos/propuestas-hu/priorizacion/historias_usuario_priorizadas.md`
  — **la carpeta dejó de ser plana**: el catálogo ya no está en la raíz de `propuestas-hu/`
- Backlog por fase: `artefactos/estrategicos/propuestas-hu/backlog/fase-{1-mvp|2-entrega-completa|3-consolidacion}.md`
- HT (trabajo de plataforma del frontend): `docs/stories/` → `HT-XXX.*.story.md`
- Event Storming: `artefactos/estrategicos/event-storming/{Contexto} - Event Storming.md`
- Modelo enriquecido: `artefactos/estrategicos/modelo-dominio/enriquecido/documentacion/{NN}_{contexto}_modelo_enriquecido.md`
- DDL y catálogos: `mer/{NN}_tablas_{contexto}.sql` · `mer/data/{NN}_data_{contexto}.sql`

### Feature del frontend → archivos

| Feature | `{NN}_{contexto}` del modelo enriquecido | DDL / data |
|---|---|---|
| `fichas-perfil` | `06_fichas_trabajos_grado` | `03_tablas_fichas_perfil.sql` |
| `artefactos` | `07_artefactos` | `04_tablas_artefactos.sql` |
| `repositorio-artefactos` | `08_repositorio_artefactos` | `05_…` *(sin catálogos)* |
| `mapas-ruta` | `09_mapas_ruta` | `06_…` |
| `proyectos-grado` | `10_proyectos_grado` | `07_…` |
| `entregables` | `11_entregables_proyectos_grado` | `08_…` |
| `evaluaciones` | `12_evaluaciones_definitivas` | `09_…` |
| `biblioteca` | `14_biblioteca` | `10_…` |
| `solicitudes` | `15_solicitudes` | `11_…` |
| `dashboard`, `seleccionar-rol` | — | — |

El Event Storming lleva el nombre del contexto en prosa (`Ficha Perfil`, `Proyecto Grado`,
`Entregables Proyectos de Grado`, `Evaluaciones Definitivas`…), **con espacios**: comillas dobles en
la URL del `gh api`.

**Que un contexto esté documentado no significa que el backend lo exponga.** De los nueve, solo
`fichas` tiene endpoints consumibles hoy. El plan debe decir si la salida es `ComingSoon` o la
degradación con `AvisoNoDisponible`.

## Protocolo de consulta

```
0. ¿No hay HU puntual, sino "implementa lo que backend ya entregó"? → Nivel 0 primero,
   para salir de ahí con uno o varios IDs concretos antes de seguir con el paso 1
1. ¿HU (negocio, con actor y criterios) o HT (plataforma, en docs/stories/)?
2. ls docs/fichas-perfil/historias/ → ¿está en local?
     Sí → léela: trae reglas POL-XX y modelo de dominio
     No → Nivel 3: historias priorizadas + Event Storming del contexto
3. LEER SIEMPRE docs/integracion-backend-frontend.md
     Por cada endpoint que la HU necesita: ¿implementado o pendiente? ¿ruta y body exactos?
4. Endpoint que ese documento no liste → abrir el Controller en ../arquisoft-backend
     Sin repo hermano → marcar el contrato como NO VERIFICADO
5. Roles: cruzar src/shared/models/rol.ts, src/layout/nav-items.ts y docs/permisos-granulares.md
6. Catálogo → listar id/nombre/descripcion de cada fila. La UI muestra el `nombre` del backend
7. Límite nuevo → confirmarlo contra el DDL o el modelo enriquecido, para LIMITES
8. Registrar todos los archivos consultados en la Metadata del plan
```

## Errores

| Error | Acción |
|---|---|
| `HTTP 401` | `gh auth refresh` o `gh auth login` |
| `HTTP 403` | Pedir al admin de `arquisoft-uco` acceso para el token |
| `HTTP 404` | Listar la carpeta padre y usar el nombre exacto |
| `gh: command not found` | https://cli.github.com/ |
| Contenido ilegible | Se usó `--jq '.content'`; usa el header `raw+json` |
| `ls ../arquisoft-backend` falla | Sigue con lo local y marca el contrato como no verificado |

`.xlsx` y `.drawio.xml` no son legibles como texto: ignóralos. Los `HU*.md` locales son una copia
filtrada; si contradicen al catálogo remoto, gana el remoto y se anota la discrepancia.
