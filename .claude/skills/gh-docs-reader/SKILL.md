---
name: gh-docs-reader
description: Localiza las fuentes de una Historia de Usuario o Tecnica para Arquisoft Frontend — historias y reglas de negocio en arquisoft-docs, el contrato real en el codigo del repo hermano arquisoft-backend, el repositorio privado arquisoft-uco/arquisoft-docs via GitHub CLI, y como descubrir ahi que HU ya entrego el equipo de backend (docs/hus/validaciones/) para desarrollar su contraparte de frontend. Usar en la FASE 1 del planificador, antes de preguntar nada al usuario.
---

# Skill: gh-docs-reader

Un plan de frontend necesita tres cosas: **qué pide la historia**, **qué expone el backend de
verdad** y **quién puede verlo**. Esta skill dice dónde está cada una.

**Nivel 2 (repo hermano) manda sobre el contrato** — ruta, verbo, DTO, rol — y **Nivel 3
(`arquisoft-docs`) manda sobre reglas de negocio, event storming, modelo de dominio y catálogo
priorizado**. Si algo local contradice a una de esas fuentes, gana la fuente: anota la discrepancia
en el plan, no la ignores.

## Nivel 0 — Descubrir qué HU ya entregó el backend (sin un ID en mente)

Cuando el pedido es del estilo "desarrolla la contraparte de lo que ya hizo el equipo de backend", el
backend publica su plan y su reporte de validación en `arquisoft-uco/arquisoft-docs`, en la raíz de
`docs/hus/planes/` y `docs/hus/validaciones/`. El frontend publica en las subcarpetas `frontend/`
(`4c-commit`, FASE 7); no publiques frontend fuera de ellas.

```bash
# Cada VALIDATOR-HU-{ID}.md con "Veredicto: APROBADO" y un PR a arquisoft-backend = HU entregada
gh api "repos/arquisoft-uco/arquisoft-docs/contents/docs/hus/validaciones" --jq ".[].name"
gh api "repos/arquisoft-uco/arquisoft-docs/contents/docs/hus/validaciones/VALIDATOR-HU-{ID}.md" \
  -H "Accept: application/vnd.github.raw+json"
```

- `## Veredicto: APROBADO` + una línea `**PR:**` a `github.com/arquisoft-uco/arquisoft-backend/pull/...`
  → el endpoint ya está mergeado y usable.
- `PLAN-HU-{ID}.md` en `docs/hus/planes/` es el plan gemelo **del equipo de backend** (arquitectura
  hexagonal, módulos Gradle). Sirve para entender el endpoint real (rutas, DTOs, roles, reglas), **no**
  como plantilla del plan de frontend.
- Un `PLAN-HU-{ID}.md` sin `VALIDATOR-HU-{ID}.md` aprobado es un HU que el backend aún no entregó: no lo
  tomes como base todavía.

Cruza esa lista contra lo que el frontend ya tiene para encontrar la diferencia (backend listo, sin
contraparte de frontend):

- `docs/hus/planes/frontend/PLAN-{HU|HT}-{ID}.md` existe → frontend ya lo planificó o lo entregó (revisa
  su `docs/hus/validaciones/frontend/`). Dilo al usuario en vez de replanificar.
- `docs/pendientes.md` → HU entregadas por backend y sin frontend, o un pendiente ya identificado.
- Una feature cuya página renderiza `<ComingSoon />` → sin frontend todavía; su contexto sale de la
  tabla "Feature del frontend → archivos".
- `// Pendiente:` en el service de una feature ya construida → puede ser una HU que backend **ya
  entregó**. Si su HU aparece `APROBADO`, es una corrección, no una historia nueva: verifícala con los
  tres pasos de «Verificar Nivel 2» de `arquisoft-frontend-arquitectura` y quita el pendiente de
  `docs/pendientes.md` al resolverlo.

Cita en el plan el `VALIDATOR-HU-{ID}.md` consultado como evidencia de que el endpoint existe; el
Nivel 2 confirma el DTO exacto.

## Nivel 1 — `docs/pendientes.md`

La única fuente local. Registra lo que sigue abierto: bloqueos de backend, client roles de Keycloak por
confirmar, pantallas en construcción, HU entregadas por backend sin frontend. **No es fuente de
contrato**; confirma siempre contra Nivel 2. Léelo antes de planificar para saber si la HU toca un
pendiente ya identificado.

No hay copia local de historias, event storming ni modelo de dominio: van directo a Nivel 3.

**IDs.** El catálogo maestro (`historias_usuario_priorizadas.md`) se reconsolida y reutiliza números de
HU para historias distintas. Antes de citar un ID en un plan, busca el título de la historia en el
catálogo vigente (por el título, no solo por el número); si no aparece, cítalo con esa salvedad.

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

Fuente autoritativa de reglas de negocio, event storming, modelo de dominio y catálogo priorizado.

```bash
gh auth status   # si falla: "ejecuta gh auth login con acceso a arquisoft-uco"

# Contenido crudo, sin decodificar base64
gh api "repos/arquisoft-uco/arquisoft-docs/contents/{ruta}" -H "Accept: application/vnd.github.raw+json"

# Listar una carpeta
gh api "repos/arquisoft-uco/arquisoft-docs/contents/{carpeta}" --jq ".[].name"
```

Rutas útiles:

- HU priorizadas: `artefactos/estrategicos/propuestas-hu/priorizacion/historias_usuario_priorizadas.md`
- Backlog por fase: `artefactos/estrategicos/propuestas-hu/backlog/fase-{1-mvp|2-entrega-completa|3-consolidacion}.md`
- HT (trabajo de plataforma del frontend): `docs/stories/` → `HT-XXX.*.story.md`
- Event Storming: `artefactos/estrategicos/event-storming/{Contexto} - Event Storming.md`
- Modelo enriquecido: `artefactos/estrategicos/modelo-dominio/enriquecido/documentacion/{NN}_{contexto}_modelo_enriquecido.md`
- DDL y catálogos: `mer/{NN}_tablas_{contexto}.sql` · `mer/data/{NN}_data_{contexto}.sql`

`.xlsx` y `.drawio.xml` no son legibles como texto: ignóralos.

### Feature del frontend → archivos

| Feature | `{NN}_{contexto}` del modelo enriquecido | DDL |
|---|---|---|
| `usuarios` | `05_usuarios` | `02_tablas_usuarios.sql` |
| `fichas-perfil` | `06_fichas_trabajos_grado` | `03_tablas_fichas_perfil.sql` |
| `artefactos` | `07_artefactos` | `04_tablas_artefactos.sql` |
| `repositorio-artefactos` | `08_repositorio_artefactos` | `05_tablas_repositorio_artefactos.sql` |
| `mapas-ruta` | `09_mapas_ruta` | `06_tablas_mapas_ruta.sql` |
| `proyectos-grado` | `10_proyectos_grado` | `07_tablas_proyectos_grado.sql` |
| `entregables` | `11_entregables_proyectos_grado` | `08_tablas_entregables.sql` |
| `evaluaciones` | `12_evaluaciones_definitivas` | `09_tablas_evaluaciones.sql` |
| `biblioteca` | `14_biblioteca` | `10_tablas_biblioteca.sql` |
| `solicitudes` | `15_solicitudes` | `11_tablas_solicitudes.sql` |

`dashboard` y `seleccionar-rol` no tienen contexto. El Event Storming lleva el nombre del contexto en
prosa (`Ficha Perfil`, `Proyecto Grado`, `Entregables Proyectos de Grado`…), **con espacios**: comillas
dobles en la URL del `gh api`.

**Que un contexto esté documentado no significa que el backend lo exponga.** Confírmalo en Nivel 2;
el plan debe decir si la salida es `ComingSoon` o la degradación con `AvisoNoDisponible`.

## Protocolo de consulta

```
0. ¿Sin HU puntual ("implementa lo que backend ya entregó")? → Nivel 0 primero, hasta tener IDs concretos
1. ¿HU (negocio, con actor y criterios) o HT (plataforma, en docs/stories/)?
2. Nivel 3: historias priorizadas + Event Storming del contexto
3. Leer docs/pendientes.md: ¿la HU toca un pendiente ya identificado?
4. LEER SIEMPRE el Controller real en ../arquisoft-backend (Nivel 2 es la fuente del contrato)
     Por cada endpoint que la HU necesita: ¿implementado o pendiente? ¿ruta y body exactos?
     Sin repo hermano → marcar el contrato como NO VERIFICADO
5. Roles: cruzar src/shared/models/rol.ts, src/layout/nav-items.ts y las authorities del backend
   ({Contexto}Authorities.java en ../arquisoft-backend)
6. Catálogo → listar id/nombre/descripcion de cada fila. La UI muestra el `nombre` del backend
7. Límite nuevo → confirmarlo contra el DDL, el modelo enriquecido o {Modulo}Limits.java, para LIMITES
8. Registrar todos los archivos consultados en la Metadata del plan
```

## Errores

| Error | Acción |
|---|---|
| `HTTP 401` | `gh auth refresh` o `gh auth login` |
| `HTTP 403` | Pedir al admin de `arquisoft-uco` acceso para el token |
| `HTTP 404` | Listar la carpeta padre y usar el nombre exacto |
| `ls ../arquisoft-backend` falla | Sigue y marca el contrato como no verificado |
