import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useItemsFichaAsesor } from './useItemsFichaAsesor';
import { useRevisionesPorItemAsesor } from './useRevisionesPorItemAsesor';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarRevisionesItemAsesor: vi.fn() },
}));
vi.mock('./useItemsFichaAsesor', () => ({ useItemsFichaAsesor: vi.fn() }));

const consultar = vi.mocked(fichasPerfilService.consultarRevisionesItemAsesor);

function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function conItems(data: { id: string }[] | undefined, isSuccess: boolean) {
  vi.mocked(useItemsFichaAsesor).mockReturnValue({ data, isSuccess } as ReturnType<
    typeof useItemsFichaAsesor
  >);
}

describe('useRevisionesPorItemAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta con item IN [ids], página 0 y tamaño 100, y arma el mapa por itemId', async () => {
    // Arrange
    conItems([{ id: 'i-1' }, { id: 'i-2' }], true);
    const revision = {
      id: 'r-1',
      itemId: 'i-1',
      estadoId: 'NUEVA',
      estadoNombre: 'Nueva',
      fechaCreacion: '2026-09-01T10:00:00Z',
    };
    consultar.mockResolvedValue({
      content: [revision],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      size: 100,
      first: true,
      last: true,
      empty: false,
    });

    // Act
    const { result } = renderHook(() => useRevisionesPorItemAsesor('f-1'), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.revisionPorItem.get('i-1')).toEqual(revision));
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 100,
      filtros: {
        tipo: 'PREDICADO_MULTIVALOR',
        campo: 'item',
        operador: 'IN',
        valores: ['i-1', 'i-2'],
      },
    });
    expect(result.current.revisionPorItem.has('i-2')).toBe(false);
  });

  it('sin ítems no consulta y devuelve el mapa vacío', () => {
    // Arrange
    conItems([], true);

    // Act
    const { result } = renderHook(() => useRevisionesPorItemAsesor('f-1'), { wrapper: Wrapper });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.revisionPorItem.size).toBe(0);
  });
});
