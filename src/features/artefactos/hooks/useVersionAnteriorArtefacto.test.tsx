import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { useVersionAnteriorArtefacto } from './useVersionAnteriorArtefacto';

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

function versionN(numero: number) {
  return { id: `v-${numero}`, artefacto: 'a-1', version: numero } as VersionArtefacto;
}

describe('useVersionAnteriorArtefacto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pide un registro filtrado por artefacto y versión N-1 y devuelve el primero', async () => {
    // Arrange
    consultar.mockResolvedValue(pagina([{ id: 'v-2', version: 2 }]));

    // Act
    const { result } = renderHook(() => useVersionAnteriorArtefacto(versionN(3)));

    // Assert
    await waitFor(() => expect(result.current.versionAnterior).toEqual({ id: 'v-2', version: 2 }));
    expect(consultar).toHaveBeenCalledWith(expect.objectContaining({ pagina: 0, tamanio: 1 }));
    const filtros = JSON.stringify(consultar.mock.calls[0][0].filtros);
    expect(filtros).toContain('a-1');
    expect(filtros).toContain('"campo":"version","operador":"ES","valor":"2"');
  });

  it('sin registro resuelve null y la versión 1 no consulta y devuelve null', async () => {
    // Arrange
    consultar.mockResolvedValue(pagina([]));

    // Act
    const vacio = renderHook(() => useVersionAnteriorArtefacto(versionN(2)));
    await waitFor(() => expect(vacio.result.current.versionAnterior).toBeNull());
    consultar.mockClear();
    const primera = renderHook(() => useVersionAnteriorArtefacto(versionN(1)));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(primera.result.current.versionAnterior).toBeNull();
  });
});
