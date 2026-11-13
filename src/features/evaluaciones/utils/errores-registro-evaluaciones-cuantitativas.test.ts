import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import {
  mensajeErrorRegistroEvaluacionesCuantitativas,
  mensajeExitoRegistroEvaluacionesCuantitativas,
  mensajeObservacionesFaltantes,
} from './errores-registro-evaluaciones-cuantitativas';

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

describe('mensajeErrorRegistroEvaluacionesCuantitativas', () => {
  it('traduce cada código 422 sin nombres a su texto propio', () => {
    // Act
    const mensaje = (codigo: string) =>
      mensajeErrorRegistroEvaluacionesCuantitativas(errorApi(codigo), NOMBRES);

    // Assert
    expect(mensaje('EVALUACION_CUANTITATIVA_JURADO_ITEMS_NO_ENCONTRADOS')).toBe(
      'Alguno de los ítems elegidos ya no está disponible. Quítalo e inténtalo de nuevo.',
    );
    expect(mensaje('EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA')).toBe(
      'Esta evaluación ya no está disponible.',
    );
    expect(mensaje('EVALUACION_CUALITATIVA_JURADO_NO_PERTENECE_JURADO')).toBe(
      'Esta evaluación ya no está disponible.',
    );
    expect(mensaje('EVALUACION_ESTADO_FINALIZADA')).toBe(
      'La evaluación está finalizada y no admite nuevas valoraciones.',
    );
    expect(mensaje('REGISTRO_EVALUACIONES_CUANTITATIVAS_JURADO_ITEMS_REPETIDOS')).toBe(
      'Hay un ítem repetido en la lista. Quita el duplicado e inténtalo de nuevo.',
    );
  });

  it('en ITEMS_YA_REGISTRADOS y PUNTAJES_EXCEDEN sustituye los UUID por nombres y cae al texto genérico sin coincidencias', () => {
    // Arrange
    const conCodigo = (codigo: string, msg: string) =>
      mensajeErrorRegistroEvaluacionesCuantitativas(errorApi(codigo, msg), NOMBRES);
    const YA = 'EVALUACION_CUANTITATIVA_JURADO_ITEMS_YA_REGISTRADOS';
    const EXCEDEN = 'EVALUACION_CUANTITATIVA_JURADO_PUNTAJES_EXCEDEN_VALOR_ITEM';

    // Act
    const yaConNombres = conCodigo(YA, `Items: [${ID_CLARIDAD}, ${ID_ORDEN}]`);
    const yaSinNombres = conCodigo(YA, `Items: [${ID_AJENO}]`);
    const excedenConNombres = conCodigo(EXCEDEN, `Items: [${ID_ORDEN}]`);
    const excedenSinNombres = conCodigo(EXCEDEN, `Items: [${ID_AJENO}]`);

    // Assert
    expect(yaConNombres).toBe(
      'Ya registraste un puntaje para: Claridad, Orden. Quítalos de la lista e inténtalo de nuevo.',
    );
    expect(yaConNombres).not.toContain(ID_CLARIDAD);
    expect(yaSinNombres).toBe(
      'Ya registraste un puntaje para alguno de los ítems de la lista. Quítalos e inténtalo de nuevo.',
    );
    expect(excedenConNombres).toBe(
      'El puntaje de Orden supera el máximo del ítem. Corrígelo e inténtalo de nuevo.',
    );
    expect(excedenSinNombres).toBe(
      'Alguno de los puntajes supera el máximo de su ítem. Corrígelo e inténtalo de nuevo.',
    );
  });

  it('con un código desconocido usa el mensaje del backend', () => {
    // Act
    const texto = mensajeErrorRegistroEvaluacionesCuantitativas(
      errorApi('OTRO', 'Fallo conocido'),
      NOMBRES,
    );

    // Assert
    expect(texto).toBe('Fallo conocido');
  });
});

describe('mensajes de éxito y de observaciones faltantes', () => {
  it('concuerdan singular y plural y omiten la parte que vale cero', () => {
    // Assert
    expect(mensajeExitoRegistroEvaluacionesCuantitativas(2, 0, 'Proyecto X')).toBe(
      'Se registraron 2 valoraciones de Proyecto X.',
    );
    expect(mensajeExitoRegistroEvaluacionesCuantitativas(1, 1, 'Proyecto X')).toBe(
      'Se registraron 1 valoración y 1 observación de Proyecto X.',
    );
    expect(mensajeExitoRegistroEvaluacionesCuantitativas(0, 3, 'Proyecto X')).toBe(
      'Se registraron 3 observaciones de Proyecto X.',
    );
    expect(mensajeObservacionesFaltantes(1)).toBe(
      'Se registró la evaluación, pero 1 observación no se guardó.',
    );
    expect(mensajeObservacionesFaltantes(2)).toBe(
      'Se registró la evaluación, pero 2 observaciones no se guardaron.',
    );
  });
});
