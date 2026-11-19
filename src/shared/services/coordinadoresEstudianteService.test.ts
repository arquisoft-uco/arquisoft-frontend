import { describe, it, expect, vi } from 'vitest';
import apiClient from '../../api/axiosInstance';
import type { CoordinadorProyecto } from '../models/CoordinadorProyecto';
import { coordinadoresEstudianteService } from './coordinadoresEstudianteService';

vi.mock('../../api/axiosInstance', () => ({
  default: { get: vi.fn() },
}));

const get = vi.mocked(apiClient.get);

const coordinadores: CoordinadorProyecto[] = [
  {
    proyectoGradoId: 'pg-1',
    tituloProyecto: 'Sistema de riego',
    coordinadorId: 'co-1',
    identificador: '1234567890',
    nombre: 'Ana Pérez',
    email: 'ana@uco.edu.co',
  },
];

describe('coordinadoresEstudianteService', () => {
  it('consulta la ruta sin parámetros y devuelve la lista tal cual', async () => {
    // Arrange
    get.mockResolvedValue({ status: 200, data: coordinadores });

    // Act
    const resultado = await coordinadoresEstudianteService.consultarCoordinadores();

    // Assert
    expect(get).toHaveBeenCalledWith('/proyectos-grado/estudiante/coordinadores');
    expect(resultado).toEqual(coordinadores);
  });

  it('propaga el error del cliente HTTP', async () => {
    // Arrange
    get.mockRejectedValue(new Error('falló'));

    // Act
    const accion = coordinadoresEstudianteService.consultarCoordinadores();

    // Assert
    await expect(accion).rejects.toThrow('falló');
  });
});
