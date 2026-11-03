import { describe, it, expect } from 'vitest';
import type { ObservacionRevision } from '../models/ObservacionRevision';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import {
  TEXTO_CIERRE_CON_OBSERVACIONES,
  TEXTO_CIERRE_NO_VERIFICABLE,
  evaluarCierre,
} from './cierre-revision';

const V1 = { id: 'v-1', artefacto: 'a-1', version: 1, revisionAsesor: 'r-1' } as VersionArtefacto;
const V2 = { ...V1, id: 'v-2', version: 2 } as VersionArtefacto;
const ANTERIOR = { ...V1 } as VersionArtefacto;
const OBS = { id: 'o-1', estadoId: 'NUEVA' } as ObservacionRevision;

function anterior(parcial: Partial<Parameters<typeof evaluarCierre>[0]['anterior']> = {}) {
  return {
    versionAnterior: ANTERIOR as VersionArtefacto | null | undefined,
    observaciones: [] as ObservacionRevision[] | undefined,
    isLoading: false,
    isError: false,
    sinCerrar: 0,
    ...parcial,
  };
}

describe('evaluarCierre', () => {
  it('permite cerrar sin observaciones propias si es la primera versión o la anterior está cerrada, inexistente o sin revisión', () => {
    // Arrange
    const observaciones: ObservacionRevision[] = [];

    // Act / Assert
    expect(evaluarCierre({ observaciones, version: V1, anterior: anterior() }).puedeCerrar).toBe(
      true,
    );
    expect(evaluarCierre({ observaciones, version: V2, anterior: anterior() }).puedeCerrar).toBe(
      true,
    );
    expect(
      evaluarCierre({ observaciones, version: V2, anterior: anterior({ versionAnterior: null }) })
        .puedeCerrar,
    ).toBe(true);
    expect(
      evaluarCierre({
        observaciones,
        version: V2,
        anterior: anterior({ versionAnterior: { ...ANTERIOR, revisionAsesor: null } }),
      }).puedeCerrar,
    ).toBe(true);
  });

  it('bloquea con motivo por observaciones propias o de la versión anterior sin cerrar', () => {
    // Act
    const propias = evaluarCierre({ version: V1, observaciones: [OBS], anterior: anterior() });
    const previas = evaluarCierre({
      version: V2,
      observaciones: [],
      anterior: anterior({ observaciones: [OBS], sinCerrar: 2 }),
    });

    // Assert
    expect(propias).toEqual({ puedeCerrar: false, motivo: TEXTO_CIERRE_CON_OBSERVACIONES });
    expect(previas).toEqual({
      puedeCerrar: false,
      motivo:
        'Para dar por completado, cierra primero las observaciones de la versión anterior (2 sin cerrar).',
    });
  });

  it('deshabilita sin motivo mientras carga y con el motivo de verificación si falla', () => {
    // Arrange
    const desconocido = { puedeCerrar: false, motivo: null };

    // Act / Assert
    expect(evaluarCierre({ version: V1, observaciones: undefined, anterior: anterior() })).toEqual(
      desconocido,
    );
    expect(
      evaluarCierre({
        version: V2,
        observaciones: [],
        anterior: anterior({ versionAnterior: undefined, isLoading: true }),
      }),
    ).toEqual(desconocido);
    expect(
      evaluarCierre({
        version: V2,
        observaciones: [],
        anterior: anterior({ observaciones: undefined, isLoading: true }),
      }),
    ).toEqual(desconocido);
    expect(
      evaluarCierre({
        version: V2,
        observaciones: [],
        anterior: anterior({ versionAnterior: undefined, isError: true }),
      }),
    ).toEqual({ puedeCerrar: false, motivo: TEXTO_CIERRE_NO_VERIFICABLE });
  });
});
