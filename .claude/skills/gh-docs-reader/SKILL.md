---
name: gh-docs-reader
description: Localiza las fuentes de una Historia de Usuario o Tecnica para Arquisoft Frontend — historias locales en docs/fichas-perfil/historias/, el contrato real del backend en docs/integracion-backend-frontend.md y el codigo del repo hermano arquisoft-backend, y el repositorio privado arquisoft-uco/arquisoft-docs via GitHub CLI. Usar en la FASE 1 del agente planificador, antes de hacer cualquier pregunta al usuario.
---

# Skill: gh-docs-reader

Un plan de frontend necesita tres cosas y ninguna sale del mismo sitio:

1. **Qué pide la historia** — actor, criterios de aceptación, reglas de negocio.
2. **Qué expone el backend de verdad** — ruta, verbo, body, respuesta, y si el endpoint existe hoy.
3. **Quién puede verlo** — roles del realm que alcanzan la ruta y la vista.

Esta skill dice dónde está cada una. **El orden importa: primero local, después el repo hermano,
después GitHub.** Lo local es más rápido, está versionado con este repo y ya viene filtrado a lo que
el frontend consume.

---

## Nivel 1 — Fuentes locales (siempre primero)

| Ruta | Qué aporta | Cuándo |
|---|---|---|
| `docs/fichas-perfil/historias/HU{NNN}-*.md` | **23 HU del contexto de fichas**, ya extraídas: historia, precondiciones, reglas de negocio con su código `POL-XX`, event storming del comando, modelo de dominio enriquecido | Siempre que la HU sea de `fichas-perfil` |
| `docs/integracion-backend-frontend.md` | **La fuente autoritativa del contrato vigente.** Tabla método del service → verbo → ruta → body → respuesta, más la lista de los 13 endpoints pendientes con su motivo, y la degradación con `AvisoNoDisponible` | **Siempre**, antes de tocar un service |
| `docs/fichas-perfil/fichas-perfil-openapi.yaml` | Diseño **objetivo** de la API. Su propia cabecera avisa de que no coincide con lo expuesto | Solo para entender la intención de un endpoint futuro. **Nunca** para planificar contra él |
| `docs/fichas-perfil/contexto/Ficha Perfil - Event Storming.md` | Comandos, políticas y eventos del contexto | Cuando la HU no está en `historias/` o hay una política ambigua |
| `docs/fichas-perfil/contexto/06_fichas_trabajos_grado_modelo_enriquecido.md` | Atributos, tipos, longitudes y obligatoriedad por objeto de dominio | Para derivar los modelos TS y los límites de validación |
| `docs/fichas-perfil/contexto/03_tablas_fichas_perfil.sql` | DDL real: anchos de columna, `NOT NULL`, únicos | Para alinear `LIMITES` con las restricciones del backend |
| `docs/permisos-granulares.md` | Mapeo de permisos por rol | Cuando la HU restringe por rol |
| `docs/revision-codigo-develop.md` | Hallazgos de la última revisión de código | Contexto de deuda técnica conocida |

Listar lo disponible:

```bash
ls docs/fichas-perfil/historias/
ls docs/fichas-perfil/contexto/
```

**Los `LIMITES` de `src/shared/validation/limites.ts` salen de este nivel**, no del criterio del
planificador: `TITULO_PROYECTO_MAX = 100` refleja un `@Size` del backend, y `validadores-zod.test.ts`
lo fija con un assert. Si la HU introduce un límite nuevo, cítalo con su fuente (DDL o modelo
enriquecido) en el plan.

## Nivel 2 — El repositorio hermano `arquisoft-backend`

Está en disco, al mismo nivel que este repo: `../arquisoft-backend`. Es la **única forma de
confirmar** una ruta, un verbo, la forma exacta de un DTO o el rol que autoriza un endpoint.

```bash
BE=../arquisoft-backend

# Rutas y verbos reales de un contexto (los Controllers son el contrato)
grep -rn "Mapping" "$BE"/fichas/infrastructure/src/main/java --include=*Controller.java

# Forma exacta de un request/response
ls "$BE"/fichas/infrastructure/src/main/java/com/arquisoft/fichas/infrastructure/**/dto/

# Client roles y qué rol de realm los tiene
grep -rn "" "$BE"/fichas/infrastructure/src/main/java/com/arquisoft/fichas/infrastructure/security/FichasAuthorities.java

# Restricciones de longitud que deben espejarse en LIMITES
grep -rn "Limits" "$BE"/shared/message/src/main/java --include=*.java
```

**El nombre de un campo del body lo manda el backend, no el modelo del frontend.** El service es
donde se traduce (`asesorFicha` en el body ↔ `asesorFichaId` en el modelo). Confírmalo abriendo el
DTO real antes de escribirlo en el plan; adivinarlo produce un 400 que parece un bug de UI.

Si el directorio no existe (`ls ../arquisoft-backend` falla), dilo explícitamente en el plan y
marca el contrato como **no verificado** — no lo des por bueno desde `integracion-backend-frontend.md`
si la HU añade un endpoint que ese documento todavía no lista.

## Nivel 3 — `arquisoft-uco/arquisoft-docs` por GitHub CLI

Solo cuando la HU **no** es de `fichas-perfil`, o cuando necesitas el catálogo completo de historias
priorizadas. Es un repositorio privado; se lee sin clonarlo.

### Prerrequisito

```bash
gh auth status
```

Si no está autenticado o no tiene acceso a la organización, detente y notifica:

> "El GitHub CLI no está autenticado con acceso a `arquisoft-uco`. Ejecuta `gh auth login` y
> asegúrate de otorgar acceso a la organización."

### Leer un archivo — sin decodificar base64

```bash
gh api "repos/arquisoft-uco/arquisoft-docs/contents/{ruta}" \
  -H "Accept: application/vnd.github.raw+json"
```

Ese header devuelve el contenido crudo y funciona en Windows y Linux. **No uses `--jq '.content'` con
`base64 -d`.**

### Rutas útiles para el frontend

```bash
# Catalogo de HU priorizadas (Actor, Objeto de Dominio, Comando) — la fuente de toda HU
gh api "repos/arquisoft-uco/arquisoft-docs/contents/artefactos/estrategicos/propuestas-hu/historias_usuario_priorizadas.md" \
  -H "Accept: application/vnd.github.raw+json"

# Historias TECNICAS (HT), que es donde vive el trabajo de plataforma del frontend
gh api "repos/arquisoft-uco/arquisoft-docs/contents/docs/stories" --jq ".[].name"
gh api "repos/arquisoft-uco/arquisoft-docs/contents/docs/stories/{HT-XXX....story.md}" \
  -H "Accept: application/vnd.github.raw+json"

# Event Storming de un contexto (OJO: los nombres llevan espacios — comillas obligatorias)
gh api "repos/arquisoft-uco/arquisoft-docs/contents/artefactos/estrategicos/event-storming/Ficha Perfil - Event Storming.md" \
  -H "Accept: application/vnd.github.raw+json"

# Modelo enriquecido de un contexto (atributos, longitudes, obligatoriedad)
gh api "repos/arquisoft-uco/arquisoft-docs/contents/artefactos/estrategicos/modelo-dominio/enriquecido/documentacion/{NN}_{contexto}_modelo_enriquecido.md" \
  -H "Accept: application/vnd.github.raw+json"

# DDL del contexto (anchos que deben espejarse en LIMITES)
gh api "repos/arquisoft-uco/arquisoft-docs/contents/mer/{NN}_tablas_{contexto}.sql" \
  -H "Accept: application/vnd.github.raw+json"

# Data de referencia de los catalogos (valores de estados/tipos que la UI muestra)
gh api "repos/arquisoft-uco/arquisoft-docs/contents/mer/data/{NN}_data_{contexto}.sql" \
  -H "Accept: application/vnd.github.raw+json"

# Atributos de calidad (usabilidad, seguridad) cuando la HU los toca
gh api "repos/arquisoft-uco/arquisoft-docs/contents/artefactos/tecnicos/diseno-arquitectonico/drivers-arquitectonicos/atributos-calidad" --jq ".[].name"
```

### Mapeo: feature del frontend → archivos en `arquisoft-docs`

| Feature (`src/features/`) | Event Storming | Modelo Enriquecido | SQL del MER | Data de referencia |
|---|---|---|---|---|
| `fichas-perfil` | `Ficha Perfil - Event Storming.md` | `06_fichas_trabajos_grado_modelo_enriquecido.md` | `03_tablas_fichas_perfil.sql` | `data/03_data_fichas_perfil.sql` |
| `artefactos` | `Artefactos - Event Storming.md` | `07_artefactos_modelo_enriquecido.md` | `04_tablas_artefactos.sql` | `data/04_data_artefactos.sql` |
| `repositorio-artefactos` | `Repositorio Artefactos - Event Storming.md` | `08_repositorio_artefactos_modelo_enriquecido.md` | `05_tablas_repositorio_artefactos.sql` | *(sin catálogos)* |
| `mapas-ruta` | `Mapa Ruta - Event Storming.md` | `09_mapas_ruta_modelo_enriquecido.md` | `06_tablas_mapas_ruta.sql` | `data/06_data_mapas_ruta.sql` |
| `proyectos-grado` | `Proyecto Grado - Event Storming.md` | `10_proyectos_grado_modelo_enriquecido.md` | `07_tablas_proyectos_grado.sql` | `data/07_data_proyectos_grado.sql` |
| `entregables` | `Entregables Proyectos de Grado - Event Storming.md` | `11_entregables_proyectos_grado_modelo_enriquecido.md` | `08_tablas_entregables.sql` | `data/08_data_entregables.sql` |
| `evaluaciones` | `Evaluaciones Definitivas - Event Storming.md` | `12_evaluaciones_definitivas_modelo_enriquecido.md` | `09_tablas_evaluaciones.sql` | `data/09_data_evaluaciones.sql` |
| `biblioteca` | `Biblioteca - Event Storming.md` | `14_biblioteca_modelo_enriquecido.md` | `10_tablas_biblioteca.sql` | `data/10_data_biblioteca.sql` |
| `solicitudes` | `Solicitudes - Event Storming.md` | `15_solicitudes_modelo_enriquecido.md` | `11_tablas_solicitudes.sql` | `data/11_data_solicitudes.sql` |
| `dashboard`, `seleccionar-rol` | — | — | — | — |

Rutas base: Event Storming en `artefactos/estrategicos/event-storming/`; Modelo Enriquecido en
`artefactos/estrategicos/modelo-dominio/enriquecido/documentacion/`; SQL en `mer/`.

**Que un contexto tenga documentación no significa que el backend lo exponga.** De los nueve, solo
`fichas` tiene endpoints consumibles hoy. Documentar una feature es planificable; integrarla contra
un backend inexistente, no — eso se resuelve con `ComingSoon` o con la degradación de
`AvisoNoDisponible`, y el plan tiene que decir cuál de las dos.

---

## Protocolo de consulta para el planificador

```
 1. ¿Es HU o HT?
      HU  → funcionalidad de negocio, tiene actor y criterios de aceptación
      HT  → trabajo de plataforma (routing, auth, CI, design system). Vive en docs/stories/
 2. ls docs/fichas-perfil/historias/            → ¿está la HU en local?
      Sí  → léela. Es la fuente principal: trae reglas POL-XX y modelo de dominio
      No  → Nivel 3: historias_usuario_priorizadas.md, y el Event Storming del contexto
 3. LEER SIEMPRE docs/integracion-backend-frontend.md
      Extraer, por cada endpoint que la HU necesita: ¿implementado o pendiente? ¿ruta y body exactos?
 4. Para todo endpoint que la HU introduzca y ese documento no liste:
      abrir el Controller real en ../arquisoft-backend y confirmar ruta, verbo, DTO y client role
      Si el repo hermano no está disponible → marcar el contrato como NO VERIFICADO en el plan
 5. Identificar los roles del realm que consumen la HU y cruzarlos con:
      src/shared/models/rol.ts        (enum Rol — los valores válidos)
      src/layout/nav-items.ts         (ROLES_POR_RUTA — quién entra a la ruta)
      docs/permisos-granulares.md     (si la HU restringe dentro de la vista)
 6. Si la HU toca un catálogo (estados, tipos de ítem):
      leer la data de referencia y listar en el plan id/nombre/descripcion de cada fila
      La UI muestra `nombre`; nunca hardcodees esa lista en un enum del frontend
 7. Si la HU introduce o cambia un límite de longitud:
      confirmarlo contra el DDL o el modelo enriquecido y anotarlo para LIMITES
 8. Registrar en la Metadata del plan todos los archivos consultados, con su ruta
```

---

## Manejo de errores

| Error | Causa probable | Acción |
|---|---|---|
| `HTTP 401` | Token expirado o sin permisos | `gh auth refresh` o `gh auth login` |
| `HTTP 404` | La ruta no existe | Lista la carpeta padre (`--jq ".[].name"`) y usa el nombre exacto |
| `HTTP 403` | Sin acceso a la organización | Pedir al admin de `arquisoft-uco` que otorgue acceso al token |
| `gh: command not found` | CLI no instalado | https://cli.github.com/ |
| Contenido ilegible | Se usó `--jq '.content'` sin decodificar | Usar `-H "Accept: application/vnd.github.raw+json"` |
| `ls ../arquisoft-backend` falla | El repo hermano no está clonado al mismo nivel | Sigue con las fuentes locales y marca el contrato como no verificado |

### Notas

- **Nombres con espacios:** los Event Storming los llevan (`Ficha Perfil - Event Storming.md`).
  Comillas dobles en la URL del `gh api`.
- **`.xlsx` y `.drawio.xml` no son legibles como texto.** Ignóralos; usa los `.md`.
- **Los `HU*.md` locales son una copia filtrada**, no el original. Si uno contradice al catálogo
  remoto, gana el remoto y se anota la discrepancia.
