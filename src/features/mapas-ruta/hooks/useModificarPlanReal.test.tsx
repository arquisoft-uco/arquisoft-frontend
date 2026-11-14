import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useModificarPlanReal } from './useModificarPlanReal';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { modificarPlanReal: vi.fn() },
}));

const modificar = vi.mocked(mapasRutaService.modificarPlanReal);

const VARIABLES = {
  planRealId: 'p-1',
  tareaId: 't-1',
  req: { tiempoRealDias: 4, descripcionReal: 'Nueva' },
};
const KEY_PLAN = ['mapas-ruta', 'estudiante', 'tarea', 't-1', 'planes-reales'];

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

describe('useModificarPlanReal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía id del plan y request e invalida el plan de la tarea en éxito', async () => {
    // Arrange
    modificar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarPlanReal(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modificar.mock.calls[0]).toEqual([
      'p-1',
      { tiempoRealDias: 4, descripcionReal: 'Nueva' },
    ]);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY_PLAN });
  });

  it('invalida el plan ante PLAN_REAL_NO_ENCONTRADO', async () => {
    // Arrange
    modificar.mockRejectedValue(errorApi('PLAN_REAL_NO_ENCONTRADO'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarPlanReal(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY_PLAN });
  });

  it('no invalida nada ante otro error', async () => {
    // Arrange
    modificar.mockRejectedValue(errorApi('PLAN_REAL_DESCRIPCION_DEMASIADO_LARGA'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarPlanReal(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
