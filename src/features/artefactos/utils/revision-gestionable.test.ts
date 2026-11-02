import { describe, it, expect } from 'vitest';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { desRevision, desVersion, haySubidaPosterior } from './revision-gestionable';

const VERSION: VersionArtefacto = {
  id: 'v-1',
  artefacto: 'a-1',
  version: 2,
  fechaCreacion: '2026-03-01T10:00:00',
  nombreProyecto: 'Proyecto',
  nombreDocumento: 'Documento',
  versionDocumento: 3,
  nombreRepositorio: 'Repo',
  nombreAsesor: 'Asesor',
  revisionAsesor: 'r-1',
  estadoRevision: 'EN_PROGRESO',
  nombreEstadoRevision: 'En progreso',
  fechaCreacionRevision: '2026-03-02T10:00:00',
};

describe('revision-gestionable', () => {
  it('proyecta una revisión del listado de revisiones', () => {
    // Act
    const revision = desRevision({
      id: 'r-9',
      versionArtefacto: 'v-9',
      artefacto: 'a-9',
      version: 4,
      estadoRevisionAsesor: 'RESUELTA',
      estadoRevisionAsesorNombre: 'Resuelta',
      fechaCreacion: '2026-03-05T10:00:00',
      nombreProyecto: 'P',
      nombreDocumento: 'D',
      versionDocumento: 1,
      observacionesAbiertas: 0,
      totalObservaciones: 2,
    });

    // Assert
    expect(revision).toMatchObject({ id: 'r-9', artefactoId: 'a-9', estadoId: 'RESUELTA' });
  });

  it('proyecta una versión con revisión visible y descarta pendiente o sin revisión', () => {
    // Assert
    expect(desVersion(VERSION)).toMatchObject({
      id: 'r-1',
      artefactoId: 'a-1',
      estadoNombre: 'En progreso',
      fechaCreacion: '2026-03-02T10:00:00',
    });
    expect(desVersion({ ...VERSION, estadoRevision: 'PENDIENTE' })).toBeNull();
    expect(desVersion({ ...VERSION, revisionAsesor: null, estadoRevision: null })).toBeNull();
  });

  it('haySubidaPosterior distingue verdadero, falso y desconocido', () => {
    // Assert
    expect(haySubidaPosterior(2, { ...VERSION, version: 3 })).toBe(true);
    expect(haySubidaPosterior(2, VERSION)).toBe(false);
    expect(haySubidaPosterior(2, null)).toBe(false);
    expect(haySubidaPosterior(2, undefined)).toBeUndefined();
  });
});
