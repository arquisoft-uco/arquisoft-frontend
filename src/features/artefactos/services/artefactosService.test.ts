import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { artefactosService } from './artefactosService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);

describe('artefactosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getObservacionesRevision', () => {
    it('consulta GET /revisiones-asesor/{id}/observaciones y traduce revisionAsesor y estado', async () => {
      // Arrange
      get.mockResolvedValue({
        data: [
          {
            id: 'o-1',
            revisionAsesor: 'r-1',
            descripcion: 'Falta el diagrama',
            estado: 'NUEVA',
            estadoNombre: 'Nueva',
          },
        ],
      });

      // Act
      const resultado = await artefactosService.getObservacionesRevision('r-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/revisiones-asesor/r-1/observaciones');
      expect(resultado).toEqual([
        {
          id: 'o-1',
          revisionAsesorId: 'r-1',
          descripcion: 'Falta el diagrama',
          estadoId: 'NUEVA',
          estadoNombre: 'Nueva',
        },
      ]);
    });

    it('devuelve una lista vacía cuando la revisión no tiene observaciones', async () => {
      // Arrange
      get.mockResolvedValue({ data: [] });

      // Act
      const resultado = await artefactosService.getObservacionesRevision('r-1');

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('consultarRevisionesAsesor', () => {
    it('hace POST /revisiones-asesor/asesor con el criterio y traduce los nombres conservando la página', async () => {
      // Arrange
      const criterio = { pagina: 0, tamanio: 10, ordenamiento: ['estadoRevisionAsesor:ASC'] };
      post.mockResolvedValue({
        data: {
          content: [
            {
              id: 'r-1',
              versionArtefacto: 'v-1',
              artefacto: 'a-1',
              version: 2,
              estadoRevisionAsesor: 'PENDIENTE',
              estadoRevisionAsesorNombre: 'Pendiente',
            },
          ],
          totalElements: 1,
          totalPages: 1,
        },
      });

      // Act
      const resultado = await artefactosService.consultarRevisionesAsesor(criterio);

      // Assert
      expect(post).toHaveBeenCalledWith('/revisiones-asesor/asesor', criterio);
      expect(resultado).toEqual({
        content: [
          {
            id: 'r-1',
            versionArtefactoId: 'v-1',
            artefactoId: 'a-1',
            version: 2,
            estadoId: 'PENDIENTE',
            estadoNombre: 'Pendiente',
          },
        ],
        totalElements: 1,
        totalPages: 1,
      });
    });
  });

  describe('getObservacionesRevisionEstudiante', () => {
    it('consulta GET /revisiones-asesor/{id}/observaciones/estudiante y traduce revisionAsesor y estado', async () => {
      // Arrange
      get.mockResolvedValue({
        data: [
          {
            id: 'o-1',
            revisionAsesor: 'r-1',
            descripcion: 'Falta el diagrama',
            estado: 'NUEVA',
            estadoNombre: 'Nueva',
          },
        ],
      });

      // Act
      const resultado = await artefactosService.getObservacionesRevisionEstudiante('r-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/revisiones-asesor/r-1/observaciones/estudiante');
      expect(resultado).toEqual([
        {
          id: 'o-1',
          revisionAsesorId: 'r-1',
          descripcion: 'Falta el diagrama',
          estadoId: 'NUEVA',
          estadoNombre: 'Nueva',
        },
      ]);
    });

    it('devuelve una lista vacía cuando la revisión no tiene observaciones', async () => {
      // Arrange
      get.mockResolvedValue({ data: [] });

      // Act
      const resultado = await artefactosService.getObservacionesRevisionEstudiante('r-1');

      // Assert
      expect(resultado).toEqual([]);
    });
  });
});
