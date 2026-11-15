import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import {
  cierraPanelCambiarPuntajeEvaluacionCuantitativaAsesor,
  mensajeErrorCambiarPuntajeEvaluacionCuantitativaAsesor,
} from './errores-cambiar-puntaje-evaluacion-cuantitativa-asesor';

function errorApi(errorCode: string, message = 'Mensaje del backend', status = 422) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('errores de cambiar puntaje de la evaluación cuantitativa del asesor', () => {
  it('traduce cada código 422 a su texto y cae al mensaje del backend en otro error', () => {
    // Act
    const mensaje = mensajeErrorCambiarPuntajeEvaluacionCuantitativaAsesor;

    // Assert
    expect(mensaje(errorApi('EVALUACION_CUANTITATIVA_ASESOR_NO_ENCONTRADA'))).toBe(
      'La valoración ya no existe. Actualiza la lista.',
    );
    expect(mensaje(errorApi('EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR'))).toBe(
      'Esta evaluación no está asignada a tu usuario.',
    );
    expect(
      mensaje(errorApi('EVALUACION_CUANTITATIVA_ASESOR_CAMBIO_PUNTAJE_EVALUACION_FINALIZADA')),
    ).toBe('La evaluación ya está finalizada; no se puede cambiar el puntaje.');
    expect(
      mensaje(errorApi('EVALUACION_CUANTITATIVA_ASESOR_PUNTAJE_EXCEDE_VALOR_ITEM', 'Excede 100')),
    ).toBe('Excede 100');
    expect(mensaje(new Error('red'))).toBe('Inténtalo nuevamente.');
  });

  it('cierra el panel con inexistente, ajena o finalizada, y no con el exceso del ítem', () => {
    // Act
    const cierra = cierraPanelCambiarPuntajeEvaluacionCuantitativaAsesor;

    // Assert
    expect(cierra(errorApi('EVALUACION_CUANTITATIVA_ASESOR_NO_ENCONTRADA'))).toBe(true);
    expect(cierra(errorApi('EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR'))).toBe(true);
    expect(
      cierra(errorApi('EVALUACION_CUANTITATIVA_ASESOR_CAMBIO_PUNTAJE_EVALUACION_FINALIZADA')),
    ).toBe(true);
    expect(cierra(errorApi('EVALUACION_CUANTITATIVA_ASESOR_PUNTAJE_EXCEDE_VALOR_ITEM'))).toBe(
      false,
    );
  });
});
