import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useAsignarAsesorEvaluacion } from './useAsignarAsesorEvaluacion';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { asignarAsesorEvaluacion: vi.fn() },
}));

const asignar = vi.mocked(evaluacionesService.asignarAsesorEvaluacion);

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

describe('useAsignarAsesorEvaluacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('asigna con el id de la evaluación y del asesor, e invalida el listado y la evaluación del asesor', async () => {
    // Arrange
    asignar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAsignarAsesorEvaluacion('e-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('a-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(asignar).toHaveBeenCalledWith({ evaluacionId: 'e-1', asesorId: 'a-1' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['evaluaciones', 'coordinador'] });
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['evaluaciones', 'e-1', 'evaluacion-asesor'],
    });
  });

  it('no invalida nada cuando la asignación falla', async () => {
    // Arrange
    asignar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAsignarAsesorEvaluacion('e-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('a-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
