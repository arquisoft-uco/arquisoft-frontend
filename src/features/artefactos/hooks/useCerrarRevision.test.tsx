import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { artefactosService } from '../services/artefactosService';
import { useCerrarRevision } from './useCerrarRevision';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { cerrarRevision: vi.fn() },
}));

const cerrar = vi.mocked(artefactosService.cerrarRevision);

const CLAVE_OBSERVACIONES = ['artefactos', 'revisiones-asesor', 'r-1', 'observaciones'];
const CLAVE_VERSIONES = ['artefactos', 'versiones-artefacto'];
const CLAVE_ASESOR = ['artefactos', 'asesor'];

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

function rechazo(errorCode: string) {
  return errorApi(422, { status: 422, errorCode, message: 'x' });
}

describe('useCerrarRevision', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('en éxito invalida versiones, observaciones de la revisión y el catálogo del asesor', async () => {
    // Arrange
    cerrar.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCerrarRevision(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    await act(async () => {
      await result.current.mutateAsync({ revisionAsesorId: 'r-1' });
    });

    // Assert
    expect(cerrar).toHaveBeenCalledWith('r-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_VERSIONES });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_ASESOR });
  });

  it('un 422 de revisión ya no cerrable invalida lo mismo y otro error no invalida', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCerrarRevision(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    cerrar.mockRejectedValueOnce(errorApi(500, { status: 500, message: 'caído' }));
    act(() => result.current.mutate({ revisionAsesorId: 'r-1' }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    const trasOtro = invalidar.mock.calls.length;

    cerrar.mockRejectedValueOnce(rechazo('REVISION_ASESOR_NO_CERRABLE'));
    act(() => result.current.mutate({ revisionAsesorId: 'r-1' }));
    await waitFor(() => expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_ASESOR }));

    // Assert
    expect(trasOtro).toBe(0);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_VERSIONES });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
  });

  it('un 422 por observaciones invalida solo el prefijo de las revisiones del asesor', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCerrarRevision(), {
      wrapper: crearWrapper(queryClient),
    });
    cerrar.mockRejectedValueOnce(rechazo('REVISION_ASESOR_CON_OBSERVACIONES'));

    // Act
    act(() => result.current.mutate({ revisionAsesorId: 'r-1' }));
    await waitFor(() =>
      expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'revisiones-asesor'] }),
    );

    // Assert
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(result.current.isError).toBe(true);
  });
});
