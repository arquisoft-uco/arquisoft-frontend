import { describe, it, expect } from 'vitest';
import type { AsesorProyectoGrado } from '../models/AsesorProyectoGrado';
import { hayAsesorAsignado, opcionesAsesor } from './cupo-asesor';

function asesor(estadoId: string): AsesorProyectoGrado {
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
    actual: estadoId === 'ASIGNADO',
  };
}

describe('hayAsesorAsignado', () => {
  it('es true solo con una fila ASIGNADO; FINALIZADO o lista vacía no cuentan', () => {
    // Assert
    expect(hayAsesorAsignado([asesor('FINALIZADO'), asesor('ASIGNADO')])).toBe(true);
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
