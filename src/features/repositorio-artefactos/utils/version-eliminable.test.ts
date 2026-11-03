import { describe, it, expect } from 'vitest';
import type { VersionRepositorioArtefacto } from '../../../shared/models/VersionRepositorioArtefacto';
import { esUltimaVersionDelDocumento } from './version-eliminable';

function version(id: string, nombreDocumento: string, numeroVersion: number) {
  return {
    id,
    nombreDocumento,
    numeroVersion,
    fechaCreacion: '2026-03-15T14:30:00Z',
    tipoContenido: 'application/pdf',
    tamanoBytes: 1,
    nombreArchivo: 'a.pdf',
  } satisfies VersionRepositorioArtefacto;
}

describe('esUltimaVersionDelDocumento', () => {
  it('marca solo la de mayor número de cada documento', () => {
    // Arrange
    const manual1 = version('a', 'Manual', 1);
    const manual2 = version('b', 'Manual', 2);
    const guia1 = version('c', 'Guía', 1);
    const versiones = [manual1, manual2, guia1];

    // Assert
    expect(esUltimaVersionDelDocumento(manual2, versiones)).toBe(true);
    expect(esUltimaVersionDelDocumento(manual1, versiones)).toBe(false);
    expect(esUltimaVersionDelDocumento(guia1, versiones)).toBe(true);
    expect(esUltimaVersionDelDocumento(manual1, [manual1])).toBe(true);
  });
});
