import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { mensajeErrorDestitucion } from './errores-destitucion';

function errorApi(errorCode: string, message = 'mensaje del backend') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('mensajeErrorDestitucion', () => {
  it('usa texto propio por código y el mensaje del backend o el respaldo en el resto', () => {
    // Assert
    expect(mensajeErrorDestitucion(errorApi('PROYECTO_GRADO_NO_PERTENECE_COORDINADOR'))).toBe(
      'Solo el coordinador asignado a este proyecto puede destituir estudiantes.',
    );
    expect(mensajeErrorDestitucion(errorApi('PROYECTO_GRADO_FINALIZADO'))).toBe(
      'Un proyecto de grado finalizado no admite cambios en sus estudiantes.',
    );
    expect(
      mensajeErrorDestitucion(errorApi('ESTUDIANTE_PROYECTO_GRADO_ESTUDIANTE_NO_VINCULADO')),
    ).toBe('Este estudiante ya no está vinculado al proyecto de grado.');
    expect(mensajeErrorDestitucion(errorApi('PROYECTO_GRADO_NO_ENCONTRADO'))).toBe(
      'El proyecto de grado ya no existe.',
    );
    expect(mensajeErrorDestitucion(errorApi('OTRO_CODIGO', 'Otro mensaje'))).toBe('Otro mensaje');
    expect(mensajeErrorDestitucion(new Error('red'))).toBe('Inténtalo nuevamente.');
  });
});
