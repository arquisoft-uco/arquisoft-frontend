import { describe, it, expect } from 'vitest';
import { MENSAJES_VALIDACION } from '../../../shared/validation';
import { validarDiasSinAvance } from './dias-sin-avance';

describe('validarDiasSinAvance', () => {
  it('acepta enteros de 1 a 365 y rechaza lo demás con el mensaje compartido', () => {
    // Assert
    expect(validarDiasSinAvance('1')).toEqual({ dias: 1 });
    expect(validarDiasSinAvance(' 365 ')).toEqual({ dias: 365 });
    expect(validarDiasSinAvance('')).toEqual({ dias: null, error: MENSAJES_VALIDACION.requerido });
    expect(validarDiasSinAvance('abc').error).toBe(MENSAJES_VALIDACION.soloDigitos);
    expect(validarDiasSinAvance('1.5').error).toBe(MENSAJES_VALIDACION.soloDigitos);
    expect(validarDiasSinAvance('0')).toEqual({
      dias: null,
      error: MENSAJES_VALIDACION.valorEntre(1, 365),
    });
    expect(validarDiasSinAvance('366').error).toBe(MENSAJES_VALIDACION.valorEntre(1, 365));
  });
});
