import { describe, it, expect } from 'vitest';
import { MENSAJES_VALIDACION } from '../../../shared/validation';
import { registrarEvaluacionesCualitativasJuradoSchema } from './registrar-evaluaciones-cualitativas-jurado-schema';

const ITEM_1 = '11111111-1111-4111-8111-111111111111';
const ITEM_2 = '22222222-2222-4222-8222-222222222222';
const CRITERIO = '33333333-3333-4333-8333-333333333333';

const mensajes = (r: ReturnType<typeof registrarEvaluacionesCualitativasJuradoSchema.safeParse>) =>
  r.success ? [] : r.error.issues.map((i) => i.message);

describe('registrarEvaluacionesCualitativasJuradoSchema', () => {
  it('acepta ítems distintos con el mismo criterio y rechaza ítem repetido, lista vacía y UUID inválido', () => {
    // Act
    const valido = registrarEvaluacionesCualitativasJuradoSchema.safeParse({
      evaluaciones: [
        { itemId: ITEM_1, criterioId: CRITERIO },
        { itemId: ITEM_2, criterioId: CRITERIO },
      ],
    });
    const repetido = registrarEvaluacionesCualitativasJuradoSchema.safeParse({
      evaluaciones: [
        { itemId: ITEM_1, criterioId: CRITERIO },
        { itemId: ITEM_1, criterioId: ITEM_2 },
      ],
    });
    const vacio = registrarEvaluacionesCualitativasJuradoSchema.safeParse({ evaluaciones: [] });
    const invalido = registrarEvaluacionesCualitativasJuradoSchema.safeParse({
      evaluaciones: [{ itemId: 'no-es-uuid', criterioId: CRITERIO }],
    });

    // Assert
    expect(valido.success).toBe(true);
    expect(mensajes(repetido)).toEqual([MENSAJES_VALIDACION.elementoRepetido]);
    expect(mensajes(vacio)).toEqual([MENSAJES_VALIDACION.listaVacia]);
    expect(mensajes(invalido)).toEqual([MENSAJES_VALIDACION.formatoUuid]);
  });
});
