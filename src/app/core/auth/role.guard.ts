import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from './keycloak.service';

/** Protect a route by realm roles.
 *
 * Usage in route definition:
 * ```ts
 * {
 *   path: 'admin',
 *   canActivate: [roleGuard],
 *   data: { roles: ['admin'] }
 * }
 * ```
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);
  const requiredRoles: string[] = route.data['roles'] ?? [];

  if (requiredRoles.length === 0 || keycloak.hasAnyRole(requiredRoles)) {
    return true;
  }

  return router.parseUrl('/forbidden');
};
