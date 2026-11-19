import { describe, it, expect } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import { mensajeErrorCorrecciones } from './errores-correcciones-revision';

function mensaje(errorCode: string, status = 422) {
  return mensajeErrorCorrecciones(errorApi(status, { errorCode, message: 'x' }));
}

describe('mensajeErrorCorrecciones', () => {
  it('traduce cada código de dominio y usa el respaldo ante un error sin código', () => {
    // Act
    const resultados = [
      mensaje('REVISION_ITEM_NO_ENCONTRADA'),
      mensaje('FICHA_NO_PROPIETARIO', 403),
      mensaje('REVISION_ITEM_CERRADA'),
      mensaje('REVISION_ITEM_NO_EN_PROGRESO'),
      mensaje('REVISION_ITEM_SIN_OBSERVACIONES'),
      mensaje('REVISION_ITEM_CON_OBSERVACIONES_PENDIENTES'),
    ];
    const sinCodigo = mensajeErrorCorrecciones(new Error('red'));

    // Assert
    expect(resultados).toEqual([
      'La revisión ya no existe.',
      'Esta revisión no pertenece a tu ficha.',
      'La revisión está cerrada y ya no admite cambios.',
      'La revisión debe estar en progreso para enviar las correcciones.',
      'Tu asesor aún no dejó observaciones en esta revisión.',
      'Aún tienes observaciones pendientes: edita el ítem para atenderlas.',
    ]);
    expect(sinCodigo).toBe('No se pudieron enviar las correcciones.');
  });
});
