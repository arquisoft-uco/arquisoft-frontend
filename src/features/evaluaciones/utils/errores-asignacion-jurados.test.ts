import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { mensajeErrorAsignacionJurados } from './errores-asignacion-jurados';

const ID_ANA = '11111111-1111-4111-8111-111111111111';
const ID_LUIS = '22222222-2222-4222-8222-222222222222';
const ID_AJENO = '33333333-3333-4333-8333-333333333333';

const NOMBRES = new Map([
  [ID_ANA, 'Ana Gómez'],
  [ID_LUIS, 'Luis Pérez'],
]);

function errorApi(errorCode: string, message: string, status = 422) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('mensajeErrorAsignacionJurados', () => {
  it('traduce los códigos de asignación y resuelve los UUID del mensaje a nombres', () => {
    // Arrange
    const yaAsignados = (msg: string) => errorApi('EVALUACION_JURADO_JURADOS_YA_ASIGNADOS', msg);

    // Act / Assert
    expect(
      mensajeErrorAsignacionJurados(yaAsignados(`Jurados: [${ID_ANA}, ${ID_LUIS}]`), NOMBRES),
    ).toBe(
      'Ya están asignados a esta evaluación: Ana Gómez, Luis Pérez. Quítalos de la selección e inténtalo de nuevo.',
    );
    expect(mensajeErrorAsignacionJurados(yaAsignados(`Jurados: [${ID_AJENO}]`), NOMBRES)).toBe(
      'Alguno de los jurados elegidos ya está asignado a esta evaluación.',
    );
    expect(
      mensajeErrorAsignacionJurados(yaAsignados(`Jurados: [${ID_AJENO}, ${ID_LUIS}]`), NOMBRES),
    ).toContain('Luis Pérez.');
    expect(
      mensajeErrorAsignacionJurados(
        errorApi('EVALUACION_JURADO_JURADOS_NO_ENCONTRADOS', `No existen: ${ID_ANA}`),
        NOMBRES,
      ),
    ).toBe('Algunos jurados ya no están disponibles: Ana Gómez. Quítalos e inténtalo de nuevo.');
    expect(
      mensajeErrorAsignacionJurados(errorApi('EVALUACION_ESTADO_FINALIZADA', 'x'), NOMBRES),
    ).toBe('La evaluación está finalizada y no admite nuevos jurados.');
    expect(mensajeErrorAsignacionJurados(errorApi('EVALUACION_NO_ENCONTRADA', 'x'), NOMBRES)).toBe(
      'La evaluación ya no existe.',
    );
    expect(
      mensajeErrorAsignacionJurados(errorApi('OTRO_CODIGO', 'Mensaje del backend', 400), NOMBRES),
    ).toBe('Mensaje del backend');
  });
});
