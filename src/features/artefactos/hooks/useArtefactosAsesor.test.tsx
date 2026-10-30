import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { ArtefactoAsesor } from '../models/ArtefactoAsesor';
import { artefactosService } from '../services/artefactosService';
import { useArtefactosAsesor } from './useArtefactosAsesor';

vi.mock('../services/artefactosService', () => ({
  artefactosService: {
    consultarArtefactosAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.consultarArtefactosAsesor);

const ARTEFACTO: ArtefactoAsesor = {
  id: 'a-1',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'r-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
};

describe('useArtefactosAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue({
      content: [ARTEFACTO],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      size: 100,
      first: true,
      last: true,
      empty: false,
    });
  });

  it('pide el catálogo de 100 ordenado, arma las opciones y resuelve nombreDe', async () => {
    // Act
    const { result } = renderHook(() => useArtefactosAsesor());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 100,
      ordenamiento: ['nombreDocumento:ASC', 'nombreProyecto:ASC'],
    });
    expect(result.current.opciones).toEqual([
      { id: 'a-1', etiqueta: 'Acta de inicio', descripcion: 'Sistema de riego' },
    ]);
    expect(result.current.nombreDe('a-1')).toBe('Acta de inicio · Sistema de riego');
    expect(result.current.nombreDe('desconocido')).toBeUndefined();
  });

  it('mientras no hay datos o si falla no hay opciones', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo'));

    // Act
    const { result } = renderHook(() => useArtefactosAsesor());
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.opciones).toEqual([]);
    expect(result.current.artefactos).toEqual([]);
  });
});
