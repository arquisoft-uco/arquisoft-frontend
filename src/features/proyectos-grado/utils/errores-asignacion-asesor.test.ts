import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { mensajeErrorAsignacionAsesor } from './errores-asignacion-asesor';

function errorApi(errorCode: string, message = 'mensaje del backend') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('mensajeErrorAsignacionAsesor', () => {
  it('usa texto propio por código y el mensaje del backend o el respaldo en el resto', () => {
    // Assert
    expect(mensajeErrorAsignacionAsesor(errorApi('PROYECTO_GRADO_NO_PERTENECE_COORDINADOR'))).toBe(
      'Solo el coordinador asignado a este proyecto puede agregar asesores.',
    );
    expect(mensajeErrorAsignacionAsesor(errorApi('PROYECTO_GRADO_FINALIZADO'))).toBe(
      'El proyecto de grado está finalizado y no admite nuevos asesores.',
    );
    expect(mensajeErrorAsignacionAsesor(errorApi('ASESOR_PROYECTO_GRADO_ASESOR_NO_VIGENTE'))).toBe(
      'El asesor seleccionado ya no está vigente. Elige otro.',
    );
    expect(mensajeErrorAsignacionAsesor(errorApi('ASESOR_PROYECTO_GRADO_ASESOR_YA_ASIGNADO'))).toBe(
      'Ese asesor ya está asignado a este proyecto de grado.',
    );
    expect(
      mensajeErrorAsignacionAsesor(errorApi('ASESOR_PROYECTO_GRADO_CUPO_ASESORES_EXCEDIDO')),
    ).toBe('El proyecto de grado admite un solo asesor asignado a la vez.');
    expect(mensajeErrorAsignacionAsesor(errorApi('OTRO_CODIGO', 'Asesor inexistente'))).toBe(
      'Asesor inexistente',
    );
    expect(mensajeErrorAsignacionAsesor(new Error('red'))).toBe('Inténtalo nuevamente.');
  });
});
