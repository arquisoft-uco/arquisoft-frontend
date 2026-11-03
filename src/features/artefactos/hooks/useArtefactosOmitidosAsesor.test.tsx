import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useArtefactosOmitidosAsesor } from './useArtefactosOmitidosAsesor';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { getIdsArtefactosOmitidosAsesor: vi.fn() },
}));

const getIds = vi.mocked(artefactosService.getIdsArtefactosOmitidosAsesor);

describe('useArtefactosOmitidosAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve los ids omitidos como un Set', async () => {
    // Arrange
    getIds.mockResolvedValue(['a-1', 'a-2']);

    // Act
    const { result } = renderHook(() => useArtefactosOmitidosAsesor());

    // Assert
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.omitidos).toBeInstanceOf(Set));
    expect(result.current.omitidos?.has('a-2')).toBe(true);
    expect(result.current.omitidos?.has('a-3')).toBe(false);
  });

  it('ante un fallo expone el error y no hay catálogo', async () => {
    // Arrange
    getIds.mockRejectedValue(new Error('fallo'));

    // Act
    const { result } = renderHook(() => useArtefactosOmitidosAsesor());

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.omitidos).toBeUndefined();
  });
});
