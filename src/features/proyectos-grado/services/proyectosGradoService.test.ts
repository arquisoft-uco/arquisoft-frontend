import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import type { AsesorProyectoGradoResponse } from '../models/AsesorProyectoGradoResponse';
import { proyectosGradoService } from './proyectosGradoService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);
const patch = vi.mocked(apiClient.patch);
const eliminar = vi.mocked(apiClient.delete);

function crearRespuesta(
  sobrescribe: Partial<AsesorProyectoGradoResponse>,
): AsesorProyectoGradoResponse {
  return {
    id: 'ap-1',
    proyectoGradoId: 'p-1',
    asesorId: 'a-1',
    identificador: '1001',
    nombre: 'Ana Pérez',
    email: 'ana@uco.edu.co',
    estadoAsesor: 'ASIGNADO',
    estadoAsesorNombre: 'Asignado',
    fechaAsignado: '2026-03-10T12:00:00Z',
    vigente: true,
    actual: true,
    ...sobrescribe,
  };
}

describe('proyectosGradoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAsesoresAsignadosProyecto', () => {
    it('consulta GET /proyectos-grado/{id}/asesores-asignados y traduce el estado a { id, nombre }', async () => {
      // Arrange
      get.mockResolvedValue({ status: 200, data: [crearRespuesta({ id: 'ap-2' })] });

      // Act
      const asesores = await proyectosGradoService.getAsesoresAsignadosProyecto('p-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/proyectos-grado/p-1/asesores-asignados');
      expect(asesores[0].estado).toEqual({ id: 'ASIGNADO', nombre: 'Asignado' });
    });
  });

  describe('getAsesoresProyecto', () => {
    it('consulta GET /proyectos-grado/{id}/asesores y traduce el estado plano a { id, nombre } conservando el orden', async () => {
      // Arrange
      get.mockResolvedValue({
        status: 200,
        data: [
          crearRespuesta({ id: 'ap-2' }),
          crearRespuesta({
            id: 'ap-1',
            estadoAsesor: 'FINALIZADO',
            estadoAsesorNombre: 'Finalizado',
            vigente: false,
            actual: false,
          }),
        ],
      });

      // Act
      const asesores = await proyectosGradoService.getAsesoresProyecto('p-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/proyectos-grado/p-1/asesores');
      expect(asesores.map((a) => a.id)).toEqual(['ap-2', 'ap-1']);
      expect(asesores[0]).toEqual({
        id: 'ap-2',
        proyectoGradoId: 'p-1',
        asesorId: 'a-1',
        identificador: '1001',
        nombre: 'Ana Pérez',
        email: 'ana@uco.edu.co',
        estado: { id: 'ASIGNADO', nombre: 'Asignado' },
        fechaAsignado: '2026-03-10T12:00:00Z',
        vigente: true,
        actual: true,
      });
      expect(asesores[1].estado).toEqual({ id: 'FINALIZADO', nombre: 'Finalizado' });
      expect(asesores[1].vigente).toBe(false);
      expect(asesores[1].actual).toBe(false);
    });
  });

  describe('getEstadosProyecto', () => {
    it('consulta GET /proyectos-grado/{id}/estados y traduce el estado plano a { id, nombre }', async () => {
      // Arrange
      get.mockResolvedValue({
        status: 200,
        data: [
          {
            id: 'h-1',
            estadoProyecto: 'EN_REVISION',
            estadoProyectoNombre: 'En revisión',
            fechaActualizacion: '2026-09-02T10:00:00Z',
          },
        ],
      });

      // Act
      const historial = await proyectosGradoService.getEstadosProyecto('p-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/proyectos-grado/p-1/estados');
      expect(historial).toEqual([
        {
          id: 'h-1',
          estado: { id: 'EN_REVISION', nombre: 'En revisión' },
          fechaActualizacion: '2026-09-02T10:00:00Z',
        },
      ]);
    });
  });

  describe('asignarAsesor', () => {
    it('hace POST /proyectos-grado/{id}/asesores traduciendo asesorId a { asesor } y resuelve undefined', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 'ap-1' } });

      // Act
      const resultado = await proyectosGradoService.asignarAsesor({
        proyectoGradoId: 'p-1',
        asesorId: 'a-1',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/proyectos-grado/p-1/asesores', { asesor: 'a-1' });
      expect(resultado).toBeUndefined();
    });
  });

  describe('cambiarEstadoAsesor', () => {
    it('hace PATCH por asesorId traduciendo estadoAsesorId a { estadoAsesor } y resuelve undefined', async () => {
      // Arrange
      patch.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await proyectosGradoService.cambiarEstadoAsesor({
        proyectoGradoId: 'p-1',
        asesorId: 'a-1',
        estadoAsesorId: 'FINALIZADO',
      });

      // Assert
      expect(patch).toHaveBeenCalledWith('/proyectos-grado/p-1/asesores/a-1/estado', {
        estadoAsesor: 'FINALIZADO',
      });
      expect(resultado).toBeUndefined();
    });
  });

  describe('asignarEstudiantes', () => {
    it('hace POST /proyectos-grado/{id}/estudiantes traduciendo estudiantesIds a { estudiantes } y resuelve undefined', async () => {
      // Arrange
      post.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await proyectosGradoService.asignarEstudiantes({
        proyectoGradoId: 'p-1',
        estudiantesIds: ['e-1', 'e-2'],
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/proyectos-grado/p-1/estudiantes', {
        estudiantes: ['e-1', 'e-2'],
      });
      expect(resultado).toBeUndefined();
    });
  });

  describe('destituirEstudiante', () => {
    it('hace DELETE /proyectos-grado/{p}/estudiantes/{estudianteId} y resuelve undefined', async () => {
      // Arrange
      eliminar.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await proyectosGradoService.destituirEstudiante({
        proyectoGradoId: 'p-1',
        estudianteId: 'e-1',
      });

      // Assert
      expect(eliminar).toHaveBeenCalledWith('/proyectos-grado/p-1/estudiantes/e-1');
      expect(resultado).toBeUndefined();
    });
  });
});
