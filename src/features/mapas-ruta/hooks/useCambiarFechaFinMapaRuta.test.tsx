import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useCambiarFechaFinMapaRuta } from './useCambiarFechaFinMapaRuta';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { cambiarFechaFin: vi.fn() },
}));

const cambiarFechaFin = vi.mocked(mapasRutaService.cambiarFechaFin);

const VARIABLES = { mapaRutaId: 'm-1', req: { fechaFin: '2026-12-01' } };

function errorApi(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message: 'crudo', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function crearContexto() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
  const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, invalidar };
}

describe('useCambiarFechaFinMapaRuta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía id y body e invalida la key mapas-ruta en éxito', async () => {
    // Arrange
    cambiarFechaFin.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarFechaFinMapaRuta(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cambiarFechaFin.mock.calls[0]).toEqual(['m-1', { fechaFin: '2026-12-01' }]);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['mapas-ruta'] });
  });

  it('invalida el listado cuando el mapa ya no existe', async () => {
    // Arrange
    cambiarFechaFin.mockRejectedValue(errorApi('MAPA_RUTA_NO_ENCONTRADO'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarFechaFinMapaRuta(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['mapas-ruta'] });
  });

  it('no invalida nada con otro error', async () => {
    // Arrange
    cambiarFechaFin.mockRejectedValue(errorApi('PROYECTO_GRADO_NO_PROPIETARIO'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarFechaFinMapaRuta(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
