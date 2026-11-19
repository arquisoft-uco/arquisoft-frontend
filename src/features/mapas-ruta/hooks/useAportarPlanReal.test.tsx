import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useAportarPlanReal } from './useAportarPlanReal';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { aportarPlanReal: vi.fn() },
}));

const aportar = vi.mocked(mapasRutaService.aportarPlanReal);

const VARIABLES = { planRealId: 'r-1', req: { descripcionReal: 'Aporte' } };
const KEY_LISTA = ['mapas-ruta', 'asesor', 'proyecto', 'pg-1', 'planes-reales'];

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

describe('useAportarPlanReal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía id del plan y request e invalida la lista del proyecto en éxito', async () => {
    // Arrange
    aportar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAportarPlanReal('pg-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(aportar.mock.calls[0]).toEqual(['r-1', { descripcionReal: 'Aporte' }]);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY_LISTA });
  });

  it('invalida la lista ante PLAN_REAL_NO_ENCONTRADO', async () => {
    // Arrange
    aportar.mockRejectedValue(errorApi('PLAN_REAL_NO_ENCONTRADO'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAportarPlanReal('pg-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY_LISTA });
  });

  it('no invalida nada ante otro error', async () => {
    // Arrange
    aportar.mockRejectedValue(errorApi('PLAN_REAL_DESCRIPCION_DEMASIADO_LARGA'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAportarPlanReal('pg-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
