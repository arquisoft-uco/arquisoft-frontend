import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { Item } from '../models/fichas-perfil';
import { useItemsFichaAsesor } from './useItemsFichaAsesor';
import { useRevisionesFichaAsesor } from './useRevisionesFichaAsesor';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarRevisionesItemAsesor: vi.fn() },
}));
vi.mock('./useItemsFichaAsesor', () => ({ useItemsFichaAsesor: vi.fn() }));

const consultar = vi.mocked(fichasPerfilService.consultarRevisionesItemAsesor);
const itemsFicha = vi.mocked(useItemsFichaAsesor);

const ITEM_1: Item = {
  id: 'i-1',
  fichaPerfilId: 'f-1',
  tipoItem: { id: 't-1', nombre: 'Objetivo' },
  contenido: 'Medir',
};
const ITEM_2: Item = { ...ITEM_1, id: 'i-2', contenido: 'Comparar' };

const REVISION = {
  id: 'r-1',
  itemId: 'i-1',
  estadoId: 'NUEVA',
  estadoNombre: 'Nueva',
  fechaCreacion: '2026-09-01T10:00:00Z',
};

function pagina(content: (typeof REVISION)[], totalPages = 1) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages,
    first: true,
    last: totalPages <= 1,
    empty: content.length === 0,
  };
}

function conItems(items: Item[]) {
  const parcial: Partial<ReturnType<typeof useItemsFichaAsesor>> = {
    data: items,
    isSuccess: true,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
  itemsFicha.mockReturnValue(parcial as ReturnType<typeof useItemsFichaAsesor>);
}

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useRevisionesFichaAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta con el filtro item IN [ids], página 0 y tamaño 10, y cruza cada revisión con su ítem', async () => {
    // Arrange
    conItems([ITEM_1, ITEM_2]);
    consultar.mockResolvedValue(pagina([REVISION]));

    // Act
    const { result } = renderHook(() => useRevisionesFichaAsesor('f-1'), {
      wrapper: crearWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.filas).toHaveLength(1));
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: undefined,
      filtros: {
        tipo: 'PREDICADO_MULTIVALOR',
        campo: 'item',
        operador: 'IN',
        valores: ['i-1', 'i-2'],
      },
    });
    expect(result.current.filas[0].item).toBe(ITEM_1);
  });

  it('con la ficha sin ítems no consulta las revisiones y marca sinItems', () => {
    // Arrange
    conItems([]);

    // Act
    const { result } = renderHook(() => useRevisionesFichaAsesor('f-1'), {
      wrapper: crearWrapper(),
    });

    // Assert
    expect(result.current.sinItems).toBe(true);
    expect(result.current.filas).toEqual([]);
    expect(consultar).not.toHaveBeenCalled();
  });

  it('ordenar envía estadoRevision:DESC y vuelve a la página 0; goToPage cambia la página', async () => {
    // Arrange
    conItems([ITEM_1]);
    consultar.mockResolvedValue(pagina([REVISION], 3));
    const { result } = renderHook(() => useRevisionesFichaAsesor('f-1'), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.filas).toHaveLength(1));

    // Act
    act(() => result.current.goToPage(2));
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 2 })),
    );
    act(() => result.current.ordenar('DESC'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({ pagina: 0, ordenamiento: ['estadoRevision:DESC'] }),
      ),
    );
    expect(result.current.page).toBe(0);
  });

  it('si fallan los ítems expone ese error, no consulta y reintentar relanza solo los ítems', () => {
    // Arrange
    const errorDeItems = new Error('fallo ítems');
    const refetchItems = vi.fn();
    const parcial: Partial<ReturnType<typeof useItemsFichaAsesor>> = {
      data: undefined,
      isSuccess: false,
      isLoading: false,
      isError: true,
      error: errorDeItems,
      refetch: refetchItems,
    };
    itemsFicha.mockReturnValue(parcial as ReturnType<typeof useItemsFichaAsesor>);
    const { result } = renderHook(() => useRevisionesFichaAsesor('f-1'), {
      wrapper: crearWrapper(),
    });

    // Act
    act(() => result.current.reintentar());

    // Assert
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(errorDeItems);
    expect(refetchItems).toHaveBeenCalledTimes(1);
    expect(consultar).not.toHaveBeenCalled();
  });

  it('si falla la consulta de revisiones marca el error y reintentar la vuelve a consultar', async () => {
    // Arrange
    conItems([ITEM_1]);
    consultar.mockRejectedValue(new Error('fallo revisiones'));
    const { result } = renderHook(() => useRevisionesFichaAsesor('f-1'), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    consultar.mockClear();

    // Act
    act(() => result.current.reintentar());

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenCalledTimes(1));
  });
});
