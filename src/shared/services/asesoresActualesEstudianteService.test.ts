import { describe, it, expect, vi } from 'vitest';
import apiClient from '../../api/axiosInstance';
import type { AsesorActualProyecto } from '../models/AsesorActualProyecto';
import { asesoresActualesEstudianteService } from './asesoresActualesEstudianteService';

vi.mock('../../api/axiosInstance', () => ({
  default: { get: vi.fn() },
}));

const get = vi.mocked(apiClient.get);

const asesores: AsesorActualProyecto[] = [
  {
    proyectoGradoId: 'pg-1',
    tituloProyecto: 'Sistema de riego',
    asesorId: 'as-1',
    identificador: '1234567890',
    nombre: 'Ana Pérez',
    email: 'ana@uco.edu.co',
  },
];

describe('asesoresActualesEstudianteService', () => {
  it('consulta la ruta sin parámetros y devuelve la lista tal cual', async () => {
    // Arrange
    get.mockResolvedValue({ status: 200, data: asesores });

    // Act
    const resultado = await asesoresActualesEstudianteService.consultarAsesoresActuales();

    // Assert
    expect(get).toHaveBeenCalledWith('/proyectos-grado/estudiante/asesores-actuales');
    expect(resultado).toEqual(asesores);
  });

  it('propaga el error del cliente HTTP', async () => {
    get.mockRejectedValue(new Error('falló'));

    await expect(asesoresActualesEstudianteService.consultarAsesoresActuales()).rejects.toThrow(
      'falló',
    );
  });
});
