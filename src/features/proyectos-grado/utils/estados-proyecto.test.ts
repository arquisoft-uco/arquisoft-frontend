import { describe, it, expect } from 'vitest';
import { esSoloLectura, puedeCancelarProyecto, puedeFinalizarProyecto } from './estados-proyecto';

describe('estados-proyecto', () => {
  it('puedeCancelarProyecto acepta EN_PROCESO, ATRASADO y el estado desconocido, y rechaza los cerrados', () => {
    // Assert
    expect(puedeCancelarProyecto('EN_PROCESO')).toBe(true);
    expect(puedeCancelarProyecto('ATRASADO')).toBe(true);
    expect(puedeCancelarProyecto(undefined)).toBe(true);
    expect(puedeCancelarProyecto('FINALIZADO')).toBe(false);
    expect(puedeCancelarProyecto('CANCELADO')).toBe(false);
  });

  it('esSoloLectura es verdadero solo para FINALIZADO y CANCELADO', () => {
    // Assert
    expect(esSoloLectura('FINALIZADO')).toBe(true);
    expect(esSoloLectura('CANCELADO')).toBe(true);
    expect(esSoloLectura('EN_PROCESO')).toBe(false);
    expect(esSoloLectura('ATRASADO')).toBe(false);
    expect(esSoloLectura(undefined)).toBe(false);
  });

  it('puedeFinalizarProyecto es verdadero solo para EN_PROCESO', () => {
    // Assert
    expect(puedeFinalizarProyecto('EN_PROCESO')).toBe(true);
    expect(puedeFinalizarProyecto('ATRASADO')).toBe(false);
    expect(puedeFinalizarProyecto('FINALIZADO')).toBe(false);
    expect(puedeFinalizarProyecto('CANCELADO')).toBe(false);
    expect(puedeFinalizarProyecto(undefined)).toBe(false);
  });
});
