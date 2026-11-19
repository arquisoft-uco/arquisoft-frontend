import { describe, it, expect } from 'vitest';
import { esEntregableDefinitivo, mensajeUltimoEntregable } from './ultimo-entregable';

describe('ultimo-entregable', () => {
  it('esEntregableDefinitivo es verdadero solo para CERRADO', () => {
    // Assert
    expect(esEntregableDefinitivo('CERRADO')).toBe(true);
    expect(esEntregableDefinitivo('RECHAZADO')).toBe(false);
    expect(esEntregableDefinitivo('CANCELADO')).toBe(false);
    expect(esEntregableDefinitivo('APROBADO')).toBe(false);
    expect(esEntregableDefinitivo(undefined)).toBe(false);
  });

  it('mensajeUltimoEntregable avisa que no hay entregables o nombra la versión y el estado', () => {
    // Assert
    expect(mensajeUltimoEntregable(null)).toMatch(/Aún no hay entregables/);
    expect(
      mensajeUltimoEntregable({
        versionEntregable: 2,
        estadoEntregable: { id: 'EN_EVALUACION', nombre: 'En evaluación' },
      }),
    ).toMatch(/versión 2.*«En evaluación»/);
    expect(mensajeUltimoEntregable(null)).toMatch(/debe estar cerrado./);
  });
});
