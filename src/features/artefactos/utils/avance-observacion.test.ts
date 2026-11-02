import { describe, it, expect } from 'vitest';
import type { ObservacionRevision } from '../models/ObservacionRevision';
import {
  contarObservacionesAbiertas,
  estadoDestinoAvance,
  puedeAvanzarObservacion,
} from './avance-observacion';

const ESTADOS = ['NUEVA', 'EN_PROGRESO', 'SOLUCIONADA', 'CERRADA', 'REABIERTA'];

function observacion(estadoId: string): ObservacionRevision {
  return {
    id: estadoId,
    revisionAsesorId: 'r-1',
    descripcion: 'd',
    estadoId,
    estadoNombre: estadoId,
  };
}

describe('avance-observacion', () => {
  it('solo NUEVA, EN_PROGRESO y SOLUCIONADA se pueden avanzar', () => {
    // Assert
    expect(ESTADOS.filter(puedeAvanzarObservacion)).toEqual([
      'NUEVA',
      'EN_PROGRESO',
      'SOLUCIONADA',
    ]);
  });

  it('el destino es SOLUCIONADA salvo desde SOLUCIONADA, y nunca otro estado', () => {
    // Assert
    expect(estadoDestinoAvance('NUEVA')).toBe('SOLUCIONADA');
    expect(estadoDestinoAvance('EN_PROGRESO')).toBe('SOLUCIONADA');
    expect(estadoDestinoAvance('SOLUCIONADA')).toBe('EN_PROGRESO');
    for (const estado of ESTADOS) {
      expect(['EN_PROGRESO', 'SOLUCIONADA']).toContain(estadoDestinoAvance(estado));
    }
  });

  it('cuenta como abiertas NUEVA, EN_PROGRESO y REABIERTA', () => {
    // Assert
    expect(contarObservacionesAbiertas([])).toBe(0);
    expect(contarObservacionesAbiertas(['SOLUCIONADA', 'CERRADA'].map(observacion))).toBe(0);
    expect(contarObservacionesAbiertas(ESTADOS.map(observacion))).toBe(3);
  });
});
