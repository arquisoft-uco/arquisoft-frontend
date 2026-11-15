import { describe, it, expect } from 'vitest';
import { LIMITES, MENSAJES_VALIDACION } from '../../../shared/validation';
import { crearCambiarPuntajeEvaluacionCuantitativaAsesorSchema } from './cambiar-puntaje-evaluacion-cuantitativa-asesor-schema';

const parse = (valorMaximo: number, puntaje: string) =>
  crearCambiarPuntajeEvaluacionCuantitativaAsesorSchema(valorMaximo).safeParse({ puntaje });
const mensajes = (r: ReturnType<typeof parse>) =>
  r.success ? [] : r.error.issues.map((i) => i.message);

describe('crearCambiarPuntajeEvaluacionCuantitativaAsesorSchema', () => {
  it('acepta los bordes 0 y el valor del ítem y rechaza vacío, decimal, negativo y por encima del tope', () => {
    // Act
    const minimo = parse(100, String(LIMITES.ITEM_CUANTITATIVO_VALOR_MIN));
    const maximo = parse(100, '100');
    const vacio = parse(100, '');
    const decimal = parse(100, '2.5');
    const negativo = parse(100, '-1');
    const excedeItem = parse(100, '101');
    const excedeLimite = parse(LIMITES.ITEM_CUANTITATIVO_VALOR_MAX + 50, '501');

    // Assert
    expect(minimo.success).toBe(true);
    expect(maximo.success).toBe(true);
    expect(mensajes(vacio)).toEqual([MENSAJES_VALIDACION.requerido]);
    expect(mensajes(decimal)).toEqual([MENSAJES_VALIDACION.soloDigitos]);
    expect(mensajes(negativo)).toEqual([MENSAJES_VALIDACION.soloDigitos]);
    expect(mensajes(excedeItem)).toEqual([MENSAJES_VALIDACION.valorEntre(0, 100)]);
    expect(mensajes(excedeLimite)).toEqual([
      MENSAJES_VALIDACION.valorEntre(0, LIMITES.ITEM_CUANTITATIVO_VALOR_MAX),
    ]);
  });
});
