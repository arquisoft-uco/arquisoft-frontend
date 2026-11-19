import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import {
  cierraPanelCambiarCriterioEvaluacionCualitativaJurado,
  mensajeErrorCambiarCriterioEvaluacionCualitativaJurado,
} from './errores-cambiar-criterio-evaluacion-cualitativa-jurado';

function errorApi(errorCode: string, message = 'Mensaje del backend', status = 422) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('errores de cambiar criterio de la evaluación cualitativa', () => {
  it('traduce cada código 422 a su texto y cae al mensaje del backend en otro error', () => {
    // Act
    const mensaje = (err: unknown) => mensajeErrorCambiarCriterioEvaluacionCualitativaJurado(err);

    // Assert
    expect(mensaje(errorApi('EVALUACION_CUALITATIVA_JURADO_NO_ENCONTRADA'))).toBe(
      'La valoración ya no existe. Actualiza la lista.',
    );
    expect(mensaje(errorApi('EVALUACION_CUALITATIVA_JURADO_CRITERIOS_NO_ENCONTRADOS'))).toBe(
      'El criterio elegido ya no existe. Elige otro.',
    );
    expect(
      mensaje(
        errorApi('EVALUACION_CUALITATIVA_JURADO_CAMBIO_CRITERIO_EVALUACION_JURADO_FINALIZADA'),
      ),
    ).toBe('La evaluación ya está finalizada; no se puede cambiar el criterio.');
    expect(mensaje(errorApi('EVALUACION_CUALITATIVA_JURADO_CRITERIO_SIN_CAMBIO'))).toBe(
      'El criterio elegido ya es el actual.',
    );
    expect(mensaje(errorApi('EVALUACION_CUALITATIVA_JURADO_NO_PERTENECE_JURADO', 'De otro'))).toBe(
      'De otro',
    );
    expect(mensaje(new Error('red'))).toBe('Inténtalo nuevamente.');
  });

  it('cierra el panel solo con evaluación inexistente o finalizada', () => {
    // Act
    const cierra = cierraPanelCambiarCriterioEvaluacionCualitativaJurado;

    // Assert
    expect(cierra(errorApi('EVALUACION_CUALITATIVA_JURADO_NO_ENCONTRADA'))).toBe(true);
    expect(
      cierra(
        errorApi('EVALUACION_CUALITATIVA_JURADO_CAMBIO_CRITERIO_EVALUACION_JURADO_FINALIZADA'),
      ),
    ).toBe(true);
    expect(cierra(errorApi('EVALUACION_CUALITATIVA_JURADO_CRITERIO_SIN_CAMBIO'))).toBe(false);
    expect(cierra(errorApi('EVALUACION_CUALITATIVA_JURADO_CRITERIOS_NO_ENCONTRADOS'))).toBe(false);
  });
});
