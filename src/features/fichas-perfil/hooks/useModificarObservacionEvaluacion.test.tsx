import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useModificarObservacionEvaluacion } from './useModificarObservacionEvaluacion';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { modificarObservacionEvaluacion: vi.fn() },
}));

const modificar = vi.mocked(fichasPerfilService.modificarObservacionEvaluacion);

const REQ = { observacionEvaluacionId: 'o-1', observacion: 'Texto nuevo' };

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

describe('useModificarObservacionEvaluacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con la solicitud e invalida las observaciones de esa evaluación', async () => {
    // Arrange
    modificar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarObservacionEvaluacion('f-1', 'ev-1'), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modificar.mock.calls[0][0]).toEqual(REQ);
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['fichas-perfil', 'f-1', 'evaluacion', 'ev-1', 'observaciones'],
    });
  });

  it('expone el error y no invalida cuando el service rechaza', async () => {
    // Arrange
    modificar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarObservacionEvaluacion('f-1', 'ev-1'), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
