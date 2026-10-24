import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { LIMITES } from './limites';
import { MENSAJES_VALIDACION } from './mensajes-validacion';
import { EMAIL_REGEX, UUID_REGEX } from './expresiones-regulares';
import {
  textoRequerido,
  opcionRequerida,
  emailValido,
  uuidValido,
  listaConMaximo,
  listaNoVaciaSinDuplicados,
  textoEntre,
  textoNoVacio,
  soloDigitosEntre,
  enteroEntre,
  validarParDeNombres,
} from './validadores-zod';

describe('límites alineados al backend', () => {
  it('refleja las restricciones @Size del backend', () => {
    expect(LIMITES.TITULO_PROYECTO_MAX).toBe(100);
    expect(LIMITES.ITEM_CONTENIDO_MAX).toBe(7000);
    expect(LIMITES.ESTADO_EVALUACION_ID_MAX).toBe(50);
    expect(LIMITES.ESTADO_FICHA_ID_MAX).toBe(50);
    expect(LIMITES.ESTUDIANTES_MAX).toBe(3);
    expect(LIMITES.MENSAJE_SOLICITUD_MAX).toBe(100);
    expect(LIMITES.RESPUESTA_CONTENIDO_MAX).toBe(100);
    expect(LIMITES.USUARIO_IDENTIFICADOR_MIN).toBe(4);
    expect(LIMITES.USUARIO_IDENTIFICADOR_MAX).toBe(30);
    expect(LIMITES.USUARIO_NOMBRE_MIN).toBe(2);
    expect(LIMITES.USUARIO_NOMBRE_MAX).toBe(50);
    expect(LIMITES.USUARIO_EMAIL_MIN).toBe(6);
    expect(LIMITES.USUARIO_EMAIL_MAX).toBe(50);
    expect(LIMITES.USUARIO_CONTACTO_MIN).toBe(10);
    expect(LIMITES.USUARIO_CONTACTO_MAX).toBe(15);
    expect(LIMITES.ITEM_CUALITATIVO_NOMBRE_MAX).toBe(100);
    expect(LIMITES.ITEM_CUALITATIVO_DESCRIPCION_MAX).toBe(300);
    expect(LIMITES.ITEM_CUANTITATIVO_NOMBRE_MAX).toBe(100);
    expect(LIMITES.ITEM_CUANTITATIVO_DESCRIPCION_MAX).toBe(300);
    expect(LIMITES.ITEM_CUANTITATIVO_VALOR_MIN).toBe(0);
    expect(LIMITES.ITEM_CUANTITATIVO_VALOR_MAX).toBe(500);
    expect(LIMITES.CATEGORIA_ITEM_CUANTITATIVO_NOMBRE_FILTRO_MAX).toBe(100);
    expect(LIMITES.OBSERVACION_EVALUACION_MAX).toBe(200);
    expect(LIMITES.OBSERVACION_ITEM_MAX).toBe(200);
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

  it('recorta espacios: un texto solo de espacios es requerido, y los bordes no cuentan en el resultado', () => {
    const soloEspacios = validador.safeParse('   ');
    expect(soloEspacios.success).toBe(false);
    if (!soloEspacios.success) {
      expect(soloEspacios.error.issues[0].message).toBe(MENSAJES_VALIDACION.requerido);
    }

    const conBordes = validador.safeParse('  Proyecto de grado  ');
    expect(conBordes.success).toBe(true);
    if (conBordes.success) expect(conBordes.data).toBe('Proyecto de grado');
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

  it('con (min, max) valida longitud además del formato, y sigue siendo retrocompatible sin argumentos', () => {
    const validador = emailValido(LIMITES.USUARIO_EMAIL_MIN, LIMITES.USUARIO_EMAIL_MAX);

    expect(validador.safeParse('').success).toBe(false);
    expect(emailValido().safeParse('a@bc.co').success).toBe(true);

    const largo = validador.safeParse(`${'a'.repeat(60)}@uco.edu.co`);
    expect(largo.success).toBe(false);
    if (!largo.success) {
      expect(largo.error.issues[0].message).toBe(
        MENSAJES_VALIDACION.longitudEntre(LIMITES.USUARIO_EMAIL_MIN, LIMITES.USUARIO_EMAIL_MAX),
      );
    }

    expect(validador.safeParse('persona@uco.edu.co').success).toBe(true);
  });
});

describe('textoEntre', () => {
  const validador = textoEntre(
    LIMITES.USUARIO_IDENTIFICADOR_MIN,
    LIMITES.USUARIO_IDENTIFICADOR_MAX,
  );

  it('rechaza vacío con el mensaje de requerido, corto y largo con el de longitud, y acepta en rango', () => {
    const vacio = validador.safeParse('');
    expect(vacio.success).toBe(false);
    if (!vacio.success) expect(vacio.error.issues[0].message).toBe(MENSAJES_VALIDACION.requerido);

    const corto = validador.safeParse('abc');
    expect(corto.success).toBe(false);
    if (!corto.success) {
      expect(corto.error.issues[0].message).toBe(
        MENSAJES_VALIDACION.longitudEntre(
          LIMITES.USUARIO_IDENTIFICADOR_MIN,
          LIMITES.USUARIO_IDENTIFICADOR_MAX,
        ),
      );
    }

    const largo = validador.safeParse('a'.repeat(LIMITES.USUARIO_IDENTIFICADOR_MAX + 1));
    expect(largo.success).toBe(false);

    expect(validador.safeParse('user123').success).toBe(true);
  });
});

describe('textoNoVacio', () => {
  it('rechaza vacío con el mensaje de requerido y acepta cualquier no vacío sin importar longitud', () => {
    const resultado = textoNoVacio().safeParse('   ');
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe(MENSAJES_VALIDACION.requerido);
    }

    expect(textoNoVacio().safeParse('a').success).toBe(true);
    expect(textoNoVacio().safeParse('a'.repeat(200)).success).toBe(true);
  });
});

describe('soloDigitosEntre', () => {
  const validador = soloDigitosEntre(LIMITES.USUARIO_CONTACTO_MIN, LIMITES.USUARIO_CONTACTO_MAX);

  it('rechaza vacío, no numérico y fuera de longitud; acepta un contacto válido', () => {
    const vacio = validador.safeParse('');
    expect(vacio.success).toBe(false);
    if (!vacio.success) expect(vacio.error.issues[0].message).toBe(MENSAJES_VALIDACION.requerido);

    const noNumerico = validador.safeParse('300abc4567');
    expect(noNumerico.success).toBe(false);
    if (!noNumerico.success) {
      expect(noNumerico.error.issues[0].message).toBe(MENSAJES_VALIDACION.soloDigitos);
    }

    const corto = validador.safeParse('123');
    expect(corto.success).toBe(false);
    if (!corto.success) {
      expect(corto.error.issues[0].message).toBe(
        MENSAJES_VALIDACION.longitudEntre(
          LIMITES.USUARIO_CONTACTO_MIN,
          LIMITES.USUARIO_CONTACTO_MAX,
        ),
      );
    }

    expect(validador.safeParse('3001234567').success).toBe(true);
  });
});

describe('enteroEntre', () => {
  const { ITEM_CUANTITATIVO_VALOR_MIN: min, ITEM_CUANTITATIVO_VALOR_MAX: max } = LIMITES;
  const validador = enteroEntre(min, max);

  function mensaje(valor: string) {
    const resultado = validador.safeParse(valor);
    return resultado.success ? null : resultado.error.issues[0].message;
  }

  it('responde requerido, solo dígitos y rango en ese orden, e incluye los extremos', () => {
    expect(mensaje('')).toBe(MENSAJES_VALIDACION.requerido);
    expect(mensaje('   ')).toBe(MENSAJES_VALIDACION.requerido);
    expect(mensaje('abc')).toBe(MENSAJES_VALIDACION.soloDigitos);
    expect(mensaje('1.5')).toBe(MENSAJES_VALIDACION.soloDigitos);
    expect(mensaje('-1')).toBe(MENSAJES_VALIDACION.soloDigitos);
    expect(mensaje(String(max + 1))).toBe(MENSAJES_VALIDACION.valorEntre(min, max));
    expect(validador.safeParse(String(min)).success).toBe(true);
    expect(validador.safeParse(String(max)).success).toBe(true);
    expect(validador.safeParse(' 42 ').success).toBe(true);
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

describe('listaNoVaciaSinDuplicados', () => {
  const esquema = listaNoVaciaSinDuplicados(
    z.object({ item: z.string(), criterio: z.string() }),
    (par) => par.item,
  );

  it('rechaza la lista vacía y la clave repetida, y acepta claves distintas', () => {
    const vacia = esquema.safeParse([]);
    const repetida = esquema.safeParse([
      { item: 'a', criterio: 'x' },
      { item: 'a', criterio: 'y' },
    ]);
    const valida = esquema.safeParse([
      { item: 'a', criterio: 'x' },
      { item: 'b', criterio: 'x' },
    ]);

    expect(vacia.success ? [] : vacia.error.issues.map((i) => i.message)).toEqual([
      MENSAJES_VALIDACION.listaVacia,
    ]);
    expect(repetida.success ? [] : repetida.error.issues.map((i) => i.message)).toEqual([
      MENSAJES_VALIDACION.elementoRepetido,
    ]);
    expect(valida.success).toBe(true);
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

describe('validarParDeNombres', () => {
  const esquema = z
    .object({ nombres: z.string(), apellidos: z.string() })
    .superRefine((val, ctx) =>
      validarParDeNombres(val, ctx, LIMITES.USUARIO_NOMBRE_MIN, LIMITES.USUARIO_NOMBRE_MAX),
    );

  function errores(nombres: string, apellidos: string) {
    const resultado = esquema.safeParse({ nombres, apellidos });
    if (resultado.success) return [];
    return resultado.error.issues.map((i) => `${i.path.join('.')}:${i.message}`);
  }

  it('acepta un par válido', () => {
    expect(esquema.safeParse({ nombres: 'Ana', apellidos: 'Gómez' }).success).toBe(true);
  });

  it('atribuye la longitud compuesta a ambos campos y el formato al campo culpable', () => {
    const largo = 'a'.repeat(LIMITES.USUARIO_NOMBRE_MAX);
    const longitud = MENSAJES_VALIDACION.longitudEntre(
      LIMITES.USUARIO_NOMBRE_MIN,
      LIMITES.USUARIO_NOMBRE_MAX,
    );
    expect(errores(largo, 'b')).toEqual([`nombres:${longitud}`, `apellidos:${longitud}`]);
    expect(errores('Ana1', 'Gómez')).toEqual([`nombres:${MENSAJES_VALIDACION.formatoNombre}`]);
    expect(errores('Ana', 'G0mez')).toEqual([`apellidos:${MENSAJES_VALIDACION.formatoNombre}`]);
  });
});
