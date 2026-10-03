---
name: arquisoft-frontend-mcps
description: MCPs recomendados por defecto para trabajar en Arquisoft Frontend (Context7, Claude in Chrome) y cuándo preferirlos sobre el fallback por Bash/CLI. Cargar al implementar o al verificar la UI en el navegador.
---

# Skill: arquisoft-frontend-mcps

MCPs que este proyecto prefiere **cuando están cargados en la sesión**. Si uno no está, usa su
fallback sin bloquear el flujo ni pedirle al usuario que lo instale.

| MCP | Úsalo para | Fallback |
|---|---|---|
| **Context7** (`mcp__context7__*`) | Documentación actual de las librerías del stack antes de generar o revisar código que las usa. IDs ya resueltos en `context7-stack-frontend` | Conocimiento del modelo, dejando explícito que puede estar desactualizado |
| **Claude in Chrome** (`mcp__claude-in-chrome__*`) | Verificar la UI real: navegar a `localhost:5173`, capturar una vista, leer consola (`read_console_messages`) y peticiones (`read_network_requests`), grabar un GIF para el PR. **El más útil de este repo** — un frontend se valida mirándolo | `npm run dev` y pedirle al usuario que describa lo que ve. Nunca des por verificada una pantalla que no viste |

Para PRs, issues y archivos de `arquisoft-docs` usa `gh` (ver `gh-docs-reader`): no hay MCP de GitHub.

## Antes de usar Claude in Chrome

1. Invoca la skill `claude-in-chrome` (es su requisito) y carga las herramientas en **una sola**
   llamada a `ToolSearch`.
2. Llama a `tabs_context_mcp` primero y **crea una pestaña nueva**; nunca reutilices IDs de otra sesión.
3. El servidor debe estar arriba (`npm run dev` → `localhost:5173`). Con `VITE_AUTH_BYPASS=true` la
   app entra sin Keycloak — sirve para ver pantallas y flujos de UI rápido, pero el token que genera
   (`dev-bypass-token`, ver `src/auth/devAuth.ts`) es falso: **el backend real lo rechaza** (401/403).
   No sirve para verificar que un endpoint responde ni para depurar permisos.
4. No dispares `alert`/`confirm`/`prompt`: bloquean la extensión. `ConfirmDialog` es un modal de
   React, no un diálogo del navegador — ese es seguro.

## Autenticación real contra el backend (permisos, endpoints, no solo UI)

Para cualquier prueba que dependa de que el backend acepte el token — un endpoint nuevo, un 403 que no
cuadra, verificar un rol — `VITE_AUTH_BYPASS` no sirve. Usa el login real:

1. Arranca el servidor **sin** `VITE_AUTH_BYPASS` (o en `false`, el valor de `.env.development.local`).
   Redirige al Keycloak real (`VITE_KEYCLOAK_URL`).
2. Usuario de prueba en local: **`dev-user`**, contraseña **`dev-user`**; tiene todos los roles.
3. **Claude nunca escribe la contraseña ni pulsa "Sign In"** — entrar credenciales en un formulario
   está prohibido aunque sean de prueba o el usuario lo pida. Deja el formulario de Keycloak listo
   (navegado, con el campo enfocado) y pide al usuario que inicie sesión él mismo; retoma la
   verificación cuando la sesión esté activa.
4. Con sesión real, los 401/403 de `read_network_requests` son reales: repórtalos como bloqueante del
   backend (candidato a `docs/pendientes.md`), no como falla de UI.

## Antes de levantar o relanzar el servidor de desarrollo

Un único proceso de Vite vivo por máquina. Antes de lanzar `npm run dev` mata el proceso previo; no
asumas que terminó solo:

```bash
lsof -i:5173 -sTCP:LISTEN   # PID que tiene el puerto
pgrep -af vite               # incluye huérfanos sin el puerto
pgrep -af "npm run dev"
```

Verifica con `pgrep`, no solo con el puerto: un relanzamiento con flags distintos (p. ej. `--host`)
deja huérfano el proceso anterior.
