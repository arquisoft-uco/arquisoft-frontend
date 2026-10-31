import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { useEnviarSolicitudRegistroModificacionUsuarios } from './useEnviarSolicitudRegistroModificacionUsuarios';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    enviarSolicitudRegistroModificacionUsuarios: vi.fn(),
  },
}));

const enviarSolicitudRegistroModificacionUsuarios = vi.mocked(
  solicitudesService.enviarSolicitudRegistroModificacionUsuarios,
);

const REQUEST = {
  destinatario: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  mensajeSolicitud: 'Registrar un usuario nuevo.',
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

describe('useEnviarSolicitudRegistroModificacionUsuarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía la solicitud con el request recibido', async () => {
    enviarSolicitudRegistroModificacionUsuarios.mockResolvedValue({ id: 's-5' });
    const { Wrapper } = crearContexto();
    const { result } = renderHook(() => useEnviarSolicitudRegistroModificacionUsuarios(), {
      wrapper: Wrapper,
    });

    act(() => result.current.mutate(REQUEST));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(enviarSolicitudRegistroModificacionUsuarios).toHaveBeenCalledWith(REQUEST);
  });

  it('expone el error cuando el service rechaza', async () => {
    enviarSolicitudRegistroModificacionUsuarios.mockRejectedValue(new Error('422'));
    const { Wrapper } = crearContexto();
    const { result } = renderHook(() => useEnviarSolicitudRegistroModificacionUsuarios(), {
      wrapper: Wrapper,
    });

    act(() => result.current.mutate(REQUEST));

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('al enviar con éxito invalida las enviadas de registro y modificación de usuarios por prefijo', async () => {
    enviarSolicitudRegistroModificacionUsuarios.mockResolvedValue({ id: 's-5' });
    const { Wrapper, queryClient } = crearContexto();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEnviarSolicitudRegistroModificacionUsuarios(), {
      wrapper: Wrapper,
    });

    act(() => result.current.mutate(REQUEST));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['solicitudes', 'registro-modificacion-usuarios', 'enviadas'],
    });
  });
});
