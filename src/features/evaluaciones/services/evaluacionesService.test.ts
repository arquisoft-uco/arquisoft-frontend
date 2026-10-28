import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { evaluacionesService } from './evaluacionesService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const del = vi.mocked(apiClient.delete);
const patch = vi.mocked(apiClient.patch);
const post = vi.mocked(apiClient.post);
const get = vi.mocked(apiClient.get);

describe('evaluacionesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registrarEvaluacionesCualitativasJurado', () => {
    it('envía a la ruta sin prefijo con item/criterio traducidos y resuelve undefined', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: undefined });

      // Act
      const resultado = await evaluacionesService.registrarEvaluacionesCualitativasJurado({
        evaluacionJuradoId: 'ej-1',
        evaluaciones: [
          { itemId: 'item-1', criterioId: 'crit-1' },
          { itemId: 'item-2', criterioId: 'crit-1' },
        ],
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/evaluaciones-jurado/ej-1/evaluaciones-cualitativas', {
        evaluaciones: [
          { item: 'item-1', criterio: 'crit-1' },
          { item: 'item-2', criterio: 'crit-1' },
        ],
      });
      expect(resultado).toBeUndefined();
    });
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

  describe('removerItemCualitativoJurado', () => {
    it('llama DELETE con el itemId en la ruta y resuelve undefined', async () => {
      // Arrange
      del.mockResolvedValue({ status: 204, data: undefined });

      // Act
      const resultado = await evaluacionesService.removerItemCualitativoJurado('item-1');

      // Assert
      expect(del).toHaveBeenCalledWith('/evaluaciones/items-cualitativos-jurado/item-1');
      expect(resultado).toBeUndefined();
    });
  });

  describe('removerItemCuantitativoJurado', () => {
    it('llama DELETE con el itemId en la ruta y resuelve undefined', async () => {
      // Arrange
      del.mockResolvedValue({ status: 204, data: undefined });

      // Act
      const resultado = await evaluacionesService.removerItemCuantitativoJurado('item-1');

      // Assert
      expect(del).toHaveBeenCalledWith('/evaluaciones/items-cuantitativos-jurado/item-1');
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

  describe('getJuradosVigentes', () => {
    const FILTRO_ACTIVO = { tipo: 'PREDICADO', campo: 'estado', operador: 'ES', valor: 'ACTIVO' };

    it('sin texto envía página, tamaño 10, orden por nombre y solo el filtro ACTIVO, y devuelve { id, nombre, email }', async () => {
      // Arrange
      post.mockResolvedValue({
        status: 200,
        data: {
          content: [
            {
              id: 'j-1',
              identificador: '123',
              nombre: 'Ana',
              email: 'ana@uco.edu.co',
              contacto: '300',
              estado: 'ACTIVO',
            },
          ],
          totalElements: 21,
          totalPages: 3,
        },
      });

      // Act
      const resultado = await evaluacionesService.getJuradosVigentes({ pagina: 2, texto: '   ' });

      // Assert
      expect(post).toHaveBeenCalledWith('/usuarios/jurados/vigentes', {
        pagina: 2,
        tamanio: 10,
        ordenamiento: ['nombre:ASC'],
        filtros: FILTRO_ACTIVO,
      });
      expect(resultado.content).toEqual([{ id: 'j-1', nombre: 'Ana', email: 'ana@uco.edu.co' }]);
      expect(resultado.totalPages).toBe(3);
      expect(resultado.totalElements).toBe(21);
    });

    it('con texto combina ACTIVO y nombre CONTIENE el texto recortado en un grupo AND', async () => {
      // Arrange
      post.mockResolvedValue({ status: 200, data: { content: [] } });

      // Act
      await evaluacionesService.getJuradosVigentes({ pagina: 0, texto: ' ana ' });

      // Assert
      expect(post).toHaveBeenCalledWith(
        '/usuarios/jurados/vigentes',
        expect.objectContaining({
          filtros: {
            tipo: 'GRUPO',
            conector: 'AND',
            nodos: [
              FILTRO_ACTIVO,
              { tipo: 'PREDICADO', campo: 'nombre', operador: 'CONTIENE', valor: 'ana' },
            ],
          },
        }),
      );
    });
  });

  describe('asignarJuradosEvaluacion', () => {
    it('llama POST con el id en la ruta y traduce juradosIds a { jurados }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { evaluacionesJurado: ['a'] } });

      // Act
      const resultado = await evaluacionesService.asignarJuradosEvaluacion({
        evaluacionId: 'e-1',
        juradosIds: ['j-1', 'j-2'],
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/evaluaciones/e-1/jurados', { jurados: ['j-1', 'j-2'] });
      expect(resultado).toEqual({ evaluacionesJurado: ['a'] });
    });
  });

  describe('getEvaluacionesCualitativasRealizadasJurado', () => {
    it('llama GET a la ruta de cualitativas del jurado y resuelve la lista', async () => {
      // Arrange
      const lista = [{ id: 'ec-1' }];
      get.mockResolvedValue({ status: 200, data: lista });

      // Act
      const resultado =
        await evaluacionesService.getEvaluacionesCualitativasRealizadasJurado('ej-1');

      // Assert
      expect(get).toHaveBeenCalledWith(
        '/evaluaciones/evaluaciones-jurado/ej-1/cualitativas/jurado',
      );
      expect(resultado).toEqual(lista);
    });
  });
});
