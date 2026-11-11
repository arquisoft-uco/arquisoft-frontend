import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { entregablesService } from './entregablesService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { get: vi.fn(), patch: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(apiClient.get);

describe('entregablesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('consultarHistorialEstadosEntregable', () => {
    it('hace GET /entregables/{id}/estados y traduce el estado plano a { id, nombre }', async () => {
      // Arrange
      get.mockResolvedValue({
        status: 200,
        data: [
          {
            id: 'h-1',
            estadoEntregable: 'DISPONIBLE_EVALUACION',
            estadoEntregableNombre: 'Disponible para evaluación',
            fechaActualizacion: '2026-09-01T10:00:00Z',
          },
        ],
      });

      // Act
      const resultado = await entregablesService.consultarHistorialEstadosEntregable('e-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/entregables/e-1/estados');
      expect(resultado).toEqual([
        {
          id: 'h-1',
          estado: { id: 'DISPONIBLE_EVALUACION', nombre: 'Disponible para evaluación' },
          fechaActualizacion: '2026-09-01T10:00:00Z',
        },
      ]);
    });
  });
});
