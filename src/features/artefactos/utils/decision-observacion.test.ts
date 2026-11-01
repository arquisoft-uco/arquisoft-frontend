import { describe, it, expect } from 'vitest';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { situacionReapertura, textoSituacionReapertura } from './decision-observacion';

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
};

function ultima(parcial: Partial<VersionArtefacto>): VersionArtefacto {
  return { ...VERSION, id: 'v-x', ...parcial };
}

describe('situacionReapertura', () => {
  it('resuelve cada situación según la última versión del artefacto', () => {
    // Act
    const situaciones = [
      undefined,
      null,
      ultima({ version: 2 }),
      ultima({ version: 3, revisionAsesor: 'r-3', estadoRevision: 'PENDIENTE' }),
      ultima({ version: 3, revisionAsesor: null, estadoRevision: null }),
      ultima({ version: 3, revisionAsesor: 'r-3', estadoRevision: 'EN_PROGRESO' }),
      ultima({ version: 4, revisionAsesor: 'r-4', estadoRevision: 'PENDIENTE' }),
    ].map((ultimaVersion) => situacionReapertura({ version: VERSION, ultimaVersion }));

    // Assert
    expect(situaciones).toEqual([
      'cargando',
      'sin-version-siguiente',
      'sin-version-siguiente',
      'disponible',
      'sin-revision',
      'revision-enviada',
      'version-no-inmediata',
    ]);
  });
});

describe('textoSituacionReapertura', () => {
  it('explica lo que falta con la versión siguiente y no dice nada si no hay impedimento', () => {
    // Assert
    expect(textoSituacionReapertura('sin-version-siguiente', VERSION)).toContain('versión 3');
    expect(textoSituacionReapertura('sin-revision', VERSION)).toContain('versión 3');
    expect(textoSituacionReapertura('revision-enviada', VERSION)).toContain('versión 3');
    expect(textoSituacionReapertura('version-no-inmediata', VERSION)).toContain(
      'inmediatamente anterior',
    );
    expect(textoSituacionReapertura('disponible', VERSION)).toBeNull();
    expect(textoSituacionReapertura('cargando', VERSION)).toBeNull();
  });
});
