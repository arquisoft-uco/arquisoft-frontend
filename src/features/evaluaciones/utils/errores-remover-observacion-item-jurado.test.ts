import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { mensajeErrorRemoverObservacionItemJurado } from './errores-remover-observacion-item-jurado';

function errorApi(errorCode: string, message = 'Mensaje del backend') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('mensajeErrorRemoverObservacionItemJurado', () => {
  it('traduce inexistente y finalizada a su texto y el resto al mensaje del backend o al respaldo', () => {
    // Act
    const noEncontrada = mensajeErrorRemoverObservacionItemJurado(
      errorApi('OBSERVACION_ITEM_JURADO_NO_ENCONTRADA'),
    );
    const finalizada = mensajeErrorRemoverObservacionItemJurado(
      errorApi('OBSERVACION_ITEM_JURADO_EVALUACION_JURADO_FINALIZADA'),
    );
    const otro = mensajeErrorRemoverObservacionItemJurado(errorApi('OTRO', 'Texto del backend'));
    const sinRespuesta = mensajeErrorRemoverObservacionItemJurado(new Error('red'));

    // Assert
    expect(noEncontrada).toBe('La observación ya no existe.');
    expect(finalizada).toBe('La evaluación está finalizada y no admite remover observaciones.');
    expect(otro).toBe('Texto del backend');
    expect(sinRespuesta).toBe('No se pudo remover la observación.');
  });
});
