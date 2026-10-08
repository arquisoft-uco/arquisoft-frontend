import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { evaluacionesService } from './evaluacionesService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { patch: vi.fn() },
}));

const patch = vi.mocked(apiClient.patch);

describe('evaluacionesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('modificarItemCualitativoJurado', () => {
    it('llama PATCH con el itemId en la ruta y solo { descripcion } en el body, y resuelve undefined', async () => {
      // Arrange
      patch.mockResolvedValue({ status: 204, data: undefined });

      // Act
      const resultado = await evaluacionesService.modificarItemCualitativoJurado({
        itemId: 'item-1',
        descripcion: 'Nueva descripción',
      });

      // Assert
      expect(patch).toHaveBeenCalledWith('/evaluaciones/items-cualitativos-jurado/item-1', {
        descripcion: 'Nueva descripción',
      });
      expect(resultado).toBeUndefined();
    });
  });
});
