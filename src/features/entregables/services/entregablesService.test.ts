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

  describe('consultarProyectosAsesor', () => {
    it('filtra en servidor los proyectos EN_PROCESO y ATRASADO', async () => {
      // Arrange
      vi.mocked(apiClient.post).mockResolvedValue({ status: 200, data: { content: [] } });

      // Act
      await entregablesService.consultarProyectosAsesor();

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/proyectos-grado/asesor', {
        pagina: 0,
        tamanio: 100,
        ordenamiento: ['tituloProyecto:ASC'],
        filtros: {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'estadoProyectoGrado',
          operador: 'IN',
          valores: ['EN_PROCESO', 'ATRASADO'],
        },
      });
    });
  });

  describe('obtenerEnlacePaquete', () => {
    it('hace GET /entregables/{id}/paquete y devuelve el enlace', async () => {
      // Arrange
      get.mockResolvedValue({ status: 200, data: { url: 'https://s3.test/p', expiraEn: 'x' } });

      // Act
      const enlace = await entregablesService.obtenerEnlacePaquete('e-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/entregables/e-1/paquete');
      expect(enlace.url).toBe('https://s3.test/p');
    });
  });
});
