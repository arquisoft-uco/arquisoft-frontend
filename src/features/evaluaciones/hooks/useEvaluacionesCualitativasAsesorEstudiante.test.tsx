import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useEvaluacionesCualitativasAsesorEstudiante } from './useEvaluacionesCualitativasAsesorEstudiante';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { getEvaluacionesCualitativasAsesorEstudiante: vi.fn() },
}));

const consultar = vi.mocked(evaluacionesService.getEvaluacionesCualitativasAsesorEstudiante);

function crearError422() {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: {},
    status: 422,
    statusText: 'Unprocessable',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('useEvaluacionesCualitativasAsesorEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue([]);
  });

  it('consulta las cualitativas con el id de la evaluación del asesor y expone los datos', async () => {
    // Arrange
    consultar.mockResolvedValue([
      {
        id: 'ec-1',
        item: { id: 'i-1', nombre: 'Claridad', descripcion: 'd', peso: 10 },
        criterio: { id: 'cr-1', nombre: 'Alto', descripcion: 'd' },
      },
    ]);

    // Act
    const { result } = renderHook(() => useEvaluacionesCualitativasAsesorEstudiante('ea-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('ea-1');
    expect(result.current.data).toHaveLength(1);
  });

  it('no consulta el service cuando no hay id', () => {
    // Act
    renderHook(() => useEvaluacionesCualitativasAsesorEstudiante(''));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });

  it('no reintenta un 422', async () => {
    // Arrange
    consultar.mockRejectedValue(crearError422());

    // Act
    const { result } = renderHook(() => useEvaluacionesCualitativasAsesorEstudiante('ea-1'));
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledTimes(1);
  });
});
