import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { usePlanesRealesProyectoAsesor } from './usePlanesRealesProyectoAsesor';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { consultarPlanesRealesProyectoAsesor: vi.fn() },
}));

const consultar = vi.mocked(mapasRutaService.consultarPlanesRealesProyectoAsesor);

describe('usePlanesRealesProyectoAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue({ content: [], totalElements: 0 } as never);
  });

  it('por defecto pide la página 0 de 10 ordenada por días reales ASC y sin filtros', async () => {
    // Act
    const { result } = renderHook(() => usePlanesRealesProyectoAsesor('p-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('p-1', {
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['tiempoRealDias:ASC'],
      filtros: undefined,
    });
    expect(result.current.hayFiltros).toBe(false);
  });

  it('con texto y orden en la URL envía el grupo de búsqueda y el orden', async () => {
    // Act
    const { result } = renderHook(() => usePlanesRealesProyectoAsesor('p-1'), {
      initialPath: '/planes?q=informe&orden=descripcionTarea:DESC',
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('p-1', {
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['descripcionTarea:DESC'],
      filtros: {
        tipo: 'GRUPO',
        conector: 'OR',
        nodos: [
          { tipo: 'PREDICADO', campo: 'descripcionTarea', operador: 'CONTIENE', valor: 'informe' },
          { tipo: 'PREDICADO', campo: 'descripcionReal', operador: 'CONTIENE', valor: 'informe' },
        ],
      },
    });
    expect(result.current.hayFiltros).toBe(true);
    expect(result.current.ordenCampo).toBe('descripcionTarea');
    expect(result.current.ordenDireccion).toBe('DESC');
  });

  it('con un orden inválido en la URL cae al orden por defecto', async () => {
    // Act
    const { result } = renderHook(() => usePlanesRealesProyectoAsesor('p-1'), {
      initialPath: '/planes?orden=estado:DESC',
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.ordenCampo).toBe('tiempoRealDias');
    expect(result.current.ordenDireccion).toBe('ASC');
  });
});
