import { describe, it, expect, vi } from 'vitest';
import { aplicarErroresDeApi } from './errores-api-usuario';
import { errorApi } from '../../../test-utils/errores-api';

const CAMPOS = ['identificador', 'nombres', 'apellidos', 'email', 'contacto'] as const;
type Campo = (typeof CAMPOS)[number];

const DUPLICADOS = [
  {
    codigo: 'USUARIO_IDENTIFICADOR_DUPLICADO',
    campo: 'identificador',
    respaldo: 'Ya existe un usuario con este identificador.',
  },
  {
    codigo: 'USUARIO_EMAIL_DUPLICADO',
    campo: 'email',
    respaldo: 'Ya existe un usuario con este correo.',
  },
  {
    codigo: 'USUARIO_CONTACTO_DUPLICADO',
    campo: 'contacto',
    respaldo: 'Ya existe un usuario con este contacto.',
  },
] as const;

function pintado(
  err: unknown,
  alias?: Record<string, readonly Campo[]>,
  campos: readonly Campo[] = CAMPOS,
) {
  const setError =
    vi.fn<
      (campo: Campo, error: { message: string }, opciones?: { shouldFocus: boolean }) => void
    >();
  aplicarErroresDeApi(err, setError, campos, alias);
  return setError.mock.calls.map(([campo, error, opciones]) => ({
    campo,
    mensaje: error.message,
    enfoca: opciones?.shouldFocus === true,
  }));
}

describe('aplicarErroresDeApi', () => {
  it('pinta cada código de duplicado y cada fieldError en su campo, expande el alias nombre a sus dos campos y enfoca solo el primero', () => {
    // Arrange
    const mensajeDelBackend = 'Mensaje del backend.';
    const camposInvalidos = errorApi(400, {
      message: 'Hay campos inválidos.',
      status: 400,
      fieldErrors: [
        { field: 'nombre', message: 'El nombre completo no es válido.' },
        { field: 'contacto', message: 'El contacto no es válido.' },
      ],
    });

    // Act
    const conMensaje = DUPLICADOS.map(({ codigo }) =>
      pintado(errorApi(422, { errorCode: codigo, message: mensajeDelBackend, status: 422 })),
    );
    const sinMensaje = DUPLICADOS.map(({ codigo }) =>
      pintado(errorApi(422, { errorCode: codigo, status: 422 })),
    );
    const porAlias = pintado(camposInvalidos, { nombre: ['nombres', 'apellidos'] });

    // Assert
    expect(conMensaje).toEqual(
      DUPLICADOS.map(({ campo }) => [{ campo, mensaje: mensajeDelBackend, enfoca: true }]),
    );
    expect(sinMensaje).toEqual(
      DUPLICADOS.map(({ campo, respaldo }) => [{ campo, mensaje: respaldo, enfoca: true }]),
    );
    expect(porAlias).toEqual([
      { campo: 'nombres', mensaje: 'El nombre completo no es válido.', enfoca: true },
      { campo: 'apellidos', mensaje: 'El nombre completo no es válido.', enfoca: false },
      { campo: 'contacto', mensaje: 'El contacto no es válido.', enfoca: false },
    ]);
  });

  it('no pinta nada si el campo no existe en el formulario o si el error no trae campo', () => {
    // Arrange
    const campoAjeno = errorApi(400, {
      message: 'Hay campos inválidos.',
      status: 400,
      fieldErrors: [
        { field: 'rol', message: 'El rol no es válido.' },
        // Un nombre heredado de Object.prototype no es un alias.
        { field: 'constructor', message: 'No es un campo.' },
      ],
    });
    const nombreSinAlias = errorApi(422, {
      message: 'El nombre completo no es válido.',
      status: 422,
      fieldErrors: [{ field: 'nombre', message: 'El nombre completo no es válido.' }],
    });
    const duplicadoDeContacto = errorApi(422, {
      errorCode: 'USUARIO_CONTACTO_DUPLICADO',
      message: 'Mensaje del backend.',
      status: 422,
    });
    const sinCampo = errorApi(503, {
      errorCode: 'USUARIO_IDP_NO_DISPONIBLE',
      message: 'Keycloak no disponible.',
      status: 503,
      fieldErrors: null,
    });

    // Act
    const pintados = [
      pintado(campoAjeno),
      pintado(nombreSinAlias),
      pintado(duplicadoDeContacto, undefined, ['identificador', 'email']),
      pintado(sinCampo),
      pintado(new Error('Network Error')),
    ];

    // Assert
    expect(pintados.flat()).toEqual([]);
  });
});
