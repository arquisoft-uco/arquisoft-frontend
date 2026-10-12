import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { useEnviarSolicitudNovedadCoordinador } from './useEnviarSolicitudNovedadCoordinador';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    enviarSolicitudNovedadCoordinador: vi.fn(),
  },
}));

const enviarSolicitudNovedadCoordinador = vi.mocked(
  solicitudesService.enviarSolicitudNovedadCoordinador,
);

const REQUEST = {
  destinatario: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  mensajeSolicitud: 'No he podido contactar a mi asesor.',
};

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

describe('useEnviarSolicitudNovedadCoordinador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía la solicitud con el request recibido', async () => {
    enviarSolicitudNovedadCoordinador.mockResolvedValue({ id: 's-1' });
    const { Wrapper } = crearContexto();
    const { result } = renderHook(() => useEnviarSolicitudNovedadCoordinador(), {
      wrapper: Wrapper,
    });

    act(() => result.current.mutate(REQUEST));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(enviarSolicitudNovedadCoordinador).toHaveBeenCalledWith(REQUEST);
  });

  it('invalida el listado de enviadas al terminar bien y no lo hace si falla', async () => {
    enviarSolicitudNovedadCoordinador.mockResolvedValueOnce({ id: 's-1' });
    enviarSolicitudNovedadCoordinador.mockRejectedValueOnce(new Error('422'));
    const { Wrapper, queryClient } = crearContexto();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEnviarSolicitudNovedadCoordinador(), {
      wrapper: Wrapper,
    });

    act(() => result.current.mutate(REQUEST));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['solicitudes', 'novedad-coordinador', 'enviadas'],
    });

    act(() => result.current.mutate(REQUEST));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidar).toHaveBeenCalledTimes(1);
  });

  it('expone el error cuando el service rechaza', async () => {
    enviarSolicitudNovedadCoordinador.mockRejectedValue(new Error('422'));
    const { Wrapper } = crearContexto();
    const { result } = renderHook(() => useEnviarSolicitudNovedadCoordinador(), {
      wrapper: Wrapper,
    });

    act(() => result.current.mutate(REQUEST));

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
