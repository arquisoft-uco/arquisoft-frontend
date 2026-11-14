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

  describe('consultarVistaPreviaPaquete', () => {
    it('hace GET a la vista previa del proyecto y devuelve el cuerpo', async () => {
      // Arrange
      const cuerpo = {
        cantidad: 1,
        artefactos: [{ artefacto: 'a-1', documento: 'Anteproyecto', numeroVersion: 2 }],
      };
      get.mockResolvedValue({ status: 200, data: cuerpo });

      // Act
      const resultado = await entregablesService.consultarVistaPreviaPaquete('p-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/entregables/proyectos-grado/p-1/vista-previa-paquete');
      expect(resultado).toEqual(cuerpo);
    });
  });

  describe('consultarProyectosConEntregableVigente', () => {
    it('excluye los CANCELADO sin proyectoFinalizado y recorre todas las páginas', async () => {
      // Arrange
      const fila = (id: string) => ({ proyectoGrado: { id, nombre: id } });
      vi.mocked(apiClient.post)
        .mockResolvedValueOnce({ status: 200, data: { content: [fila('p-1')], totalPages: 2 } })
        .mockResolvedValueOnce({ status: 200, data: { content: [fila('p-2')], totalPages: 2 } });

      // Act
      const ids = await entregablesService.consultarProyectosConEntregableVigente();

      // Assert
      const filtros = {
        tipo: 'PREDICADO',
        campo: 'estadoEntregable',
        operador: 'NO_ES',
        valor: 'CANCELADO',
      };
      expect(apiClient.post).toHaveBeenCalledTimes(2);
      expect(apiClient.post).toHaveBeenNthCalledWith(1, '/entregables-proyecto-grado/asesor', {
        pagina: 0,
        tamanio: 100,
        filtros,
      });
      expect(apiClient.post).toHaveBeenNthCalledWith(2, '/entregables-proyecto-grado/asesor', {
        pagina: 1,
        tamanio: 100,
        filtros,
      });
      expect(ids).toEqual(['p-1', 'p-2']);
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
