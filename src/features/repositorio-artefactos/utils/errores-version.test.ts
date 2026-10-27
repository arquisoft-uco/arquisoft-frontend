import { describe, it, expect, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import type { ApiError } from '../../../shared/models/api-response';
import { aplicarErrorDeVersion, mensajeDeErrorDeVersion } from './errores-version';

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: cuerpo.error,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function porCodigo(errorCode: string) {
  return crearErrorApi({
    error: 'Unprocessable Entity',
    errorCode,
    message: 'del backend',
    status: 422,
  });
}

describe('errores-version', () => {
  it('los códigos de documento marcan el campo del nombre con enfoque', () => {
    // Arrange
    const setError = vi.fn();

    // Act
    aplicarErrorDeVersion(porCodigo('DOCUMENTO_YA_EXISTE'), setError);
    aplicarErrorDeVersion(porCodigo('DOCUMENTO_NO_EXISTE'), setError);

    // Assert
    expect(setError).toHaveBeenCalledTimes(2);
    expect(setError).toHaveBeenNthCalledWith(
      1,
      'nombreDocumento',
      { message: 'Ya existe un documento con este nombre en el repositorio.' },
      { shouldFocus: true },
    );
    expect(setError).toHaveBeenNthCalledWith(
      2,
      'nombreDocumento',
      { message: 'Este documento ya no existe en el repositorio.' },
      { shouldFocus: true },
    );
  });

  it('los códigos de archivo marcan el campo archivo con el mensaje del backend', () => {
    // Arrange
    const setError = vi.fn();

    // Act
    aplicarErrorDeVersion(porCodigo('TIPO_ARCHIVO_NO_COINCIDE'), setError);
    aplicarErrorDeVersion(porCodigo('TAMANO_ARCHIVO_EXCEDIDO'), setError);

    // Assert
    expect(setError).toHaveBeenCalledTimes(2);
    expect(setError).toHaveBeenCalledWith('archivo', { message: 'del backend' });
  });

  it('cada fieldError cae en su campo e ignora los que no tienen input', () => {
    // Arrange
    const setError = vi.fn();
    const err = crearErrorApi({
      error: 'Bad Request',
      message: 'inválido',
      status: 400,
      fieldErrors: [
        { field: 'nombreArchivo', message: 'm1' },
        { field: 'tipoContenido', message: 'm2' },
        { field: 'tamanoBytes', message: 'm3' },
        { field: 'nombreDocumento', message: 'm4' },
        { field: 'carga', message: 'm5' },
        { field: 'nuevoDocumento', message: 'm6' },
      ],
    });

    // Act
    aplicarErrorDeVersion(err, setError);

    // Assert
    expect(setError.mock.calls).toEqual([
      ['archivo', { message: 'm1' }],
      ['archivo', { message: 'm2' }],
      ['archivo', { message: 'm3' }],
      ['nombreDocumento', { message: 'm4' }],
    ]);
  });

  it('un error sin mensaje del backend usa el respaldo de la fase en curso', () => {
    // Arrange
    const sinRespuesta = new Error('Network Error');

    // Assert
    expect(mensajeDeErrorDeVersion(sinRespuesta, 'subiendo')).toBe(
      'El almacenamiento no aceptó el archivo. Vuelve a intentarlo.',
    );
    expect(mensajeDeErrorDeVersion(sinRespuesta, 'registrando')).toBe(
      'No se pudo registrar la versión. Vuelve a intentarlo.',
    );
    expect(mensajeDeErrorDeVersion(sinRespuesta, null)).toBe(
      'No se pudo preparar la carga. Vuelve a intentarlo.',
    );
  });
});
