import { describe, it, expect } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import {
  ARTEFACTO_ESTUDIANTE_NO_PROPIETARIO,
  OBSERVACION_NO_EDITABLE_ESTUDIANTE,
  REVISION_NO_ADMITE_AVANCE,
  avanceObservacionYaNoAplica,
  mensajeErrorAvanceObservacion,
} from './errores-avance-observacion';

function porCodigo(errorCode: string) {
  return errorApi(422, { status: 422, errorCode, message: 'del backend' });
}

describe('errores-avance-observacion', () => {
  it('traduce los códigos que ya no aplican, y el resto usa el mensaje del servidor o el respaldo', () => {
    // Assert
    expect(
      mensajeErrorAvanceObservacion(porCodigo(OBSERVACION_NO_EDITABLE_ESTUDIANTE), 'R'),
    ).toContain('ya cerró o reabrió');
    expect(mensajeErrorAvanceObservacion(porCodigo(REVISION_NO_ADMITE_AVANCE), 'R')).toContain(
      'ya no está en progreso',
    );
    expect(mensajeErrorAvanceObservacion(porCodigo(ARTEFACTO_ESTUDIANTE_NO_PROPIETARIO), 'R')).toBe(
      'No estás vinculado a este artefacto',
    );
    expect(mensajeErrorAvanceObservacion(porCodigo('OTRO'), 'R')).toBe('del backend');
    expect(mensajeErrorAvanceObservacion(new Error('red'), 'R')).toBe('R');
  });

  it('el predicado distingue los códigos que invalidan de los que no', () => {
    // Assert
    expect(avanceObservacionYaNoAplica(porCodigo(REVISION_NO_ADMITE_AVANCE))).toBe(true);
    expect(avanceObservacionYaNoAplica(porCodigo(OBSERVACION_NO_EDITABLE_ESTUDIANTE))).toBe(true);
    expect(avanceObservacionYaNoAplica(porCodigo('OTRO'))).toBe(false);
    expect(avanceObservacionYaNoAplica(new Error('fallo'))).toBe(false);
  });
});
