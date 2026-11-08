import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useAgregarPlanEstimado } from './useAgregarPlanEstimado';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { agregarPlanEstimado: vi.fn() },
}));

const agregar = vi.mocked(mapasRutaService.agregarPlanEstimado);

const VARIABLES = { tareaId: 't-1', req: { tiempoEstimadoDias: 5 } };
const KEY = ['mapas-ruta', 'estudiante'];
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

describe('useAgregarPlanEstimado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía tarea y request e invalida el plan de la tarea en éxito', async () => {
    // Arrange
    agregar.mockResolvedValue({ id: 'p-1' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarPlanEstimado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(agregar.mock.calls[0]).toEqual(['t-1', { tiempoEstimadoDias: 5 }]);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY_PLAN });
  });

  it('invalida la key del mapa de ruta del estudiante ante TAREA_NO_ENCONTRADA', async () => {
    // Arrange
    agregar.mockRejectedValue(errorApi('TAREA_NO_ENCONTRADA'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarPlanEstimado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY });
  });

  it('invalida el plan de la tarea ante PLAN_ESTIMADO_DUPLICADO', async () => {
    // Arrange
    agregar.mockRejectedValue(errorApi('PLAN_ESTIMADO_DUPLICADO'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarPlanEstimado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY_PLAN });
  });

  it('no invalida nada ante PLAN_ESTIMADO_TIEMPO_EXCEDE_PLAZO', async () => {
    // Arrange
    agregar.mockRejectedValue(errorApi('PLAN_ESTIMADO_TIEMPO_EXCEDE_PLAZO'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarPlanEstimado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
