import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../api/axiosInstance';
import type { Page } from '../models/api-response';
import { asesoresFichaService } from './asesoresFichaService';

vi.mock('../../api/axiosInstance', () => ({
  default: { post: vi.fn() },
}));

const post = vi.mocked(apiClient.post);

interface AsesorFichaVigenteResponseDTO {
  id: string;
  identificador: string;
  nombre: string;
  email: string;
  contacto: string;
  estado: string;
}

function crearPagina(
  content: AsesorFichaVigenteResponseDTO[],
): Page<AsesorFichaVigenteResponseDTO> {
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

describe('asesoresFichaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('consultarVigentes', () => {
    it('envía el criterio de consulta exacto y traduce la página a Asesor[] descartando identificador/contacto/estado', async () => {
      // Arrange
      post.mockResolvedValue({
        status: 200,
        data: crearPagina([
          {
            id: 'a-1',
            identificador: '1234567890',
            nombre: 'Ana Pérez',
            email: 'ana@uco.edu.co',
            contacto: '3001234567',
            estado: 'ACTIVO',
          },
        ]),
      });

      // Act
      const resultado = await asesoresFichaService.consultarVigentes();

      // Assert
      expect(post).toHaveBeenCalledWith('/usuarios/asesores-ficha/vigentes', {
        pagina: 0,
        tamanio: 100,
        ordenamiento: ['nombre:ASC'],
        filtros: { tipo: 'PREDICADO', campo: 'estado', operador: 'ES', valor: 'ACTIVO' },
      });
      expect(resultado).toEqual([{ id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' }]);
    });

    it('traduce una página vacía a un arreglo vacío', async () => {
      // Arrange
      post.mockResolvedValue({ status: 200, data: crearPagina([]) });

      // Act
      const resultado = await asesoresFichaService.consultarVigentes();

      // Assert
      expect(resultado).toEqual([]);
    });
  });
});
