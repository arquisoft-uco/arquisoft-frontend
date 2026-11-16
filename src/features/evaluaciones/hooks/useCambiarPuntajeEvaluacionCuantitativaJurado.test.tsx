import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useCambiarPuntajeEvaluacionCuantitativaJurado } from './useCambiarPuntajeEvaluacionCuantitativaJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { cambiarPuntajeEvaluacionCuantitativaJurado: vi.fn() },
}));

const cambiar = vi.mocked(evaluacionesService.cambiarPuntajeEvaluacionCuantitativaJurado);

const LISTA = { queryKey: ['evaluaciones', 'jurado', 'ej-1', 'cuantitativas'] };
const ASIGNADAS = { queryKey: ['evaluaciones', 'jurado', 'asignadas'] };
const REQ = { evaluacionCuantitativaJuradoId: 'eq-1', puntaje: 30 };

function errorApi(errorCode: string, status = 422) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message: 'x', status },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function montar() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  const { result } = renderHook(() => useCambiarPuntajeEvaluacionCuantitativaJurado('ej-1'), {
    wrapper: Wrapper,
  });
  return { result, invalidar };
}

describe('useCambiarPuntajeEvaluacionCuantitativaJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía la petición e invalida solo la lista del jurado en éxito', async () => {
    // Arrange
    cambiar.mockResolvedValue(undefined);
    const { result, invalidar } = montar();

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cambiar).toHaveBeenCalledWith(REQ);
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith(LISTA);
  });

  it.each([
    ['EVALUACION_CUANTITATIVA_JURADO_NO_ENCONTRADA', LISTA],
    ['EVALUACION_CUANTITATIVA_JURADO_EVALUACION_FINALIZADA', ASIGNADAS],
  ])('ante el 422 %s invalida solo la query correspondiente', async (codigo, key) => {
    // Arrange
    cambiar.mockRejectedValue(errorApi(codigo));
    const { result, invalidar } = montar();

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith(key);
  });

  it('no invalida nada ante otro error', async () => {
    // Arrange
    cambiar.mockRejectedValue(errorApi('EVALUACION_CUANTITATIVA_JURADO_PUNTAJE_EXCEDE_VALOR_ITEM'));
    const { result, invalidar } = montar();

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
