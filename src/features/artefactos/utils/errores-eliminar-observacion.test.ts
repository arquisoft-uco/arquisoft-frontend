import { describe, it, expect } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import { mensajeErrorEliminarObservacion } from './errores-eliminar-observacion';

describe('mensajeErrorEliminarObservacion', () => {
  it('traduce cada código 422 conocido y usa el mensaje del servidor o el respaldo en el resto', () => {
    // Arrange
    const respaldo = 'Respaldo';

    // Act
    const enviada = mensajeErrorEliminarObservacion(
      errorApi(422, {
        errorCode: 'REVISION_ASESOR_NO_ADMITE_ELIMINAR_OBSERVACIONES',
        message: 'x',
      }),
      respaldo,
    );
    const noExiste = mensajeErrorEliminarObservacion(
      errorApi(422, { errorCode: 'OBSERVACION_NO_ENCONTRADA', message: 'x' }),
      respaldo,
    );
    const delServidor = mensajeErrorEliminarObservacion(
      errorApi(422, {
        errorCode: 'ARTEFACTOS_ARTEFACTO_ASESOR_NO_PROPIETARIO',
        message: 'Usted no es el asesor responsable del artefacto',
      }),
      respaldo,
    );
    const sinCodigo = mensajeErrorEliminarObservacion(new Error('red'), respaldo);

    // Assert
    expect(enviada).toBe(
      'Solo se pueden eliminar observaciones de una revisión que aún no se ha enviado al estudiante.',
    );
    expect(noExiste).toBe('La observación ya no existe.');
    expect(delServidor).toBe('Usted no es el asesor responsable del artefacto');
    expect(sinCodigo).toBe(respaldo);
  });
});
