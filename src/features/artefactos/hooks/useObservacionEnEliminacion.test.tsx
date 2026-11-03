import { describe, it, expect } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import {
  CLAVE_ELIMINAR_OBSERVACION,
  useObservacionEnEliminacion,
} from './useObservacionEnEliminacion';

describe('useObservacionEnEliminacion', () => {
  it('es true solo para la observación con eliminación pendiente y vuelve a false al terminar', async () => {
    // Arrange
    const queryClient = new QueryClient();
    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }
    let resolver: () => void = () => {};
    const { result } = renderHook(
      () => ({
        mutacion: useMutation<void, unknown, string>({
          mutationKey: CLAVE_ELIMINAR_OBSERVACION,
          mutationFn: () => new Promise<void>((resolve) => (resolver = resolve)),
        }),
        o1: useObservacionEnEliminacion('o-1'),
        o2: useObservacionEnEliminacion('o-2'),
      }),
      { wrapper: Wrapper },
    );
    expect(result.current.o1).toBe(false);

    // Act
    act(() => result.current.mutacion.mutate('o-1'));

    // Assert
    await waitFor(() => expect(result.current.o1).toBe(true));
    expect(result.current.o2).toBe(false);

    // Act
    await act(async () => resolver());

    // Assert
    await waitFor(() => expect(result.current.o1).toBe(false));
  });
});
