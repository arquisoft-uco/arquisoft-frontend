import { describe, it, expect } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import {
  OBSERVACIONES_ANTERIOR_SIN_CERRAR,
  REVISION_CON_OBSERVACIONES,
  REVISION_NO_CERRABLE,
  cierreBloqueadoPorObservaciones,
  mensajeDeErrorCerrarRevision,
  revisionYaNoCerrable,
} from './errores-cerrar-revision';

function porCodigo(errorCode: string) {
  return errorApi(422, { status: 422, errorCode, message: 'del backend' });
}

describe('errores-cerrar-revision', () => {
  it('traduce cada código, deja pasar el mensaje del servidor o el respaldo y los predicados distinguen', () => {
    // Act
    const mensajes = [
      'REVISION_ASESOR_NO_ENCONTRADA',
      'ARTEFACTOS_ARTEFACTO_NO_ENCONTRADO',
      'VERSION_ARTEFACTO_NO_ENCONTRADA',
      'ARTEFACTOS_ARTEFACTO_ASESOR_NO_PROPIETARIO',
      'ARTEFACTOS_ARTEFACTO_OMITIDO',
      REVISION_NO_CERRABLE,
      REVISION_CON_OBSERVACIONES,
      OBSERVACIONES_ANTERIOR_SIN_CERRAR,
    ].map((codigo) => mensajeDeErrorCerrarRevision(porCodigo(codigo)));

    // Assert
    expect(mensajes).toEqual([
      'La revisión ya no existe.',
      'El artefacto ya no existe.',
      'La versión ya no existe.',
      'Ya no eres el asesor responsable de este artefacto.',
      'El artefacto está omitido y no admite cambios.',
      'Esta revisión ya no está pendiente: no se puede dar por completado.',
      'La revisión tiene observaciones. Elimínalas antes de darla por completada.',
      'Quedan observaciones de la versión anterior sin cerrar. Ciérralas antes de dar por completado.',
    ]);
    expect(mensajeDeErrorCerrarRevision(porCodigo('OTRO'))).toBe('del backend');
    expect(mensajeDeErrorCerrarRevision(new Error('Network Error'))).toBe('Inténtalo nuevamente.');
    expect(revisionYaNoCerrable(porCodigo(REVISION_NO_CERRABLE))).toBe(true);
    expect(revisionYaNoCerrable(porCodigo('ARTEFACTOS_ARTEFACTO_OMITIDO'))).toBe(true);
    expect(revisionYaNoCerrable(porCodigo(REVISION_CON_OBSERVACIONES))).toBe(false);
    expect(revisionYaNoCerrable(porCodigo(OBSERVACIONES_ANTERIOR_SIN_CERRAR))).toBe(false);
    expect(revisionYaNoCerrable(new Error('fallo'))).toBe(false);
    expect(cierreBloqueadoPorObservaciones(porCodigo(REVISION_CON_OBSERVACIONES))).toBe(true);
    expect(cierreBloqueadoPorObservaciones(porCodigo(OBSERVACIONES_ANTERIOR_SIN_CERRAR))).toBe(
      true,
    );
    expect(cierreBloqueadoPorObservaciones(porCodigo(REVISION_NO_CERRABLE))).toBe(false);
    expect(
      cierreBloqueadoPorObservaciones(porCodigo('REVISION_ASESOR_CON_OBSERVACIONES_ABIERTAS')),
    ).toBe(false);
  });
});
