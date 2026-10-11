import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { Item } from '../models/fichas-perfil';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';
import { useItemsMiFicha } from './useItemsMiFicha';
import { useRevisionesMiFicha } from './useRevisionesMiFicha';

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

function conItems(items: Item[], itemsCargados = true, extra: Partial<ItemsMiFicha> = {}) {
  const parcial: Partial<ItemsMiFicha> = { items, itemsCargados, ...extra };
  itemsMiFicha.mockReturnValue({
    fichaId: 'f-1',
    items: [],
    tiposItem: [],
    itemsCargados: true,
    isLoading: false,
    isError: false,
    error: null,
    cargandoTipos: false,
    errorTipos: false,
    refetch: vi.fn(),
    agregar: { mutate: vi.fn(), reset: vi.fn(), isPending: false },
    modificar: { mutate: vi.fn(), reset: vi.fn(), isPending: false },
    remover: { mutate: vi.fn(), reset: vi.fn(), isPending: false },
    ...parcial,
  } as ItemsMiFicha);
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

describe('useRevisionesMiFicha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta con el filtro item IN [ids], página 0 y tamaño 10, y cruza cada revisión con su ítem', async () => {
    // Arrange
    conFicha('f-1');
    conItems([ITEM_1, ITEM_2]);
    consultar.mockResolvedValue(
      pagina([REVISION, { ...REVISION, id: 'r-2', itemId: 'i-desconocido' }]),
    );
    const queryClient = nuevoCliente();

    // Act
    const { result } = renderHook(() => useRevisionesMiFicha(), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.filas).toHaveLength(2));
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
    expect(result.current.filas[1].item).toBeUndefined();
    expect(
      queryClient.getQueryData(['fichas-perfil', 'estudiante', 'f-1', 'revisiones', 0, undefined]),
    ).toBeDefined();
  });

  it('con la ficha sin ítems no consulta las revisiones y marca sinItems', () => {
    // Arrange
    conFicha('f-1');
    conItems([]);

    // Act
    const { result } = renderHook(() => useRevisionesMiFicha(), {
      wrapper: crearWrapper(nuevoCliente()),
    });

    // Assert
    expect(result.current.sinItems).toBe(true);
    expect(result.current.filas).toEqual([]);
    expect(consultar).not.toHaveBeenCalled();
  });

  it('no consulta sin ficha activa ni mientras los ítems no se han cargado', () => {
    // Arrange
    conFicha(null);
    conItems([ITEM_1], false);

    // Act
    const { result } = renderHook(() => useRevisionesMiFicha(), {
      wrapper: crearWrapper(nuevoCliente()),
    });

    // Assert
    expect(result.current.sinItems).toBe(false);
    expect(consultar).not.toHaveBeenCalled();
  });

  it('goToPage cambia la página consultada y ordenar envía estadoRevision:DESC volviendo a la página 0', async () => {
    // Arrange
    conFicha('f-1');
    conItems([ITEM_1]);
    consultar.mockResolvedValue(pagina([REVISION], 3));
    const { result } = renderHook(() => useRevisionesMiFicha(), {
      wrapper: crearWrapper(nuevoCliente()),
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
    expect(result.current.direccion).toBe('DESC');
    expect(result.current.page).toBe(0);
  });

  it('cuando falla la consulta de ítems expone ese error y no consulta las revisiones', () => {
    // Arrange
    const errorDeItems = new Error('fallo al consultar los ítems');
    conFicha('f-1');
    conItems([], false, { isError: true, error: errorDeItems });

    // Act
    const { result } = renderHook(() => useRevisionesMiFicha(), {
      wrapper: crearWrapper(nuevoCliente()),
    });

    // Assert
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(errorDeItems);
    expect(consultar).not.toHaveBeenCalled();
  });
});
