import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../../../test-utils/render';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { useUltimaRevisionArtefacto } from './useUltimaRevisionArtefacto';
import { useUltimasVersionesEstudiante } from './useUltimasVersionesEstudiante';

vi.mock('./useUltimasVersionesEstudiante', () => ({ useUltimasVersionesEstudiante: vi.fn() }));

const VERSION: VersionArtefacto = {
  id: 'v-1',
  artefacto: 'a-1',
  version: 2,
  fechaCreacion: '2026-03-01T10:00:00',
  nombreProyecto: 'Proyecto',
  nombreDocumento: 'Documento',
  versionDocumento: 3,
  nombreRepositorio: 'Repo',
  nombreAsesor: 'Asesor',
  revisionAsesor: 'r-1',
  estadoRevision: 'EN_PROGRESO',
  nombreEstadoRevision: 'En progreso',
  fechaCreacionRevision: '2026-03-02T10:00:00',
};

function preparar(ultima: VersionArtefacto | null | undefined, isLoading = false) {
  vi.mocked(useUltimasVersionesEstudiante).mockReturnValue({
    ultimaVersion: () => ultima,
    isLoading,
    isError: false,
    refetch: vi.fn(),
  });
}

describe('useUltimaRevisionArtefacto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cargando no hay última versión ni permiso conocido', () => {
    // Arrange
    preparar(undefined, true);

    // Act
    const { result } = renderHook(() => useUltimaRevisionArtefacto('a-1'));

    // Assert
    expect(result.current.ultima).toBeUndefined();
    expect(result.current.motivoSubida).toBeUndefined();
    expect(result.current.puedeSubir).toBe(false);
  });

  it('sin versiones no hay revisión y se puede subir', () => {
    // Arrange
    preparar(null);

    // Act
    const { result } = renderHook(() => useUltimaRevisionArtefacto('a-1'));

    // Assert
    expect(result.current.ultima).toBeNull();
    expect(result.current.revision).toBeNull();
    expect(result.current.puedeSubir).toBe(true);
  });

  it('una última versión sin revisión o con revisión pendiente no tiene revisión y bloquea subir', () => {
    // Arrange
    preparar({ ...VERSION, revisionAsesor: null, estadoRevision: null });
    const sinRevision = renderHook(() => useUltimaRevisionArtefacto('a-1'));
    preparar({ ...VERSION, estadoRevision: 'PENDIENTE' });

    // Act
    const pendiente = renderHook(() => useUltimaRevisionArtefacto('a-1'));

    // Assert
    expect(sinRevision.result.current.revision).toBeNull();
    expect(sinRevision.result.current.puedeSubir).toBe(false);
    expect(sinRevision.result.current.motivoSubida).toBe('Esperando la revisión del asesor.');
    expect(pendiente.result.current.revision).toBeNull();
    expect(pendiente.result.current.puedeSubir).toBe(false);
  });

  it('con revisión en progreso expone la revisión gestionable y permite subir', () => {
    // Arrange
    preparar(VERSION);

    // Act
    const { result } = renderHook(() => useUltimaRevisionArtefacto('a-1'));

    // Assert
    expect(result.current.revision).toMatchObject({ id: 'r-1', artefactoId: 'a-1' });
    expect(result.current.puedeSubir).toBe(true);
  });
});
