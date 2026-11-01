import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { artefactosService } from '../services/artefactosService';
import { useEliminarObservacion } from './useEliminarObservacion';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { eliminarObservacion: vi.fn() },
}));

const eliminar = vi.mocked(artefactosService.eliminarObservacion);

const CLAVE_OBSERVACIONES = ['artefactos', 'revisiones-asesor', 'r-1', 'observaciones'];
const CLAVE_VERSIONES = ['artefactos', 'versiones-artefacto'];
const CLAVE_ASESOR = ['artefactos', 'asesor'];
const VARIABLES = { observacionId: 'o-1', revisionAsesorId: 'r-1' };

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

function error422(errorCode: string) {
  return errorApi(422, { status: 422, errorCode, message: 'x' });
}

describe('useEliminarObservacion', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('en éxito elimina por id de observación e invalida solo las observaciones de la revisión', async () => {
    // Arrange
    eliminar.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEliminarObservacion(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    await act(async () => {
      await result.current.mutateAsync(VARIABLES);
    });

    // Assert
    expect(eliminar).toHaveBeenCalledWith('o-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
    expect(invalidar).not.toHaveBeenCalledWith({ queryKey: CLAVE_VERSIONES });
  });

  it('observación no encontrada invalida solo la lista; revisión no pendiente invalida también versiones y artefactos', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEliminarObservacion(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    eliminar.mockRejectedValueOnce(error422('OBSERVACION_NO_ENCONTRADA'));
    act(() => result.current.mutate(VARIABLES));
    await waitFor(() => expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES }));
    const trasNoEncontrada = invalidar.mock.calls.length;

    eliminar.mockRejectedValueOnce(error422('REVISION_ASESOR_NO_ADMITE_ELIMINAR_OBSERVACIONES'));
    act(() => result.current.mutate(VARIABLES));
    await waitFor(() => expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_ASESOR }));

    // Assert
    expect(trasNoEncontrada).toBe(1);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_VERSIONES });
  });
});
