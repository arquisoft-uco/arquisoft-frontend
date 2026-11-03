import { describe, it, expect } from 'vitest';
import { MENSAJES_VALIDACION } from '../../../shared/validation';
import { vincularEstudiantesSchema } from './estudiantes-artefacto-schema';

const ID_1 = '3f1c2a4e-5b6d-4e7f-8a9b-0c1d2e3f4a5b';
const ID_2 = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';

describe('vincularEstudiantesSchema', () => {
  it('acepta UUID distintos y rechaza lista vacía, UUID inválido y repetidos', () => {
    // Act
    const valido = vincularEstudiantesSchema.safeParse({ estudiantes: [ID_1, ID_2] });
    const vacio = vincularEstudiantesSchema.safeParse({ estudiantes: [] });
    const invalido = vincularEstudiantesSchema.safeParse({ estudiantes: ['no-es-uuid'] });
    const repetido = vincularEstudiantesSchema.safeParse({ estudiantes: [ID_1, ID_1] });

    // Assert
    expect(valido.success).toBe(true);
    expect(vacio.success).toBe(false);
    expect(!vacio.success && vacio.error.issues[0].message).toBe(MENSAJES_VALIDACION.listaVacia);
    expect(invalido.success).toBe(false);
    expect(repetido.success).toBe(false);
    expect(!repetido.success && repetido.error.issues[0].message).toBe(
      MENSAJES_VALIDACION.elementoRepetido,
    );
  });
});
