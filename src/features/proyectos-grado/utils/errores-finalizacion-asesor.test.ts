import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { mensajeErrorFinalizacionAsesor } from './errores-finalizacion-asesor';

function errorApi(errorCode: string, message = 'mensaje del backend') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('mensajeErrorFinalizacionAsesor', () => {
  it('usa texto propio por código y el mensaje del backend o el respaldo en el resto', () => {
    // Assert
    expect(
      mensajeErrorFinalizacionAsesor(
        errorApi('ASESOR_PROYECTO_GRADO_TRANSICION_ESTADO_ASESOR_INVALIDA'),
      ),
    ).toBe('Este asesor ya no está asignado al proyecto.');
    expect(mensajeErrorFinalizacionAsesor(errorApi('PROYECTO_GRADO_FINALIZADO'))).toBe(
      'Un proyecto de grado finalizado no admite cambios en sus asesores.',
    );
    expect(
      mensajeErrorFinalizacionAsesor(errorApi('PROYECTO_GRADO_NO_PERTENECE_COORDINADOR')),
    ).toBe('Solo el coordinador asignado a este proyecto puede finalizar asesores.');
    expect(mensajeErrorFinalizacionAsesor(errorApi('PROYECTO_GRADO_NO_ENCONTRADO'))).toBe(
      'El proyecto de grado ya no existe.',
    );
    expect(mensajeErrorFinalizacionAsesor(errorApi('ASESOR_NO_ENCONTRADO'))).toBe(
      'Este asesor ya no está vinculado al proyecto de grado.',
    );
    expect(mensajeErrorFinalizacionAsesor(errorApi('ASESOR_PROYECTO_GRADO_NO_ENCONTRADO'))).toBe(
      'Este asesor ya no está vinculado al proyecto de grado.',
    );
    expect(mensajeErrorFinalizacionAsesor(errorApi('OTRO_CODIGO', 'Detalle del backend'))).toBe(
      'Detalle del backend',
    );
    expect(mensajeErrorFinalizacionAsesor(new Error('red'))).toBe('Inténtalo nuevamente.');
  });
});
