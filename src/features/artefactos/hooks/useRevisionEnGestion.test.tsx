import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../../../test-utils/render';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { useObservacionesRevision } from './useObservacionesRevision';
import { usePuedeGestionarObservaciones } from './usePuedeGestionarObservaciones';
import { useRevisionAnterior } from './useRevisionAnterior';
import { useRevisionEnGestion } from './useRevisionEnGestion';
import { useUltimaVersionArtefacto } from './useUltimaVersionArtefacto';

vi.mock('./useObservacionesRevision', () => ({ useObservacionesRevision: vi.fn() }));
vi.mock('./usePuedeGestionarObservaciones', () => ({ usePuedeGestionarObservaciones: vi.fn() }));
vi.mock('./useRevisionAnterior', () => ({ useRevisionAnterior: vi.fn() }));
vi.mock('./useUltimaVersionArtefacto', () => ({ useUltimaVersionArtefacto: vi.fn() }));

const VERSION = {
  id: 'v-1',
  artefacto: 'a-1',
  version: 1,
  nombreDocumento: 'Acta',
  revisionAsesor: 'r-1',
  estadoRevision: 'PENDIENTE',
} as VersionArtefacto;

function preparar({
  observaciones,
  editable,
  omitidos = new Set<string>(),
}: {
  observaciones: { id: string; estadoId: string }[] | undefined;
  editable: boolean;
  omitidos?: Set<string>;
}) {
  vi.mocked(useObservacionesRevision).mockReturnValue({
    data: observaciones,
    isLoading: observaciones === undefined,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as Partial<ReturnType<typeof useObservacionesRevision>> as ReturnType<
    typeof useObservacionesRevision
  >);
  vi.mocked(usePuedeGestionarObservaciones).mockReturnValue({
    puedeGestionar: () => editable,
    omitidos,
  });
  vi.mocked(useRevisionAnterior).mockReturnValue({
    visible: false,
  } as Partial<ReturnType<typeof useRevisionAnterior>> as ReturnType<typeof useRevisionAnterior>);
  vi.mocked(useUltimaVersionArtefacto).mockReturnValue({
    ultimaVersion: undefined,
    isLoading: false,
    isError: false,
  });
}

function usar(version: VersionArtefacto = VERSION) {
  return renderHook(() => useRevisionEnGestion({ revisionAsesorId: 'r-1', version })).result
    .current;
}

describe('useRevisionEnGestion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pendiente editable: nota de envío solo con la lista cargada y vacía', () => {
    // Arrange / Act
    preparar({ observaciones: [], editable: true });
    const vacia = usar();
    preparar({ observaciones: [{ id: 'o-1', estadoId: 'ABIERTA' }], editable: true });
    const conLista = usar();
    preparar({ observaciones: undefined, editable: true });
    const cargando = usar();

    // Assert
    expect(vacia).toMatchObject({
      editable: true,
      hayObservaciones: false,
      mostrarNotaEnvio: true,
    });
    expect(conLista).toMatchObject({ hayObservaciones: true, mostrarNotaEnvio: false });
    expect(cargando).toMatchObject({ hayObservaciones: false, mostrarNotaEnvio: false });
  });

  it('omitido o no pendiente no es editable y no ofrece nota de envío', () => {
    // Arrange
    preparar({ observaciones: [], editable: false, omitidos: new Set(['a-1']) });

    // Act
    const resultado = usar();

    // Assert
    expect(resultado).toMatchObject({ omitido: true, editable: false, mostrarNotaEnvio: false });
    expect(resultado.puedeDecidir).toBe(false);
  });

  it('resuelta no omitida permite decidir y consulta la última versión', () => {
    // Arrange
    preparar({ observaciones: [], editable: false });

    // Act
    const resultado = usar({ ...VERSION, estadoRevision: 'RESUELTA' });

    // Assert
    expect(resultado.puedeDecidir).toBe(true);
    expect(useUltimaVersionArtefacto).toHaveBeenCalledWith('a-1', true);
  });

  it('entrega omitido indefinido a la revisión anterior mientras el catálogo carga', () => {
    // Arrange
    preparar({ observaciones: [], editable: false });
    vi.mocked(usePuedeGestionarObservaciones).mockReturnValue({
      puedeGestionar: () => false,
      omitidos: undefined,
    });

    // Act
    usar();
    vi.mocked(usePuedeGestionarObservaciones).mockReturnValue({
      puedeGestionar: () => false,
      omitidos: new Set(['a-1']),
    });
    usar();

    // Assert
    const llamadas = vi.mocked(useRevisionAnterior);
    expect(llamadas).toHaveBeenNthCalledWith(1, expect.objectContaining({ omitido: undefined }));
    expect(llamadas).toHaveBeenLastCalledWith(expect.objectContaining({ omitido: true }));
  });
});
