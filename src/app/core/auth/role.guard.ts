import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { RolActivoService } from './rol-activo.service';
import { Rol } from '../../shared/models/rol.model';

/**
 * Guard que protege rutas según el rol activo seleccionado por el usuario.
 *
 * Redirige a `/seleccionar-rol` si no hay un rol activo.
 * Redirige a `/forbidden` si el rol activo no tiene acceso a la ruta.
 *
 * Uso en la definición de ruta:
 * ```ts
 * {
 *   path: 'admin',
 *   canActivate: [roleGuard],
 *   data: { roles: [Rol.Administrador, Rol.Coordinador] }
 * }
 * ```
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const rolActivoService = inject(RolActivoService);
  const router = inject(Router);
  const rolesRequeridos: Rol[] = route.data['roles'] ?? [];

  if (rolesRequeridos.length === 0) return true;

  const rolActivo = rolActivoService.rolActivo();

  if (!rolActivo) {
    return router.parseUrl('/seleccionar-rol');
  }

  if (rolesRequeridos.includes(rolActivo)) return true;

  return router.parseUrl('/forbidden');
};
