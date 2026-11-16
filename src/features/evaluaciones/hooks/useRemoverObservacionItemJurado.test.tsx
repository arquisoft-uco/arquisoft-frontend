import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { AxiosError, AxiosHeaders } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useRemoverObservacionItemJurado } from './useRemoverObservacionItemJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    removerObservacionItemJurado: vi.fn(),
  },
}));

const remover = vi.mocked(evaluacionesService.removerObservacionItemJurado);

const KEY = { queryKey: ['evaluaciones', 'jurado', 'observaciones-cuantitativa'] };

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

function errorApi(errorCode: string, status: number) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message: 'x', status },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('useRemoverObservacionItemJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida las observaciones con la key exacta tras remover', async () => {
    // Arrange
    remover.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverObservacionItemJurado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('obs-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(remover).toHaveBeenCalledWith('obs-1');
    expect(invalidar).toHaveBeenCalledWith(KEY);
  });

  it('también invalida ante el 422 de observación no encontrada', async () => {
    // Arrange
    remover.mockRejectedValue(errorApi('OBSERVACION_ITEM_JURADO_NO_ENCONTRADA', 422));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverObservacionItemJurado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('obs-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith(KEY);
  });

  it('no invalida ante el 422 de evaluación finalizada', async () => {
    // Arrange
    remover.mockRejectedValue(
      errorApi('OBSERVACION_ITEM_JURADO_EVALUACION_JURADO_FINALIZADA', 422),
    );
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverObservacionItemJurado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('obs-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
