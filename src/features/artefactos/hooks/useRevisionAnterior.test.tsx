import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../../../test-utils/render';
import type { ObservacionRevision } from '../models/ObservacionRevision';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { useObservacionesRevision } from './useObservacionesRevision';
import { useRevisionAnterior } from './useRevisionAnterior';
import { useUltimaVersionArtefacto } from './useUltimaVersionArtefacto';
import { useVersionAnteriorArtefacto } from './useVersionAnteriorArtefacto';

vi.mock('./useVersionAnteriorArtefacto', () => ({ useVersionAnteriorArtefacto: vi.fn() }));
vi.mock('./useObservacionesRevision', () => ({ useObservacionesRevision: vi.fn() }));
vi.mock('./useUltimaVersionArtefacto', () => ({ useUltimaVersionArtefacto: vi.fn() }));

const ACTUAL = { id: 'v-3', artefacto: 'a-1', version: 3 } as VersionArtefacto;
const ANTERIOR = {
  id: 'v-2',
  artefacto: 'a-1',
  version: 2,
  revisionAsesor: 'r-2',
  estadoRevision: 'RESUELTA',
} as VersionArtefacto;

function obs(id: string, estadoId: string): ObservacionRevision {
  return { id, revisionAsesorId: 'r-2', descripcion: id, estadoId, estadoNombre: estadoId };
}

function prepararVersion(versionAnterior: VersionArtefacto | null | undefined, isError = false) {
  vi.mocked(useVersionAnteriorArtefacto).mockReturnValue({
    versionAnterior,
    isLoading: versionAnterior === undefined && !isError,
    isError,
    error: isError ? new Error('x') : null,
    refetch: vi.fn(),
  } as Partial<ReturnType<typeof useVersionAnteriorArtefacto>> as ReturnType<
    typeof useVersionAnteriorArtefacto
  >);
}

function prepararObservaciones(data: ObservacionRevision[] | undefined, isError = false) {
  vi.mocked(useObservacionesRevision).mockReturnValue({
    data,
    isLoading: data === undefined && !isError,
    isError,
    error: null,
    refetch: vi.fn(),
  } as Partial<ReturnType<typeof useObservacionesRevision>> as ReturnType<
    typeof useObservacionesRevision
  >);
}

function prepararUltima(ultimaVersion: VersionArtefacto | undefined) {
  vi.mocked(useUltimaVersionArtefacto).mockReturnValue({
    ultimaVersion,
    isLoading: false,
    isError: false,
  });
}

function usar(omitido: boolean | undefined, version = ACTUAL) {
  return renderHook(() => useRevisionAnterior({ version, omitido })).result.current;
}

describe('useRevisionAnterior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prepararUltima(undefined);
  });

  it('no es visible en la versión 1, sin versión anterior, sin revisión o sin observaciones', () => {
    // Arrange / Act
    prepararVersion(null);
    prepararObservaciones(undefined);
    const sinAnterior = usar(false);
    const primera = usar(false, { ...ACTUAL, version: 1 });
    prepararVersion({ ...ANTERIOR, revisionAsesor: null });
    const sinRevision = usar(false);
    prepararVersion(ANTERIOR);
    prepararObservaciones([]);
    const sinObservaciones = usar(false);

    // Assert
    expect(sinAnterior.visible).toBe(false);
    expect(primera.visible).toBe(false);
    expect(sinRevision.visible).toBe(false);
    expect(sinObservaciones.visible).toBe(false);
  });

  it('es visible mientras carga la versión o las observaciones, con error y con datos', () => {
    // Arrange / Act
    prepararVersion(undefined);
    prepararObservaciones(undefined);
    const cargandoVersion = usar(false);
    prepararVersion(ANTERIOR);
    const cargandoObservaciones = usar(false);
    prepararObservaciones(undefined, true);
    const conError = usar(false);
    prepararObservaciones([obs('o-1', 'SOLUCIONADA')]);
    const conDatos = usar(false);

    // Assert
    expect(cargandoVersion).toMatchObject({ visible: true, isLoading: true });
    expect(cargandoObservaciones).toMatchObject({ visible: true, isLoading: true });
    expect(conError).toMatchObject({ visible: true, isError: true });
    expect(conDatos.visible).toBe(true);
  });

  it('cuenta las observaciones sin cerrar', () => {
    // Arrange
    prepararVersion(ANTERIOR);
    prepararObservaciones([obs('o-1', 'CERRADA'), obs('o-2', 'REABIERTA'), obs('o-3', 'NUEVA')]);

    // Act
    const resultado = usar(false);

    // Assert
    expect(resultado).toMatchObject({ total: 3, sinCerrar: 2 });
  });

  it('solo decide con revisión RESUELTA y artefacto conocido como no omitido', () => {
    // Arrange
    prepararObservaciones([obs('o-1', 'SOLUCIONADA')]);

    // Act
    prepararVersion(ANTERIOR);
    const decide = usar(false);
    const omitido = usar(true);
    const sinCatalogo = usar(undefined);
    prepararVersion({ ...ANTERIOR, estadoRevision: 'CERRADA' });
    const cerrada = usar(false);

    // Assert
    expect(decide.puedeDecidir).toBe(true);
    expect(omitido.puedeDecidir).toBe(false);
    expect(sinCatalogo.puedeDecidir).toBe(false);
    expect(cerrada.puedeDecidir).toBe(false);
  });

  it('consulta la última versión solo si puede decidir', () => {
    // Arrange
    prepararObservaciones([obs('o-1', 'SOLUCIONADA')]);
    prepararVersion(ANTERIOR);

    // Act
    usar(false);
    usar(true);

    // Assert
    expect(useUltimaVersionArtefacto).toHaveBeenCalledWith('a-1', true);
    expect(useUltimaVersionArtefacto).toHaveBeenCalledWith('a-1', false);
  });

  it('el aviso explica el motivo de la reapertura solo si hay algo accionable', () => {
    // Arrange
    prepararVersion(ANTERIOR);
    prepararObservaciones([obs('o-1', 'SOLUCIONADA')]);
    prepararUltima(ANTERIOR);

    // Act
    const bloqueada = usar(false);
    prepararUltima({ ...ACTUAL, revisionAsesor: 'r-3', estadoRevision: 'PENDIENTE' });
    const disponible = usar(false);
    prepararObservaciones([obs('o-1', 'CERRADA')]);
    const sinSolucionadas = usar(false);

    // Assert
    expect(bloqueada.situacion).toBe('sin-version-siguiente');
    expect(bloqueada.textoAviso).toMatch(/versión 3/);
    expect(disponible.situacion).toBe('disponible');
    expect(disponible.textoAviso).toBeNull();
    expect(sinSolucionadas.textoAviso).toBeNull();
  });
});
