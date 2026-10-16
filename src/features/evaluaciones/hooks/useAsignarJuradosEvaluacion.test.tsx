import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useAsignarJuradosEvaluacion } from './useAsignarJuradosEvaluacion';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { asignarJuradosEvaluacion: vi.fn() },
}));

const asignar = vi.mocked(evaluacionesService.asignarJuradosEvaluacion);

function crearContexto() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, invalidar };
}

describe('useAsignarJuradosEvaluacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('asigna con el id de la evaluación y los jurados, e invalida el listado del coordinador', async () => {
    // Arrange
    asignar.mockResolvedValue({ evaluacionesJurado: ['x'] });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAsignarJuradosEvaluacion('e-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(['j-1', 'j-2']));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(asignar).toHaveBeenCalledWith({ evaluacionId: 'e-1', juradosIds: ['j-1', 'j-2'] });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['evaluaciones', 'coordinador'] });
  });

  it('no invalida el listado cuando la asignación falla', async () => {
    // Arrange
    asignar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAsignarJuradosEvaluacion('e-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(['j-1']));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
