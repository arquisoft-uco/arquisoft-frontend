import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useMapasRutaCoordinador } from './useMapasRutaCoordinador';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { consultarMapasRutaCoordinador: vi.fn() },
}));

const consultar = vi.mocked(mapasRutaService.consultarMapasRutaCoordinador);

describe('useMapasRutaCoordinador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue({ content: [], totalElements: 0 } as never);
  });

  it('por defecto pide la página 0 de 10 sin orden ni filtros', async () => {
    // Act
    const { result } = renderHook(() => useMapasRutaCoordinador());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: undefined,
      filtros: undefined,
    });
    expect(result.current.hayFiltros).toBe(false);
  });

  it('lee filtros y orden de la URL, descartando una fecha inexistente', async () => {
    // Act
    const { result } = renderHook(() => useMapasRutaCoordinador(), {
      initialPath: '/mapas-ruta?inicioDesde=2026-01-01&finHasta=2026-02-31&orden=fechaFin:DESC',
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['fechaFin:DESC', 'fechaInicio:ASC'],
      filtros: {
        tipo: 'PREDICADO',
        campo: 'fechaInicio',
        operador: 'MAYOR_IGUAL_QUE',
        valor: '2026-01-01',
      },
    });
  });

  it('al filtrar vuelve a la página 0 y limpiarFiltros quita los filtros', async () => {
    // Arrange
    const { result } = renderHook(() => useMapasRutaCoordinador(), {
      initialPath: '/mapas-ruta?pagina=3',
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.page).toBe(2);

    // Act
    act(() => result.current.setFecha('finDesde', '2026-06-01'));

    // Assert
    await waitFor(() => expect(result.current.fechas.finDesde).toBe('2026-06-01'));
    expect(result.current.page).toBe(0);
    expect(result.current.hayFiltros).toBe(true);

    // Act
    act(() => result.current.limpiarFiltros());

    // Assert
    await waitFor(() => expect(result.current.hayFiltros).toBe(false));
  });
});
