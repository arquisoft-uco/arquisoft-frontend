import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { mensajeErrorOmitirEvaluacionesCualitativasAsesor } from './errores-omitir-evaluaciones-cualitativas-asesor';
import {
  EVALUACION_CUALITATIVA_ASESOR_EVALUACIONES_NO_REGISTRADAS,
  EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA,
  EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR,
  EVALUACION_CUALITATIVA_ASESOR_OMISION_EVALUACION_ASESOR_FINALIZADA,
} from './codigos-error-evaluaciones';

function errorApi(errorCode: string, message = 'Mensaje del backend', status = 422) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('mensajeErrorOmitirEvaluacionesCualitativasAsesor', () => {
  it('traduce cada código 422 a su texto propio y cae al mensaje del backend en otro error', () => {
    // Act
    const mensaje = (err: unknown) => mensajeErrorOmitirEvaluacionesCualitativasAsesor(err);

    // Assert
    expect(
      mensaje(errorApi(EVALUACION_CUALITATIVA_ASESOR_OMISION_EVALUACION_ASESOR_FINALIZADA)),
    ).toBe('La evaluación ya fue finalizada; no se pueden omitir valoraciones.');
    expect(mensaje(errorApi(EVALUACION_CUALITATIVA_ASESOR_EVALUACIONES_NO_REGISTRADAS))).toBe(
      'Algunas valoraciones ya no existen. Actualizamos la lista.',
    );
    expect(mensaje(errorApi(EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA))).toBe(
      'Esta evaluación ya no está disponible.',
    );
    expect(mensaje(errorApi(EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR))).toBe(
      'Esta evaluación no está asignada a tu usuario.',
    );
    expect(mensaje(errorApi('OTRO_CODIGO', 'Falla del servidor', 500))).toBe('Falla del servidor');
    expect(mensaje(new Error('red'))).toBe('Inténtalo nuevamente.');
  });
});
