import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { mensajeErrorModificarObservacionItemJurado } from './errores-modificar-observacion-item-jurado';

function errorApi(errorCode: string, message = 'Mensaje del backend') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('mensajeErrorModificarObservacionItemJurado', () => {
  it('traduce inexistente, duplicada y finalizada a su texto y el resto al mensaje del backend', () => {
    // Act
    const noEncontrada = mensajeErrorModificarObservacionItemJurado(
      errorApi('OBSERVACION_ITEM_JURADO_NO_ENCONTRADA'),
    );
    const duplicada = mensajeErrorModificarObservacionItemJurado(
      errorApi('OBSERVACION_ITEM_JURADO_DESCRIPCION_DUPLICADA'),
    );
    const finalizada = mensajeErrorModificarObservacionItemJurado(
      errorApi('OBSERVACION_ITEM_JURADO_EVALUACION_JURADO_FINALIZADA'),
    );
    const otro = mensajeErrorModificarObservacionItemJurado(errorApi('OTRO', 'Texto del backend'));
    const sinRespuesta = mensajeErrorModificarObservacionItemJurado(new Error('red'));

    // Assert
    expect(noEncontrada).toBe('La observación ya no existe.');
    expect(duplicada).toBe('Ya hay otra observación con este texto para este ítem.');
    expect(finalizada).toBe('La evaluación está finalizada y no admite modificar observaciones.');
    expect(otro).toBe('Texto del backend');
    expect(sinRespuesta).toBe('No se pudo modificar la observación.');
  });
});
