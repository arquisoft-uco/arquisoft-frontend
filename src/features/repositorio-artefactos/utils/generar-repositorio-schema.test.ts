import { describe, it, expect } from 'vitest';
import { LIMITES, MENSAJES_VALIDACION } from '../../../shared/validation';
import { generarRepositorioSchema } from './generar-repositorio-schema';

const VALIDO = { nombreRepositorio: 'Repositorio Alfa', descripcion: 'Artefactos del semillero' };

function mensajes(entrada: unknown) {
  const resultado = generarRepositorioSchema.safeParse(entrada);
  return resultado.success ? [] : resultado.error.issues.map((i) => i.message);
}

describe('generarRepositorioSchema', () => {
  it('exige ambos campos con trim, respeta los máximos y recorta el valor', () => {
    // Act
    const vacios = mensajes({ nombreRepositorio: '   ', descripcion: '' });
    const nombreLargo = mensajes({
      ...VALIDO,
      nombreRepositorio: 'a'.repeat(LIMITES.REPOSITORIO_NOMBRE_MAX + 1),
    });
    const descripcionLarga = mensajes({
      ...VALIDO,
      descripcion: 'a'.repeat(LIMITES.REPOSITORIO_DESCRIPCION_MAX + 1),
    });
    const enElLimite = generarRepositorioSchema.safeParse({
      nombreRepositorio: 'a'.repeat(LIMITES.REPOSITORIO_NOMBRE_MAX),
      descripcion: 'a'.repeat(LIMITES.REPOSITORIO_DESCRIPCION_MAX),
    });
    const recortado = generarRepositorioSchema.safeParse({
      nombreRepositorio: '  Alfa  ',
      descripcion: '  Desc  ',
    });

    // Assert
    expect(vacios).toEqual([MENSAJES_VALIDACION.requerido, MENSAJES_VALIDACION.requerido]);
    expect(nombreLargo).toEqual([
      MENSAJES_VALIDACION.longitudMaxima(LIMITES.REPOSITORIO_NOMBRE_MAX),
    ]);
    expect(descripcionLarga).toEqual([
      MENSAJES_VALIDACION.longitudMaxima(LIMITES.REPOSITORIO_DESCRIPCION_MAX),
    ]);
    expect(enElLimite.success).toBe(true);
    expect(recortado.data).toEqual({ nombreRepositorio: 'Alfa', descripcion: 'Desc' });
  });
});
