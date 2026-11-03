import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { useVersionesEliminablesEstudiante } from './useVersionesEliminablesEstudiante';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { consultarVersionesArtefactoEstudiante: vi.fn() },
}));

const consultar = vi.mocked(artefactosService.consultarVersionesArtefactoEstudiante);

function fila(id: string, artefacto: string, version: number, revision: string | null = null) {
  return {
    id,
    artefacto,
    version,
    revisionAsesor: revision ? `r-${id}` : null,
    estadoRevision: revision,
  } as VersionArtefacto;
}

function pagina(content: VersionArtefacto[]): Page<VersionArtefacto> {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    page: 0,
    size: 2,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

describe('useVersionesEliminablesEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ofrece eliminar solo la última sin revisión con anterior en progreso y pide las dos más recientes', async () => {
    // Arrange
    const v2 = fila('v-2', 'a-1', 2);
    const v1 = fila('v-1', 'a-1', 1, 'EN_PROGRESO');
    consultar.mockResolvedValue(pagina([v2, v1]));

    // Act
    const { result } = renderHook(() => useVersionesEliminablesEstudiante([v2, v1]));

    // Assert
    expect(result.current.puedeEliminar(v2)).toBe(false);
    await waitFor(() => expect(result.current.puedeEliminar(v2)).toBe(true));
    expect(result.current.puedeEliminar(v1)).toBe(false);
    expect(consultar).toHaveBeenCalledTimes(1);
    expect(consultar).toHaveBeenCalledWith(
      expect.objectContaining({ pagina: 0, tamanio: 2, ordenamiento: ['version:DESC'] }),
    );
  });

  it('no consulta los artefactos cuyas filas ya tienen revisión', () => {
    // Arrange
    const conRevision = fila('v-3', 'a-2', 3, 'PENDIENTE');

    // Act
    const { result } = renderHook(() => useVersionesEliminablesEstudiante([conRevision]));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.puedeEliminar(conRevision)).toBe(false);
  });

  it('degrada a no eliminable si la consulta falla', async () => {
    // Arrange
    const v1 = fila('v-1', 'a-1', 1);
    consultar.mockRejectedValue(new Error('x'));

    // Act
    const { result } = renderHook(() => useVersionesEliminablesEstudiante([v1]));

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenCalled());
    expect(result.current.puedeEliminar(v1)).toBe(false);
  });
});
