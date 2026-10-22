import { describe, it, expect, vi } from 'vitest';
import apiClient from '../../api/axiosInstance';
import type { Page } from '../models/api-response';
import { asesoresVigentesService } from './asesoresVigentesService';

vi.mock('../../api/axiosInstance', () => ({
  default: { post: vi.fn() },
}));

const post = vi.mocked(apiClient.post);

describe('asesoresVigentesService', () => {
  describe('consultarVigentes', () => {
    it('envía el criterio de consulta exacto y traduce la página a Asesor[] descartando identificador/contacto/estado', async () => {
      // Arrange
      const pagina: Page<unknown> = {
        content: [
          {
            id: 'a-1',
            identificador: '1234567890',
            nombre: 'Ana Pérez',
            email: 'ana@uco.edu.co',
            contacto: '3001234567',
            estado: 'ACTIVO',
          },
        ],
        page: 0,
        size: 100,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
        empty: false,
      };
      post.mockResolvedValue({ status: 200, data: pagina });

      // Act
      const resultado = await asesoresVigentesService.consultarVigentes();

      // Assert
      expect(post).toHaveBeenCalledWith('/usuarios/asesores/vigentes', {
        pagina: 0,
        tamanio: 100,
        ordenamiento: ['nombre:ASC'],
        filtros: { tipo: 'PREDICADO', campo: 'estado', operador: 'ES', valor: 'ACTIVO' },
      });
      expect(resultado).toEqual([{ id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' }]);
    });
  });
});
