import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY } from './useRespuestasCambioAsesorEnviadas';
import { useResponderSolicitudCambioAsesor } from './useResponderSolicitudCambioAsesor';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    responderSolicitudCambioAsesor: vi.fn(),
  },
}));

const responderSolicitudCambioAsesor = vi.mocked(solicitudesService.responderSolicitudCambioAsesor);

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function crearCliente() {
  return new QueryClient({ defaultOptions: { mutations: { retry: false } } });
}

describe('useResponderSolicitudCambioAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delega en el service con solicitudId y contenido y expone el id de la respuesta', async () => {
    // Arrange
    responderSolicitudCambioAsesor.mockResolvedValue({ id: 'r-1' });
    const { result } = renderHook(() => useResponderSolicitudCambioAsesor(), {
      wrapper: crearWrapper(crearCliente()),
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

  it('tras un éxito invalida el prefijo de respuestas enviadas de cambio de asesor', async () => {
    // Arrange
    responderSolicitudCambioAsesor.mockResolvedValue({ id: 'r-1' });
    const queryClient = crearCliente();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useResponderSolicitudCambioAsesor(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.mutate({ solicitudId: 's-1', contenido: 'Revisemos el cambio.' }));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: RESPUESTAS_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY,
    });
  });
});
