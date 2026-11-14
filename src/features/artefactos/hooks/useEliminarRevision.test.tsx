import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { artefactosService } from '../services/artefactosService';
import { useEliminarRevision } from './useEliminarRevision';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { eliminarRevision: vi.fn() },
}));

const eliminar = vi.mocked(artefactosService.eliminarRevision);

const CLAVE_VERSIONES = ['artefactos', 'versiones-artefacto'];
const CLAVE_ASESOR = ['artefactos', 'asesor'];
const CLAVE_REVISIONES = ['artefactos', 'revisiones-asesor'];

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useEliminarRevision', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('en éxito elimina por id e invalida versiones, catálogo del asesor y revisiones', async () => {
    // Arrange
    eliminar.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEliminarRevision(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    await act(async () => {
      await result.current.mutateAsync({ revisionAsesorId: 'r-1' });
    });

    // Assert
    expect(eliminar).toHaveBeenCalledWith('r-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_VERSIONES });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_ASESOR });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_REVISIONES });
  });

  it('un 422 de revisión ya no eliminable invalida lo mismo y otro error no invalida', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEliminarRevision(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    eliminar.mockRejectedValueOnce(errorApi(500, { status: 500, message: 'caído' }));
    act(() => result.current.mutate({ revisionAsesorId: 'r-1' }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    const trasOtro = invalidar.mock.calls.length;

    eliminar.mockRejectedValueOnce(
      errorApi(422, { status: 422, errorCode: 'REVISION_ASESOR_NO_ELIMINABLE', message: 'x' }),
    );
    act(() => result.current.mutate({ revisionAsesorId: 'r-1' }));
    await waitFor(() => expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_REVISIONES }));

    // Assert
    expect(trasOtro).toBe(0);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_VERSIONES });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_ASESOR });
  });
});
