import { describe, it, expect } from 'vitest';
import type { AsesorProyecto } from '../models/AsesorProyecto';
import { ESTADO_ASESOR_ASIGNADO, opcionesAsesorTarea } from './asesores-tarea';

const ACTUAL = { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' };

function asesor(parcial: Partial<AsesorProyecto>): AsesorProyecto {
  return {
    id: 'a-2',
    nombre: 'Luis Mora',
    email: 'luis@uco.edu.co',
    estadoId: ESTADO_ASESOR_ASIGNADO,
    actual: true,
    ...parcial,
  };
}

describe('opcionesAsesorTarea', () => {
  it('ofrece solo los asignados actuales y añade el asesor de la tarea si falta', () => {
    // Arrange
    const asesores = [
      asesor({ id: 'a-2' }),
      asesor({ id: 'a-3', estadoId: 'FINALIZADO' }),
      asesor({ id: 'a-4', actual: false }),
    ];

    // Act
    const opciones = opcionesAsesorTarea(asesores, ACTUAL);

    // Assert
    expect(opciones.map((o) => o.id)).toEqual(['a-2', 'a-1']);
    expect(opciones[1]).toEqual({ ...ACTUAL, estadoId: ESTADO_ASESOR_ASIGNADO, actual: true });
  });

  it('no duplica el asesor de la tarea si ya está entre los asignados', () => {
    // Arrange
    const asesores = [asesor({ id: 'a-1' }), asesor({ id: 'a-2' })];

    // Act
    const opciones = opcionesAsesorTarea(asesores, ACTUAL);

    // Assert
    expect(opciones.map((o) => o.id)).toEqual(['a-1', 'a-2']);
  });

  it('sin asesor actual devuelve solo los asignados vigentes', () => {
    // Arrange
    const asesores = [
      asesor({ id: 'a-2' }),
      asesor({ id: 'a-3', estadoId: 'FINALIZADO' }),
      asesor({ id: 'a-4', actual: false }),
    ];

    // Act
    const opciones = opcionesAsesorTarea(asesores);

    // Assert
    expect(opciones.map((o) => o.id)).toEqual(['a-2']);
  });
});
