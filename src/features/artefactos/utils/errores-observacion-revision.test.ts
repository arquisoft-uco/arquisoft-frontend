import { describe, it, expect } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import {
  OBSERVACION_DUPLICADA,
  OBSERVACION_NO_ENCONTRADA,
  REVISION_NO_ADMITE_ELIMINAR_OBSERVACIONES,
  REVISION_NO_ADMITE_OBSERVACIONES,
  REVISION_NO_ENCONTRADA,
  mensajeDeErrorObservacion,
  observacionYaNoGestionable,
} from './errores-observacion-revision';

function porCodigo(errorCode: string) {
  return errorApi(422, { status: 422, errorCode, message: 'del backend' });
}

describe('mensajeDeErrorObservacion', () => {
  it('traduce cada código conocido y deja pasar el mensaje del servidor o el respaldo', () => {
    // Act
    const mensajes = [
      REVISION_NO_ENCONTRADA,
      'ARTEFACTOS_ARTEFACTO_NO_ENCONTRADO',
      'ARTEFACTOS_ARTEFACTO_ASESOR_NO_PROPIETARIO',
      'ARTEFACTOS_ARTEFACTO_OMITIDO',
      REVISION_NO_ADMITE_OBSERVACIONES,
      REVISION_NO_ADMITE_ELIMINAR_OBSERVACIONES,
      OBSERVACION_DUPLICADA,
      OBSERVACION_NO_ENCONTRADA,
    ].map((codigo) => mensajeDeErrorObservacion(porCodigo(codigo), 'respaldo'));

    // Assert
    expect(mensajes).toEqual([
      'La revisión ya no existe.',
      'El artefacto ya no existe.',
      'Ya no eres el asesor responsable de este artefacto.',
      'El artefacto está omitido y no admite cambios.',
      'La revisión ya no está pendiente: no admite más observaciones.',
      'La revisión ya no está pendiente: sus observaciones no se pueden eliminar.',
      'Ya existe una observación con esta descripción en la revisión.',
      'La observación ya no existe.',
    ]);
    expect(mensajeDeErrorObservacion(porCodigo('OTRO'), 'respaldo')).toBe('del backend');
    expect(mensajeDeErrorObservacion(new Error('Network Error'), 'respaldo')).toBe('respaldo');
  });
});

describe('observacionYaNoGestionable', () => {
  it('es verdadero cuando la revisión o el artefacto cambiaron y falso para duplicada, inexistente u otro', () => {
    // Assert
    expect(observacionYaNoGestionable(porCodigo(REVISION_NO_ADMITE_OBSERVACIONES))).toBe(true);
    expect(observacionYaNoGestionable(porCodigo(REVISION_NO_ADMITE_ELIMINAR_OBSERVACIONES))).toBe(
      true,
    );
    expect(observacionYaNoGestionable(porCodigo('ARTEFACTOS_ARTEFACTO_OMITIDO'))).toBe(true);
    expect(observacionYaNoGestionable(porCodigo(OBSERVACION_DUPLICADA))).toBe(false);
    expect(observacionYaNoGestionable(porCodigo(OBSERVACION_NO_ENCONTRADA))).toBe(false);
    expect(observacionYaNoGestionable(new Error('fallo'))).toBe(false);
  });
});
