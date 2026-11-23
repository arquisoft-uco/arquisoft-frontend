import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UseQueryResult } from '@tanstack/react-query';
import { renderHook } from '../../../test-utils/render';
import { useEvaluacionesCualitativasAsesor } from './useEvaluacionesCualitativasAsesor';
import { useItemsCualitativosAsesor } from './useItemsCualitativosAsesor';
import { useItemsCualitativosPendientesAsesor } from './useItemsCualitativosPendientesAsesor';

vi.mock('./useItemsCualitativosAsesor', () => ({ useItemsCualitativosAsesor: vi.fn() }));
vi.mock('./useEvaluacionesCualitativasAsesor', () => ({
  useEvaluacionesCualitativasAsesor: vi.fn(),
}));

const catalogo = vi.mocked(useItemsCualitativosAsesor);
const realizadas = vi.mocked(useEvaluacionesCualitativasAsesor);

const ITEMS = [
  { id: 'i-1', nombre: 'Claridad', descripcion: '', peso: 50 },
  { id: 'i-2', nombre: 'Rigor', descripcion: '', peso: 50 },
];

function consulta<T>(estado: object): UseQueryResult<T[], Error> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    ...estado,
  } as UseQueryResult<T[], Error>;
}

describe('useItemsCualitativosPendientesAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('combina el catálogo con las realizadas y expone solo los pendientes', () => {
    // Arrange
    catalogo.mockReturnValue(consulta({ data: ITEMS }));
    realizadas.mockReturnValue(
      consulta({ data: [{ id: 'e-1', item: { id: 'i-1' }, criterio: { id: 'c-1' } }] }),
    );

    // Act
    const { result } = renderHook(() => useItemsCualitativosPendientesAsesor('ea-1'));

    // Assert
    expect(realizadas).toHaveBeenCalledWith('ea-1');
    expect(result.current.filas.map((f) => [f.item.id, f.pendiente])).toEqual([
      ['i-1', false],
      ['i-2', true],
    ]);
    expect(result.current.pendientes).toEqual([ITEMS[1]]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('está cargando mientras falte cualquiera de las dos consultas', () => {
    // Arrange
    catalogo.mockReturnValue(consulta({ data: ITEMS }));
    realizadas.mockReturnValue(consulta({ isLoading: true }));

    // Act
    const { result } = renderHook(() => useItemsCualitativosPendientesAsesor('ea-1'));

    // Assert
    expect(result.current.isLoading).toBe(true);
    expect(result.current.filas).toEqual([]);
  });

  it('marca el error y recarga solo la consulta que falló', () => {
    // Arrange
    const refetchCatalogo = vi.fn();
    const refetchRealizadas = vi.fn();
    const falla = new Error('sin conexión');
    catalogo.mockReturnValue(consulta({ data: ITEMS, refetch: refetchCatalogo }));
    realizadas.mockReturnValue(
      consulta({ isError: true, error: falla, refetch: refetchRealizadas }),
    );

    // Act
    const { result } = renderHook(() => useItemsCualitativosPendientesAsesor('ea-1'));
    result.current.refetch();

    // Assert
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(falla);
    expect(refetchRealizadas).toHaveBeenCalledTimes(1);
    expect(refetchCatalogo).not.toHaveBeenCalled();
  });
});
