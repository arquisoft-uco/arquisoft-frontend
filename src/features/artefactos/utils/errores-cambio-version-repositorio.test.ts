import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import {
  ASESOR_NO_PROPIETARIO,
  CAMBIO_VERSION_NO_PERMITIDO,
  esErrorDeCampoVersion,
  esErrorQueDesactualizaListado,
  MENSAJE_CAMBIO_NO_PERMITIDO,
  MENSAJE_IGUAL_A_ACTUAL,
  MENSAJE_OTRO_DOCUMENTO,
  mensajeErrorCambioVersionRepositorio,
  VERSION_REPOSITORIO_IGUAL_A_ACTUAL,
  VERSION_REPOSITORIO_NO_ENCONTRADA,
  VERSION_REPOSITORIO_OTRO_DOCUMENTO,
} from './errores-cambio-version-repositorio';
import { ARTEFACTO_OMITIDO } from './errores-omitir-artefacto';

function error422(errorCode: string, message = 'Mensaje del servidor') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('errores-cambio-version-repositorio', () => {
  it('usa mensaje propio para los tres códigos de la HU y el del servidor para el resto', () => {
    // Assert
    expect(mensajeErrorCambioVersionRepositorio(error422(CAMBIO_VERSION_NO_PERMITIDO), 'x')).toBe(
      MENSAJE_CAMBIO_NO_PERMITIDO,
    );
    expect(
      mensajeErrorCambioVersionRepositorio(error422(VERSION_REPOSITORIO_OTRO_DOCUMENTO), 'x'),
    ).toBe(MENSAJE_OTRO_DOCUMENTO);
    expect(
      mensajeErrorCambioVersionRepositorio(error422(VERSION_REPOSITORIO_IGUAL_A_ACTUAL), 'x'),
    ).toBe(MENSAJE_IGUAL_A_ACTUAL);
    expect(
      mensajeErrorCambioVersionRepositorio(error422(ASESOR_NO_PROPIETARIO, 'No es suyo'), 'x'),
    ).toBe('No es suyo');
  });

  it('clasifica los errores de campo', () => {
    // Assert
    expect(esErrorDeCampoVersion(error422(VERSION_REPOSITORIO_OTRO_DOCUMENTO))).toBe(true);
    expect(esErrorDeCampoVersion(error422(VERSION_REPOSITORIO_IGUAL_A_ACTUAL))).toBe(true);
    expect(esErrorDeCampoVersion(error422(VERSION_REPOSITORIO_NO_ENCONTRADA))).toBe(true);
    expect(esErrorDeCampoVersion(error422(ASESOR_NO_PROPIETARIO))).toBe(false);
  });

  it('clasifica los errores que desactualizan el listado', () => {
    // Assert
    expect(esErrorQueDesactualizaListado(error422(ARTEFACTO_OMITIDO))).toBe(true);
    expect(esErrorQueDesactualizaListado(error422(CAMBIO_VERSION_NO_PERMITIDO))).toBe(true);
    expect(esErrorQueDesactualizaListado(error422(ASESOR_NO_PROPIETARIO))).toBe(true);
    expect(esErrorQueDesactualizaListado(error422(VERSION_REPOSITORIO_NO_ENCONTRADA))).toBe(true);
    expect(esErrorQueDesactualizaListado(error422(VERSION_REPOSITORIO_OTRO_DOCUMENTO))).toBe(false);
    expect(esErrorQueDesactualizaListado(new Error('red'))).toBe(false);
  });
});
