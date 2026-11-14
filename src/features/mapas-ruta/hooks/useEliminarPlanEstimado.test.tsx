import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useEliminarPlanEstimado } from './useEliminarPlanEstimado';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { eliminarPlanEstimado: vi.fn() },
}));

const eliminar = vi.mocked(mapasRutaService.eliminarPlanEstimado);

const VARIABLES = { planEstimadoId: 'p-1', tareaId: 't-1' };
const KEY_PLAN = ['mapas-ruta', 'estudiante', 'tarea', 't-1', 'planes-estimados'];

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

describe('useEliminarPlanEstimado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía el id del plan e invalida el plan de la tarea en éxito', async () => {
    // Arrange
    eliminar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useEliminarPlanEstimado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(eliminar.mock.calls[0]).toEqual(['p-1']);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY_PLAN });
  });

  it('invalida el plan ante PLAN_ESTIMADO_NO_ENCONTRADO', async () => {
    // Arrange
    eliminar.mockRejectedValue(errorApi('PLAN_ESTIMADO_NO_ENCONTRADO'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useEliminarPlanEstimado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY_PLAN });
  });

  it('no invalida nada ante otro error', async () => {
    // Arrange
    eliminar.mockRejectedValue(errorApi('ERROR_INESPERADO'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useEliminarPlanEstimado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
