import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { AxiosError, AxiosHeaders } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useRemoverJuradoEvaluacion } from './useRemoverJuradoEvaluacion';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { removerJuradosEvaluacion: vi.fn() },
}));

const remover = vi.mocked(evaluacionesService.removerJuradosEvaluacion);

const KEY_JURADOS = { queryKey: ['evaluaciones', 'e-1', 'jurados'] };
const KEY_COORDINADOR = { queryKey: ['evaluaciones', 'coordinador'] };

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

function errorApi(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message: 'x', status: 422 },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('useRemoverJuradoEvaluacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('remueve un solo jurado e invalida la lista de jurados y el listado del coordinador', async () => {
    // Arrange
    remover.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverJuradoEvaluacion('e-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('j-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(remover).toHaveBeenCalledWith({ evaluacionId: 'e-1', juradosIds: ['j-1'] });
    expect(invalidar).toHaveBeenCalledWith(KEY_JURADOS);
    expect(invalidar).toHaveBeenCalledWith(KEY_COORDINADOR);
  });

  it('ante el 422 de jurado no asignado invalida la lista', async () => {
    // Arrange
    remover.mockRejectedValue(errorApi('EVALUACION_JURADO_JURADOS_NO_ASIGNADOS'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverJuradoEvaluacion('e-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('j-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith(KEY_JURADOS);
  });

  it('ante el 422 de jurado con evaluaciones no invalida nada', async () => {
    // Arrange
    remover.mockRejectedValue(errorApi('EVALUACION_JURADO_JURADOS_CON_EVALUACIONES'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverJuradoEvaluacion('e-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('j-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
