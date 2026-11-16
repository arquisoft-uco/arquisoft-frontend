import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { mensajeErrorRegistroEvaluacionesCuantitativasAsesor } from './errores-registro-evaluaciones-cuantitativas-asesor';

const ID_CLARIDAD = '11111111-1111-4111-8111-111111111111';
const ID_ORDEN = '22222222-2222-4222-8222-222222222222';
const ID_AJENO = '33333333-3333-4333-8333-333333333333';

const NOMBRES = new Map([
  [ID_CLARIDAD, 'Claridad'],
  [ID_ORDEN, 'Orden'],
]);

function errorApi(errorCode: string, message = 'Mensaje del backend') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

const mensaje = (codigo: string, texto?: string) =>
  mensajeErrorRegistroEvaluacionesCuantitativasAsesor(errorApi(codigo, texto), NOMBRES);

describe('mensajeErrorRegistroEvaluacionesCuantitativasAsesor', () => {
  it('traduce cada código 422 sin detalle a su texto propio', () => {
    // Assert
    expect(mensaje('EVALUACION_CUANTITATIVA_ASESOR_ITEMS_NO_ENCONTRADOS')).toBe(
      'Alguno de los ítems elegidos ya no está disponible. Quítalo e inténtalo de nuevo.',
    );
    expect(mensaje('EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA')).toBe(
      'Esta evaluación ya no está disponible.',
    );
    expect(mensaje('EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR')).toBe(
      'Esta evaluación ya no está disponible.',
    );
    expect(mensaje('EVALUACION_ESTADO_FINALIZADA')).toBe(
      'La evaluación está finalizada y no admite nuevas valoraciones.',
    );
    expect(mensaje('REGISTRO_EVALUACIONES_CUANTITATIVAS_ASESOR_ITEMS_REPETIDOS')).toBe(
      'Hay un ítem repetido en la lista. Quita el duplicado e inténtalo de nuevo.',
    );
  });

  it('en YA_REGISTRADOS y PUNTAJES_EXCEDEN sustituye UUID por nombres y cae al genérico sin coincidencias', () => {
    // Act
    const yaConNombres = mensaje(
      'EVALUACION_CUANTITATIVA_ASESOR_ITEMS_YA_REGISTRADOS',
      `Items: [${ID_CLARIDAD}, ${ID_ORDEN}]`,
    );
    const yaSinNombres = mensaje(
      'EVALUACION_CUANTITATIVA_ASESOR_ITEMS_YA_REGISTRADOS',
      `Items: [${ID_AJENO}]`,
    );
    const excedeConNombres = mensaje(
      'EVALUACION_CUANTITATIVA_ASESOR_PUNTAJES_EXCEDEN_VALOR_ITEM',
      `Items: [${ID_ORDEN}]`,
    );
    const excedeSinNombres = mensaje(
      'EVALUACION_CUANTITATIVA_ASESOR_PUNTAJES_EXCEDEN_VALOR_ITEM',
      `Items: [${ID_AJENO}]`,
    );

    // Assert
    expect(yaConNombres).toBe(
      'Ya registraste un puntaje para: Claridad, Orden. Quítalos de la lista e inténtalo de nuevo.',
    );
    expect(yaConNombres).not.toContain(ID_CLARIDAD);
    expect(yaSinNombres).toBe(
      'Ya registraste un puntaje para alguno de los ítems de la lista. Quítalos e inténtalo de nuevo.',
    );
    expect(excedeConNombres).toBe(
      'El puntaje de Orden supera el máximo del ítem. Corrígelo e inténtalo de nuevo.',
    );
    expect(excedeSinNombres).toBe(
      'Alguno de los puntajes supera el máximo de su ítem. Corrígelo e inténtalo de nuevo.',
    );
  });

  it('con un código desconocido usa el mensaje del backend', () => {
    // Assert
    expect(mensaje('OTRO', 'Fallo conocido')).toBe('Fallo conocido');
  });
});
