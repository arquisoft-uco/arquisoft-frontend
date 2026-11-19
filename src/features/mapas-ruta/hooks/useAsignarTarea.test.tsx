import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useAsignarTarea } from './useAsignarTarea';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { asignarTarea: vi.fn() },
}));

const asignar = vi.mocked(mapasRutaService.asignarTarea);

const VARIABLES = { mapaRutaId: 'm-1', req: { descripcion: 'Nueva', asesorId: 'a-2' } };
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

describe('useAsignarTarea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía mapa y request e invalida la key del mapa de ruta del estudiante en éxito', async () => {
    // Arrange
    asignar.mockResolvedValue({ id: 't-9' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAsignarTarea(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(asignar.mock.calls[0]).toEqual(['m-1', { descripcion: 'Nueva', asesorId: 'a-2' }]);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY });
  });

  it('invalida también ante MAPA_RUTA_NO_ENCONTRADO porque la vista quedó vieja', async () => {
    // Arrange
    asignar.mockRejectedValue(errorApi('MAPA_RUTA_NO_ENCONTRADO'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAsignarTarea(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY });
  });

  it.each(['TAREA_DUPLICADA', 'OTRO_ERROR'])('no invalida nada ante %s', async (codigo) => {
    // Arrange
    asignar.mockRejectedValue(errorApi(codigo));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAsignarTarea(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
