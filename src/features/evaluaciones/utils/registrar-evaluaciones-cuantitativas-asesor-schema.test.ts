import { describe, it, expect } from 'vitest';
import { LIMITES, MENSAJES_VALIDACION } from '../../../shared/validation';
import { registrarEvaluacionesCuantitativasAsesorSchema } from './registrar-evaluaciones-cuantitativas-asesor-schema';

const ITEM_1 = '11111111-1111-4111-8111-111111111111';
const ITEM_2 = '22222222-2222-4222-8222-222222222222';

const parse = (evaluaciones: unknown) =>
  registrarEvaluacionesCuantitativasAsesorSchema.safeParse({ evaluaciones });
const mensajes = (r: ReturnType<typeof parse>) =>
  r.success ? [] : r.error.issues.map((i) => i.message);

describe('registrarEvaluacionesCuantitativasAsesorSchema', () => {
  it('acepta puntajes en el rango y rechaza lista vacía, ítem repetido, UUID inválido y puntaje inválido', () => {
    // Act
    const valido = parse([
      { itemId: ITEM_1, puntaje: LIMITES.ITEM_CUANTITATIVO_VALOR_MIN },
      { itemId: ITEM_2, puntaje: LIMITES.ITEM_CUANTITATIVO_VALOR_MAX },
    ]);
    const vacio = parse([]);
    const repetido = parse([
      { itemId: ITEM_1, puntaje: 3 },
      { itemId: ITEM_1, puntaje: 4 },
    ]);
    const uuid = parse([{ itemId: 'no-es-uuid', puntaje: 3 }]);
    const noEntero = parse([{ itemId: ITEM_1, puntaje: 2.5 }]);
    const negativo = parse([{ itemId: ITEM_1, puntaje: -1 }]);
    const excedido = parse([{ itemId: ITEM_1, puntaje: LIMITES.ITEM_CUANTITATIVO_VALOR_MAX + 1 }]);
    const ausente = parse([{ itemId: ITEM_1 }]);

    // Assert
    expect(valido.success).toBe(true);
    expect(mensajes(vacio)).toEqual([MENSAJES_VALIDACION.listaVacia]);
    expect(mensajes(repetido)).toEqual([MENSAJES_VALIDACION.elementoRepetido]);
    expect(mensajes(uuid)).toEqual([MENSAJES_VALIDACION.formatoUuid]);
    expect(noEntero.success).toBe(false);
    expect(negativo.success).toBe(false);
    expect(excedido.success).toBe(false);
    expect(mensajes(ausente)).toEqual([MENSAJES_VALIDACION.requerido]);
  });
});
