import { describe, it, expect } from 'vitest';
import type { AsesorProyectoGrado } from '../models/AsesorProyectoGrado';
import { hayAsesorAsignado, opcionesAsesor } from './cupo-asesor';

function asesor(estadoId: string, actual = estadoId === 'ASIGNADO'): AsesorProyectoGrado {
  return {
    id: `ap-${estadoId}`,
    proyectoGradoId: 'p-1',
    asesorId: 'a-1',
    identificador: '1001',
    nombre: 'Ana Pérez',
    email: 'ana@uco.edu.co',
    estado: { id: estadoId, nombre: estadoId },
    fechaAsignado: '2026-10-01T00:00:00Z',
    vigente: estadoId === 'ASIGNADO',
    actual,
  };
}

describe('hayAsesorAsignado', () => {
  it('cuenta solo el ASIGNADO vigente; el histórico, FINALIZADO y la lista vacía no', () => {
    // Arrange
    const capturaDelDetalle = [
      asesor('FINALIZADO', true),
      asesor('ASIGNADO', false),
      asesor('FINALIZADO', false),
    ];

    // Assert
    expect(hayAsesorAsignado([asesor('ASIGNADO', true)])).toBe(true);
    expect(hayAsesorAsignado([asesor('ASIGNADO', false)])).toBe(false);
    expect(hayAsesorAsignado(capturaDelDetalle)).toBe(false);
    expect(hayAsesorAsignado([asesor('FINALIZADO')])).toBe(false);
    expect(hayAsesorAsignado([])).toBe(false);
  });
});

describe('opcionesAsesor', () => {
  it('mapea nombre a etiqueta y email a descripción sin excluir a nadie', () => {
    // Act
    const opciones = opcionesAsesor([
      { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
      { id: 'a-2', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' },
    ]);

    // Assert
    expect(opciones).toEqual([
      { id: 'a-1', etiqueta: 'Ana Pérez', descripcion: 'ana@uco.edu.co' },
      { id: 'a-2', etiqueta: 'Luis Gómez', descripcion: 'luis@uco.edu.co' },
    ]);
  });
});
