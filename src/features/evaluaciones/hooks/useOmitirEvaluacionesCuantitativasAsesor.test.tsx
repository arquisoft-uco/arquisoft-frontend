import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useOmitirEvaluacionesCuantitativasAsesor } from './useOmitirEvaluacionesCuantitativasAsesor';
import {
  EVALUACION_CUANTITATIVA_ASESOR_EVALUACIONES_NO_REGISTRADAS,
  EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA,
  EVALUACION_CUANTITATIVA_ASESOR_OMISION_EVALUACION_ASESOR_FINALIZADA,
} from '../utils/codigos-error-evaluaciones';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { omitirEvaluacionesCuantitativasAsesor: vi.fn() },
}));

const omitir = vi.mocked(evaluacionesService.omitirEvaluacionesCuantitativasAsesor);

const LISTA = { queryKey: ['evaluaciones', 'asesor', 'ea-1', 'cuantitativas'] };
const PREFIJO = { queryKey: ['evaluaciones', 'asesor'] };

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
  const { result } = renderHook(() => useOmitirEvaluacionesCuantitativasAsesor('ea-1'), {
    wrapper: Wrapper,
  });
  return { result, invalidar };
}

describe('useOmitirEvaluacionesCuantitativasAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía el id de la evaluación y los ids de ítem, e invalida el prefijo del asesor en éxito', async () => {
    // Arrange
    omitir.mockResolvedValue(undefined);
    const { result, invalidar } = montar();

    // Act
    act(() => result.current.mutate(['i-1', 'i-2']));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(omitir).toHaveBeenCalledWith({ evaluacionAsesorId: 'ea-1', items: ['i-1', 'i-2'] });
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith(PREFIJO);
  });

  it('invalida solo la lista ante los 422 de valoraciones no registradas o evaluación no encontrada', async () => {
    // Arrange
    const { result, invalidar } = montar();

    // Act
    omitir.mockRejectedValueOnce(
      errorApi(EVALUACION_CUANTITATIVA_ASESOR_EVALUACIONES_NO_REGISTRADAS),
    );
    act(() => result.current.mutate(['i-1']));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith(LISTA);

    // Act
    invalidar.mockClear();
    omitir.mockRejectedValueOnce(
      errorApi(EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA),
    );
    act(() => result.current.mutate(['i-1']));

    // Assert
    await waitFor(() => expect(invalidar).toHaveBeenCalledWith(LISTA));
    expect(invalidar).toHaveBeenCalledTimes(1);
  });

  it('invalida el prefijo del asesor ante el 422 de evaluación finalizada', async () => {
    // Arrange
    omitir.mockRejectedValue(
      errorApi(EVALUACION_CUANTITATIVA_ASESOR_OMISION_EVALUACION_ASESOR_FINALIZADA),
    );
    const { result, invalidar } = montar();

    // Act
    act(() => result.current.mutate(['i-1']));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith(PREFIJO);
  });

  it('no invalida nada ante otro error', async () => {
    // Arrange
    omitir.mockRejectedValue(errorApi('ERROR_DESCONOCIDO', 500));
    const { result, invalidar } = montar();

    // Act
    act(() => result.current.mutate(['i-1']));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
