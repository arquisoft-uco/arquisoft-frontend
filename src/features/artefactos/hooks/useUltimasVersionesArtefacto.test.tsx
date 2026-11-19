import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { useUltimasVersionesArtefacto } from './useUltimasVersionesArtefacto';

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

describe('useUltimasVersionesArtefacto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pide las dos primeras filas por versión descendente filtrada por artefacto, sin repetir ids, y resuelve la última y la anterior', async () => {
    // Arrange
    consultar.mockResolvedValue(pagina([{ id: 'v-9' }, { id: 'v-8' }]));

    // Act
    const { result } = renderHook(() => useUltimasVersionesArtefacto(['a-1', 'a-1', 'a-2']));

    // Assert
    await waitFor(() => expect(result.current.ultimaVersionId('a-1')).toBe('v-9'));
    expect(result.current.versionAnterior('a-1')).toEqual({ id: 'v-8' });
    expect(consultar).toHaveBeenCalledTimes(2);
    expect(consultar).toHaveBeenCalledWith(
      expect.objectContaining({ pagina: 0, tamanio: 2, ordenamiento: ['version:DESC'] }),
    );
    expect(JSON.stringify(consultar.mock.calls[0][0].filtros)).toContain('a-1');
  });

  it('un artefacto sin versiones resuelve null y deshabilitado no consulta', async () => {
    // Arrange
    consultar.mockResolvedValue(pagina([]));

    // Act
    const { result } = renderHook(() => useUltimasVersionesArtefacto(['a-1']));
    const apagado = renderHook(() => useUltimasVersionesArtefacto(['a-5'], false));

    // Assert
    await waitFor(() => expect(result.current.ultimaVersionId('a-1')).toBeNull());
    expect(result.current.versionAnterior('a-1')).toBeNull();
    expect(consultar).toHaveBeenCalledTimes(1);
    expect(apagado.result.current.ultimaVersionId('a-5')).toBeUndefined();
    expect(apagado.result.current.versionAnterior('a-5')).toBeUndefined();
  });

  it('ultimaVersion es undefined cargando, la versión cuando llega y null sin versiones', async () => {
    // Arrange
    consultar.mockImplementation(({ filtros }) =>
      Promise.resolve(
        JSON.stringify(filtros).includes('a-1') ? pagina([{ id: 'v-9' }]) : pagina([]),
      ),
    );

    // Act
    const { result } = renderHook(() => useUltimasVersionesArtefacto(['a-1', 'a-2']));
    const alInicio = result.current.ultimaVersion('a-1');

    // Assert
    expect(alInicio).toBeUndefined();
    await waitFor(() => expect(result.current.ultimaVersion('a-1')).toEqual({ id: 'v-9' }));
    await waitFor(() => expect(result.current.ultimaVersion('a-2')).toBeNull());
  });
});
