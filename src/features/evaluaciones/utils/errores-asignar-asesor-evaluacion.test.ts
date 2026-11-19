import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import {
  esAsesorNoEncontrado,
  mensajeErrorAsignarAsesorEvaluacion,
} from './errores-asignar-asesor-evaluacion';

function errorApi(errorCode: string, message: string, status = 422) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('errores de asignar asesor a la evaluación', () => {
  it('traduce los cuatro códigos del backend y cae al mensaje del servidor con otro código', () => {
    // Act / Assert
    expect(mensajeErrorAsignarAsesorEvaluacion(errorApi('EVALUACION_NO_ENCONTRADA', 'x'))).toBe(
      'La evaluación ya no existe.',
    );
    expect(mensajeErrorAsignarAsesorEvaluacion(errorApi('ASESOR_NO_ENCONTRADO', 'x'))).toBe(
      'El asesor elegido ya no está vigente. Elige otro.',
    );
    expect(
      mensajeErrorAsignarAsesorEvaluacion(errorApi('EVALUACION_ASIGNACION_FINALIZADA', 'x')),
    ).toBe('La evaluación está finalizada y su asesor ya no puede cambiarse.');
    expect(
      mensajeErrorAsignarAsesorEvaluacion(errorApi('EVALUACION_ASESOR_CON_EVALUACIONES', 'x')),
    ).toBe(
      'El asesor actual ya registró evaluaciones, por eso esta evaluación no puede cambiarse de asesor.',
    );
    expect(
      mensajeErrorAsignarAsesorEvaluacion(errorApi('OTRO_CODIGO', 'Mensaje del backend', 400)),
    ).toBe('Mensaje del backend');
  });

  it('esAsesorNoEncontrado solo es verdadero para ASESOR_NO_ENCONTRADO', () => {
    // Act / Assert
    expect(esAsesorNoEncontrado(errorApi('ASESOR_NO_ENCONTRADO', 'x'))).toBe(true);
    expect(esAsesorNoEncontrado(errorApi('EVALUACION_NO_ENCONTRADA', 'x'))).toBe(false);
    expect(esAsesorNoEncontrado(new Error('red'))).toBe(false);
  });
});
