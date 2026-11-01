import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { useUltimasVersionesEstudiante } from './useUltimasVersionesEstudiante';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { consultarVersionesArtefactoEstudiante: vi.fn() },
}));

const consultar = vi.mocked(artefactosService.consultarVersionesArtefactoEstudiante);

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

describe('useUltimasVersionesEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pide la fila 0 por versión descendente filtrada por artefacto, sin repetir ids, y expone la versión', async () => {
    // Arrange
    consultar.mockResolvedValue(pagina([{ id: 'v-9', estadoRevision: 'EN_PROGRESO' }]));

    // Act
    const { result } = renderHook(() => useUltimasVersionesEstudiante(['a-1', 'a-1', 'a-2']));

    // Assert
    expect(result.current.ultimaVersion('a-1')).toBeUndefined();
    await waitFor(() => expect(result.current.ultimaVersion('a-1')?.id).toBe('v-9'));
    expect(consultar).toHaveBeenCalledTimes(2);
    expect(consultar).toHaveBeenCalledWith(
      expect.objectContaining({ pagina: 0, tamanio: 1, ordenamiento: ['version:DESC'] }),
    );
    expect(JSON.stringify(consultar.mock.calls[0][0].filtros)).toContain('a-1');
  });

  it('un artefacto sin versiones resuelve null y deshabilitado no consulta', async () => {
    // Arrange
    consultar.mockResolvedValue(pagina([]));

    // Act
    const { result } = renderHook(() => useUltimasVersionesEstudiante(['a-1']));
    const apagado = renderHook(() => useUltimasVersionesEstudiante(['a-5'], false));

    // Assert
    await waitFor(() => expect(result.current.ultimaVersion('a-1')).toBeNull());
    expect(consultar).toHaveBeenCalledTimes(1);
    expect(apagado.result.current.ultimaVersion('a-5')).toBeUndefined();
  });
});
