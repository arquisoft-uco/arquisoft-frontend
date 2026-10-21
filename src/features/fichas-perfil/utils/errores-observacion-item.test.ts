import { describe, it, expect } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import { mensajeErrorObservacionItem } from './errores-observacion-item';

describe('mensajeErrorObservacionItem', () => {
  it('traduce cada código 422 conocido y usa el respaldo ante un error sin código', () => {
    // Arrange
    const respaldo = 'Respaldo';

    // Act
    const cerrada = mensajeErrorObservacionItem(
      errorApi(422, { errorCode: 'REVISION_ITEM_CERRADA', message: 'x' }),
      respaldo,
    );
    const noExiste = mensajeErrorObservacionItem(
      errorApi(422, { errorCode: 'OBSERVACION_ITEM_NO_ENCONTRADA', message: 'x' }),
      respaldo,
    );
    const ajena = mensajeErrorObservacionItem(
      errorApi(422, { errorCode: 'FICHA_NO_PERTENECE_ASESOR', message: 'x' }),
      respaldo,
    );
    const sinCodigo = mensajeErrorObservacionItem(new Error('red'), respaldo);

    // Assert
    expect(cerrada).toBe('La revisión está cerrada y ya no admite cambios.');
    expect(noExiste).toBe('La observación ya no existe.');
    expect(ajena).toBe('Esta ficha no está asignada a ti.');
    expect(sinCodigo).toBe(respaldo);
  });
});
