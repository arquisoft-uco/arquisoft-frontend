import { useMemo } from 'react';
import { useRolActivo } from './useAuth';
import type { Rol } from '../shared/models/rol';

/** Returns true when the current active role is in the list of allowed roles. */
export function useHasRole(roles: Rol[]): boolean {
  const rolActivo = useRolActivo();
  return useMemo(
    () => (rolActivo !== null ? roles.includes(rolActivo) : false),
    [rolActivo, roles],
  );
}
