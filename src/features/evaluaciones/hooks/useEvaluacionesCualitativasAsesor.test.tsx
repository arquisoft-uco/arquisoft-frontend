import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useEvaluacionesCualitativasAsesor } from './useEvaluacionesCualitativasAsesor';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { getEvaluacionesCualitativasAsesor: vi.fn() },
}));

const consultar = vi.mocked(evaluacionesService.getEvaluacionesCualitativasAsesor);

function crearError422() {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: {},
    status: 422,
    statusText: 'Unprocessable',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('useEvaluacionesCualitativasAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue([]);
  });

  it('consulta las cualitativas con el id de la evaluación del asesor', async () => {
    // Act
    const { result } = renderHook(() => useEvaluacionesCualitativasAsesor('ea-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('ea-1');
  });

  it('no consulta el service cuando no hay id', () => {
    // Act
    renderHook(() => useEvaluacionesCualitativasAsesor(''));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });

  it('no reintenta un 422', async () => {
    // Arrange
    consultar.mockRejectedValue(crearError422());

    // Act
    const { result } = renderHook(() => useEvaluacionesCualitativasAsesor('ea-1'));
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledTimes(1);
  });
});
