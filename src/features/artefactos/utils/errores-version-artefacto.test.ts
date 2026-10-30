import { describe, it, expect, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import type { ApiError } from '../../../shared/models/api-response';
import { aplicarErrorDeVersionArtefacto, esErrorDeArchivo } from './errores-version-artefacto';

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

describe('errores-version-artefacto', () => {
  it('un código o fieldError de archivo marca el campo y no deja mensaje de negocio', () => {
    // Arrange
    const setError = vi.fn();
    const porCampo = crearErrorApi({
      error: 'Bad Request',
      message: 'inválido',
      status: 400,
      fieldErrors: [{ field: 'tamanoBytes', message: 'muy grande' }],
    });

    // Act
    const porCodigoResultado = aplicarErrorDeVersionArtefacto(
      porCodigo('VERSION_ARTEFACTO_TIPO_ARCHIVO_NO_COINCIDE'),
      'registrando',
      setError,
    );
    const porCampoResultado = aplicarErrorDeVersionArtefacto(porCampo, 'solicitando', setError);

    // Assert
    expect(porCodigoResultado).toBeNull();
    expect(porCampoResultado).toBeNull();
    expect(setError).toHaveBeenNthCalledWith(1, 'archivo', { message: 'del backend' });
    expect(setError).toHaveBeenNthCalledWith(2, 'archivo', { message: 'muy grande' });
  });

  it('un error de negocio devuelve el mensaje del servidor y uno sin respuesta usa el respaldo de la fase', () => {
    // Arrange
    const setError = vi.fn();

    // Act
    const negocio = aplicarErrorDeVersionArtefacto(
      porCodigo('REVISION_ASESOR_VERSION_ANTERIOR_NO_EN_PROGRESO'),
      'solicitando',
      setError,
    );
    const sinRed = aplicarErrorDeVersionArtefacto(new Error('Network Error'), 'subiendo', setError);

    // Assert
    expect(negocio).toBe('del backend');
    expect(sinRed).toBe('El almacenamiento no aceptó el archivo. Vuelve a intentarlo.');
    expect(setError).not.toHaveBeenCalled();
    expect(esErrorDeArchivo(porCodigo('ARTEFACTOS_ARTEFACTO_OMITIDO'))).toBe(false);
  });
});
