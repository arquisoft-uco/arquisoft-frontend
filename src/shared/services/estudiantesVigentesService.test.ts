import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../api/axiosInstance';
import type { Page } from '../models/api-response';
import { estudiantesVigentesService } from './estudiantesVigentesService';

vi.mock('../../api/axiosInstance', () => ({
  default: { post: vi.fn() },
}));

const post = vi.mocked(apiClient.post);

interface EstudianteVigenteResponseDTO {
  id: string;
  identificador: string;
  nombre: string;
  email: string;
  contacto: string;
  estado: string;
}

function crearPagina(
  content: EstudianteVigenteResponseDTO[],
): Page<EstudianteVigenteResponseDTO> {
  return {
    content,
    page: 0,
    size: 100,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

describe('estudiantesVigentesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('consultarVigentes', () => {
    it('envía el criterio de consulta exacto y traduce la página a EstudianteVigente[] descartando identificador/contacto/estado', async () => {
      // Arrange
      post.mockResolvedValue({
        status: 200,
        data: crearPagina([
          {
            id: 'e-1',
            identificador: '1234567890',
            nombre: 'Carlos Ruiz',
            email: 'carlos@uco.edu.co',
            contacto: '3001234567',
            estado: 'ACTIVO',
          },
        ]),
      });

      // Act
      const resultado = await estudiantesVigentesService.consultarVigentes();

      // Assert
      expect(post).toHaveBeenCalledWith('/usuarios/estudiantes/vigentes', {
        pagina: 0,
        tamanio: 100,
        ordenamiento: ['nombre:ASC'],
        filtros: { tipo: 'PREDICADO', campo: 'estado', operador: 'ES', valor: 'ACTIVO' },
      });
      expect(resultado).toEqual([{ id: 'e-1', nombre: 'Carlos Ruiz', email: 'carlos@uco.edu.co' }]);
    });

    it('traduce una página vacía a un arreglo vacío', async () => {
      // Arrange
      post.mockResolvedValue({ status: 200, data: crearPagina([]) });

      // Act
      const resultado = await estudiantesVigentesService.consultarVigentes();

      // Assert
      expect(resultado).toEqual([]);
    });
  });
});
