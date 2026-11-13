import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useEvaluacionesCuantitativasRealizadasJurado } from './useEvaluacionesCuantitativasRealizadasJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { getEvaluacionesCuantitativasRealizadasJurado: vi.fn() },
}));

const consultar = vi.mocked(evaluacionesService.getEvaluacionesCuantitativasRealizadasJurado);

function crearError422() {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: {},
    status: 422,
    statusText: 'Unprocessable',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('useEvaluacionesCuantitativasRealizadasJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue([]);
  });

  it('consulta las cuantitativas realizadas con el id de la evaluación del jurado', async () => {
    // Act
    const { result } = renderHook(() => useEvaluacionesCuantitativasRealizadasJurado('ej-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('ej-1');
    expect(result.current.data).toEqual([]);
  });

  it('no consulta el service cuando no hay id', () => {
    // Act
    renderHook(() => useEvaluacionesCuantitativasRealizadasJurado(''));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });

  it('no reintenta un 422', async () => {
    // Arrange
    consultar.mockRejectedValue(crearError422());

    // Act
    const { result } = renderHook(() => useEvaluacionesCuantitativasRealizadasJurado('ej-1'));
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledTimes(1);
  });
});
