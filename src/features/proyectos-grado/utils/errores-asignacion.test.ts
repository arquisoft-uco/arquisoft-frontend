import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { LIMITES } from '../../../shared/validation';
import { mensajeErrorAsignacion } from './errores-asignacion';

function errorApi(errorCode: string, message = 'mensaje del backend') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('mensajeErrorAsignacion', () => {
  it('usa texto propio por código y el mensaje del backend o el respaldo en el resto', () => {
    // Assert
    expect(mensajeErrorAsignacion(errorApi('PROYECTO_GRADO_NO_PERTENECE_COORDINADOR'))).toBe(
      'Solo el coordinador asignado a este proyecto puede agregar estudiantes.',
    );
    expect(
      mensajeErrorAsignacion(errorApi('ESTUDIANTE_PROYECTO_GRADO_ESTUDIANTE_YA_VINCULADO')),
    ).toBe('Alguno de los estudiantes ya está vinculado a este proyecto.');
    expect(mensajeErrorAsignacion(errorApi('ESTUDIANTE_PROYECTO_GRADO_CUPO_EXCEDIDO'))).toBe(
      `El proyecto de grado admite como máximo ${LIMITES.ESTUDIANTES_MAX} estudiantes.`,
    );
    expect(mensajeErrorAsignacion(errorApi('OTRO_CODIGO', 'Estudiante no vigente'))).toBe(
      'Estudiante no vigente',
    );
    expect(mensajeErrorAsignacion(new Error('red'))).toBe('Inténtalo nuevamente.');
  });
});
