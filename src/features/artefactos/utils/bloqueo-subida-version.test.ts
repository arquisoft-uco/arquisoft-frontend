import { describe, it, expect } from 'vitest';
import type { EstadoRevisionAsesor } from '../models/artefactos';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { motivoBloqueoSubida, motivoBloqueoSubidaDeParticipacion } from './bloqueo-subida-version';

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

const ESTADOS: EstadoRevisionAsesor[] = [
  { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: '' },
  { id: 'EN_PROGRESO', nombre: 'En progreso', descripcion: '' },
  { id: 'RESUELTA', nombre: 'Resuelta', descripcion: '' },
  { id: 'CERRADA', nombre: 'Cerrada', descripcion: '' },
];

describe('motivoBloqueoSubidaDeParticipacion', () => {
  it('permite sin estado o en progreso, explica cada bloqueo y espera al catálogo', () => {
    // Act
    const resultados = [undefined, 'En progreso', 'Pendiente', 'Resuelta', 'Cerrada', 'Otro'].map(
      (estado) => motivoBloqueoSubidaDeParticipacion(estado, ESTADOS),
    );

    // Assert
    expect(resultados).toEqual([
      null,
      null,
      'El asesor está preparando la revisión.',
      'Esperando la siguiente revisión del asesor.',
      'El asesor cerró este artefacto.',
      'Esperando la revisión del asesor.',
    ]);
    expect(motivoBloqueoSubidaDeParticipacion('Cerrada', undefined)).toBeUndefined();
    expect(motivoBloqueoSubidaDeParticipacion(undefined, undefined)).toBeNull();
  });
});
