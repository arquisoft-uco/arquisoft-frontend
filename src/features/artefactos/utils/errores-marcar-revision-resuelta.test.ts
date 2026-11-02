import { describe, it, expect } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import {
  esConObservacionesAbiertas,
  esSinVersionPosterior,
  mensajeErrorMarcarRevisionResuelta,
} from './errores-marcar-revision-resuelta';

describe('errores de marcar revisión resuelta', () => {
  it('reconoce el código sin versión posterior y mapea su mensaje; el resto usa el del servidor o el respaldo', () => {
    // Arrange
    const sinPosterior = errorApi(422, {
      errorCode: 'REVISION_ASESOR_SIN_VERSION_POSTERIOR',
      message: 'x',
    });
    const cerrada = errorApi(422, {
      errorCode: 'REVISION_ASESOR_CERRADA',
      message: 'Está cerrada',
    });

    // Act / Assert
    expect(esSinVersionPosterior(sinPosterior)).toBe(true);
    expect(esSinVersionPosterior(cerrada)).toBe(false);
    expect(mensajeErrorMarcarRevisionResuelta(sinPosterior, 'Respaldo')).toBe(
      'Primero sube una nueva versión del artefacto',
    );
    expect(mensajeErrorMarcarRevisionResuelta(cerrada, 'Respaldo')).toBe('Está cerrada');
    expect(mensajeErrorMarcarRevisionResuelta(new Error('red'), 'Respaldo')).toBe('Respaldo');
  });

  it('reconoce el 422 de observaciones abiertas y mapea su mensaje', () => {
    // Arrange
    const abiertas = errorApi(422, {
      errorCode: 'REVISION_ASESOR_CON_OBSERVACIONES_ABIERTAS',
      message: 'x',
    });

    // Assert
    expect(esConObservacionesAbiertas(abiertas)).toBe(true);
    expect(esConObservacionesAbiertas(new Error('red'))).toBe(false);
    expect(mensajeErrorMarcarRevisionResuelta(abiertas, 'Respaldo')).toContain(
      'observaciones sin solucionar',
    );
  });
});
