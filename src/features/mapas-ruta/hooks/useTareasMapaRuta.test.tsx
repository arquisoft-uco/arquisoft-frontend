import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useTareasMapaRuta } from './useTareasMapaRuta';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { consultarTareasMapaRuta: vi.fn() },
}));

const consultar = vi.mocked(mapasRutaService.consultarTareasMapaRuta);

describe('useTareasMapaRuta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue({ content: [], totalElements: 0 } as never);
  });

  it('por defecto pide la página 0 de 10 ordenada por descripción ASC y sin filtros', async () => {
    // Act
    const { result } = renderHook(() => useTareasMapaRuta('m-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('m-1', {
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['descripcion:ASC'],
      filtros: undefined,
    });
    expect(result.current.hayFiltros).toBe(false);
  });

  it('lee texto, estados y orden de la URL', async () => {
    // Act
    const { result } = renderHook(() => useTareasMapaRuta('m-1'), {
      initialPath: '/mapas-ruta?q=informe&estado=NUEVA&orden=descripcion:DESC',
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('m-1', {
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['descripcion:DESC'],
      filtros: {
        tipo: 'GRUPO',
        conector: 'AND',
        nodos: [
          { tipo: 'PREDICADO', campo: 'descripcion', operador: 'CONTIENE', valor: 'informe' },
          { tipo: 'PREDICADO_MULTIVALOR', campo: 'estadoItem', operador: 'IN', valores: ['NUEVA'] },
        ],
      },
    });
  });

  it('con un orden inválido en la URL cae al orden por defecto', async () => {
    // Act
    const { result } = renderHook(() => useTareasMapaRuta('m-1'), {
      initialPath: '/mapas-ruta?orden=estado:DESC',
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.ordenDireccion).toBe('ASC');
  });

  it('al filtrar vuelve a la página 0 y limpiarFiltros quita los filtros', async () => {
    // Arrange
    const { result } = renderHook(() => useTareasMapaRuta('m-1'), {
      initialPath: '/mapas-ruta?pagina=3',
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.page).toBe(2);

    // Act
    act(() => result.current.toggleEstado('NUEVA'));

    // Assert
    await waitFor(() => expect(result.current.estadoIds).toEqual(['NUEVA']));
    expect(result.current.page).toBe(0);
    expect(result.current.hayFiltros).toBe(true);

    // Act
    act(() => result.current.limpiarFiltros());

    // Assert
    await waitFor(() => expect(result.current.hayFiltros).toBe(false));
  });
});
