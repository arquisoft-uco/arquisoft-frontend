import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { artefactosService } from '../services/artefactosService';
import { useCambiarEstadoObservacion } from './useCambiarEstadoObservacion';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { cambiarEstadoObservacion: vi.fn() },
}));

const cambiar = vi.mocked(artefactosService.cambiarEstadoObservacion);

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

describe('useCambiarEstadoObservacion', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('cerrar invalida solo las observaciones de la revisión y reabrir el prefijo de revisiones', async () => {
    // Arrange
    cambiar.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCambiarEstadoObservacion(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    await act(async () => {
      await result.current.mutateAsync({
        observacionId: 'o-1',
        revisionAsesorId: 'r-1',
        estado: 'CERRADA',
      });
    });

    // Assert
    expect(cambiar).toHaveBeenCalledWith('o-1', { estado: 'CERRADA' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });

    // Act
    invalidar.mockClear();
    await act(async () => {
      await result.current.mutateAsync({
        observacionId: 'o-1',
        revisionAsesorId: 'r-1',
        estado: 'REABIERTA',
      });
    });

    // Assert
    expect(cambiar).toHaveBeenLastCalledWith('o-1', { estado: 'REABIERTA' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'revisiones-asesor'] });
  });

  it('un 422 de estado obsoleto invalida observaciones, versiones y artefactos; un duplicado no invalida', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCambiarEstadoObservacion(), {
      wrapper: crearWrapper(queryClient),
    });
    const variables = {
      observacionId: 'o-1',
      revisionAsesorId: 'r-1',
      estado: 'REABIERTA' as const,
    };

    // Act
    cambiar.mockRejectedValueOnce(
      errorApi(422, { status: 422, errorCode: 'OBSERVACION_DUPLICADA', message: 'x' }),
    );
    act(() => result.current.mutate(variables));
    await waitFor(() => expect(result.current.isError).toBe(true));
    const trasDuplicado = invalidar.mock.calls.length;

    cambiar.mockRejectedValueOnce(
      errorApi(422, { status: 422, errorCode: 'OBSERVACION_NO_SOLUCIONADA', message: 'x' }),
    );
    act(() => result.current.mutate(variables));
    await waitFor(() =>
      expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] }),
    );

    // Assert
    expect(trasDuplicado).toBe(0);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'versiones-artefacto'] });
  });
});
