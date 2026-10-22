import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { useResponderSolicitudCambioAsesor } from './useResponderSolicitudCambioAsesor';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    responderSolicitudCambioAsesor: vi.fn(),
  },
}));

const responderSolicitudCambioAsesor = vi.mocked(solicitudesService.responderSolicitudCambioAsesor);

function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useResponderSolicitudCambioAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delega en el service con solicitudId y contenido y expone el id de la respuesta', async () => {
    // Arrange
    responderSolicitudCambioAsesor.mockResolvedValue({ id: 'r-1' });
    const { result } = renderHook(() => useResponderSolicitudCambioAsesor(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate({ solicitudId: 's-1', contenido: 'Revisemos el cambio.' }));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(responderSolicitudCambioAsesor).toHaveBeenCalledWith({
      solicitudId: 's-1',
      contenido: 'Revisemos el cambio.',
    });
    expect(result.current.data).toEqual({ id: 'r-1' });
  });
});
