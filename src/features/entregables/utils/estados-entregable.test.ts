import { describe, it, expect } from 'vitest';
import { puedeCambiarEstado, puedeCerrar } from './estados-entregable';

describe('estados-entregable', () => {
  it('solo los estados terminales impiden cambiar y solo los aprobados permiten cerrar', () => {
    // Assert
    expect(puedeCambiarEstado('CANCELADO')).toBe(false);
    expect(puedeCambiarEstado('CERRADO')).toBe(false);
    [
      'DISPONIBLE_EVALUACION',
      'EN_EVALUACION',
      'APROBADO_CON_OBSERVACIONES',
      'APROBADO',
      'RECHAZADO',
    ].forEach((id) => expect(puedeCambiarEstado(id)).toBe(true));
    expect(puedeCerrar('APROBADO')).toBe(true);
    expect(puedeCerrar('APROBADO_CON_OBSERVACIONES')).toBe(true);
    expect(puedeCerrar('EN_EVALUACION')).toBe(false);
    expect(puedeCerrar('RECHAZADO')).toBe(false);
  });
});
