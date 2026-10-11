import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { Item } from '../models/fichas-perfil';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';
import { useItemsMiFicha } from './useItemsMiFicha';
import { useRevisionesPorItemMiFicha } from './useRevisionesPorItemMiFicha';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarRevisionesItemEstudiante: vi.fn() },
}));
vi.mock('./useFichaPerfilIdEstudiante', () => ({ useFichaPerfilIdEstudiante: vi.fn() }));
vi.mock('./useItemsMiFicha', () => ({ useItemsMiFicha: vi.fn() }));

type ItemsMiFicha = ReturnType<typeof useItemsMiFicha>;

const consultar = vi.mocked(fichasPerfilService.consultarRevisionesItemEstudiante);
const idEstudiante = vi.mocked(useFichaPerfilIdEstudiante);
const itemsMiFicha = vi.mocked(useItemsMiFicha);

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

function pagina(content: (typeof REVISION)[]) {
  return {
    content,
    page: 0,
    size: 100,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

function conItems(items: Item[], itemsCargados = true) {
  itemsMiFicha.mockReturnValue({ items, itemsCargados } as ItemsMiFicha);
}

function conFicha(fichaPerfilId: string | null) {
  idEstudiante.mockReturnValue({ fichaPerfilId } as ReturnType<typeof useFichaPerfilIdEstudiante>);
}

function nuevoCliente() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useRevisionesPorItemMiFicha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con ítems consulta tamanio 100 con item IN [ids], devuelve la lista completa y usa su propia key', async () => {
    // Arrange
    conFicha('f-1');
    conItems([ITEM_1, ITEM_2]);
    consultar.mockResolvedValue(pagina([REVISION, { ...REVISION, id: 'r-2' }]));
    const queryClient = nuevoCliente();

    // Act
    const { result } = renderHook(() => useRevisionesPorItemMiFicha(), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.revisiones).toHaveLength(2));
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
    expect(result.current.isSuccess).toBe(true);
    expect(
      queryClient.getQueryData(['fichas-perfil', 'estudiante', 'f-1', 'revisiones-por-item']),
    ).toBeDefined();
  });

  it('no consulta sin ítems, sin ficha activa ni mientras los ítems no se han cargado', () => {
    // Arrange
    conFicha('f-1');
    conItems([]);

    // Act
    const sinItems = renderHook(() => useRevisionesPorItemMiFicha(), {
      wrapper: crearWrapper(nuevoCliente()),
    });

    // Assert
    expect(sinItems.result.current.revisiones).toEqual([]);
    sinItems.unmount();

    // Arrange
    conFicha(null);
    conItems([ITEM_1]);

    // Act
    const sinFicha = renderHook(() => useRevisionesPorItemMiFicha(), {
      wrapper: crearWrapper(nuevoCliente()),
    });
    sinFicha.unmount();

    // Arrange
    conFicha('f-1');
    conItems([ITEM_1], false);

    // Act
    renderHook(() => useRevisionesPorItemMiFicha(), { wrapper: crearWrapper(nuevoCliente()) });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });

  it('cuando la consulta falla marca isError', async () => {
    // Arrange
    conFicha('f-1');
    conItems([ITEM_1]);
    consultar.mockRejectedValue(new Error('falla'));

    // Act
    const { result } = renderHook(() => useRevisionesPorItemMiFicha(), {
      wrapper: crearWrapper(nuevoCliente()),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.revisiones).toEqual([]);
  });
});
