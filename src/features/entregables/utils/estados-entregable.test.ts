import { describe, it, expect } from 'vitest';
import {
  MOTIVO_NO_CANCELABLE,
  MOTIVO_NO_CERRABLE,
  MOTIVO_NO_HABILITABLE,
  motivoDestinoNoDisponible,
  puedeCambiarEstado,
  puedeCancelar,
  puedeCerrar,
  puedeHabilitarEvaluacion,
} from './estados-entregable';

const ESTADOS = [
  'NUEVO',
  'DISPONIBLE_EVALUACION',
  'EN_EVALUACION',
  'APROBADO',
  'APROBADO_CON_OBSERVACIONES',
  'RECHAZADO',
  'CANCELADO',
  'CERRADO',
];

function permitidos(predicado: (id: string) => boolean) {
  return ESTADOS.filter(predicado);
}

describe('estados-entregable', () => {
  it('cada predicado admite solo los estados de origen de la tabla de transiciones', () => {
    // Assert
    expect(permitidos(puedeHabilitarEvaluacion)).toEqual(['NUEVO']);
    expect(permitidos(puedeCancelar)).toEqual(['NUEVO', 'RECHAZADO']);
    expect(permitidos(puedeCerrar)).toEqual([
      'APROBADO',
      'APROBADO_CON_OBSERVACIONES',
      'RECHAZADO',
    ]);
    expect(permitidos(puedeCambiarEstado)).toEqual([
      'NUEVO',
      'APROBADO',
      'APROBADO_CON_OBSERVACIONES',
      'RECHAZADO',
    ]);
  });

  it('motivoDestinoNoDisponible devuelve null si se permite y el motivo del destino si no', () => {
    // Assert
    expect(motivoDestinoNoDisponible('NUEVO', 'DISPONIBLE_EVALUACION')).toBeNull();
    expect(motivoDestinoNoDisponible('NUEVO', 'CANCELADO')).toBeNull();
    expect(motivoDestinoNoDisponible('RECHAZADO', 'CERRADO')).toBeNull();
    expect(motivoDestinoNoDisponible('NUEVO', 'CERRADO')).toBe(MOTIVO_NO_CERRABLE);
    expect(motivoDestinoNoDisponible('RECHAZADO', 'DISPONIBLE_EVALUACION')).toBe(
      MOTIVO_NO_HABILITABLE,
    );
    expect(motivoDestinoNoDisponible('DISPONIBLE_EVALUACION', 'CANCELADO')).toBe(
      MOTIVO_NO_CANCELABLE,
    );
  });
});
