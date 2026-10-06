import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { useEnviarSolicitudNovedadAsesor } from './useEnviarSolicitudNovedadAsesor';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    enviarSolicitudNovedadAsesor: vi.fn(),
  },
}));

const enviarSolicitudNovedadAsesor = vi.mocked(solicitudesService.enviarSolicitudNovedadAsesor);

const REQUEST = {
  destinatario: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  mensajeSolicitud: 'Mi asesor no ha respondido.',
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
  return { Wrapper };
}

describe('useEnviarSolicitudNovedadAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía la solicitud con el request recibido', async () => {
    enviarSolicitudNovedadAsesor.mockResolvedValue({ id: 's-2' });
    const { Wrapper } = crearContexto();
    const { result } = renderHook(() => useEnviarSolicitudNovedadAsesor(), {
      wrapper: Wrapper,
    });

    act(() => result.current.mutate(REQUEST));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(enviarSolicitudNovedadAsesor).toHaveBeenCalledWith(REQUEST);
  });

  it('expone el error cuando el service rechaza', async () => {
    enviarSolicitudNovedadAsesor.mockRejectedValue(new Error('422'));
    const { Wrapper } = crearContexto();
    const { result } = renderHook(() => useEnviarSolicitudNovedadAsesor(), {
      wrapper: Wrapper,
    });

    act(() => result.current.mutate(REQUEST));

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
