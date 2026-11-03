import { describe, it, expect } from 'vitest';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { motivoBloqueoSubida } from './bloqueo-subida-version';

function version(estadoRevision: string | null): VersionArtefacto {
  return { id: 'v-1', estadoRevision } as VersionArtefacto;
}

describe('motivoBloqueoSubida', () => {
  it('permite subir sin versiones o con revisión en progreso y explica cada bloqueo', () => {
    // Act
    const resultados = [
      null,
      version('EN_PROGRESO'),
      version(null),
      version('PENDIENTE'),
      version('RESUELTA'),
      version('CERRADA'),
      version('DESCONOCIDO'),
    ].map(motivoBloqueoSubida);

    // Assert
    expect(resultados).toEqual([
      null,
      null,
      'Esperando la revisión del asesor.',
      'El asesor está preparando la revisión.',
      'Esperando la siguiente revisión del asesor.',
      'El asesor cerró este artefacto.',
      'Esperando la revisión del asesor.',
    ]);
  });
});
