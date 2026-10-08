import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { useEliminarRespuestaNovedadCoordinador } from './useEliminarRespuestaNovedadCoordinador';
import { RESPUESTAS_ENVIADAS_QUERY_KEY } from './useRespuestasNovedadCoordinadorEnviadas';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    eliminarRespuestaNovedadCoordinador: vi.fn(),
  },
}));

const eliminarRespuestaNovedadCoordinador = vi.mocked(
  solicitudesService.eliminarRespuestaNovedadCoordinador,
);

function crearContexto() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient };
}

describe('useEliminarRespuestaNovedadCoordinador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('elimina con el id recibido e invalida el prefijo del listado de respuestas enviadas', async () => {
    // Arrange
    eliminarRespuestaNovedadCoordinador.mockResolvedValue(undefined);
    const { Wrapper, queryClient } = crearContexto();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEliminarRespuestaNovedadCoordinador(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate('s-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(eliminarRespuestaNovedadCoordinador).toHaveBeenCalledWith('s-1');
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: RESPUESTAS_ENVIADAS_QUERY_KEY });
  });

  it('expone el error e invalida igual el listado cuando el service rechaza', async () => {
    // Arrange
    eliminarRespuestaNovedadCoordinador.mockRejectedValue(new Error('422'));
    const { Wrapper, queryClient } = crearContexto();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEliminarRespuestaNovedadCoordinador(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate('s-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: RESPUESTAS_ENVIADAS_QUERY_KEY });
  });
});
