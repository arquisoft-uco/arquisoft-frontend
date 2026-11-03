import { useMutationState } from '@tanstack/react-query';

export const CLAVE_ELIMINAR_OBSERVACION = ['artefactos', 'eliminar-observacion'];

export function useObservacionEnEliminacion(observacionId: string): boolean {
  const pendientes = useMutationState({
    filters: { mutationKey: CLAVE_ELIMINAR_OBSERVACION, status: 'pending' },
    select: (mutacion) => mutacion.state.variables,
  });

  return pendientes.some((id) => typeof id === 'string' && id === observacionId);
}
