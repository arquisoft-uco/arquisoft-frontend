import { describe, it, expect, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import type { ApiError } from '../../../shared/models/api-response';
import { aplicarErrorDeRepositorio } from './errores-repositorio';

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: cuerpo.error,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('aplicarErrorDeRepositorio', () => {
  it('marca el campo Nombre cuando el repositorio está duplicado', () => {
    // Arrange
    const setError = vi.fn();
    const err = crearErrorApi({
      error: 'Unprocessable Entity',
      errorCode: 'REPOSITORIO_ARTEFACTO_DUPLICADO',
      message: 'dup',
      status: 422,
    });

    // Act
    aplicarErrorDeRepositorio(err, setError);

    // Assert
    expect(setError).toHaveBeenCalledWith(
      'nombreRepositorio',
      { message: 'Ya existe un repositorio con este nombre.' },
      { shouldFocus: true },
    );
  });

  it('marca cada fieldError conocido e ignora los campos que no son del formulario', () => {
    // Arrange
    const setError = vi.fn();
    const err = crearErrorApi({
      error: 'Bad Request',
      message: 'inválido',
      status: 400,
      fieldErrors: [
        { field: 'nombreRepositorio', message: 'Nombre mal' },
        { field: 'descripcion', message: 'Descripción mal' },
        { field: 'otro', message: 'Desconocido' },
      ],
    });

    // Act
    aplicarErrorDeRepositorio(err, setError);

    // Assert
    expect(setError).toHaveBeenCalledTimes(2);
    expect(setError).toHaveBeenCalledWith('nombreRepositorio', { message: 'Nombre mal' });
    expect(setError).toHaveBeenCalledWith('descripcion', { message: 'Descripción mal' });
  });

  it('no marca nada ante un error desconocido', () => {
    // Arrange
    const setError = vi.fn();

    // Act
    aplicarErrorDeRepositorio(new Error('x'), setError);

    // Assert
    expect(setError).not.toHaveBeenCalled();
  });
});
