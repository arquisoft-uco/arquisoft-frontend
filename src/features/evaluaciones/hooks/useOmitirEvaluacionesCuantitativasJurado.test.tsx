import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useOmitirEvaluacionesCuantitativasJurado } from './useOmitirEvaluacionesCuantitativasJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { omitirEvaluacionesCuantitativasJurado: vi.fn() },
}));

const omitir = vi.mocked(evaluacionesService.omitirEvaluacionesCuantitativasJurado);

const LISTA = { queryKey: ['evaluaciones', 'jurado', 'ej-1', 'cuantitativas'] };
const ASIGNADAS = { queryKey: ['evaluaciones', 'jurado', 'asignadas'] };

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
  const { result } = renderHook(() => useOmitirEvaluacionesCuantitativasJurado('ej-1'), {
    wrapper: Wrapper,
  });
  return { result, invalidar };
}

describe('useOmitirEvaluacionesCuantitativasJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía el id de la evaluación y los ids, e invalida la lista y «Mis evaluaciones» en éxito', async () => {
    // Arrange
    omitir.mockResolvedValue(undefined);
    const { result, invalidar } = montar();

    // Act
    act(() => result.current.mutate(['ec-1', 'ec-2']));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(omitir).toHaveBeenCalledWith({
      evaluacionJuradoId: 'ej-1',
      evaluaciones: ['ec-1', 'ec-2'],
    });
    expect(invalidar).toHaveBeenCalledTimes(2);
    expect(invalidar).toHaveBeenCalledWith(LISTA);
    expect(invalidar).toHaveBeenCalledWith(ASIGNADAS);
  });

  it('invalida solo la lista ante los 422 de evaluaciones o evaluación no encontradas', async () => {
    // Arrange
    const { result, invalidar } = montar();

    // Act
    omitir.mockRejectedValueOnce(
      errorApi('EVALUACION_CUANTITATIVA_JURADO_EVALUACIONES_NO_ENCONTRADAS'),
    );
    act(() => result.current.mutate(['ec-1']));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith(LISTA);

    // Act
    invalidar.mockClear();
    omitir.mockRejectedValueOnce(
      errorApi('EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA'),
    );
    act(() => result.current.mutate(['ec-1']));

    // Assert
    await waitFor(() => expect(invalidar).toHaveBeenCalledWith(LISTA));
    expect(invalidar).toHaveBeenCalledTimes(1);
  });

  it('invalida solo «Mis evaluaciones» ante el 422 de evaluación finalizada', async () => {
    // Arrange
    omitir.mockRejectedValue(
      errorApi('EVALUACION_CUANTITATIVA_JURADO_OMISION_EVALUACION_JURADO_FINALIZADA'),
    );
    const { result, invalidar } = montar();

    // Act
    act(() => result.current.mutate(['ec-1']));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith(ASIGNADAS);
  });

  it('no invalida nada ante observaciones pendientes ni ante otro error', async () => {
    // Arrange
    const { result, invalidar } = montar();

    // Act
    omitir.mockRejectedValueOnce(
      errorApi('EVALUACION_CUANTITATIVA_JURADO_EVALUACIONES_CON_OBSERVACIONES'),
    );
    act(() => result.current.mutate(['ec-1']));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();

    // Act
    omitir.mockRejectedValueOnce(errorApi('ERROR_DESCONOCIDO', 500));
    act(() => result.current.mutate(['ec-1']));

    // Assert
    await waitFor(() => expect(omitir).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
