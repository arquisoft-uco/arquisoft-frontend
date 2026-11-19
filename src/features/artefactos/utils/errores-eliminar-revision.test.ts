import { describe, it, expect } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import {
  REVISION_NO_ELIMINABLE,
  mensajeDeErrorEliminarRevision,
  revisionYaNoEliminable,
} from './errores-eliminar-revision';

function porCodigo(errorCode: string) {
  return errorApi(422, { status: 422, errorCode, message: 'del backend' });
}

describe('errores-eliminar-revision', () => {
  it('traduce cada código, deja pasar el mensaje del servidor o el respaldo y el predicado distingue', () => {
    // Act
    const mensajes = [
      'REVISION_ASESOR_NO_ENCONTRADA',
      'ARTEFACTOS_ARTEFACTO_NO_ENCONTRADO',
      'ARTEFACTOS_ARTEFACTO_ASESOR_NO_PROPIETARIO',
      'ARTEFACTOS_ARTEFACTO_OMITIDO',
      REVISION_NO_ELIMINABLE,
    ].map((codigo) => mensajeDeErrorEliminarRevision(porCodigo(codigo)));

    // Assert
    expect(mensajes).toEqual([
      'La revisión ya no existe.',
      'El artefacto ya no existe.',
      'Ya no eres el asesor responsable de este artefacto.',
      'El artefacto está omitido y no admite cambios.',
      'Solo se puede eliminar una revisión que aún no se ha enviado al estudiante.',
    ]);
    expect(mensajeDeErrorEliminarRevision(porCodigo('OTRO'))).toBe('del backend');
    expect(mensajeDeErrorEliminarRevision(new Error('Network Error'))).toBe(
      'Inténtalo nuevamente.',
    );
    expect(revisionYaNoEliminable(porCodigo(REVISION_NO_ELIMINABLE))).toBe(true);
    expect(revisionYaNoEliminable(porCodigo('ARTEFACTOS_ARTEFACTO_OMITIDO'))).toBe(true);
    expect(revisionYaNoEliminable(porCodigo('OTRO'))).toBe(false);
    expect(revisionYaNoEliminable(new Error('fallo'))).toBe(false);
  });
});
