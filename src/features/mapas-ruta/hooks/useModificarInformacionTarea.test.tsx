import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useModificarInformacionTarea } from './useModificarInformacionTarea';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { modificarInformacionTarea: vi.fn() },
}));

const modificar = vi.mocked(mapasRutaService.modificarInformacionTarea);

const VARIABLES = { tareaId: 't-1', req: { descripcion: 'Nueva', asesorId: 'a-2' } };
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

describe('useModificarInformacionTarea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía id y request e invalida la key del mapa de ruta del estudiante en éxito', async () => {
    // Arrange
    modificar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarInformacionTarea(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modificar.mock.calls[0]).toEqual(['t-1', { descripcion: 'Nueva', asesorId: 'a-2' }]);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY });
  });

  it('invalida también ante TAREA_NO_ENCONTRADA porque el detalle quedó viejo', async () => {
    // Arrange
    modificar.mockRejectedValue(errorApi('TAREA_NO_ENCONTRADA'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarInformacionTarea(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY });
  });

  it.each(['TAREA_DUPLICADA', 'OTRO_ERROR'])('no invalida nada ante %s', async (codigo) => {
    // Arrange
    modificar.mockRejectedValue(errorApi(codigo));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarInformacionTarea(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
