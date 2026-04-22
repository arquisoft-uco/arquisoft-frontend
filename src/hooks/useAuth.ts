import { useMemo } from 'react';
import { useAuthStore, parseRoles } from '../stores/authStore';
import { useRoleStore } from '../stores/roleStore';
import { Rol } from '../shared/models/rol';

const ROL_VALUES = new Set<string>(Object.values(Rol));

function isValidRol(value: string): value is Rol {
  return ROL_VALUES.has(value);
}

/** All roles from the JWT that are recognised by the system enum. */
export function useRolesDisponibles(): Rol[] {
  const tokenParsed = useAuthStore((s) => s.tokenParsed);
  return useMemo(
    () => parseRoles(tokenParsed).filter(isValidRol) as Rol[],
    [tokenParsed],
  );
}

/**
 * Derives the effective active role, replicating Angular's RolActivoService.rolActivo computed:
 * 1. If the stored role is still in the user's JWT roles → use it.
 * 2. If the user has exactly one role → auto-select it.
 * 3. Otherwise null (user must visit SeleccionarRol).
 */
export function useRolActivo(): Rol | null {
  const rolesDisponibles = useRolesDisponibles();
  const rolSeleccionado = useRoleStore((s) => s.rolSeleccionado);

  return useMemo(() => {
    if (rolSeleccionado && rolesDisponibles.includes(rolSeleccionado)) return rolSeleccionado;
    if (rolesDisponibles.length === 1) return rolesDisponibles[0];
    return null;
  }, [rolSeleccionado, rolesDisponibles]);
}

/** True while Keycloak has not yet finished init. */
export function useIsInitializing(): boolean {
  return useAuthStore((s) => s.isInitializing);
}

export function useUsername(): string {
  return useAuthStore((s) => s.username);
}
