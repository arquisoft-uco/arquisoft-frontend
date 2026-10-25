import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { mapasRutaService } from './mapasRutaService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { post: vi.fn() },
}));

const post = vi.mocked(apiClient.post);

describe('mapasRutaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('agregarMapaRuta', () => {
    it('traduce proyectoGradoId a proyectoGrado en POST /mapas-ruta y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 'm-1' } });

      // Act
      const resultado = await mapasRutaService.agregarMapaRuta({
        proyectoGradoId: 'p-1',
        fechaInicio: '2026-10-22',
        fechaFin: '2026-12-01',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/mapas-ruta', {
        proyectoGrado: 'p-1',
        fechaInicio: '2026-10-22',
        fechaFin: '2026-12-01',
      });
      expect(resultado).toEqual({ id: 'm-1' });
    });
  });

  describe('consultarProyectosElegibles', () => {
    it('filtra EN_PROCESO, ordena por título, pide 20 por página y traduce la respuesta', async () => {
      // Arrange
      post.mockResolvedValue({
        data: {
          content: [{ id: 'p-1', tituloProyecto: 'Sistema A', otro: 'x' }],
          page: 2,
          last: false,
        },
      });

      // Act
      const resultado = await mapasRutaService.consultarProyectosElegibles(2);

      // Assert
      expect(post).toHaveBeenCalledWith('/proyectos-grado/coordinador', {
        pagina: 2,
        tamanio: 20,
        ordenamiento: ['tituloProyecto:ASC'],
        filtros: {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'estadoProyectoGrado',
          operador: 'IN',
          valores: ['EN_PROCESO'],
        },
      });
      expect(resultado).toEqual({
        proyectos: [{ id: 'p-1', titulo: 'Sistema A' }],
        siguientePagina: 3,
      });
    });

    it('devuelve siguientePagina null en la última página', async () => {
      // Arrange
      post.mockResolvedValue({ data: { content: [], page: 4, last: true } });

      // Act
      const resultado = await mapasRutaService.consultarProyectosElegibles(4);

      // Assert
      expect(resultado.siguientePagina).toBeNull();
    });
  });
});
