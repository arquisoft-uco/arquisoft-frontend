import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useEvaluacionesAsignadasJurado } from './useEvaluacionesAsignadasJurado';
import type { EvaluacionAsignadaJurado } from '../models/EvaluacionAsignadaJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { getEvaluacionesAsignadasJurado: vi.fn() },
}));

const getAsignadas = vi.mocked(evaluacionesService.getEvaluacionesAsignadasJurado);

const ASIGNACION: EvaluacionAsignadaJurado = {
  id: 'ej-1',
  evaluacion: { id: 'e-1', estado: { id: 'PENDIENTE', nombre: 'Pendiente' } },
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
};

function crearContexto(opcionesQueries: { staleTime?: number } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, ...opcionesQueries } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient };
}

describe('useEvaluacionesAsignadasJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve la lista del service bajo la query key del plan', async () => {
    // Arrange
    getAsignadas.mockResolvedValue([ASIGNACION]);
    const { Wrapper, queryClient } = crearContexto();

    // Act
    const { result } = renderHook(() => useEvaluacionesAsignadasJurado(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([ASIGNACION]);
    expect(queryClient.getQueryData(['evaluaciones', 'jurado', 'asignadas'])).toEqual([ASIGNACION]);
  });

  it('expone el error cuando el service rechaza', async () => {
    // Arrange
    getAsignadas.mockRejectedValue(new Error('500'));
    const { Wrapper } = crearContexto();

    // Act
    const { result } = renderHook(() => useEvaluacionesAsignadasJurado(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('vuelve a pedir la lista al remontar aunque el staleTime global la considere fresca', async () => {
    // Arrange
    getAsignadas.mockResolvedValue([ASIGNACION]);
    const { Wrapper } = crearContexto({ staleTime: 5 * 60 * 1000 });
    const primero = renderHook(() => useEvaluacionesAsignadasJurado(), { wrapper: Wrapper });
    await waitFor(() => expect(primero.result.current.isSuccess).toBe(true));
    primero.unmount();

    // Act
    renderHook(() => useEvaluacionesAsignadasJurado(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(getAsignadas).toHaveBeenCalledTimes(2));
  });
});
