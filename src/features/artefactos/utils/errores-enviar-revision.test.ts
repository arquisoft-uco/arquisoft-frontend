import { describe, it, expect } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import {
  REVISION_NO_ENVIABLE,
  mensajeDeErrorEnviarRevision,
  revisionYaNoEnviable,
} from './errores-enviar-revision';

function porCodigo(errorCode: string) {
  return errorApi(422, { status: 422, errorCode, message: 'del backend' });
}

describe('errores-enviar-revision', () => {
  it('traduce cada código, deja pasar el mensaje del servidor o el respaldo y el predicado distingue', () => {
    // Act
    const mensajes = [
      'REVISION_ASESOR_NO_ENCONTRADA',
      'ARTEFACTOS_ARTEFACTO_NO_ENCONTRADO',
      'VERSION_ARTEFACTO_NO_ENCONTRADA',
      'ARTEFACTOS_ARTEFACTO_ASESOR_NO_PROPIETARIO',
      'ARTEFACTOS_ARTEFACTO_OMITIDO',
      REVISION_NO_ENVIABLE,
    ].map((codigo) => mensajeDeErrorEnviarRevision(porCodigo(codigo)));

    // Assert
    expect(mensajes).toEqual([
      'La revisión ya no existe.',
      'El artefacto ya no existe.',
      'La versión ya no existe.',
      'Ya no eres el asesor responsable de este artefacto.',
      'El artefacto está omitido y no admite cambios.',
      'Esta revisión ya no está pendiente: ya se envió.',
    ]);
    expect(mensajeDeErrorEnviarRevision(porCodigo('OTRO'))).toBe('del backend');
    expect(mensajeDeErrorEnviarRevision(new Error('Network Error'))).toBe('Inténtalo nuevamente.');
    expect(revisionYaNoEnviable(porCodigo(REVISION_NO_ENVIABLE))).toBe(true);
    expect(revisionYaNoEnviable(porCodigo('OTRO'))).toBe(false);
    expect(revisionYaNoEnviable(new Error('fallo'))).toBe(false);
  });
});
