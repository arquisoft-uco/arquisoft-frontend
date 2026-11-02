import { describe, it, expect } from 'vitest';
import { esRevisionResoluble } from './revision-resoluble';

describe('esRevisionResoluble', () => {
  it('es verdadero solo con revisión y estado EN_PROGRESO', () => {
    // Act / Assert
    expect(esRevisionResoluble({ revisionAsesor: 'r-1', estadoRevision: 'EN_PROGRESO' })).toBe(
      true,
    );
    for (const estado of ['PENDIENTE', 'RESUELTA', 'CERRADA', null]) {
      expect(esRevisionResoluble({ revisionAsesor: 'r-1', estadoRevision: estado })).toBe(false);
    }
    expect(esRevisionResoluble({ revisionAsesor: null, estadoRevision: 'EN_PROGRESO' })).toBe(
      false,
    );
  });
});
