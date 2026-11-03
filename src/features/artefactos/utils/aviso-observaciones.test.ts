import { describe, it, expect } from 'vitest';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { textoAvisoObservaciones } from './aviso-observaciones';

const VERSION: VersionArtefacto = {
  id: 'v-2',
  artefacto: 'a-1',
  version: 2,
  fechaCreacion: '2026-03-10T15:30:00Z',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 1,
  nombreRepositorio: 'Repositorio base',
  nombreAsesor: 'Marta Gómez',
  revisionAsesor: 'r-2',
  estadoRevision: 'RESUELTA',
  nombreEstadoRevision: 'Resuelta',
  fechaCreacionRevision: null,
};

const BASE = {
  editable: false,
  version: VERSION,
  omitido: false,
  puedeDecidir: false,
  haySolucionadas: false,
  situacion: 'disponible' as const,
};

describe('textoAvisoObservaciones', () => {
  it('elige el aviso según edición, decisión, omisión y estado de la revisión', () => {
    // Assert
    expect(textoAvisoObservaciones({ ...BASE, editable: true })).toContain('está pendiente');
    expect(
      textoAvisoObservaciones({ ...BASE, puedeDecidir: true, haySolucionadas: true }),
    ).toBeNull();
    expect(
      textoAvisoObservaciones({
        ...BASE,
        puedeDecidir: true,
        haySolucionadas: true,
        situacion: 'sin-revision',
      }),
    ).toContain('registra primero la revisión');
    expect(
      textoAvisoObservaciones({ ...BASE, puedeDecidir: true, situacion: 'sin-revision' }),
    ).toBeNull();
    expect(textoAvisoObservaciones({ ...BASE, omitido: true })).toBe(
      'Este artefacto está omitido y no admite cambios.',
    );
    expect(
      textoAvisoObservaciones({
        ...BASE,
        version: { ...VERSION, estadoRevision: 'EN_PROGRESO' },
      }),
    ).toContain('ya no está pendiente');
  });
});
