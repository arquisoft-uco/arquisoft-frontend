import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useRemoverObservacionEvaluacion } from './useRemoverObservacionEvaluacion';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { removerObservacionEvaluacion: vi.fn() },
}));

const remover = vi.mocked(fichasPerfilService.removerObservacionEvaluacion);

const KEY_OBSERVACIONES = ['fichas-perfil', 'f-1', 'evaluacion', 'ev-1', 'observaciones'];

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

describe('useRemoverObservacionEvaluacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con el id e invalida las observaciones de esa evaluación', async () => {
    // Arrange
    remover.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverObservacionEvaluacion('f-1', 'ev-1'), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate('o-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(remover.mock.calls[0][0]).toBe('o-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY_OBSERVACIONES });
  });

  it('también invalida la lista cuando el service rechaza', async () => {
    // Arrange
    remover.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverObservacionEvaluacion('f-1', 'ev-1'), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate('o-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: KEY_OBSERVACIONES });
  });
});
