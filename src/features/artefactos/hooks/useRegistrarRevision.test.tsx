import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { artefactosService } from '../services/artefactosService';
import { useRegistrarRevision } from './useRegistrarRevision';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { registrarRevision: vi.fn() },
}));

const registrar = vi.mocked(artefactosService.registrarRevision);

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useRegistrarRevision', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('en éxito invalida el listado de versiones por su prefijo y no el del asesor', async () => {
    // Arrange
    registrar.mockResolvedValue({ id: 'r-1' });
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRegistrarRevision(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    await act(async () => {
      await result.current.mutateAsync('v-1');
    });

    // Assert
    expect(registrar).toHaveBeenCalledWith('v-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'versiones-artefacto'] });
    expect(invalidar).not.toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] });
  });

  it('un 422 de dato desactualizado invalida versiones y asesor, y otro error no invalida', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRegistrarRevision(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    registrar.mockRejectedValueOnce(errorApi(500, { status: 500, message: 'caído' }));
    act(() => result.current.mutate('v-1'));
    await waitFor(() => expect(result.current.isError).toBe(true));
    const trasOtro = invalidar.mock.calls.length;

    registrar.mockRejectedValueOnce(
      errorApi(422, { status: 422, errorCode: 'VERSION_ARTEFACTO_NO_ES_ULTIMA', message: 'x' }),
    );
    act(() => result.current.mutate('v-1'));
    await waitFor(() =>
      expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] }),
    );

    // Assert
    expect(trasOtro).toBe(0);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'versiones-artefacto'] });
  });
});
