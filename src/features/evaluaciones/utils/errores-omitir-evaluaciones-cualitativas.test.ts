import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { mensajeErrorOmitirEvaluacionesCualitativas } from './errores-omitir-evaluaciones-cualitativas';

function errorApi(errorCode: string, message = 'Mensaje del backend', status = 422) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('mensajeErrorOmitirEvaluacionesCualitativas', () => {
  it('traduce cada código 422 a su texto propio y cae al mensaje del backend en otro error', () => {
    // Act
    const mensaje = (err: unknown) => mensajeErrorOmitirEvaluacionesCualitativas(err);

    // Assert
    expect(mensaje(errorApi('EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_FINALIZADA'))).toBe(
      'La evaluación ya fue finalizada; no se pueden omitir valoraciones.',
    );
    expect(mensaje(errorApi('EVALUACION_CUALITATIVA_JURADO_EVALUACIONES_NO_ENCONTRADAS'))).toBe(
      'Algunas valoraciones ya no existen. Actualizamos la lista.',
    );
    expect(mensaje(errorApi('EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA'))).toBe(
      'Esta evaluación ya no está disponible.',
    );
    expect(mensaje(errorApi('OTRO_CODIGO', 'Falla del servidor', 500))).toBe('Falla del servidor');
    expect(mensaje(new Error('red'))).toBe('Inténtalo nuevamente.');
  });
});
