import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useEvaluacionAsesor } from './useEvaluacionAsesor';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { getEvaluacionAsesor: vi.fn() },
}));

const consultar = vi.mocked(evaluacionesService.getEvaluacionAsesor);

const EVALUACION_ASESOR = {
  id: 'ea-1',
  asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  notas: { resumenCualitativo: null, resumenCuantitativo: null, notaAcumulada: null },
};

function crearError422() {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: {},
    status: 422,
    statusText: 'Unprocessable',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('useEvaluacionAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(EVALUACION_ASESOR);
  });

  it('consulta con el id de la evaluación y expone la evaluación del asesor', async () => {
    // Act
    const { result } = renderHook(() => useEvaluacionAsesor('e-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('e-1');
    expect(result.current.data).toEqual(EVALUACION_ASESOR);
  });

  it('no consulta el service cuando no hay id', () => {
    // Act
    renderHook(() => useEvaluacionAsesor(''));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });

  it('no reintenta un 422', async () => {
    // Arrange
    consultar.mockRejectedValue(crearError422());

    // Act
    const { result } = renderHook(() => useEvaluacionAsesor('e-1'));
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledTimes(1);
  });
});
