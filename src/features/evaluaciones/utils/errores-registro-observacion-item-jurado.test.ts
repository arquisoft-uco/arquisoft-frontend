import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { mensajeErrorRegistroObservacionItemJurado } from './errores-registro-observacion-item-jurado';

function errorApi(errorCode: string, message = 'Mensaje del backend') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('mensajeErrorRegistroObservacionItemJurado', () => {
  it('traduce no encontrada y finalizada a su texto propio y el resto al mensaje del backend', () => {
    // Act
    const noEncontrada = mensajeErrorRegistroObservacionItemJurado(
      errorApi('OBSERVACION_ITEM_JURADO_EVALUACION_NO_ENCONTRADA'),
    );
    const finalizada = mensajeErrorRegistroObservacionItemJurado(
      errorApi('OBSERVACION_ITEM_JURADO_EVALUACION_JURADO_FINALIZADA'),
    );
    const otro = mensajeErrorRegistroObservacionItemJurado(errorApi('OTRO', 'Texto del backend'));
    const sinRespuesta = mensajeErrorRegistroObservacionItemJurado(new Error('red'));

    // Assert
    expect(noEncontrada).toBe('La valoración de este ítem ya no está disponible.');
    expect(finalizada).toBe('La evaluación está finalizada y no admite observaciones.');
    expect(otro).toBe('Texto del backend');
    expect(sinRespuesta).toBe('No se pudo guardar la observación.');
  });
});
