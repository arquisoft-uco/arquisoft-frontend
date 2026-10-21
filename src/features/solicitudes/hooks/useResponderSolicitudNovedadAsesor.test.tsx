import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { useResponderSolicitudNovedadAsesor } from './useResponderSolicitudNovedadAsesor';
import { RESPUESTAS_ASESOR_ENVIADAS_QUERY_KEY } from './useRespuestasNovedadAsesorEnviadas';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    responderSolicitudNovedadAsesor: vi.fn(),
  },
}));

const responderSolicitudNovedadAsesor = vi.mocked(
  solicitudesService.responderSolicitudNovedadAsesor,
);

function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useResponderSolicitudNovedadAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delega en el service con solicitudId y contenido y expone el id de la respuesta', async () => {
    // Arrange
    responderSolicitudNovedadAsesor.mockResolvedValue({ id: 'r-2' });
    const { result } = renderHook(() => useResponderSolicitudNovedadAsesor(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate({ solicitudId: 's-2', contenido: 'Revisemos tu avance.' }));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(responderSolicitudNovedadAsesor).toHaveBeenCalledWith({
      solicitudId: 's-2',
      contenido: 'Revisemos tu avance.',
    });
    expect(result.current.data).toEqual({ id: 'r-2' });
  });

  it('invalida las respuestas enviadas del asesor tras responder', async () => {
    // Arrange
    responderSolicitudNovedadAsesor.mockResolvedValue({ id: 'r-3' });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useResponderSolicitudNovedadAsesor(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    // Act
    act(() => result.current.mutate({ solicitudId: 's-3', contenido: 'Gracias por avisar.' }));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: RESPUESTAS_ASESOR_ENVIADAS_QUERY_KEY });
  });
});
