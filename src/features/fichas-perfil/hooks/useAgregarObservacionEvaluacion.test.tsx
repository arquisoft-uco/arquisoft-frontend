import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useAgregarObservacionEvaluacion } from './useAgregarObservacionEvaluacion';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { agregarObservacionEvaluacion: vi.fn() },
}));

const agregarObservacion = vi.mocked(fichasPerfilService.agregarObservacionEvaluacion);

const REQ = { evaluacionFichaPerfilId: 'ev-1', observacion: 'Ajustar el alcance' };

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

describe('useAgregarObservacionEvaluacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con la solicitud e invalida el prefijo de evaluación de la ficha', async () => {
    // Arrange
    agregarObservacion.mockResolvedValue({ id: 'o-1' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarObservacionEvaluacion('f-1'), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(agregarObservacion.mock.calls[0][0]).toEqual(REQ);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['fichas-perfil', 'f-1', 'evaluacion'] });
  });

  it('expone el error y no invalida cuando el service rechaza', async () => {
    // Arrange
    agregarObservacion.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarObservacionEvaluacion('f-1'), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
