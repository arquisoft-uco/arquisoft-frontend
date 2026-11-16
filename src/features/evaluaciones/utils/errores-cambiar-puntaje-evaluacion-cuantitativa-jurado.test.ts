import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import {
  cierraPanelCambiarPuntajeEvaluacionCuantitativaJurado,
  mensajeErrorCambiarPuntajeEvaluacionCuantitativaJurado,
} from './errores-cambiar-puntaje-evaluacion-cuantitativa-jurado';

function errorApi(errorCode: string, message = 'Mensaje del backend', status = 422) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('errores de cambiar el puntaje de la evaluación cuantitativa', () => {
  it('traduce cada código 422 a su texto y cae al mensaje del backend en otro error', () => {
    // Act
    const mensaje = (err: unknown) => mensajeErrorCambiarPuntajeEvaluacionCuantitativaJurado(err);

    // Assert
    expect(mensaje(errorApi('EVALUACION_CUANTITATIVA_JURADO_NO_ENCONTRADA'))).toBe(
      'La valoración ya no existe. Actualiza la lista.',
    );
    expect(mensaje(errorApi('EVALUACION_CUANTITATIVA_JURADO_NO_PERTENECE_JURADO'))).toBe(
      'Esta valoración no está asignada a tu usuario.',
    );
    expect(mensaje(errorApi('EVALUACION_CUANTITATIVA_JURADO_EVALUACION_FINALIZADA'))).toBe(
      'La evaluación ya está finalizada; no se puede cambiar el puntaje.',
    );
    expect(mensaje(errorApi('EVALUACION_CUANTITATIVA_JURADO_PUNTAJE_EXCEDE_VALOR_ITEM'))).toBe(
      'El puntaje supera el máximo del ítem.',
    );
    expect(mensaje(errorApi('OTRO_CODIGO', 'De otro'))).toBe('De otro');
    expect(mensaje(new Error('red'))).toBe('Inténtalo nuevamente.');
  });

  it('cierra el panel con valoración inexistente, ajena o evaluación finalizada, y no con el tope', () => {
    // Act
    const cierra = cierraPanelCambiarPuntajeEvaluacionCuantitativaJurado;

    // Assert
    expect(cierra(errorApi('EVALUACION_CUANTITATIVA_JURADO_NO_ENCONTRADA'))).toBe(true);
    expect(cierra(errorApi('EVALUACION_CUANTITATIVA_JURADO_NO_PERTENECE_JURADO'))).toBe(true);
    expect(cierra(errorApi('EVALUACION_CUANTITATIVA_JURADO_EVALUACION_FINALIZADA'))).toBe(true);
    expect(cierra(errorApi('EVALUACION_CUANTITATIVA_JURADO_PUNTAJE_EXCEDE_VALOR_ITEM'))).toBe(
      false,
    );
    expect(cierra(new Error('red'))).toBe(false);
  });
});
