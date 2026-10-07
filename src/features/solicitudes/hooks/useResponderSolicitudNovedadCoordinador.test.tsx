import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { useResponderSolicitudNovedadCoordinador } from './useResponderSolicitudNovedadCoordinador';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    responderSolicitudNovedadCoordinador: vi.fn(),
  },
}));

const responderSolicitudNovedadCoordinador = vi.mocked(
  solicitudesService.responderSolicitudNovedadCoordinador,
);

function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useResponderSolicitudNovedadCoordinador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delega en el service con solicitudId y contenido y expone el id de la respuesta', async () => {
    // Arrange
    responderSolicitudNovedadCoordinador.mockResolvedValue({ id: 'r-1' });
    const { result } = renderHook(() => useResponderSolicitudNovedadCoordinador(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate({ solicitudId: 's-1', contenido: 'Programemos una reunión.' }));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(responderSolicitudNovedadCoordinador).toHaveBeenCalledWith({
      solicitudId: 's-1',
      contenido: 'Programemos una reunión.',
    });
    expect(result.current.data).toEqual({ id: 'r-1' });
  });
});
