import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { evaluacionesService } from './evaluacionesService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { get: vi.fn(), patch: vi.fn(), post: vi.fn() },
}));

const patch = vi.mocked(apiClient.patch);
const post = vi.mocked(apiClient.post);
const get = vi.mocked(apiClient.get);

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

  describe('registrarItemCuantitativoJurado', () => {
    it('llama POST enviando categoria (no categoriaId) y el valor numérico, y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 'i-1' } });

      // Act
      const resultado = await evaluacionesService.registrarItemCuantitativoJurado({
        nombre: 'Rigor',
        descripcion: 'Calidad del método.',
        categoriaId: 'c-1',
        valor: 30,
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/evaluaciones/items-cuantitativos-jurado', {
        nombre: 'Rigor',
        descripcion: 'Calidad del método.',
        categoria: 'c-1',
        valor: 30,
      });
      expect(resultado).toEqual({ id: 'i-1' });
    });
  });

  describe('getCategoriasItemCuantitativoJurado', () => {
    it('no envía params sin nombre y envía params: { nombre } con filtro', async () => {
      // Arrange
      get.mockResolvedValue({ status: 200, data: [] });

      // Act
      await evaluacionesService.getCategoriasItemCuantitativoJurado();
      await evaluacionesService.getCategoriasItemCuantitativoJurado('téc');

      // Assert
      expect(get).toHaveBeenNthCalledWith(
        1,
        '/evaluaciones/categorias-item-cuantitativo-jurado',
        undefined,
      );
      expect(get).toHaveBeenNthCalledWith(2, '/evaluaciones/categorias-item-cuantitativo-jurado', {
        params: { nombre: 'téc' },
      });
    });
  });
});
