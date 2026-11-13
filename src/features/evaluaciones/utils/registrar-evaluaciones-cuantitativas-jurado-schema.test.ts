import { describe, it, expect } from 'vitest';
import { LIMITES, MENSAJES_VALIDACION } from '../../../shared/validation';
import { registrarEvaluacionesCuantitativasJuradoSchema } from './registrar-evaluaciones-cuantitativas-jurado-schema';

const ITEM_1 = '11111111-1111-4111-8111-111111111111';
const ITEM_2 = '22222222-2222-4222-8222-222222222222';

const mensajes = (
  r: ReturnType<typeof registrarEvaluacionesCuantitativasJuradoSchema.safeParse>,
) => (r.success ? [] : r.error.issues.map((i) => i.message));

const con = (...pares: { itemId: string; puntaje: unknown; observacion?: unknown }[]) =>
  registrarEvaluacionesCuantitativasJuradoSchema.safeParse({ evaluaciones: pares });

describe('registrarEvaluacionesCuantitativasJuradoSchema', () => {
  it('acepta un lote válido y rechaza lista vacía, ítem repetido, UUID inválido y puntajes fuera de forma o rango', () => {
    // Act
    const valido = con({ itemId: ITEM_1, puntaje: 0 }, { itemId: ITEM_2, puntaje: 500 });
    const vacio = registrarEvaluacionesCuantitativasJuradoSchema.safeParse({ evaluaciones: [] });
    const repetido = con({ itemId: ITEM_1, puntaje: 10 }, { itemId: ITEM_1, puntaje: 20 });
    const uuid = con({ itemId: 'no-es-uuid', puntaje: 10 });
    const decimal = con({ itemId: ITEM_1, puntaje: 1.5 });
    const negativo = con({ itemId: ITEM_1, puntaje: -1 });
    const excedido = con({ itemId: ITEM_1, puntaje: LIMITES.ITEM_CUANTITATIVO_VALOR_MAX + 1 });
    const ausente = con({ itemId: ITEM_1, puntaje: undefined });
    const texto = con({ itemId: ITEM_1, puntaje: '10' });

    // Assert
    expect(valido.success).toBe(true);
    expect(mensajes(vacio)).toEqual([MENSAJES_VALIDACION.listaVacia]);
    expect(mensajes(repetido)).toEqual([MENSAJES_VALIDACION.elementoRepetido]);
    expect(mensajes(uuid)).toEqual([MENSAJES_VALIDACION.formatoUuid]);
    expect(mensajes(decimal)).toEqual([MENSAJES_VALIDACION.soloDigitos]);
    expect(mensajes(negativo)).toEqual([MENSAJES_VALIDACION.soloDigitos]);
    expect(mensajes(excedido)).toEqual([
      MENSAJES_VALIDACION.valorEntre(
        LIMITES.ITEM_CUANTITATIVO_VALOR_MIN,
        LIMITES.ITEM_CUANTITATIVO_VALOR_MAX,
      ),
    ]);
    expect(mensajes(ausente)).toEqual([MENSAJES_VALIDACION.requerido]);
    expect(texto.success).toBe(false);
  });

  it('la observación es opcional, y si se escribe no puede estar en blanco ni superar el máximo', () => {
    // Act
    const sinObservacion = con({ itemId: ITEM_1, puntaje: 10 });
    const conObservacion = con({ itemId: ITEM_1, puntaje: 10, observacion: 'Buen trabajo' });
    const enBlanco = con({ itemId: ITEM_1, puntaje: 10, observacion: '   ' });
    const enMaximo = con({
      itemId: ITEM_1,
      puntaje: 10,
      observacion: 'a'.repeat(LIMITES.OBSERVACION_ITEM_JURADO_DESCRIPCION_MAX),
    });
    const excedida = con({
      itemId: ITEM_1,
      puntaje: 10,
      observacion: 'a'.repeat(LIMITES.OBSERVACION_ITEM_JURADO_DESCRIPCION_MAX + 1),
    });

    // Assert
    expect(sinObservacion.success).toBe(true);
    expect(conObservacion.success).toBe(true);
    expect(mensajes(enBlanco)).toEqual([MENSAJES_VALIDACION.requerido]);
    expect(enMaximo.success).toBe(true);
    expect(mensajes(excedida)).toEqual([
      MENSAJES_VALIDACION.longitudMaxima(LIMITES.OBSERVACION_ITEM_JURADO_DESCRIPCION_MAX),
    ]);
  });
});
