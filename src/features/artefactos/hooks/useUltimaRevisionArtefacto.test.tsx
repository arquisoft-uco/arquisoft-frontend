import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../../../test-utils/render';
import type { RevisionGestionable } from '../models/RevisionGestionable';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { useRevisionEnProgresoReciente } from './useRevisionEnProgresoReciente';
import { useUltimaRevisionArtefacto } from './useUltimaRevisionArtefacto';
import { useUltimasVersionesEstudiante } from './useUltimasVersionesEstudiante';

vi.mock('./useUltimasVersionesEstudiante', () => ({ useUltimasVersionesEstudiante: vi.fn() }));
vi.mock('./useRevisionEnProgresoReciente', () => ({ useRevisionEnProgresoReciente: vi.fn() }));

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
  proyectoFinalizado: false,
  proyectoCancelado: false,
};

function preparar(ultima: VersionArtefacto | null | undefined, isLoading = false) {
  vi.mocked(useUltimasVersionesEstudiante).mockReturnValue({
    ultimaVersion: () => ultima,
    isLoading,
    isError: false,
    refetch: vi.fn(),
  });
}

function prepararAnterior(revision: RevisionGestionable | null | undefined, isLoading = false) {
  vi.mocked(useRevisionEnProgresoReciente).mockReturnValue({
    revision,
    isLoading,
    isError: false,
    refetch: vi.fn(),
  });
}

const ANTERIOR: RevisionGestionable = {
  id: 'r-0',
  artefactoId: 'a-1',
  version: 1,
  estadoId: 'EN_PROGRESO',
  estadoNombre: 'En progreso',
  nombreProyecto: 'Proyecto',
  nombreDocumento: 'Documento',
  versionDocumento: 3,
  fechaCreacion: '2026-03-02T10:00:00',
};

describe('useUltimaRevisionArtefacto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prepararAnterior(undefined);
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

  it('con la última sin revisión y una anterior en progreso gestiona la anterior y sigue bloqueando subir', () => {
    // Arrange
    preparar({ ...VERSION, revisionAsesor: null, estadoRevision: null });
    prepararAnterior(ANTERIOR);

    // Act
    const { result } = renderHook(() => useUltimaRevisionArtefacto('a-1'));

    // Assert
    expect(useRevisionEnProgresoReciente).toHaveBeenCalledWith('a-1', true);
    expect(result.current.revision).toBe(ANTERIOR);
    expect(result.current.puedeSubir).toBe(false);
    expect(result.current.motivoSubida).toBe('Esperando la revisión del asesor.');
  });

  it('con revisión en la última no busca la anterior, y mientras la busca sigue cargando', () => {
    // Arrange
    preparar(VERSION);
    const conRevision = renderHook(() => useUltimaRevisionArtefacto('a-1'));
    preparar({ ...VERSION, revisionAsesor: null, estadoRevision: null });
    prepararAnterior(undefined, true);

    // Act
    const buscando = renderHook(() => useUltimaRevisionArtefacto('a-1'));

    // Assert
    expect(useRevisionEnProgresoReciente).toHaveBeenCalledWith('a-1', false);
    expect(conRevision.result.current.revision).toMatchObject({ id: 'r-1' });
    expect(buscando.result.current.isLoading).toBe(true);
    expect(buscando.result.current.revision).toBeNull();
  });

  it('propaga el error de la consulta de la revisión anterior', () => {
    // Arrange
    preparar({ ...VERSION, revisionAsesor: null, estadoRevision: null });
    vi.mocked(useRevisionEnProgresoReciente).mockReturnValue({
      revision: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    // Act
    const { result } = renderHook(() => useUltimaRevisionArtefacto('a-1'));

    // Assert
    expect(result.current.isError).toBe(true);
    expect(result.current.revision).toBeNull();
  });
});
