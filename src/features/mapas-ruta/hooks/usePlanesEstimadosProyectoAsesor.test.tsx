import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { usePlanesEstimadosProyectoAsesor } from './usePlanesEstimadosProyectoAsesor';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { consultarPlanesEstimadosProyectoAsesor: vi.fn() },
}));

const consultar = vi.mocked(mapasRutaService.consultarPlanesEstimadosProyectoAsesor);

describe('usePlanesEstimadosProyectoAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue({ content: [], totalElements: 0 } as never);
  });

  it('por defecto pide la página 0 de 10 por días estimados ASC y sin filtros', async () => {
    // Act
    const { result } = renderHook(() => usePlanesEstimadosProyectoAsesor('pg-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('pg-1', {
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['tiempoEstimadoDias:ASC'],
      filtros: undefined,
    });
    expect(result.current.hayFiltros).toBe(false);
  });

  it('con texto y orden en la URL envía el grupo OR y ese orden', async () => {
    // Act
    const { result } = renderHook(() => usePlanesEstimadosProyectoAsesor('pg-1'), {
      initialPath: '/x?q=informe&orden=descripcionTarea:DESC',
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('pg-1', {
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['descripcionTarea:DESC'],
      filtros: {
        tipo: 'GRUPO',
        conector: 'OR',
        nodos: [
          { tipo: 'PREDICADO', campo: 'descripcionTarea', operador: 'CONTIENE', valor: 'informe' },
          {
            tipo: 'PREDICADO',
            campo: 'descripcionEstimado',
            operador: 'CONTIENE',
            valor: 'informe',
          },
        ],
      },
    });
    expect(result.current.ordenCampo).toBe('descripcionTarea');
    expect(result.current.ordenDireccion).toBe('DESC');
    expect(result.current.hayFiltros).toBe(true);
  });

  it('con un orden inválido en la URL cae al orden por defecto', async () => {
    // Act
    const { result } = renderHook(() => usePlanesEstimadosProyectoAsesor('pg-1'), {
      initialPath: '/x?orden=estado:DESC',
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.ordenCampo).toBe('tiempoEstimadoDias');
    expect(result.current.ordenDireccion).toBe('ASC');
  });
});
