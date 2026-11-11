import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import type { ArtefactoAsesor } from '../models/ArtefactoAsesor';
import type { VersionRepositorioAsesor } from '../models/VersionRepositorioAsesor';
import { useVersionesElegiblesArtefacto } from './useVersionesElegiblesArtefacto';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { consultarVersionesRepositorioAsesor: vi.fn() },
}));

const consultar = vi.mocked(artefactosService.consultarVersionesRepositorioAsesor);

const ARTEFACTO: ArtefactoAsesor = {
  id: 'art-1',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'v-2',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repo base',
  omitido: false,
  proyectoFinalizado: false,
  proyectoCancelado: false,
};

describe('useVersionesElegiblesArtefacto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filtra por repositorio y documento y no ofrece la versión actual', async () => {
    // Arrange
    consultar.mockResolvedValue({
      content: [{ id: 'v-1' }, { id: 'v-2' }, { id: 'v-3' }] as VersionRepositorioAsesor[],
      page: 0,
      size: 100,
      totalElements: 3,
      totalPages: 1,
      first: true,
      last: true,
      empty: false,
    });

    // Act
    const { result } = renderHook(() => useVersionesElegiblesArtefacto(ARTEFACTO, true));

    // Assert
    await waitFor(() => expect(result.current.versiones).toHaveLength(2));
    expect(result.current.versiones.map((v) => v.id)).toEqual(['v-1', 'v-3']);
    expect(consultar).toHaveBeenCalledWith(
      expect.objectContaining({
        filtros: {
          tipo: 'GRUPO',
          conector: 'AND',
          nodos: [
            { tipo: 'PREDICADO', campo: 'nombreRepositorio', operador: 'ES', valor: 'Repo base' },
            {
              tipo: 'PREDICADO',
              campo: 'nombreDocumento',
              operador: 'ES',
              valor: 'Acta de inicio',
            },
          ],
        },
      }),
    );
  });

  it('deshabilitado no consulta', () => {
    // Act
    renderHook(() => useVersionesElegiblesArtefacto(ARTEFACTO, false));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });
});
