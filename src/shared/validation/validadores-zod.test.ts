import { describe, it, expect } from 'vitest';
import { LIMITES } from './limites';
import { MENSAJES_VALIDACION } from './mensajes-validacion';
import { EMAIL_REGEX, UUID_REGEX } from './expresiones-regulares';
import {
  textoRequerido,
  opcionRequerida,
  emailValido,
  uuidValido,
  listaConMaximo,
} from './validadores-zod';

describe('límites alineados al backend', () => {
  it('refleja las restricciones @Size del backend', () => {
    expect(LIMITES.TITULO_PROYECTO_MAX).toBe(100);
    expect(LIMITES.ITEM_CONTENIDO_MAX).toBe(7000);
    expect(LIMITES.ESTADO_EVALUACION_ID_MAX).toBe(50);
    expect(LIMITES.ESTUDIANTES_MAX).toBe(3);
  });
});

describe('textoRequerido', () => {
  const validador = textoRequerido(LIMITES.TITULO_PROYECTO_MAX);

  it('rechaza texto vacío con el mensaje de requerido', () => {
    const resultado = validador.safeParse('');
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe(MENSAJES_VALIDACION.requerido);
    }
  });

  it('rechaza texto que excede el máximo', () => {
    const resultado = validador.safeParse('a'.repeat(LIMITES.TITULO_PROYECTO_MAX + 1));
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe(
        MENSAJES_VALIDACION.longitudMaxima(LIMITES.TITULO_PROYECTO_MAX),
      );
    }
  });

  it('acepta texto dentro del límite', () => {
    expect(validador.safeParse('Proyecto de grado').success).toBe(true);
    expect(validador.safeParse('a'.repeat(LIMITES.TITULO_PROYECTO_MAX)).success).toBe(true);
  });
});

describe('opcionRequerida', () => {
  it('rechaza cadena vacía', () => {
    const resultado = opcionRequerida().safeParse('');
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe(MENSAJES_VALIDACION.seleccioneOpcion);
    }
  });

  it('acepta una opción seleccionada', () => {
    expect(opcionRequerida().safeParse('coordinador').success).toBe(true);
  });
});

describe('emailValido', () => {
  it('acepta un correo con formato válido', () => {
    expect(emailValido().safeParse('persona@uco.edu.co').success).toBe(true);
  });

  it('rechaza un correo con formato inválido', () => {
    const resultado = emailValido().safeParse('persona@sin-dominio');
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe(MENSAJES_VALIDACION.formatoEmail);
    }
  });
});

describe('uuidValido', () => {
  it('acepta un UUID válido', () => {
    expect(uuidValido().safeParse('3f2504e0-4f89-41d3-9a0c-0305e82c3301').success).toBe(true);
  });

  it('rechaza un identificador que no es UUID', () => {
    expect(uuidValido().safeParse('123').success).toBe(false);
  });
});

describe('listaConMaximo', () => {
  const validador = listaConMaximo(LIMITES.ESTUDIANTES_MAX);

  it('acepta una lista dentro del máximo', () => {
    expect(validador.safeParse(['a', 'b', 'c']).success).toBe(true);
  });

  it('rechaza una lista que excede el máximo', () => {
    const resultado = validador.safeParse(['a', 'b', 'c', 'd']);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe(
        MENSAJES_VALIDACION.listaMaxima(LIMITES.ESTUDIANTES_MAX),
      );
    }
  });
});

describe('expresiones regulares', () => {
  it('EMAIL_REGEX distingue correos válidos e inválidos', () => {
    expect(EMAIL_REGEX.test('a@b.co')).toBe(true);
    expect(EMAIL_REGEX.test('a@b')).toBe(false);
  });

  it('UUID_REGEX distingue UUID válidos e inválidos', () => {
    expect(UUID_REGEX.test('3f2504e0-4f89-41d3-9a0c-0305e82c3301')).toBe(true);
    expect(UUID_REGEX.test('no-es-uuid')).toBe(false);
  });
});
