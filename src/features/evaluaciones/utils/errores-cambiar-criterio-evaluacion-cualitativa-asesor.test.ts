import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import {
  cierraPanelCambiarCriterioEvaluacionCualitativaAsesor,
  mensajeErrorCambiarCriterioEvaluacionCualitativaAsesor,
} from './errores-cambiar-criterio-evaluacion-cualitativa-asesor';

const NO_ENCONTRADA = 'EVALUACION_CUALITATIVA_ASESOR_EVALUACION_CUALITATIVA_NO_ENCONTRADA';
const CRITERIOS = 'EVALUACION_CUALITATIVA_ASESOR_CRITERIOS_NO_ENCONTRADOS';
const FINALIZADA = 'EVALUACION_CUALITATIVA_ASESOR_CAMBIO_CRITERIO_EVALUACION_ASESOR_FINALIZADA';
const NO_PERTENECE = 'EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR';

function errorApi(errorCode: string, message = 'Mensaje del backend', status = 422) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('errores de cambiar criterio de la evaluación cualitativa del asesor', () => {
  it('traduce cada código 422 a su texto y cae al mensaje del backend en otro error', () => {
    // Act
    const mensaje = (err: unknown) => mensajeErrorCambiarCriterioEvaluacionCualitativaAsesor(err);

    // Assert
    expect(mensaje(errorApi(NO_ENCONTRADA))).toBe(
      'La valoración ya no existe. Actualiza la lista.',
    );
    expect(mensaje(errorApi(CRITERIOS))).toBe('El criterio elegido ya no existe. Elige otro.');
    expect(mensaje(errorApi(FINALIZADA))).toBe(
      'La evaluación ya está finalizada; no se puede cambiar el criterio.',
    );
    expect(mensaje(errorApi(NO_PERTENECE, 'De otro'))).toBe('De otro');
    expect(mensaje(new Error('red'))).toBe('Inténtalo nuevamente.');
  });

  it('cierra el panel solo con evaluación inexistente o finalizada', () => {
    // Act
    const cierra = cierraPanelCambiarCriterioEvaluacionCualitativaAsesor;

    // Assert
    expect(cierra(errorApi(NO_ENCONTRADA))).toBe(true);
    expect(cierra(errorApi(FINALIZADA))).toBe(true);
    expect(cierra(errorApi(CRITERIOS))).toBe(false);
    expect(cierra(errorApi(NO_PERTENECE))).toBe(false);
  });
});
