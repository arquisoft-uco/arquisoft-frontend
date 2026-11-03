import { describe, it, expect } from 'vitest';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import {
  ESTADO_REVISION_CERRADA,
  ESTADO_REVISION_PENDIENTE,
  estudianteVeObservaciones,
  puedeGestionarObservaciones,
  puedeRegistrarRevision,
  reabreArtefacto,
  revisionAdmiteDecisionObservacion,
  tieneRevision,
} from './revision-version';

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
  revisionAsesor: null,
  estadoRevision: null,
  nombreEstadoRevision: null,
  fechaCreacionRevision: null,
};

function con(estadoRevision: string | null): VersionArtefacto {
  return { ...VERSION, estadoRevision };
}

function puede(
  estadoRevision: string | null,
  ultimaVersionId: string | null | undefined = 'v-2',
  artefactoOmitido = false,
) {
  return puedeRegistrarRevision({
    version: con(estadoRevision),
    ultimaVersionId,
    artefactoOmitido,
  });
}

describe('puedeRegistrarRevision', () => {
  it('solo se ofrece en la última versión de un artefacto no omitido sin revisión o con la última cerrada', () => {
    // Act
    const resultado = {
      sinRevision: puede(null),
      cerrada: puede(ESTADO_REVISION_CERRADA),
      pendiente: puede('PENDIENTE'),
      enProgreso: puede('EN_PROGRESO'),
      resuelta: puede('RESUELTA'),
      noEsUltima: puede(null, 'v-3'),
      ultimaDesconocida: puede(null, null),
      omitido: puede(null, 'v-2', true),
    };

    // Assert
    expect(resultado).toEqual({
      sinRevision: true,
      cerrada: true,
      pendiente: false,
      enProgreso: false,
      resuelta: false,
      noEsUltima: false,
      ultimaDesconocida: false,
      omitido: false,
    });
  });
});

describe('puedeGestionarObservaciones', () => {
  it('solo con revisión pendiente y artefacto no omitido', () => {
    // Act
    const gestionar = (estado: string | null, artefactoOmitido = false) =>
      puedeGestionarObservaciones({ version: con(estado), artefactoOmitido });

    // Assert
    expect({
      pendiente: gestionar(ESTADO_REVISION_PENDIENTE),
      enProgreso: gestionar('EN_PROGRESO'),
      resuelta: gestionar('RESUELTA'),
      cerrada: gestionar(ESTADO_REVISION_CERRADA),
      sinRevision: gestionar(null),
      omitido: gestionar(ESTADO_REVISION_PENDIENTE, true),
    }).toEqual({
      pendiente: true,
      enProgreso: false,
      resuelta: false,
      cerrada: false,
      sinRevision: false,
      omitido: false,
    });
  });
});

describe('estudianteVeObservaciones y tieneRevision', () => {
  it('el estudiante ve las observaciones solo con revisión no pendiente', () => {
    // Arrange
    const conRevision = (estadoRevision: string | null) => ({
      ...con(estadoRevision),
      revisionAsesor: 'r-1',
    });

    // Assert
    expect(estudianteVeObservaciones(conRevision('EN_PROGRESO'))).toBe(true);
    expect(estudianteVeObservaciones(conRevision(ESTADO_REVISION_CERRADA))).toBe(true);
    expect(estudianteVeObservaciones(conRevision(ESTADO_REVISION_PENDIENTE))).toBe(false);
    expect(estudianteVeObservaciones(con(null))).toBe(false);
    expect(tieneRevision(conRevision('RESUELTA'))).toBe(true);
    expect(tieneRevision(con(null))).toBe(false);
  });
});

describe('reabreArtefacto', () => {
  it('solo reabre cuando la revisión más reciente está cerrada', () => {
    // Assert
    expect(reabreArtefacto(con(ESTADO_REVISION_CERRADA))).toBe(true);
    expect(reabreArtefacto(con(null))).toBe(false);
    expect(reabreArtefacto(con('PENDIENTE'))).toBe(false);
  });
});

describe('revisionAdmiteDecisionObservacion', () => {
  it('solo admite la decisión con la revisión resuelta y el artefacto no omitido', () => {
    // Assert
    const admite = (estado: string | null, artefactoOmitido = false) =>
      revisionAdmiteDecisionObservacion({ version: con(estado), artefactoOmitido });
    expect(admite('RESUELTA')).toBe(true);
    expect(admite('RESUELTA', true)).toBe(false);
    expect(admite('PENDIENTE')).toBe(false);
    expect(admite('EN_PROGRESO')).toBe(false);
    expect(admite(ESTADO_REVISION_CERRADA)).toBe(false);
    expect(admite(null)).toBe(false);
  });
});
