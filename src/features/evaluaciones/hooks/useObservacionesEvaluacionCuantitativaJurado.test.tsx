import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useObservacionesEvaluacionCuantitativaJurado } from './useObservacionesEvaluacionCuantitativaJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { getObservacionesEvaluacionCuantitativaJurado: vi.fn() },
}));

const consultar = vi.mocked(evaluacionesService.getObservacionesEvaluacionCuantitativaJurado);

const PAGINA = {
  content: [{ id: 'o-1', descripcion: 'Falta rigor' }],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
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

describe('useObservacionesEvaluacionCuantitativaJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(PAGINA as never);
  });

  it('pide la primera página de 10 y re-consulta al cambiar de página', async () => {
    // Act
    const { result } = renderHook(() => useObservacionesEvaluacionCuantitativaJurado('ec-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('ec-1', { pagina: 0, tamanio: 10 });
    expect(result.current.data?.content).toHaveLength(1);

    // Act
    act(() => result.current.goToPage(1));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith('ec-1', { pagina: 1, tamanio: 10 }),
    );
    expect(result.current.page).toBe(1);
  });

  it('no consulta el service cuando no hay id', () => {
    // Act
    renderHook(() => useObservacionesEvaluacionCuantitativaJurado(''));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });

  it('no reintenta un 422', async () => {
    // Arrange
    consultar.mockRejectedValue(crearError422());

    // Act
    const { result } = renderHook(() => useObservacionesEvaluacionCuantitativaJurado('ec-1'));
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledTimes(1);
  });
});
