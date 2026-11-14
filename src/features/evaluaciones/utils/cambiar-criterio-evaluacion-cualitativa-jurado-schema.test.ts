import { describe, it, expect } from 'vitest';
import { MENSAJES_VALIDACION } from '../../../shared/validation';
import { cambiarCriterioEvaluacionCualitativaJuradoSchema as schema } from './cambiar-criterio-evaluacion-cualitativa-jurado-schema';

describe('cambiarCriterioEvaluacionCualitativaJuradoSchema', () => {
  it('exige el criterio y un UUID, y acepta un UUID válido', () => {
    // Act
    const vacio = schema.safeParse({ criterioId: '' });
    const invalido = schema.safeParse({ criterioId: 'no-es-uuid' });
    const valido = schema.safeParse({ criterioId: '11111111-1111-4111-8111-111111111111' });

    // Assert
    expect(vacio.success).toBe(false);
    expect(vacio.error?.issues[0].message).toBe(MENSAJES_VALIDACION.seleccioneOpcion);
    expect(invalido.success).toBe(false);
    expect(invalido.error?.issues[0].message).toBe(MENSAJES_VALIDACION.formatoUuid);
    expect(valido.success).toBe(true);
  });
});
