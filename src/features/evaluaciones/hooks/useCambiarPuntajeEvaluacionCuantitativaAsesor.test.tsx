import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useCambiarPuntajeEvaluacionCuantitativaAsesor } from './useCambiarPuntajeEvaluacionCuantitativaAsesor';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { cambiarPuntajeEvaluacionCuantitativaAsesor: vi.fn() },
}));

const cambiar = vi.mocked(evaluacionesService.cambiarPuntajeEvaluacionCuantitativaAsesor);

const LISTA = { queryKey: ['evaluaciones', 'asesor', 'ea-1', 'cuantitativas'] };
const PREFIJO_ASESOR = { queryKey: ['evaluaciones', 'asesor'] };
const REQ = { evaluacionCuantitativaAsesorId: 'ec-1', puntaje: 40 };

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
  const { result } = renderHook(() => useCambiarPuntajeEvaluacionCuantitativaAsesor('ea-1'), {
    wrapper: Wrapper,
  });
  return { result, invalidar };
}

describe('useCambiarPuntajeEvaluacionCuantitativaAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía la petición e invalida solo la lista cuantitativa del asesor en éxito', async () => {
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
    ['EVALUACION_CUANTITATIVA_ASESOR_NO_ENCONTRADA', LISTA],
    ['EVALUACION_CUANTITATIVA_ASESOR_PUNTAJE_EXCEDE_VALOR_ITEM', LISTA],
    ['EVALUACION_CUANTITATIVA_ASESOR_CAMBIO_PUNTAJE_EVALUACION_FINALIZADA', PREFIJO_ASESOR],
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
    cambiar.mockRejectedValue(errorApi('EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR'));
    const { result, invalidar } = montar();

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
