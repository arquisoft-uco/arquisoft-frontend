import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { mensajeErrorRemoverJurado } from './errores-remover-jurado-evaluacion';

function errorApi(errorCode: string, message = 'Mensaje del backend') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('mensajeErrorRemoverJurado', () => {
  it('traduce cada código con el nombre del jurado y el resto al mensaje del backend o al respaldo', () => {
    // Act
    const noExiste = mensajeErrorRemoverJurado(errorApi('EVALUACION_NO_ENCONTRADA'), 'Ana');
    const finalizada = mensajeErrorRemoverJurado(
      errorApi('EVALUACION_ASIGNACION_FINALIZADA'),
      'Ana',
    );
    const noAsignado = mensajeErrorRemoverJurado(
      errorApi('EVALUACION_JURADO_JURADOS_NO_ASIGNADOS'),
      'Ana',
    );
    const conEvaluaciones = mensajeErrorRemoverJurado(
      errorApi('EVALUACION_JURADO_JURADOS_EVALUADOS'),
      'Ana',
    );
    const otro = mensajeErrorRemoverJurado(errorApi('OTRO', 'Texto del backend'), 'Ana');
    const sinRespuesta = mensajeErrorRemoverJurado(new Error('red'), 'Ana');

    // Assert
    expect(noExiste).toBe('La evaluación ya no existe.');
    expect(finalizada).toBe('La evaluación está finalizada y no admite cambios de jurados.');
    expect(noAsignado).toBe('Ana ya no está asignado a esta evaluación.');
    expect(conEvaluaciones).toBe(
      'No se puede remover a Ana porque ya completó su evaluación y no puede retirarse.',
    );
    expect(otro).toBe('Texto del backend');
    expect(sinRespuesta).toBe('Inténtalo nuevamente.');
  });
});
