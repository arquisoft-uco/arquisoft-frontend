import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { useEliminarSolicitudNovedadCoordinador } from './useEliminarSolicitudNovedadCoordinador';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    eliminarSolicitudNovedadCoordinador: vi.fn(),
  },
}));

const eliminarSolicitudNovedadCoordinador = vi.mocked(
  solicitudesService.eliminarSolicitudNovedadCoordinador,
);

const KEY_ENVIADAS = ['solicitudes', 'novedad-coordinador', 'enviadas'];

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

describe('useEliminarSolicitudNovedadCoordinador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('elimina con el id recibido e invalida el prefijo del listado de enviadas', async () => {
    // Arrange
    eliminarSolicitudNovedadCoordinador.mockResolvedValue(undefined);
    const { Wrapper, queryClient } = crearContexto();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEliminarSolicitudNovedadCoordinador(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate('s-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(eliminarSolicitudNovedadCoordinador).toHaveBeenCalledWith('s-1');
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY_ENVIADAS });
  });

  it('expone el error e invalida igual el listado cuando el service rechaza', async () => {
    // Arrange
    eliminarSolicitudNovedadCoordinador.mockRejectedValue(new Error('422'));
    const { Wrapper, queryClient } = crearContexto();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEliminarSolicitudNovedadCoordinador(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate('s-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY_ENVIADAS });
  });
});
