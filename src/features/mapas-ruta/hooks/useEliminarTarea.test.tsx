import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useEliminarTarea } from './useEliminarTarea';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { eliminarTarea: vi.fn() },
}));

const eliminarTarea = vi.mocked(mapasRutaService.eliminarTarea);

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

describe('useEliminarTarea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía el id e invalida la key del mapa de ruta sin refetch de lo activo en éxito', async () => {
    // Arrange
    eliminarTarea.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useEliminarTarea(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('t-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(eliminarTarea.mock.calls[0]).toEqual(['t-1']);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY, refetchType: 'none' });
  });

  it.each(['TAREA_NO_REMOVIBLE', 'TAREA_NO_ENCONTRADA'])(
    'invalida por prefijo con refetch ante %s porque el detalle mostrado quedó viejo',
    async (codigo) => {
      // Arrange
      eliminarTarea.mockRejectedValue(errorApi(codigo));
      const { Wrapper, invalidar } = crearContexto();
      const { result } = renderHook(() => useEliminarTarea(), { wrapper: Wrapper });

      // Act
      act(() => result.current.mutate('t-1'));

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY });
    },
  );

  it('no invalida nada con otro error', async () => {
    // Arrange
    eliminarTarea.mockRejectedValue(errorApi('OTRO'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useEliminarTarea(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('t-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
