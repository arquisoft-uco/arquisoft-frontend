import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useDescartarEvaluacion } from './useDescartarEvaluacion';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { descartarEvaluacion: vi.fn() },
}));

const descartarEvaluacion = vi.mocked(fichasPerfilService.descartarEvaluacion);

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

describe('useDescartarEvaluacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con la evaluación y refresca todas las consultas de la ficha', async () => {
    // Arrange
    descartarEvaluacion.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useDescartarEvaluacion('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('ev-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(descartarEvaluacion).toHaveBeenCalledWith('ev-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['fichas-perfil', 'f-1'] });
  });

  it('expone el error y no invalida cuando el service rechaza', async () => {
    // Arrange
    descartarEvaluacion.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useDescartarEvaluacion('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('ev-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
