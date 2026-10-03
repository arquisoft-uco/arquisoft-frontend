import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useAgregarEstadoEvaluacion } from './useAgregarEstadoEvaluacion';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { agregarEstadoEvaluacion: vi.fn() },
}));

const agregarEstadoEvaluacion = vi.mocked(fichasPerfilService.agregarEstadoEvaluacion);

const REQ = { evaluacionFichaPerfilId: 'ev-1', estadoEvaluacionId: 'APROBADA' };

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

describe('useAgregarEstadoEvaluacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con la solicitud e invalida la evaluación del representante de la ficha', async () => {
    // Arrange
    agregarEstadoEvaluacion.mockResolvedValue({ id: 'ee-1' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarEstadoEvaluacion('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(agregarEstadoEvaluacion).toHaveBeenCalledWith(REQ);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['evaluacion-representante', 'f-1'] });
  });

  it('expone el error y no invalida cuando el service rechaza', async () => {
    // Arrange
    agregarEstadoEvaluacion.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarEstadoEvaluacion('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
