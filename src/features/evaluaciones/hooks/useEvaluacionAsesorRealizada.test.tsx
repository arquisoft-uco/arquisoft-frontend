import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useEvaluacionAsesorRealizada } from './useEvaluacionAsesorRealizada';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { getEvaluacionAsesorRealizada: vi.fn() },
}));

const consultar = vi.mocked(evaluacionesService.getEvaluacionAsesorRealizada);

const INFORMACION = {
  id: 'ea-1',
  evaluacion: {
    id: 'ev-1',
    entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
    estado: { id: 'e-1', nombre: 'En curso' },
  },
  asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
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

describe('useEvaluacionAsesorRealizada', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(INFORMACION);
  });

  it('consulta con el id de la evaluación del asesor y expone el detalle', async () => {
    // Act
    const { result } = renderHook(() => useEvaluacionAsesorRealizada('ea-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('ea-1');
    expect(result.current.data).toEqual(INFORMACION);
  });

  it('no consulta el service cuando no hay id', () => {
    // Act
    renderHook(() => useEvaluacionAsesorRealizada(''));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });

  it('no reintenta un 422', async () => {
    // Arrange
    consultar.mockRejectedValue(crearError422());

    // Act
    const { result } = renderHook(() => useEvaluacionAsesorRealizada('ea-1'));
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledTimes(1);
  });
});
