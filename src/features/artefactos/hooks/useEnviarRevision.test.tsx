import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { artefactosService } from '../services/artefactosService';
import { useEnviarRevision } from './useEnviarRevision';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { enviarRevision: vi.fn() },
}));

const enviar = vi.mocked(artefactosService.enviarRevision);

const CLAVE_OBSERVACIONES = ['artefactos', 'revisiones-asesor', 'r-1', 'observaciones'];

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useEnviarRevision', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('en éxito invalida versiones y observaciones de esa revisión, sin tocar el catálogo del asesor', async () => {
    // Arrange
    enviar.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEnviarRevision(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    await act(async () => {
      await result.current.mutateAsync({ revisionAsesorId: 'r-1' });
    });

    // Assert
    expect(enviar).toHaveBeenCalledWith('r-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'versiones-artefacto'] });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
    expect(invalidar).not.toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] });
  });

  it('un 422 de revisión ya no enviable invalida además el catálogo del asesor y otro error no invalida', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEnviarRevision(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    enviar.mockRejectedValueOnce(errorApi(500, { status: 500, message: 'caído' }));
    act(() => result.current.mutate({ revisionAsesorId: 'r-1' }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    const trasOtro = invalidar.mock.calls.length;

    enviar.mockRejectedValueOnce(
      errorApi(422, { status: 422, errorCode: 'REVISION_ASESOR_NO_ENVIABLE', message: 'x' }),
    );
    act(() => result.current.mutate({ revisionAsesorId: 'r-1' }));
    await waitFor(() =>
      expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] }),
    );

    // Assert
    expect(trasOtro).toBe(0);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'versiones-artefacto'] });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
  });

  it('un 422 sin observaciones invalida solo las observaciones de la revisión', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEnviarRevision(), {
      wrapper: crearWrapper(queryClient),
    });
    enviar.mockRejectedValueOnce(
      errorApi(422, {
        status: 422,
        errorCode: 'REVISION_ASESOR_SIN_OBSERVACIONES',
        message: 'x',
      }),
    );

    // Act
    act(() => result.current.mutate({ revisionAsesorId: 'r-1' }));
    await waitFor(() => expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES }));

    // Assert
    expect(invalidar).toHaveBeenCalledTimes(1);
  });
});
