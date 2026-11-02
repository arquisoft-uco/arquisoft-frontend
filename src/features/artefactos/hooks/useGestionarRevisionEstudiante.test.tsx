import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../../../test-utils/render';
import type { ObservacionRevision } from '../models/ObservacionRevision';
import type { RevisionGestionable } from '../models/RevisionGestionable';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { useGestionarRevisionEstudiante } from './useGestionarRevisionEstudiante';
import { useObservacionesRevisionEstudiante } from './useObservacionesRevisionEstudiante';
import { useUltimasVersionesEstudiante } from './useUltimasVersionesEstudiante';

vi.mock('./useObservacionesRevisionEstudiante', () => ({
  useObservacionesRevisionEstudiante: vi.fn(),
}));
vi.mock('./useUltimasVersionesEstudiante', () => ({ useUltimasVersionesEstudiante: vi.fn() }));

const REVISION: RevisionGestionable = {
  id: 'r-1',
  artefactoId: 'a-1',
  version: 2,
  estadoId: 'EN_PROGRESO',
  estadoNombre: 'En progreso',
  nombreProyecto: 'P',
  nombreDocumento: 'D',
  versionDocumento: 1,
  fechaCreacion: null,
};

function observacion(estadoId: string): ObservacionRevision {
  return {
    id: estadoId,
    revisionAsesorId: 'r-1',
    descripcion: 'x',
    estadoId,
    estadoNombre: estadoId,
  };
}

function preparar(
  observaciones: ObservacionRevision[] | undefined,
  ultima: Partial<VersionArtefacto> | null | undefined,
  isLoading = false,
) {
  const base: Partial<ReturnType<typeof useObservacionesRevisionEstudiante>> = {};
  const datos = {
    data: observaciones,
    isLoading,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
  vi.mocked(useObservacionesRevisionEstudiante).mockReturnValue(
    Object.assign(base, datos) as ReturnType<typeof useObservacionesRevisionEstudiante>,
  );
  vi.mocked(useUltimasVersionesEstudiante).mockReturnValue({
    ultimaVersion: () => ultima as VersionArtefacto | null | undefined,
    isLoading: false,
    isError: false,
  });
}

describe('useGestionarRevisionEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con observaciones abiertas bloquea resolver y la nota dice cuántas faltan', () => {
    // Arrange
    preparar([observacion('NUEVA'), observacion('SOLUCIONADA')], {
      version: 3,
      estadoRevision: 'EN_PROGRESO',
    });

    // Act
    const { result } = renderHook(() => useGestionarRevisionEstudiante(REVISION));

    // Assert
    expect(result.current.abiertas).toBe(1);
    expect(result.current.puedeResolver).toBe(false);
    expect(result.current.notaPie).toBe('Te falta marcar 1 observación como solucionada.');
    expect(result.current.puedeSubir).toBe(true);
  });

  it('sin abiertas habilita resolver; avisa si falta subir la versión siguiente', () => {
    // Arrange
    preparar([observacion('SOLUCIONADA')], { version: 2, estadoRevision: 'EN_PROGRESO' });

    // Act
    const { result } = renderHook(() => useGestionarRevisionEstudiante(REVISION));

    // Assert
    expect(result.current.puedeResolver).toBe(true);
    expect(result.current.notaPie).toBe(
      'Sube una nueva versión del artefacto antes de marcar la revisión como resuelta.',
    );
  });

  it('con versión posterior subida dice que todo está listo y explica por qué no puede subir', () => {
    // Arrange
    preparar([observacion('SOLUCIONADA')], { version: 3, estadoRevision: null });

    // Act
    const { result } = renderHook(() => useGestionarRevisionEstudiante(REVISION));

    // Assert
    expect(result.current.notaPie).toBe('Todo listo: ya puedes marcar la revisión como resuelta.');
    expect(result.current.puedeSubir).toBe(false);
    expect(result.current.motivoSubida).toBe('Esperando la revisión del asesor.');
  });

  it('cargando no permite resolver y sin última versión conocida no hay motivo', () => {
    // Arrange
    preparar(undefined, undefined, true);

    // Act
    const { result } = renderHook(() => useGestionarRevisionEstudiante(REVISION));

    // Assert
    expect(result.current.puedeResolver).toBe(false);
    expect(result.current.puedeSubir).toBe(false);
    expect(result.current.motivoSubida).toBeUndefined();
    expect(result.current.notaPie).toBeUndefined();
  });

  it('una revisión que no está en progreso no es editable', () => {
    // Arrange
    preparar([observacion('NUEVA')], null);

    // Act
    const { result } = renderHook(() =>
      useGestionarRevisionEstudiante({ ...REVISION, estadoId: 'RESUELTA' }),
    );

    // Assert
    expect(result.current.editable).toBe(false);
    expect(result.current.puedeResolver).toBe(false);
    expect(result.current.puedeSubir).toBe(false);
    expect(result.current.notaPie).toBe('Esta revisión ya no admite cambios.');
  });
});
