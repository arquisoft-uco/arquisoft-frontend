import { describe, it, expect } from 'vitest';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import type { VersionRepositorioAsesor } from '../models/VersionRepositorioAsesor';
import {
  construirFiltroDocumento,
  excluirVersionActual,
  motivoBloqueoCambioVersion,
  MOTIVO_REVISION_CERRADA,
  MOTIVO_SIN_REVISION,
  puedeCambiarVersionRepositorio,
} from './cambio-version-repositorio';

function version(estadoRevision: string | null): VersionArtefacto {
  return { id: 'v', estadoRevision } as VersionArtefacto;
}

describe('cambio-version-repositorio', () => {
  it('permite el cambio sin versiones, PENDIENTE o EN_PROGRESO y lo bloquea en el resto', () => {
    // Assert
    expect(puedeCambiarVersionRepositorio(null)).toBe(true);
    expect(puedeCambiarVersionRepositorio(version('PENDIENTE'))).toBe(true);
    expect(puedeCambiarVersionRepositorio(version('EN_PROGRESO'))).toBe(true);
    expect(puedeCambiarVersionRepositorio(version(null))).toBe(false);
    expect(puedeCambiarVersionRepositorio(version('RESUELTA'))).toBe(false);
    expect(puedeCambiarVersionRepositorio(version('CERRADA'))).toBe(false);
  });

  it('explica el bloqueo según haya o no revisión', () => {
    // Assert
    expect(motivoBloqueoCambioVersion(version(null))).toBe(MOTIVO_SIN_REVISION);
    expect(motivoBloqueoCambioVersion(version('RESUELTA'))).toBe(MOTIVO_REVISION_CERRADA);
    expect(motivoBloqueoCambioVersion(version('CERRADA'))).toBe(MOTIVO_REVISION_CERRADA);
  });

  it('construye el filtro AND con ES sobre repositorio y documento', () => {
    // Act
    const filtro = construirFiltroDocumento({
      nombreRepositorio: 'Repo base',
      nombreDocumento: 'Acta',
    });

    // Assert
    expect(filtro).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [
        { tipo: 'PREDICADO', campo: 'nombreRepositorio', operador: 'ES', valor: 'Repo base' },
        { tipo: 'PREDICADO', campo: 'nombreDocumento', operador: 'ES', valor: 'Acta' },
      ],
    });
  });

  it('excluye la versión actual de las candidatas', () => {
    // Arrange
    const versiones = [{ id: 'a' }, { id: 'b' }] as VersionRepositorioAsesor[];

    // Act
    const resultado = excluirVersionActual(versiones, 'a');

    // Assert
    expect(resultado.map((v) => v.id)).toEqual(['b']);
  });
});
