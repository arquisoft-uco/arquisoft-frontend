import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useCambiarEstadoTarea } from './useCambiarEstadoTarea';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { cambiarEstadoTarea: vi.fn() },
}));

const cambiarEstadoTarea = vi.mocked(mapasRutaService.cambiarEstadoTarea);

const VARIABLES = { tareaId: 't-1', req: { estadoItemId: 'EN_PROGRESO' } };
const KEY = ['mapas-ruta', 'estudiante'];

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

describe('useCambiarEstadoTarea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía id y request e invalida la key del mapa de ruta del estudiante en éxito', async () => {
    // Arrange
    cambiarEstadoTarea.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarEstadoTarea(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cambiarEstadoTarea.mock.calls[0]).toEqual(['t-1', { estadoItemId: 'EN_PROGRESO' }]);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY });
  });

  it.each(['TRANSICION_ESTADO_ITEM_NO_PERMITIDA', 'TAREA_NO_ENCONTRADA'])(
    'invalida también ante %s porque el estado mostrado quedó viejo',
    async (codigo) => {
      // Arrange
      cambiarEstadoTarea.mockRejectedValue(errorApi(codigo));
      const { Wrapper, invalidar } = crearContexto();
      const { result } = renderHook(() => useCambiarEstadoTarea(), { wrapper: Wrapper });

      // Act
      act(() => result.current.mutate(VARIABLES));

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY });
    },
  );

  it('no invalida nada con otro error', async () => {
    // Arrange
    cambiarEstadoTarea.mockRejectedValue(errorApi('ESTADO_ITEM_INVALIDO'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarEstadoTarea(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
