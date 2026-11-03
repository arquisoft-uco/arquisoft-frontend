import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { useUltimaVersionArtefacto } from './useUltimaVersionArtefacto';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { consultarVersionesArtefactoAsesor: vi.fn() },
}));

const consultar = vi.mocked(artefactosService.consultarVersionesArtefactoAsesor);

function pagina(content: Partial<VersionArtefacto>[]): Page<VersionArtefacto> {
  return {
    content: content as VersionArtefacto[],
    totalElements: content.length,
    totalPages: 1,
    page: 0,
    size: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

describe('useUltimaVersionArtefacto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pide la fila 0 por versión descendente filtrada por artefacto y devuelve la primera', async () => {
    // Arrange
    consultar.mockResolvedValue(pagina([{ id: 'v-9', version: 9 }]));

    // Act
    const { result } = renderHook(() => useUltimaVersionArtefacto('a-1', true));

    // Assert
    await waitFor(() => expect(result.current.ultimaVersion).toEqual({ id: 'v-9', version: 9 }));
    expect(consultar).toHaveBeenCalledWith(
      expect.objectContaining({ pagina: 0, tamanio: 1, ordenamiento: ['version:DESC'] }),
    );
    expect(JSON.stringify(consultar.mock.calls[0][0].filtros)).toContain('a-1');
  });

  it('sin versiones resuelve null y deshabilitado no consulta', async () => {
    // Arrange
    consultar.mockResolvedValue(pagina([]));

    // Act
    const vacio = renderHook(() => useUltimaVersionArtefacto('a-1', true));
    await waitFor(() => expect(vacio.result.current.ultimaVersion).toBeNull());
    consultar.mockClear();
    const deshabilitado = renderHook(() => useUltimaVersionArtefacto('a-2', false));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(deshabilitado.result.current.ultimaVersion).toBeUndefined();
  });
});
