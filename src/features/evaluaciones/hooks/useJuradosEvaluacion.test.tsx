import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { EvaluacionJurado } from '../models/EvaluacionJurado';
import { evaluacionesService } from '../services/evaluacionesService';
import { construirFiltrosJurado, useJuradosEvaluacion } from './useJuradosEvaluacion';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { getJuradosEvaluacion: vi.fn() },
}));

const consultar = vi.mocked(evaluacionesService.getJuradosEvaluacion);

const PAGINA: Page<EvaluacionJurado> = {
  content: [{ id: 'ej-1', jurado: { id: 'j-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' } }],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
  empty: false,
};

describe('construirFiltrosJurado', () => {
  it('devuelve undefined con texto vacío o solo espacios y recorta el valor si hay texto', () => {
    // Act & Assert
    expect(construirFiltrosJurado('')).toBeUndefined();
    expect(construirFiltrosJurado('   ')).toBeUndefined();
    expect(construirFiltrosJurado('  Ana ')).toEqual({
      tipo: 'PREDICADO',
      campo: 'jurado',
      operador: 'CONTIENE',
      valor: 'Ana',
    });
  });
});

describe('useJuradosEvaluacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(PAGINA);
  });

  it('consulta los jurados de la evaluación con página 0, tamaño 10 y orden ascendente por defecto', async () => {
    // Act
    const { result } = renderHook(() => useJuradosEvaluacion('e-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('e-1', {
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['jurado:ASC'],
      filtros: undefined,
    });
    expect(result.current.ordenDireccion).toBe('ASC');
  });

  it('envía el predicado CONTIENE sobre jurado cuando la URL trae ?q=', async () => {
    // Act
    const { result } = renderHook(() => useJuradosEvaluacion('e-1'), {
      initialPath: '/?q=Ana',
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith(
      'e-1',
      expect.objectContaining({
        filtros: { tipo: 'PREDICADO', campo: 'jurado', operador: 'CONTIENE', valor: 'Ana' },
      }),
    );
  });

  it('ordena descendente cuando la URL trae ?orden=jurado:DESC', async () => {
    // Act
    const { result } = renderHook(() => useJuradosEvaluacion('e-1'), {
      initialPath: '/?orden=jurado:DESC',
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.ordenDireccion).toBe('DESC');
    expect(consultar).toHaveBeenCalledWith(
      'e-1',
      expect.objectContaining({ ordenamiento: ['jurado:DESC'] }),
    );
  });

  it('no consulta el service cuando no hay evaluacionId', () => {
    // Act
    renderHook(() => useJuradosEvaluacion(''));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });
});
