import { describe, it, expect } from 'vitest';
import { MENSAJES_VALIDACION } from '../../../shared/validation';
import { cambiarPuntajeEvaluacionCuantitativaJuradoSchema } from './cambiar-puntaje-evaluacion-cuantitativa-jurado-schema';

describe('cambiarPuntajeEvaluacionCuantitativaJuradoSchema', () => {
  it('exige un entero entre 0 y el valor del ítem, ambos extremos incluidos', () => {
    // Arrange
    const schema = cambiarPuntajeEvaluacionCuantitativaJuradoSchema(50);
    const mensaje = (puntaje: string) => schema.safeParse({ puntaje }).error?.issues[0].message;

    // Assert
    expect(mensaje('')).toBe(MENSAJES_VALIDACION.requerido);
    expect(mensaje('abc')).toBe(MENSAJES_VALIDACION.soloDigitos);
    expect(mensaje('4.5')).toBe(MENSAJES_VALIDACION.soloDigitos);
    expect(mensaje('-1')).toBe(MENSAJES_VALIDACION.soloDigitos);
    expect(mensaje('51')).toBe(MENSAJES_VALIDACION.valorEntre(0, 50));
    expect(schema.safeParse({ puntaje: '0' }).success).toBe(true);
    expect(schema.safeParse({ puntaje: '50' }).success).toBe(true);
  });
});
