import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useTareasMapaRutaAsesor } from './useTareasMapaRutaAsesor';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { consultarTareasMapaRutaAsesor: vi.fn() },
}));

const consultar = vi.mocked(mapasRutaService.consultarTareasMapaRutaAsesor);

describe('useTareasMapaRutaAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue({ content: [], totalElements: 0 } as never);
  });

  it('por defecto pide la página 0 de 10 ordenada por descripción ASC y sin filtros', async () => {
    // Act
    const { result } = renderHook(() => useTareasMapaRutaAsesor('m-1'));
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

  it('con texto y orden DESC en la URL envía el predicado de descripción y el orden', async () => {
    // Act
    const { result } = renderHook(() => useTareasMapaRutaAsesor('m-1'), {
      initialPath: '/mapas-ruta?q=informe&orden=descripcion:DESC',
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('m-1', {
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['descripcion:DESC'],
      filtros: { tipo: 'PREDICADO', campo: 'descripcion', operador: 'CONTIENE', valor: 'informe' },
    });
    expect(result.current.hayFiltros).toBe(true);
  });

  it('con un orden inválido en la URL cae al orden por defecto', async () => {
    // Act
    const { result } = renderHook(() => useTareasMapaRutaAsesor('m-1'), {
      initialPath: '/mapas-ruta?orden=estado:DESC',
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.ordenDireccion).toBe('ASC');
  });
});
