import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY } from './useRespuestasRegistroModificacionUsuariosEnviadas';
import { useResponderSolicitudRegistroModificacionUsuarios } from './useResponderSolicitudRegistroModificacionUsuarios';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    responderSolicitudRegistroModificacionUsuarios: vi.fn(),
  },
}));

const responder = vi.mocked(solicitudesService.responderSolicitudRegistroModificacionUsuarios);

function crearCliente() {
  return new QueryClient({ defaultOptions: { mutations: { retry: false } } });
}

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useResponderSolicitudRegistroModificacionUsuarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delega en el service con solicitudId y contenido y expone el id de la respuesta e invalida las respuestas enviadas', async () => {
    // Arrange
    responder.mockResolvedValue({ id: 'r-1' });
    const queryClient = crearCliente();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useResponderSolicitudRegistroModificacionUsuarios(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.mutate({ solicitudId: 's-1', contenido: 'Hecho.' }));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(responder).toHaveBeenCalledWith({ solicitudId: 's-1', contenido: 'Hecho.' });
    expect(result.current.data).toEqual({ id: 'r-1' });
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: RESPUESTAS_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY,
    });
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    const fallo = new Error('422');
    responder.mockRejectedValue(fallo);
    const { result } = renderHook(() => useResponderSolicitudRegistroModificacionUsuarios(), {
      wrapper: crearWrapper(crearCliente()),
    });

    // Act
    act(() => result.current.mutate({ solicitudId: 's-1', contenido: 'Hecho.' }));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(fallo);
  });
});
