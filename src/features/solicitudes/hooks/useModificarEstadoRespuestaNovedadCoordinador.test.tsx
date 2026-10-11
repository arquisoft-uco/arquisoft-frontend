import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { useModificarEstadoRespuestaNovedadCoordinador } from './useModificarEstadoRespuestaNovedadCoordinador';
import { RESPUESTAS_ENVIADAS_QUERY_KEY } from './useRespuestasNovedadCoordinadorEnviadas';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    modificarEstadoRespuestaNovedadCoordinador: vi.fn(),
  },
}));

const modificarEstado = vi.mocked(solicitudesService.modificarEstadoRespuestaNovedadCoordinador);

const REQUEST = { solicitudId: 's-1', nuevoEstado: 'APROBADA' };

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

describe('useModificarEstadoRespuestaNovedadCoordinador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('modifica con el request recibido e invalida el prefijo del listado de respuestas enviadas', async () => {
    // Arrange
    modificarEstado.mockResolvedValue(undefined);
    const { Wrapper, queryClient } = crearContexto();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useModificarEstadoRespuestaNovedadCoordinador(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(REQUEST));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modificarEstado).toHaveBeenCalledWith(REQUEST);
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: RESPUESTAS_ENVIADAS_QUERY_KEY });
  });

  it('expone el error e invalida igual el listado cuando el service rechaza', async () => {
    // Arrange
    modificarEstado.mockRejectedValue(new Error('422'));
    const { Wrapper, queryClient } = crearContexto();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useModificarEstadoRespuestaNovedadCoordinador(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(REQUEST));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: RESPUESTAS_ENVIADAS_QUERY_KEY });
  });
});
