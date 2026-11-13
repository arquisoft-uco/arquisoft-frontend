import { describe, it, expect } from 'vitest';
import { LIMITES, MENSAJES_VALIDACION } from '../../../shared/validation';
import { comoCampoPlanReal, planRealSchema } from './plan-real';

describe('planRealSchema', () => {
  it('exige días enteros de al menos 1 y recorta la descripción opcional', () => {
    // Arrange
    const max = LIMITES.PLAN_REAL_DESCRIPCION_MAX;
    const valida = { tiempoRealDias: '5', descripcionReal: '' };
    const mensajeDe = (valores: { tiempoRealDias: string; descripcionReal: string }) =>
      planRealSchema.safeParse(valores).error?.issues[0].message;

    // Act / Assert
    expect(mensajeDe({ ...valida, tiempoRealDias: '' })).toBe(MENSAJES_VALIDACION.requerido);
    expect(mensajeDe({ ...valida, tiempoRealDias: 'abc' })).toBe(MENSAJES_VALIDACION.soloDigitos);
    expect(mensajeDe({ ...valida, tiempoRealDias: '0' })).toBe(
      MENSAJES_VALIDACION.valorMinimo(LIMITES.PLAN_REAL_TIEMPO_DIAS_MIN),
    );
    expect(mensajeDe({ ...valida, descripcionReal: 'a'.repeat(max + 1) })).toBe(
      MENSAJES_VALIDACION.longitudMaxima(max),
    );
    expect(planRealSchema.safeParse({ ...valida, descripcionReal: 'a'.repeat(max) }).success).toBe(
      true,
    );
    expect(planRealSchema.parse({ ...valida, descripcionReal: '  ok  ' })).toEqual({
      tiempoRealDias: '5',
      descripcionReal: 'ok',
    });
  });

  it('comoCampoPlanReal reconoce los campos del formulario y descarta otros', () => {
    // Act / Assert
    expect(comoCampoPlanReal('tiempoRealDias')).toBe('tiempoRealDias');
    expect(comoCampoPlanReal('planReal')).toBeUndefined();
  });
});
