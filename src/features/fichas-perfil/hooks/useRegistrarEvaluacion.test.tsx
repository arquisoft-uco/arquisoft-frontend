import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useRegistrarEvaluacion } from './useRegistrarEvaluacion';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { registrarEvaluacion: vi.fn() },
}));

const registrarEvaluacion = vi.mocked(fichasPerfilService.registrarEvaluacion);

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

describe('useRegistrarEvaluacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con el fichaPerfilId e invalida la consulta de evaluación al terminar', async () => {
    // Arrange
    registrarEvaluacion.mockResolvedValue({ id: 'ev-1' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarEvaluacion('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate());

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(registrarEvaluacion).toHaveBeenCalledWith({ fichaPerfilId: 'f-1' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['evaluacion-representante', 'f-1'] });
  });

  it('expone el error y no invalida cuando el service rechaza', async () => {
    // Arrange
    registrarEvaluacion.mockRejectedValue(new Error('400'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarEvaluacion('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate());

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
