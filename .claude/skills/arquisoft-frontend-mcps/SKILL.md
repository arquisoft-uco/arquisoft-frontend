---
name: arquisoft-frontend-mcps
description: MCPs recomendados por defecto para trabajar en Arquisoft Frontend (Context7, Claude in Chrome, GitHub, IDEA/WebStorm) y cuándo preferirlos sobre el fallback por Bash/CLI. Cargar junto con arquisoft-frontend-arquitectura al planificar, implementar, testear o revisar la UI.
---

# Skill: arquisoft-frontend-mcps

MCPs que este proyecto prefiere **cuando están cargados en la sesión**. Si uno no está, usa su
fallback sin bloquear el flujo ni pedirle al usuario que lo instale.

| MCP | Úsalo para | Fallback |
|---|---|---|
| **Context7** (`mcp__context7__*`) | Documentación actual de las librerías del stack antes de generar o revisar código que las usa. IDs ya resueltos en `context7-stack-frontend`. Es política global del usuario | Conocimiento del modelo, dejando explícito que puede estar desactualizado |
| **Claude in Chrome** (`mcp__claude-in-chrome__*`) | Verificar la UI real: navegar a `localhost:5173`, capturar una vista, leer consola (`read_console_messages`) y peticiones (`read_network_requests`), grabar un GIF para el PR. **El más útil de este repo** — un frontend se valida mirándolo | `npm run dev` y pedirle al usuario que describa lo que ve. Nunca des por verificada una pantalla que no viste |
| **GitHub MCP** (`mcp__github__*`) | PRs, issues, ramas y checks de CI sobre `arquisoft-uco/arquisoft-frontend`; leer archivos de `arquisoft-docs` con `get_file_contents` | `gh` CLI, como documenta `gh-docs-reader` |
| **IDEA MCP** (`mcp__idea__*`) | Buscar símbolos y usos (`search_symbol`, `analyze_calls`), problemas del editor (`get_file_problems`) con el repo abierto en WebStorm | `Grep`/`Glob` y `npm run lint` |

## Antes de usar Claude in Chrome

1. Invoca la skill `claude-in-chrome` (es su requisito) y carga las herramientas en **una sola**
   llamada a `ToolSearch`.
2. Llama a `tabs_context_mcp` primero y **crea una pestaña nueva**; nunca reutilices IDs de otra sesión.
3. El servidor debe estar arriba (`npm run dev` → `localhost:5173`). Con `VITE_AUTH_BYPASS=true` la
   app entra sin Keycloak — sirve para ver pantallas y flujos de UI rápido, pero el token que genera
   (`dev-bypass-token`, ver `src/auth/devAuth.ts`) es un string falso: **el backend real lo rechaza**
   (401/403). No sirve para verificar que un endpoint responde bien ni para depurar permisos.
4. No dispares `alert`/`confirm`/`prompt`: bloquean la extensión. `ConfirmDialog` es un modal de
   React, no un diálogo del navegador — ese es seguro.

## Autenticación real contra el backend (permisos, endpoints, no solo UI)

Para cualquier prueba que dependa de que el backend acepte el token — un endpoint nuevo, un 403 que
no cuadra, verificar un rol — `VITE_AUTH_BYPASS` no sirve. Usa el login real:

1. Arranca el servidor **sin** `VITE_AUTH_BYPASS` (o explícitamente en `false`, que es el valor de
   `.env.development.local`). Redirige a Keycloak real (`VITE_KEYCLOAK_URL`, `auth.arquisoft.top`).
2. Usuario de prueba en local: **`dev-user`**, contraseña **`dev-user`** (mismo valor que el usuario).
3. **Claude nunca escribe la contraseña ni pulsa "Sign In"** — entrar credenciales en un formulario
   está prohibido sin importar que sean de prueba o que el usuario lo pida explícitamente. Deja el
   formulario de Keycloak listo (navegado, con el campo enfocado si hace falta) y pide al usuario que
   inicie sesión él mismo; retoma la verificación una vez la sesión esté activa.
4. Con sesión real, los 401/403 que veas en `read_network_requests` son reales — repórtalos como
   bloqueante del backend (candidato a `docs/integracion-backend-frontend.md`), no como falla de UI.

## Antes de levantar o relanzar el servidor de desarrollo

Un único proceso de Vite vivo por máquina, siempre. Antes de lanzar `npm run dev` (por Bash, por
`mcp__webstorm__execute_run_configuration`/`execute_terminal_command`, o por cualquier otro medio),
finaliza cualquier proceso previo — no asumas que terminó solo:

```bash
lsof -i:5173 -sTCP:LISTEN   # PID que tiene el puerto
pgrep -af vite               # procesos vite, incluye huérfanos sin el puerto
pgrep -af "npm run dev"
```

Mata lo que encuentres antes de relanzar. Un relanzamiento con flags distintos (ej. agregar
`--host` para exponer en la red) deja huérfano el proceso anterior si solo confías en que el nuevo
tomó el puerto — verifica con `pgrep`, no solo con `lsof` sobre el puerto.

Con la run configuration `dev` del IDE (`.idea/runConfigurations/dev.xml`, tipo npm, sin variables
de entorno propias — hereda `.env.development.local`, login real por defecto), aplica lo mismo:
`execute_run_configuration` no mata la instancia anterior por ti.

**Ojo con la caché de WebStorm:** editar `dev.xml` (agregar/quitar `<envs>`, `<arguments>`) no
siempre se refleja de inmediato en `execute_run_configuration` — puede seguir lanzando la versión
cacheada. Si necesitas certeza (ej. confirmar que `VITE_AUTH_BYPASS` no quedó pegado), verifica el
entorno real del proceso antes de asumir que el cambio surtió efecto:

```bash
for pid in $(pgrep -f "node.*vite"); do tr '\0' '\n' < /proc/$pid/environ | grep -i VITE_AUTH; done
```

Si no coincide con lo esperado, lanza directo por Bash (`npm run dev -- --host`, con o sin
`VITE_AUTH_BYPASS=true` explícito) en vez de seguir peleando con la run configuration.

## No aplican aquí

`claude_ai_Microsoft_365`, `claude_ai_Stytch` y `drawio` no tienen relación con el stack ni con el
contenido de este repositorio. No los invoques salvo petición explícita.
