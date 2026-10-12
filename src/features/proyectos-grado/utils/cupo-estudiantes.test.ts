import { describe, it, expect } from 'vitest';
import type { EstudianteVigente } from '../../../shared/models/EstudianteVigente';
import { LIMITES } from '../../../shared/validation';
import type { EstudianteProyectoGrado } from '../models/EstudianteProyectoGrado';
import { candidatosAsignables, cupoDisponible } from './cupo-estudiantes';

function vinculado(estudianteId: string, vigente = true): EstudianteProyectoGrado {
  return {
    id: `ep-${estudianteId}`,
    proyectoGradoId: 'p-1',
    estudianteId,
    identificador: '2001',
    nombre: 'X',
    email: 'x@uco.edu.co',
    vigente,
  };
}

describe('cupoDisponible', () => {
  it('descuenta a todos los vinculados, incluidos los dados de baja, y nunca baja de 0', () => {
    // Assert
    expect(cupoDisponible([])).toBe(LIMITES.ESTUDIANTES_MAX);
    expect(cupoDisponible([vinculado('e-1'), vinculado('e-2', false)])).toBe(
      LIMITES.ESTUDIANTES_MAX - 2,
    );
    expect(cupoDisponible([1, 2, 3, 4, 5].map((n) => vinculado(`e-${n}`)))).toBe(0);
  });
});

describe('candidatosAsignables', () => {
  it('excluye a los ya vinculados por estudianteId y mapea etiqueta y descripción', () => {
    // Arrange
    const vigentes: EstudianteVigente[] = [
      { id: 'e-1', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' },
      { id: 'e-2', nombre: 'Marta Ruiz', email: 'marta@uco.edu.co' },
    ];

    // Act
    const opciones = candidatosAsignables(vigentes, [vinculado('e-1', false)]);

    // Assert
    expect(opciones).toEqual([
      { id: 'e-2', etiqueta: 'Marta Ruiz', descripcion: 'marta@uco.edu.co' },
    ]);
  });
});
