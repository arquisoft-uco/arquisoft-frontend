import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { mensajeErrorRegistroEvaluacionesCualitativas } from './errores-registro-evaluaciones-cualitativas';

const ID_CLARIDAD = '11111111-1111-4111-8111-111111111111';
const ID_ORDEN = '22222222-2222-4222-8222-222222222222';
const ID_AJENO = '33333333-3333-4333-8333-333333333333';

const NOMBRES = new Map([
  [ID_CLARIDAD, 'Claridad'],
  [ID_ORDEN, 'Orden'],
]);

function errorApi(errorCode: string, message = 'Mensaje del backend', status = 422) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('mensajeErrorRegistroEvaluacionesCualitativas', () => {
  it('traduce cada código 422 a su texto propio', () => {
    // Act
    const mensaje = (codigo: string) =>
      mensajeErrorRegistroEvaluacionesCualitativas(errorApi(codigo), NOMBRES);

    // Assert
    expect(mensaje('EVALUACION_CUALITATIVA_JURADO_ITEMS_NO_ENCONTRADOS')).toBe(
      'Alguno de los ítems elegidos ya no está disponible. Quítalo e inténtalo de nuevo.',
    );
    expect(mensaje('EVALUACION_CUALITATIVA_JURADO_CRITERIOS_NO_ENCONTRADOS')).toBe(
      'Alguno de los criterios elegidos ya no está disponible. Elige otro e inténtalo de nuevo.',
    );
    expect(mensaje('EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA')).toBe(
      'Esta evaluación ya no está disponible.',
    );
    expect(mensaje('EVALUACION_ESTADO_FINALIZADA')).toBe(
      'La evaluación está finalizada y no admite nuevas valoraciones.',
    );
    expect(mensaje('REGISTRO_EVALUACIONES_CUALITATIVAS_ITEMS_REPETIDOS')).toBe(
      'Hay un ítem repetido en la lista. Quita el duplicado e inténtalo de nuevo.',
    );
  });

  it('en ITEMS_YA_REGISTRADOS sustituye los UUID por nombres y cae al texto genérico si no reconoce ninguno', () => {
    // Arrange
    const yaRegistrados = (msg: string) =>
      errorApi('EVALUACION_CUALITATIVA_JURADO_ITEMS_YA_REGISTRADOS', msg);

    // Act
    const conNombres = mensajeErrorRegistroEvaluacionesCualitativas(
      yaRegistrados(`Items: [${ID_CLARIDAD}, ${ID_ORDEN}]`),
      NOMBRES,
    );
    const sinNombres = mensajeErrorRegistroEvaluacionesCualitativas(
      yaRegistrados(`Items: [${ID_AJENO}]`),
      NOMBRES,
    );

    // Assert
    expect(conNombres).toBe(
      'Ya registraste una valoración para: Claridad, Orden. Quítalos de la lista e inténtalo de nuevo.',
    );
    expect(conNombres).not.toContain(ID_CLARIDAD);
    expect(sinNombres).toBe(
      'Ya registraste una valoración para alguno de los ítems de la lista. Quítalos e inténtalo de nuevo.',
    );
  });

  it('con un código desconocido usa el mensaje del backend', () => {
    // Act
    const texto = mensajeErrorRegistroEvaluacionesCualitativas(
      errorApi('OTRO', 'Fallo conocido'),
      NOMBRES,
    );

    // Assert
    expect(texto).toBe('Fallo conocido');
  });
});
