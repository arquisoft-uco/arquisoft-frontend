import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useRegistrarEvaluacionesCualitativasJurado } from './useRegistrarEvaluacionesCualitativasJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { registrarEvaluacionesCualitativasJurado: vi.fn() },
}));

const registrar = vi.mocked(evaluacionesService.registrarEvaluacionesCualitativasJurado);

const PARES = [{ itemId: 'i-1', criterioId: 'c-1' }];

function errorApi(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message: 'x', status: 422 },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

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

describe('useRegistrarEvaluacionesCualitativasJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía el id de la evaluación y los pares, y no invalida nada en éxito', async () => {
    // Arrange
    registrar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarEvaluacionesCualitativasJurado('ej-1'), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(PARES));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(registrar).toHaveBeenCalledWith({ evaluacionJuradoId: 'ej-1', evaluaciones: PARES });
    expect(invalidar).not.toHaveBeenCalled();
  });

  it('invalida el catálogo de ítems o de criterios que el backend dice que ya no existe', async () => {
    // Arrange
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarEvaluacionesCualitativasJurado('ej-1'), {
      wrapper: Wrapper,
    });

    // Act
    registrar.mockRejectedValueOnce(errorApi('EVALUACION_CUALITATIVA_JURADO_ITEMS_NO_ENCONTRADOS'));
    act(() => result.current.mutate(PARES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['evaluaciones', 'items-cualitativos-jurado'],
    });

    // Act
    invalidar.mockClear();
    registrar.mockRejectedValueOnce(
      errorApi('EVALUACION_CUALITATIVA_JURADO_CRITERIOS_NO_ENCONTRADOS'),
    );
    act(() => result.current.mutate(PARES));

    // Assert
    await waitFor(() =>
      expect(invalidar).toHaveBeenCalledWith({
        queryKey: ['evaluaciones', 'criterios-item-cualitativo-jurado'],
      }),
    );
    expect(invalidar).toHaveBeenCalledTimes(1);
  });

  it('no invalida catálogos ante otros errores', async () => {
    // Arrange
    registrar.mockRejectedValue(errorApi('EVALUACION_CUALITATIVA_JURADO_ITEMS_YA_REGISTRADOS'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarEvaluacionesCualitativasJurado('ej-1'), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(PARES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
