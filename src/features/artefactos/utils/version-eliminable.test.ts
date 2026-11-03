import { describe, it, expect } from 'vitest';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { esVersionEliminable } from './version-eliminable';

function version(numero: number, estadoRevision: string | null = null): VersionArtefacto {
  return {
    id: `v-${numero}`,
    artefacto: 'a-1',
    version: numero,
    fechaCreacion: '2026-03-10T15:30:00Z',
    nombreProyecto: 'Sistema de riego',
    nombreDocumento: 'Acta de inicio',
    versionDocumento: 1,
    nombreRepositorio: 'Repositorio base',
    nombreAsesor: 'Marta Gómez',
    revisionAsesor: estadoRevision ? `r-${numero}` : null,
    estadoRevision,
    nombreEstadoRevision: null,
    fechaCreacionRevision: null,
  };
}

describe('esVersionEliminable', () => {
  it('solo ofrece eliminar la última sin revisión propia y con la anterior en progreso', () => {
    // Arrange
    const v1 = version(1);
    const v2 = version(2);
    const conAnterior = (estado: string) => [v2, version(1, estado)];

    // Act / Assert
    expect(esVersionEliminable(v2, conAnterior('EN_PROGRESO'))).toBe(true);
    expect(esVersionEliminable(v1, [v1])).toBe(true);
    expect(esVersionEliminable(v1, [v2, v1])).toBe(false);
    const v2ConRevision = version(2, 'PENDIENTE');
    expect(esVersionEliminable(v2ConRevision, [v2ConRevision, version(1, 'EN_PROGRESO')])).toBe(
      false,
    );
    expect(esVersionEliminable(v2, conAnterior('PENDIENTE'))).toBe(false);
    expect(esVersionEliminable(v2, conAnterior('RESUELTA'))).toBe(false);
    expect(esVersionEliminable(v2, conAnterior('CERRADA'))).toBe(false);
    expect(esVersionEliminable(v2, [v2])).toBe(false);
    expect(esVersionEliminable(v2, [])).toBe(false);
  });
});
