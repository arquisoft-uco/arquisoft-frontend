---
name: arquisoft-frontend-mcps
description: MCPs recomendados por defecto para trabajar en Arquisoft Frontend (Context7, Claude in Chrome, GitHub, IDEA/WebStorm) y cuándo preferirlos sobre el fallback por Bash/CLI. Cargar junto con arquisoft-frontend-arquitectura al planificar, implementar, testear o revisar la UI.
---

# Skill: arquisoft-frontend-mcps

MCPs que este proyecto prefiere por defecto **cuando están disponibles en la sesión**. Si un MCP no
está cargado, usa el fallback documentado en cada fila — la ausencia de un MCP nunca bloquea el
flujo, solo cambia la herramienta.

| MCP | Úsalo por defecto para | Fallback si no está disponible |
|---|---|---|
| **Context7** (`mcp__context7__*`) | Documentación actual de las librerías del stack (React 19, react-router 7, TanStack Query 5, Zustand 5, react-hook-form 7, Zod 3, Tailwind 4, Vite 6, Vitest 4, keycloak-js 26) antes de generar o revisar código que las usa — IDs validados en la skill `context7-stack-frontend`. Es política global del usuario, no solo de este proyecto. | Basarse en el conocimiento del modelo, dejando explícito que puede estar desactualizado para la versión exacta del stack. |
| **Claude in Chrome** (`mcp__claude-in-chrome__*`) | Verificar la UI real contra el navegador: navegar a `http://localhost:5173`, capturar el estado de una vista, leer la consola (`read_console_messages`) y las peticiones (`read_network_requests`) cuando una pantalla falla, y grabar un GIF de un flujo para el PR. Es el MCP más útil de este repo — un frontend se valida mirándolo. | `npm run dev` y pedirle al usuario que abra el navegador y describa/pegue lo que ve. Nunca des por verificada una pantalla que no viste. |
| **GitHub MCP** (`mcp__github__*`) | Operaciones sobre `arquisoft-uco/arquisoft-frontend`: PRs, issues, ramas, checks de CI. También leer archivos del repo privado `arquisoft-uco/arquisoft-docs` con `get_file_contents` en vez de `gh api` crudo. | El flujo con GitHub CLI (`gh api ... -H "Accept: application/vnd.github.raw+json"`) documentado en la skill `gh-docs-reader`. |
| **IDEA MCP** (`mcp__idea__*`) | Buscar símbolos y usos (`search_symbol`, `search_text`, `analyze_calls`), leer problemas del editor (`get_file_problems`) y lanzar comandos del proyecto cuando el repo está abierto en WebStorm/IntelliJ. | `Grep`/`Glob` y `npm run lint` por Bash. |

## Antes de usar Claude in Chrome

1. Invoca primero la skill `claude-in-chrome` (es su requisito) y carga las herramientas que vas a
   necesitar **en una sola llamada a `ToolSearch`**, no una por una.
2. Llama a `tabs_context_mcp` antes que nada y **crea una pestaña nueva** (`tabs_create_mcp`) salvo
   que el usuario pida trabajar sobre una suya. Nunca reutilices IDs de pestaña de otra sesión.
3. El servidor de desarrollo tiene que estar arriba: `npm run dev` → `http://localhost:5173`. Con
   `VITE_AUTH_BYPASS=true` en `.env.development.local` la app entra sin Keycloak, que es lo que hace
   viable la verificación automatizada.
4. No dispares `alert`/`confirm`/`prompt`: bloquean la extensión y dejan la sesión sin respuesta.
   `ConfirmDialog` del proyecto es un modal de React, no un diálogo del navegador — ese sí es seguro.

## No recomendados para este proyecto

`claude_ai_Microsoft_365`, `claude_ai_Stytch` y `drawio` no tienen relación con el stack ni con el
contenido de este repositorio — no los invoques a menos que el usuario lo pida explícitamente para
una tarea puntual.

## Regla general

Antes de usar un MCP de esta lista, verifica que está cargado en la sesión (aparece en las
herramientas disponibles o vía `ToolSearch`). Si no aparece, usa el fallback sin bloquear el flujo ni
pedirle al usuario que lo instale, salvo que la tarea explícitamente lo requiera.
