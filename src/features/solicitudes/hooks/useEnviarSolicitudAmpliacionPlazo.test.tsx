import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { useEnviarSolicitudAmpliacionPlazo } from './useEnviarSolicitudAmpliacionPlazo';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    enviarSolicitudAmpliacionPlazo: vi.fn(),
  },
}));

const enviarSolicitudAmpliacionPlazo = vi.mocked(solicitudesService.enviarSolicitudAmpliacionPlazo);

const REQUEST = {
  destinatario: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  mensajeSolicitud: 'Necesito más plazo.',
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

describe('useEnviarSolicitudAmpliacionPlazo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía la solicitud con el request recibido', async () => {
    enviarSolicitudAmpliacionPlazo.mockResolvedValue({ id: 's-4' });
    const { Wrapper } = crearContexto();
    const { result } = renderHook(() => useEnviarSolicitudAmpliacionPlazo(), {
      wrapper: Wrapper,
    });

    act(() => result.current.mutate(REQUEST));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(enviarSolicitudAmpliacionPlazo).toHaveBeenCalledWith(REQUEST);
  });

  it('al enviar con éxito invalida las enviadas de ampliación de plazo por prefijo', async () => {
    enviarSolicitudAmpliacionPlazo.mockResolvedValue({ id: 's-4' });
    const { Wrapper, queryClient } = crearContexto();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEnviarSolicitudAmpliacionPlazo(), {
      wrapper: Wrapper,
    });

    act(() => result.current.mutate(REQUEST));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['solicitudes', 'ampliacion-plazo', 'enviadas'],
    });
  });

  it('expone el error cuando el service rechaza', async () => {
    enviarSolicitudAmpliacionPlazo.mockRejectedValue(new Error('422'));
    const { Wrapper } = crearContexto();
    const { result } = renderHook(() => useEnviarSolicitudAmpliacionPlazo(), {
      wrapper: Wrapper,
    });

    act(() => result.current.mutate(REQUEST));

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
