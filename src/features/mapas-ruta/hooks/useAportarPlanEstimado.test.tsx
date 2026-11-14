import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useAportarPlanEstimado } from './useAportarPlanEstimado';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { aportarPlanEstimado: vi.fn() },
}));

const aportar = vi.mocked(mapasRutaService.aportarPlanEstimado);

const VARIABLES = { planEstimadoId: 'p-1', req: { descripcionEstimado: 'Aporte' } };
const KEY_LISTA = ['mapas-ruta', 'asesor', 'proyecto', 'pg-1', 'planes-estimados'];

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

describe('useAportarPlanEstimado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía id del plan y request e invalida la lista del proyecto en éxito', async () => {
    // Arrange
    aportar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAportarPlanEstimado('pg-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(aportar.mock.calls[0]).toEqual(['p-1', { descripcionEstimado: 'Aporte' }]);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY_LISTA });
  });

  it('invalida la lista ante PLAN_ESTIMADO_NO_ENCONTRADO', async () => {
    // Arrange
    aportar.mockRejectedValue(errorApi('PLAN_ESTIMADO_NO_ENCONTRADO'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAportarPlanEstimado('pg-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY_LISTA });
  });

  it('no invalida nada ante otro error', async () => {
    // Arrange
    aportar.mockRejectedValue(errorApi('PLAN_ESTIMADO_DESCRIPCION_DEMASIADO_LARGA'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAportarPlanEstimado('pg-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
