# Planificación: Permisos Granulares en el Frontend

## Contexto

El sistema ya cuenta con autenticación Keycloak funcional, control de acceso por rol (`roleGuard`, `HasRoleDirective`, `RolActivoService`) y un interceptor que maneja 401/403. El objetivo es añadir un segundo nivel: **permisos granulares efectivos** (permisos de rol + overrides personales) sin romper lo existente.

---

## Principios de diseño

- Los **roles** siguen controlando el acceso a **rutas** (grueso).
- Los **permisos** controlan la visibilidad de **acciones dentro de una vista** (fino: botones, formularios, secciones).
- El frontend **nunca es la línea de seguridad final**. Ocultar un elemento es UX, no seguridad. El backend valida cada request.
- Los permisos efectivos viajan en el JWT como un claim `permissions: string[]`. El backend (o un Protocol Mapper de Keycloak) calcula `permisos_del_rol ∪ overrides_personales` antes de firmar el token.

---

## Convención de identificadores de permiso

Formato: `recurso:accion`

| Permiso | Descripción |
|---|---|
| `fichas-perfil:leer` | Ver listado y detalle de fichas |
| `fichas-perfil:crear` | Crear una ficha de perfil |
| `fichas-perfil:editar` | Editar ficha de perfil |
| `fichas-perfil:eliminar` | Eliminar ficha de perfil |
| `proyectos-grado:leer` | Ver proyectos de grado |
| `proyectos-grado:crear` | Crear proyecto de grado |
| `proyectos-grado:editar` | Editar proyecto de grado |
| `artefactos:leer` | Ver artefactos |
| `artefactos:crear` | Subir artefacto |
| `artefactos:eliminar` | Eliminar artefacto |
| `entregables:leer` | Ver entregables |
| `entregables:crear` | Crear entregable |
| `entregables:editar` | Editar entregable |
| `evaluaciones:leer` | Ver evaluaciones |
| `evaluaciones:calificar` | Calificar una evaluación |
| `mapas-ruta:leer` | Ver mapas de ruta |
| `mapas-ruta:editar` | Editar mapa de ruta |
| `repositorio-artefactos:leer` | Ver repositorio |
| `repositorio-artefactos:subir` | Subir al repositorio |
| `biblioteca:leer` | Ver biblioteca |
| `biblioteca:gestionar` | Gestionar recursos de biblioteca |
| `solicitudes:leer` | Ver solicitudes |
| `solicitudes:crear` | Crear solicitud |
| `solicitudes:aprobar` | Aprobar o rechazar solicitudes |

> Esta lista es un punto de partida. Ampliar según los endpoints reales del backend.

---

## Cambios requeridos

### 1. Exponer `tokenParsed` en `KeycloakService`

**Archivo:** `src/app/core/auth/keycloak.service.ts`

**Cambio:** El signal `_tokenParsed` ya existe pero es privado. Exponer como readonly para que `PermissionService` lo lea sin acoplarse al SDK de Keycloak.

```ts
// Añadir junto a los otros signals readonly públicos
readonly tokenParsed = this._tokenParsed.asReadonly();
```

---

### 2. Crear `Permission` model

**Archivo nuevo:** `src/app/shared/models/permission.model.ts`

Catálogo de todos los identificadores de permiso del sistema como un objeto constante (evita strings mágicos en templates y componentes).

```ts
export const Permission = {
  // Fichas Perfil
  FichasPerfilLeer:    'fichas-perfil:leer',
  FichasPerfilCrear:   'fichas-perfil:crear',
  FichasPerfilEditar:  'fichas-perfil:editar',
  FichasPerfilEliminar:'fichas-perfil:eliminar',
  // Proyectos Grado
  ProyectosGradoLeer:  'proyectos-grado:leer',
  ProyectosGradoCrear: 'proyectos-grado:crear',
  ProyectosGradoEditar:'proyectos-grado:editar',
  // Artefactos
  ArtefactosLeer:      'artefactos:leer',
  ArtefactosCrear:     'artefactos:crear',
  ArtefactosEliminar:  'artefactos:eliminar',
  // Entregables
  EntregablesLeer:     'entregables:leer',
  EntregablesCrear:    'entregables:crear',
  EntregablesEditar:   'entregables:editar',
  // Evaluaciones
  EvaluacionesLeer:      'evaluaciones:leer',
  EvaluacionesCalificar: 'evaluaciones:calificar',
  // Mapas Ruta
  MapasRutaLeer:  'mapas-ruta:leer',
  MapasRutaEditar:'mapas-ruta:editar',
  // Repositorio
  RepositorioLeer:  'repositorio-artefactos:leer',
  RepositorioSubir: 'repositorio-artefactos:subir',
  // Biblioteca
  BibliotecaLeer:     'biblioteca:leer',
  BibliotecaGestionar:'biblioteca:gestionar',
  // Solicitudes
  SolicitudesLeer:   'solicitudes:leer',
  SolicitudesCrear:  'solicitudes:crear',
  SolicitudesAprobar:'solicitudes:aprobar',
} as const;

export type Permission = typeof Permission[keyof typeof Permission];
```

---

### 3. Crear `PermissionService`

**Archivo nuevo:** `src/app/core/auth/permission.service.ts`

Lee el claim `permissions` del JWT parseado. Es un signal reactivo: cuando el token se renueva, `effectivePermissions` se recalcula automáticamente.

```ts
import { computed, inject, Injectable } from '@angular/core';
import { KeycloakService } from './keycloak.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly _keycloak = inject(KeycloakService);

  /**
   * Set de permisos efectivos extraídos del claim `permissions` del JWT.
   * El backend calcula: permisos_del_rol ∪ overrides_personales.
   * Al renovarse el token, este computed se recalcula automáticamente.
   */
  readonly effectivePermissions = computed<ReadonlySet<string>>(() => {
    const parsed = this._keycloak.tokenParsed();
    const perms = (parsed?.['permissions'] as string[] | undefined) ?? [];
    return new Set(perms);
  });

  has(permission: string): boolean {
    return this.effectivePermissions().has(permission);
  }

  hasAny(permissions: string[]): boolean {
    return permissions.some(p => this.has(p));
  }

  hasAll(permissions: string[]): boolean {
    return permissions.every(p => this.has(p));
  }
}
```

---

### 4. Crear `HasPermissionDirective`

**Archivo nuevo:** `src/app/shared/directives/has-permission.directive.ts`

Directiva estructural análoga a `HasRoleDirective`. Muestra u oculta un elemento del DOM según si el usuario tiene el permiso requerido.

```ts
import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionService } from '../../core/auth/permission.service';

/**
 * Directiva estructural que muestra contenido solo cuando el usuario
 * tiene el permiso (o alguno de los permisos) requeridos.
 *
 * Uso:
 * ```html
 * <button *hasPermission="'artefactos:crear'">Subir artefacto</button>
 * <button *hasPermission="['solicitudes:aprobar', 'solicitudes:editar']">Gestionar</button>
 * ```
 */
@Directive({
  selector: '[hasPermission]',
})
export class HasPermissionDirective {
  private readonly _permissionService = inject(PermissionService);
  private readonly _templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly _viewContainer = inject(ViewContainerRef);

  readonly hasPermission = input.required<string | string[]>();

  constructor() {
    effect(() => {
      const perms = this.hasPermission();
      const allowed = Array.isArray(perms)
        ? this._permissionService.hasAny(perms)
        : this._permissionService.has(perms);

      this._viewContainer.clear();
      if (allowed) {
        this._viewContainer.createEmbeddedView(this._templateRef);
      }
    });
  }
}
```

---

### 5. Crear `permissionGuard`

**Archivo nuevo:** `src/app/core/auth/permission.guard.ts`

Guard de ruta para proteger sub-rutas que requieren un permiso específico (complementa a `roleGuard`).

```ts
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { PermissionService } from './permission.service';

/**
 * Guard que protege rutas según permisos granulares del usuario.
 *
 * Uso:
 * ```ts
 * {
 *   path: 'nueva',
 *   canActivate: [permissionGuard],
 *   data: { permissions: ['artefactos:crear'] }
 * }
 * ```
 */
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);
  const required: string[] = route.data['permissions'] ?? [];

  if (required.length === 0) return true;
  if (permissionService.hasAny(required)) return true;

  return router.parseUrl('/forbidden');
};
```

---

### 6. Aplicar guards y directiva en rutas y vistas

**Archivos afectados:** `app.routes.ts` y los `.routes.ts` de cada feature.

Ejemplo para sub-rutas de artefactos:

```ts
// src/app/features/artefactos/artefactos.routes.ts
{
  path: 'nueva',
  canActivate: [permissionGuard],
  data: { permissions: [Permission.ArtefactosCrear] },
  loadComponent: () => import('./components/nueva-artefacto/nueva-artefacto')
    .then(m => m.NuevaArtefactoComponent),
}
```

Ejemplo en template:

```html
<!-- Solo visible si el usuario tiene el permiso -->
<button *hasPermission="Permission.ArtefactosCrear">Nuevo Artefacto</button>

<!-- Acepta varios permisos (cualquiera es suficiente) -->
<button *hasPermission="[Permission.SolicitudesAprobar]">Aprobar Solicitud</button>
```

---

### 7. Verificar que el interceptor de errores ya maneja 401 (sin cambios)

**Archivo:** `src/app/core/http/interceptors/error.interceptor.ts`

El interceptor existente ya ejecuta `keycloak.logout()` ante un 401. Esto cubre el escenario donde el backend invalida la sesión del usuario al modificar sus permisos. **No requiere cambios.**

---

## Responsabilidad del backend (coordinación requerida)

Para que el frontend funcione, el backend debe:

1. **Incluir un claim `permissions` en el JWT** con la lista de permisos efectivos calculados (`permisos_del_rol` + `overrides_personales` con prioridad sobre el rol).
   - Implementar como **Protocol Mapper** en Keycloak (recomendado), o
   - Hacerlo en el backend y agregar el claim en un token de sesión customizado.

2. **Cuando se modifican los permisos de un usuario**, llamar al Admin API de Keycloak para invalidar sus sesiones activas:
   ```
   DELETE {keycloak}/admin/realms/{realm}/users/{userId}/sessions
   ```
   Esto fuerza el re-login del usuario y la obtención de un nuevo JWT con los permisos actualizados.

---

## Orden de implementación sugerido

| # | Tarea | Archivo | Bloqueante |
|---|---|---|---|
| 1 | Exponer `tokenParsed` en `KeycloakService` | `core/auth/keycloak.service.ts` | Todos los siguientes |
| 2 | Crear `Permission` model | `shared/models/permission.model.ts` | 4, 5, 6 |
| 3 | Crear `PermissionService` | `core/auth/permission.service.ts` | 4, 5 |
| 4 | Crear `HasPermissionDirective` | `shared/directives/has-permission.directive.ts` | 6 |
| 5 | Crear `permissionGuard` | `core/auth/permission.guard.ts` | 6 |
| 6 | Aplicar en rutas y templates | `*.routes.ts`, `*.html` | — |
| 7 | Coordinar claim `permissions` con backend | Backend / Keycloak | Todo |

---

## Lo que NO cambia

- `KeycloakService` — solo se expone `tokenParsed`.
- `RolActivoService` — sigue gestionando el rol activo para vistas multi-rol.
- `roleGuard` — sigue protegiendo rutas de nivel de módulo.
- `HasRoleDirective` — sigue siendo válida para visibilidad basada en rol.
- `authInterceptor` / `errorInterceptor` — sin cambios.
- Infraestructura de refresh de token — sin cambios.
