# Revisión de Código — Rama `develop`

**Fecha:** 2026-05-19  
**Rama revisada:** `develop`  
**Stack:** React 19 · TypeScript 5.9 · Vite 6 · TanStack Query 5 · Zustand 5 · Keycloak JS 26 · React Router 7  

| Verificación | Estado |
|---|---|
| TypeScript (`npm run lint`) | ✅ Sin errores |
| Tests (`npm run test`) | ❌ 0 archivos de prueba |

---

## 🔴 Crítico — Bloqueante para producción

### 1. Sin cobertura de tests

No existe ningún archivo `.test.tsx` / `.spec.ts` en `src/`. Las utilidades de prueba existen en `src/test-utils/` pero nadie las usa. Los flujos críticos `AuthGuard`, `RoleGuard` y `fichasPerfilService` no tienen ninguna validación automatizada.

**Acción:** escribir al menos tests de humo para los guards de autenticación y el servicio de fichas de perfil.

---

### 2. Ruta `example-domain` expuesta en producción ✅ Corregido

La ruta `{ path: 'example-domain', element: <ExampleList /> }` y su import lazy estaban registrados en `src/router.tsx`. Al no aparecer en `src/layout/nav-items.ts` ni en ningún otro componente fuera de su propio directorio, se confirmó que es código de plantilla/referencia que no debe estar en producción.

**Acción aplicada:** se eliminó el import lazy y la entrada de ruta en `src/router.tsx`.

---

### 3. Dashboard con datos estáticos hardcodeados

`src/features/dashboard/Dashboard.tsx` (líneas 91-94) muestra estadísticas fijas (`"12"`, `"5"`, `"3"`) y textos como `"Próximo vence hoy"`. Son valores de maqueta, no datos reales del backend, lo que confundirá a los usuarios en producción.

**Acción:** reemplazar con llamadas reales a la API o eliminar la sección de estadísticas hasta tener los endpoints disponibles.

---

## 🟠 Alto — Riesgo significativo

### 4. `VITE_AUTH_BYPASS=true` comprometido en el repositorio ✅ Corregido

`.env.development` tenía `VITE_AUTH_BYPASS=true` commiteado como configuración por defecto del equipo, lo que suponía riesgo si un pipeline de CI construía sin sobreescribir esa variable.

**Acción aplicada:** se eliminó `.env.development` del repositorio. Ahora cada desarrollador crea su propio `.env.development.local` (gitignored) a partir de `.env.example`. Se actualizaron `README.md`, `CLAUDE.md` y `AuthGuard.tsx` para reflejar el cambio.

**Acción pendiente recomendada:** agregar una guardia en `src/main.tsx` como salvaguarda adicional:

```ts
if (import.meta.env.PROD && import.meta.env.VITE_AUTH_BYPASS === 'true') {
  throw new Error('VITE_AUTH_BYPASS no puede ser true en producción.');
}
```

---

### 5. Detección de errores por parsing de string ✅ Corregido

`RegistrarEvaluacionPanel.tsx` y `AgregarEstadoEvaluacionPanel.tsx` parseaban el mensaje del error de JavaScript para detectar códigos HTTP, lo cual es frágil e incorrecto.

**Acciones aplicadas:**
- Se creó `src/shared/utils/api-error.ts` con las funciones `getApiErrorMessage`, `getApiErrorStatus`, `isApiErrorWithStatus`, `hasApiErrorCode`, `getApiFieldErrors` y `classifyApiError`, alineadas con el `ErrorResponseDTO` del backend.
- Se actualizó `src/shared/models/api-response.ts` para incluir `errorCode`, `fieldErrors` y la nueva interfaz `FieldError`.
- Se reemplazaron todos los `(error as Error)?.message?.includes(...)` y `err instanceof Error ? err.message` por `getApiErrorMessage(err, fallback)` en todos los componentes y hooks del feature `fichas-perfil`.

---

### 6. Inconsistencia de tipos en `RegistrarFichaPerfilRequest`

Hay dos interfaces para el mismo concepto con nombres de campo diferentes:

| Archivo | Campos |
|---|---|
| `models/RegistrarFichaPerfilRequest.ts` | `titulo`, `idAsesorFicha`, `idEstudiantes` |
| `models/fichas-perfil.ts` (`CrearFichaPerfilRequest`) | `tituloProyecto`, `asesorFichaId` |

Si el backend espera `tituloProyecto` y el frontend envía `titulo`, el POST a `/fichas-perfil` creará fichas sin título correctamente mapeado.

**Acción:** verificar el contrato del backend y unificar en una sola interfaz con los nombres correctos.

---

### 7. `RoleGuard` no aplicado en el router

`src/guards/RoleGuard.tsx` existe y funciona, pero **ninguna ruta en `src/router.tsx` lo usa**. La protección por rol ocurre solo dentro de `FichasPerfil.tsx`. Rutas como `/proyectos-grado`, `/evaluaciones`, `/biblioteca`, etc. son accesibles por cualquier usuario autenticado independientemente de su rol.

**Acción:** aplicar `RoleGuard` en cada ruta del router, o documentar explícitamente que la restricción es responsabilidad del componente de cada feature.

---

### 8. Sin error boundary global

`src/shared/components/ChunkErrorBoundary.tsx` solo envuelve el `<Outlet>` dentro de `AppLayout`. Si ocurre un error en `AuthGuard` o en `AppLayout` mismo, el usuario ve una pantalla en blanco sin posibilidad de recuperación.

**Acción:** envolver `<RouterProvider>` en `src/main.tsx` con un error boundary de nivel superior.

---

## 🟡 Medio — Mejoras recomendadas

### 9. Variables de entorno sin validación en arranque ✅ Corregido

`keycloak.ts` y `axiosInstance.ts` leían `import.meta.env.*` directamente sin verificar si los valores existían.

**Acciones aplicadas:**
- Creado `src/config/env.ts` — módulo de configuración centralizado que valida todas las variables al cargarse. Si alguna requerida está ausente lanza un error inmediato con el nombre de la variable y las instrucciones de configuración. También bloquea `VITE_AUTH_BYPASS=true` en builds de producción (hallazgo #4, acción pendiente).
- `keycloak.ts` y `axiosInstance.ts` leen ahora de `KEYCLOAK_CONFIG` y `API_URL` exportados por `env.ts`.
- `main.tsx` importa `./config/env` como primera línea, garantizando que la validación se ejecuta antes de montar React o inicializar Keycloak.

---

### 10. `console.error` sin servicio de observabilidad

`src/api/axiosInstance.ts` (línea 62) y `src/shared/components/ChunkErrorBoundary.tsx` (línea 24) solo escriben a la consola del navegador. En producción los errores no llegan a ningún sistema de alertas.

**Acción:** integrar un servicio de monitoreo de errores (Sentry u equivalente) en `componentDidCatch` y en el interceptor de respuesta.

---

### 11. Documentación SQL/YAML dentro de `src/` ✅ Corregido

`src/features/fichas-perfil/docs/` contenía archivos `.sql`, `.yaml` y `.md` dentro del ámbito de compilación de TypeScript.

**Acción aplicada:** directorio movido a `docs/fichas-perfil/` mediante `git mv` para preservar el historial de los archivos.

---

### 12. Formulario `RegistrarFichaPerfil` sin validación estructurada ✅ Corregido

`RegistrarFichaPerfil.tsx` usaba `noValidate` y validación manual con condicionales dispersos.

**Acciones aplicadas:**
- Instalada la dependencia `@hookform/resolvers`.
- Schema Zod con reglas explícitas: `titulo` (requerido, máx. 200 chars), `idAsesorFicha` (requerido), `idEstudiantes` (mín. 1, máx. 3).
- `useForm` con `zodResolver` y `mode: 'onChange'` — el botón "Registrar" se habilita solo cuando el form es válido.
- Mensajes de error inline accesibles (`aria-invalid`, `aria-describedby`, `role="alert"`) bajo cada campo.
- El campo de estudiantes (selección tag-style) se controla con `setValue` + `watch` de RHF.

---

### 13. `staleTime` global sin `gcTime` explícito ✅ Corregido

`src/main.tsx` configuraba `staleTime: 5 min` pero el `gcTime` por defecto también era 5 minutos, lo que eliminaba los datos del caché casi inmediatamente tras desmontarse el componente.

**Acciones aplicadas:**
- `src/main.tsx`: `gcTime` global aumentado a 30 min — navegar entre páginas y volver reutiliza el caché sin re-fetch.
- `useEstadosFicha`, `useEstadosEvaluacion`, `tiposItemQuery` (en `useItemsMiFicha`): agregado `gcTime: Infinity` junto al `staleTime: Infinity` ya existente — estos catálogos inmutables nunca se descartan del caché durante la sesión.

---

## 🔵 Bajo — Calidad y convenciones

### 14. `import React` innecesario en `FichasPerfil.tsx` ✅ Corregido

`src/features/fichas-perfil/FichasPerfil.tsx` importaba `React` manualmente. Con `"jsx": "react-jsx"` en `tsconfig.app.json` el transform automático de JSX no lo requiere.

**Acción aplicada:** eliminado el import.

---

### 15. `BADGE_COLORS` con strings en español como claves

`src/features/fichas-perfil/components/representante/EstadosEvaluacionPanel.tsx` usa los nombres textuales de los estados como claves del objeto de colores. Si el backend cambia el texto de un estado, el badge no mostrará el color correcto sin lanzar ningún error.

**Acción:** usar los IDs o los valores del enum `EstadoEvaluacion` como claves.

---

## ✅ Fortalezas del proyecto

- **Arquitectura de autenticación sólida:** `keycloak.ts` como singleton de módulo, mutex de refresh en el interceptor de Axios, `scheduleRefresh` con Visibility API, token exclusivamente en memoria.
- **Feature modules bien delimitados** con separación clara de `models/`, `hooks/`, `services/` y `components/`.
- **Separación de concerns correcta:** Zustand para UI, TanStack Query para estado de servidor, Axios fuera del árbol React.
- **Accesibilidad:** `aria-label`, `role`, `sr-only`, skip-to-content, manejo de teclado en `AppLayout` y `Header`.
- **`ChunkErrorBoundary`** para recuperar de errores de lazy-loading con botón de recarga.
- **`safeStorage`** con try/catch para Safari en modo privado.
- **TypeScript estricto:** `strict: true`, `noUnusedLocals`, `noUnusedParameters` — sin errores.

---

## Resumen de prioridades

| Prioridad | Hallazgo | Estado |
|---|---|---|
| 🔴 | Eliminar ruta `example-domain` del router | ✅ Corregido |
| 🔴 | Reemplazar datos hardcodeados en Dashboard | Pendiente |
| 🔴 | Verificar campos de `RegistrarFichaPerfilRequest` contra contrato del backend | Pendiente |
| 🟠 | Eliminar `.env.development` del repo | ✅ Corregido |
| 🟠 | Guard en `main.tsx` para `VITE_AUTH_BYPASS` en producción | Pendiente |
| 🟠 | Corregir detección de errores en paneles (string parsing) | ✅ Corregido |
| 🟠 | Aplicar `RoleGuard` en rutas del router | Pendiente |
| 🟠 | Error boundary global en `main.tsx` | Pendiente |
| 🟡 | Validación de variables de entorno en arranque | ✅ Corregido |
| 🟡 | Integrar observabilidad de errores en producción | Pendiente |
| 🟡 | Mover `src/features/fichas-perfil/docs/` fuera de `src/` | Pendiente |
| 🟡 | Migrar `RegistrarFichaPerfil` a `react-hook-form` + `zod` | Pendiente |
