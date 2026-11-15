import { describe, it, expect } from 'vitest';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { guiaArtefactoAsesor, guiaArtefactoEstudiante } from './guia-artefacto';

function version(estadoRevision: string | null): VersionArtefacto {
  return { id: 'v-1', estadoRevision } as VersionArtefacto;
}

describe('guiaArtefactoAsesor', () => {
  it('devuelve una guía distinta por cada estado de la última versión', () => {
    // Act
    const textos = [
      guiaArtefactoAsesor(null),
      guiaArtefactoAsesor(version(null)),
      guiaArtefactoAsesor(version('PENDIENTE')),
      guiaArtefactoAsesor(version('EN_PROGRESO')),
      guiaArtefactoAsesor(version('RESUELTA')),
      guiaArtefactoAsesor(version('CERRADA')),
    ];

    // Assert
    expect(textos[0]).toBe('Esperando que el estudiante suba la primera versión.');
    expect(textos[1]).toBe('Hay una versión sin revisar: regístrale la revisión.');
    expect(textos[2]).toBe('Revisión en borrador: agrega las observaciones y envíala.');
    expect(textos[3]).toBe('El estudiante está atendiendo tus observaciones.');
    expect(textos[4]).toContain('El estudiante resolvió las observaciones');
    expect(textos[5]).toBe('Cerraste este artefacto: ya no admite nuevas versiones.');
    expect(new Set(textos).size).toBe(6);
  });
});

describe('guiaArtefactoEstudiante', () => {
  it('conserva los avisos del estudiante por estado y no da guía cuando puede subir', () => {
    // Act & Assert
    expect(guiaArtefactoEstudiante(null)).toBe('Aún no has subido ninguna versión del artefacto.');
    expect(guiaArtefactoEstudiante(version('EN_PROGRESO'))).toBe(
      'Atiende las observaciones del asesor y sube una nueva versión.',
    );
    expect(guiaArtefactoEstudiante(version('PENDIENTE'))).toBe(
      'El asesor está preparando la revisión.',
    );
    expect(guiaArtefactoEstudiante(version('RESUELTA'))).toBe(
      'Esperando la siguiente revisión del asesor.',
    );
    expect(guiaArtefactoEstudiante(version('CERRADA'))).toBe('El asesor cerró este artefacto.');
    expect(guiaArtefactoEstudiante(version(null))).toBe('Esperando la revisión del asesor.');
  });
});
