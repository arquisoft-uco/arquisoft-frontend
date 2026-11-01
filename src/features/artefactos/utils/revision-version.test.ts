import { describe, it, expect } from 'vitest';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import {
  ESTADO_REVISION_CERRADA,
  puedeRegistrarRevision,
  reabreArtefacto,
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

describe('reabreArtefacto', () => {
  it('solo reabre cuando la revisión más reciente está cerrada', () => {
    // Assert
    expect(reabreArtefacto(con(ESTADO_REVISION_CERRADA))).toBe(true);
    expect(reabreArtefacto(con(null))).toBe(false);
    expect(reabreArtefacto(con('PENDIENTE'))).toBe(false);
  });
});
