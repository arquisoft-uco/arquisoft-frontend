import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_AMPLIACION_PLAZO_ENVIADAS_QUERY_KEY } from './useRespuestasAmpliacionPlazoEnviadas';
import { useResponderSolicitudAmpliacionPlazo } from './useResponderSolicitudAmpliacionPlazo';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    responderSolicitudAmpliacionPlazo: vi.fn(),
  },
}));

const responderSolicitudAmpliacionPlazo = vi.mocked(
  solicitudesService.responderSolicitudAmpliacionPlazo,
);

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function crearCliente() {
  return new QueryClient({ defaultOptions: { mutations: { retry: false } } });
}

describe('useResponderSolicitudAmpliacionPlazo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delega en el service con solicitudId y contenido, expone el id e invalida las respuestas enviadas de ampliación de plazo', async () => {
    // Arrange
    responderSolicitudAmpliacionPlazo.mockResolvedValue({ id: 'r-1' });
    const queryClient = crearCliente();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useResponderSolicitudAmpliacionPlazo(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.mutate({ solicitudId: 's-1', contenido: 'Plazo ampliado.' }));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(responderSolicitudAmpliacionPlazo).toHaveBeenCalledWith({
      solicitudId: 's-1',
      contenido: 'Plazo ampliado.',
    });
    expect(result.current.data).toEqual({ id: 'r-1' });
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: RESPUESTAS_AMPLIACION_PLAZO_ENVIADAS_QUERY_KEY,
    });
  });

  it('ante un error del service expone el error', async () => {
    // Arrange
    const error = new Error('fallo');
    responderSolicitudAmpliacionPlazo.mockRejectedValue(error);
    const { result } = renderHook(() => useResponderSolicitudAmpliacionPlazo(), {
      wrapper: crearWrapper(crearCliente()),
    });

    // Act
    act(() => result.current.mutate({ solicitudId: 's-1', contenido: 'Plazo ampliado.' }));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
