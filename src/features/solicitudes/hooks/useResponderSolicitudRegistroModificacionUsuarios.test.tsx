import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { useResponderSolicitudRegistroModificacionUsuarios } from './useResponderSolicitudRegistroModificacionUsuarios';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    responderSolicitudRegistroModificacionUsuarios: vi.fn(),
  },
}));

const responder = vi.mocked(solicitudesService.responderSolicitudRegistroModificacionUsuarios);

function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useResponderSolicitudRegistroModificacionUsuarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delega en el service con solicitudId y contenido y expone el id de la respuesta', async () => {
    // Arrange
    responder.mockResolvedValue({ id: 'r-1' });
    const { result } = renderHook(() => useResponderSolicitudRegistroModificacionUsuarios(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate({ solicitudId: 's-1', contenido: 'Hecho.' }));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(responder).toHaveBeenCalledWith({ solicitudId: 's-1', contenido: 'Hecho.' });
    expect(result.current.data).toEqual({ id: 'r-1' });
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    const fallo = new Error('422');
    responder.mockRejectedValue(fallo);
    const { result } = renderHook(() => useResponderSolicitudRegistroModificacionUsuarios(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate({ solicitudId: 's-1', contenido: 'Hecho.' }));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(fallo);
  });
});
