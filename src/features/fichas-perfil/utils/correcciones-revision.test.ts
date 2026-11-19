import { describe, it, expect } from 'vitest';
import type { ObservacionItem } from '../models/ObservacionItem';
import {
  motivoCorreccionesNoDisponibles,
  resumirObservacionesPorRevision,
} from './correcciones-revision';

function observacion(revisionItemId: string, estadoId: string): ObservacionItem {
  return {
    id: `${revisionItemId}-${estadoId}`,
    revisionItemId,
    observacion: 'x',
    estadoId,
    estadoNombre: estadoId,
  };
}

describe('resumirObservacionesPorRevision', () => {
  it('cuenta total y pendientes por revisión y devuelve ceros para la que no trae observaciones', () => {
    // Arrange
    const observaciones = [
      observacion('r-1', 'PENDIENTE'),
      observacion('r-1', 'CERRADO'),
      observacion('r-1', 'EN_PROGRESO'),
    ];

    // Act
    const resumen = resumirObservacionesPorRevision(['r-1', 'r-2'], observaciones);

    // Assert
    expect(resumen.get('r-1')).toEqual({ total: 3, pendientes: 1 });
    expect(resumen.get('r-2')).toEqual({ total: 0, pendientes: 0 });
  });
});

describe('motivoCorreccionesNoDisponibles', () => {
  it('devuelve el motivo que corresponde a cada situación y null cuando se puede enviar', () => {
    // Act
    const visualizada = motivoCorreccionesNoDisponibles('VISUALIZADA', { total: 2, pendientes: 0 });
    const sinObservaciones = motivoCorreccionesNoDisponibles('EN_PROGRESO', {
      total: 0,
      pendientes: 0,
    });
    const unaPendiente = motivoCorreccionesNoDisponibles('EN_PROGRESO', {
      total: 2,
      pendientes: 1,
    });
    const variasPendientes = motivoCorreccionesNoDisponibles('EN_PROGRESO', {
      total: 3,
      pendientes: 2,
    });
    const todoEnRegla = motivoCorreccionesNoDisponibles('EN_PROGRESO', { total: 2, pendientes: 0 });
    const noVerificable = motivoCorreccionesNoDisponibles('EN_PROGRESO', undefined);

    // Assert
    expect(visualizada).toBe(
      'Edita el ítem para atender las observaciones y luego envía las correcciones.',
    );
    expect(sinObservaciones).toBe('Tu asesor aún no dejó observaciones en esta revisión.');
    expect(unaPendiente).toBe('Tienes 1 observación pendiente: edita el ítem para atenderlas.');
    expect(variasPendientes).toBe(
      'Tienes 2 observaciones pendientes: edita el ítem para atenderlas.',
    );
    expect(todoEnRegla).toBeNull();
    expect(noVerificable).toBeNull();
  });
});
