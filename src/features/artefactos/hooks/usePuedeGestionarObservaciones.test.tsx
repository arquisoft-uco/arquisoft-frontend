import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { usePuedeGestionarObservaciones } from './usePuedeGestionarObservaciones';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { getIdsArtefactosOmitidosAsesor: vi.fn() },
}));

const getIds = vi.mocked(artefactosService.getIdsArtefactosOmitidosAsesor);

function version(parcial: Partial<VersionArtefacto>): VersionArtefacto {
  return {
    id: 'v-2',
    artefacto: 'a-1',
    version: 2,
    fechaCreacion: '2026-03-10T15:30:00Z',
    nombreProyecto: 'Sistema de riego',
    nombreDocumento: 'Acta de inicio',
    versionDocumento: 1,
    nombreRepositorio: 'Repositorio base',
    nombreAsesor: 'Marta Gómez',
    revisionAsesor: 'r-1',
    estadoRevision: 'PENDIENTE',
    nombreEstadoRevision: 'Pendiente',
    fechaCreacionRevision: null,
    ...parcial,
  };
}

describe('usePuedeGestionarObservaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getIds.mockResolvedValue(['a-omitido']);
  });

  it('cierra mientras carga y luego abre solo con revisión pendiente de un artefacto no omitido', async () => {
    // Arrange
    const elegible = version({});
    const enProgreso = version({ estadoRevision: 'EN_PROGRESO' });
    const omitida = version({ artefacto: 'a-omitido' });

    // Act
    const { result } = renderHook(() => usePuedeGestionarObservaciones());

    // Assert
    expect(result.current.puedeGestionar(elegible)).toBe(false);
    await waitFor(() => expect(result.current.puedeGestionar(elegible)).toBe(true));
    expect(result.current.puedeGestionar(enProgreso)).toBe(false);
    expect(result.current.puedeGestionar(omitida)).toBe(false);
  });

  it('si falla el catálogo de omitidos no ofrece gestionar', async () => {
    // Arrange
    getIds.mockRejectedValue(new Error('fallo'));

    // Act
    const { result } = renderHook(() => usePuedeGestionarObservaciones());

    // Assert
    await waitFor(() => expect(getIds).toHaveBeenCalled());
    expect(result.current.puedeGestionar(version({}))).toBe(false);
  });
});
