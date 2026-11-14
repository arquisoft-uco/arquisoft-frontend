import { describe, it, expect } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import {
  ARTEFACTO_ASESOR_NO_PROPIETARIO,
  REVISION_ABIERTA_EXISTENTE,
  REVISION_VERSION_ANTERIOR_NO_RESUELTA,
  VERSION_NO_ENCONTRADA,
  VERSION_NO_ES_ULTIMA,
  mensajeDeErrorRegistrarRevision,
  revisionYaNoRegistrable,
} from './errores-registrar-revision';

function porCodigo(errorCode: string) {
  return errorApi(422, { status: 422, errorCode, message: 'del backend' });
}

describe('mensajeDeErrorRegistrarRevision', () => {
  it('traduce cada código de dato desactualizado y deja pasar el mensaje del servidor o el respaldo', () => {
    // Act
    const mensajes = [
      VERSION_NO_ENCONTRADA,
      'ARTEFACTOS_ARTEFACTO_NO_ENCONTRADO',
      ARTEFACTO_ASESOR_NO_PROPIETARIO,
      'ARTEFACTOS_ARTEFACTO_OMITIDO',
      VERSION_NO_ES_ULTIMA,
      REVISION_ABIERTA_EXISTENTE,
      REVISION_VERSION_ANTERIOR_NO_RESUELTA,
    ].map((codigo) => mensajeDeErrorRegistrarRevision(porCodigo(codigo)));

    // Assert
    expect(mensajes).toEqual([
      'La versión ya no existe.',
      'El artefacto ya no existe.',
      'Ya no eres el asesor responsable de este artefacto.',
      'El artefacto está omitido y no admite revisiones.',
      'Hay una versión más reciente: registra la revisión sobre ella.',
      'Esta versión ya tiene una revisión sin cerrar.',
      'La revisión de la versión anterior aún no está resuelta: podrás registrar esta cuando el estudiante la resuelva.',
    ]);
    expect(mensajeDeErrorRegistrarRevision(porCodigo('OTRO'))).toBe('del backend');
    expect(mensajeDeErrorRegistrarRevision(new Error('Network Error'))).toBe(
      'Inténtalo nuevamente.',
    );
  });
});

describe('revisionYaNoRegistrable', () => {
  it('es verdadero para los códigos de dato desactualizado y falso para cualquier otro', () => {
    // Assert
    expect(revisionYaNoRegistrable(porCodigo(VERSION_NO_ES_ULTIMA))).toBe(true);
    expect(revisionYaNoRegistrable(porCodigo(REVISION_ABIERTA_EXISTENTE))).toBe(true);
    expect(revisionYaNoRegistrable(porCodigo(REVISION_VERSION_ANTERIOR_NO_RESUELTA))).toBe(true);
    expect(revisionYaNoRegistrable(porCodigo('OTRO'))).toBe(false);
    expect(revisionYaNoRegistrable(new Error('fallo'))).toBe(false);
  });
});
