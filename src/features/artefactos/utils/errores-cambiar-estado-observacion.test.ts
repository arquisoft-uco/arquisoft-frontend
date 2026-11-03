import { describe, it, expect } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import {
  OBSERVACION_NO_SOLUCIONADA,
  decisionObservacionYaNoAplica,
  mensajeDeErrorCambiarEstadoObservacion,
} from './errores-cambiar-estado-observacion';

function porCodigo(errorCode: string) {
  return errorApi(422, { status: 422, errorCode, message: 'del backend' });
}

describe('errores-cambiar-estado-observacion', () => {
  it('traduce los códigos, deja pasar el mensaje del servidor y el predicado separa el duplicado', () => {
    // Assert
    expect(mensajeDeErrorCambiarEstadoObservacion(porCodigo(OBSERVACION_NO_SOLUCIONADA))).toBe(
      'La observación ya no está en estado solucionada.',
    );
    expect(
      mensajeDeErrorCambiarEstadoObservacion(
        porCodigo('REVISION_ASESOR_VERSION_SIGUIENTE_ENVIADA'),
      ),
    ).toContain('ya se envió');
    expect(mensajeDeErrorCambiarEstadoObservacion(porCodigo('OBSERVACION_DUPLICADA'))).toContain(
      'Ya existe una observación',
    );
    expect(mensajeDeErrorCambiarEstadoObservacion(porCodigo('OTRO'))).toBe('del backend');
    expect(mensajeDeErrorCambiarEstadoObservacion(new Error('Network Error'))).toBe(
      'Inténtalo nuevamente.',
    );
    expect(decisionObservacionYaNoAplica(porCodigo(OBSERVACION_NO_SOLUCIONADA))).toBe(true);
    expect(decisionObservacionYaNoAplica(porCodigo('OBSERVACION_DUPLICADA'))).toBe(false);
    expect(decisionObservacionYaNoAplica(new Error('fallo'))).toBe(false);
  });
});
