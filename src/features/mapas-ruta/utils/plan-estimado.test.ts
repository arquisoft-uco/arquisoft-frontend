import { describe, it, expect } from 'vitest';
import { LIMITES } from '../../../shared/validation';
import {
  comoCampoPlanEstimado,
  formatearDias,
  planEstimadoSchema,
  plazoMapaRutaEnDias,
} from './plan-estimado';

describe('plazoMapaRutaEnDias', () => {
  it('calcula la diferencia civil sin sumar 1 y devuelve null con fechas inválidas', () => {
    // Act / Assert
    expect(plazoMapaRutaEnDias('2026-03-05', '2026-03-06')).toBe(1);
    expect(plazoMapaRutaEnDias('2026-03-05', '2026-08-01')).toBe(149);
    expect(plazoMapaRutaEnDias('2026-03-05', 'no-es-fecha')).toBeNull();
    expect(plazoMapaRutaEnDias('2026-02-30', '2026-03-06')).toBeNull();
  });
});

describe('planEstimadoSchema', () => {
  it('valida días y descripción opcional recortada', () => {
    // Arrange
    const larga = 'a'.repeat(LIMITES.PLAN_ESTIMADO_DESCRIPCION_MAX + 1);

    // Act / Assert
    expect(
      planEstimadoSchema.safeParse({ tiempoEstimadoDias: '', descripcionEstimado: '' }).success,
    ).toBe(false);
    expect(
      planEstimadoSchema.safeParse({ tiempoEstimadoDias: '0', descripcionEstimado: '' }).success,
    ).toBe(false);
    expect(
      planEstimadoSchema.safeParse({ tiempoEstimadoDias: '3', descripcionEstimado: larga }).success,
    ).toBe(false);
    expect(
      planEstimadoSchema.parse({ tiempoEstimadoDias: '3', descripcionEstimado: '  ok  ' }),
    ).toEqual({ tiempoEstimadoDias: '3', descripcionEstimado: 'ok' });
  });

  it('comoCampoPlanEstimado reconoce los campos del formulario y descarta tarea', () => {
    // Act / Assert
    expect(comoCampoPlanEstimado('tiempoEstimadoDias')).toBe('tiempoEstimadoDias');
    expect(comoCampoPlanEstimado('tarea')).toBeUndefined();
  });
});

describe('formatearDias', () => {
  it('usa singular con 1 y plural en otro caso', () => {
    // Act / Assert
    expect(formatearDias(1)).toBe('1 día');
    expect(formatearDias(5)).toBe('5 días');
  });
});
