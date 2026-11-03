import { describe, it, expect } from 'vitest';
import { LIMITES } from '../../../shared/validation';
import { observacionRevisionSchema } from './observacion-revision-schema';

describe('observacionRevisionSchema', () => {
  it('exige descripción, la recorta y limita su longitud a 1000 caracteres', () => {
    // Act
    const max = LIMITES.OBSERVACION_REVISION_ARTEFACTO_MAX;
    const vacia = observacionRevisionSchema.safeParse({ descripcion: '' });
    const soloEspacios = observacionRevisionSchema.safeParse({ descripcion: '   ' });
    const recortada = observacionRevisionSchema.safeParse({ descripcion: '  Falta el diagrama  ' });
    const enElLimite = observacionRevisionSchema.safeParse({ descripcion: 'a'.repeat(max) });
    const excedida = observacionRevisionSchema.safeParse({ descripcion: 'a'.repeat(max + 1) });

    // Assert
    expect(vacia.success).toBe(false);
    expect(soloEspacios.success).toBe(false);
    expect(recortada.success && recortada.data.descripcion).toBe('Falta el diagrama');
    expect(enElLimite.success).toBe(true);
    expect(excedida.success).toBe(false);
  });
});
