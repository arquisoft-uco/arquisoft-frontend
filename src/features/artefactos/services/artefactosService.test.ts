import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { artefactosService } from './artefactosService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { get: vi.fn() },
}));

const get = vi.mocked(apiClient.get);

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
});
