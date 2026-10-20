import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { Item } from '../models/fichas-perfil';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';
import { useItemsMiFicha } from './useItemsMiFicha';
import { useObservacionesMiFicha } from './useObservacionesMiFicha';
import { useRevisionesPorItemMiFicha } from './useRevisionesPorItemMiFicha';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarObservacionesItemEstudiante: vi.fn() },
}));
vi.mock('./useFichaPerfilIdEstudiante', () => ({ useFichaPerfilIdEstudiante: vi.fn() }));
vi.mock('./useItemsMiFicha', () => ({ useItemsMiFicha: vi.fn() }));
vi.mock('./useRevisionesPorItemMiFicha', () => ({ useRevisionesPorItemMiFicha: vi.fn() }));

type ItemsMiFicha = ReturnType<typeof useItemsMiFicha>;
type RevisionesPorItem = ReturnType<typeof useRevisionesPorItemMiFicha>;

const consultar = vi.mocked(fichasPerfilService.consultarObservacionesItemEstudiante);
const idEstudiante = vi.mocked(useFichaPerfilIdEstudiante);
const itemsMiFicha = vi.mocked(useItemsMiFicha);
const revisionesPorItem = vi.mocked(useRevisionesPorItemMiFicha);

const ITEM_1: Item = {
  id: 'i-1',
  fichaPerfilId: 'f-1',
  tipoItem: { id: 't-1', nombre: 'Objetivo' },
  contenido: 'Medir',
};

const REVISION_1 = {
  id: 'r-1',
  itemId: 'i-1',
  estadoId: 'NUEVA',
  estadoNombre: 'Nueva',
  fechaCreacion: '2026-09-01T10:00:00Z',
};
const REVISION_2 = { ...REVISION_1, id: 'r-2' };

const OBSERVACION = {
  id: 'o-1',
  revisionItemId: 'r-1',
  observacion: 'Ajustar el alcance',
  estadoId: 'PENDIENTE',
  estadoNombre: 'Pendiente',
};

function pagina(content: (typeof OBSERVACION)[]) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

function conItems(parcial: Partial<ItemsMiFicha> = {}) {
  itemsMiFicha.mockReturnValue({
    items: [ITEM_1],
    itemsCargados: true,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as ItemsMiFicha);
}

function conRevisiones(
  revisiones: (typeof REVISION_1)[],
  parcial: Partial<RevisionesPorItem> = {},
) {
  revisionesPorItem.mockReturnValue({
    revisiones,
    isLoading: false,
    isSuccess: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as RevisionesPorItem);
}

function nuevoCliente() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function crearWrapper(queryClient: QueryClient = nuevoCliente()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useObservacionesMiFicha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    idEstudiante.mockReturnValue({ fichaPerfilId: 'f-1' } as ReturnType<
      typeof useFichaPerfilIdEstudiante
    >);
  });

  it('consulta revisionItem IN [ids] en página 0, tamaño 10 y sin orden, cruza con el ítem y usa la key con el id de la ficha', async () => {
    // Arrange
    conItems();
    conRevisiones([REVISION_1, REVISION_2]);
    consultar.mockResolvedValue(pagina([OBSERVACION]));
    const queryClient = nuevoCliente();

    // Act
    const { result } = renderHook(() => useObservacionesMiFicha(), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.filas).toHaveLength(1));
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: undefined,
      filtros: {
        tipo: 'PREDICADO_MULTIVALOR',
        campo: 'revisionItem',
        operador: 'IN',
        valores: ['r-1', 'r-2'],
      },
    });
    expect(result.current.filas[0]).toEqual({
      observacion: OBSERVACION,
      item: ITEM_1,
      revisionCerrada: false,
    });
    expect(result.current.sinObservables).toBe(false);
    expect(
      queryClient.getQueryData([
        'fichas-perfil',
        'estudiante',
        'f-1',
        'observaciones',
        ['r-1', 'r-2'],
        0,
        undefined,
      ]),
    ).toBeDefined();
  });

  it('ordenar DESC envía estadoObservacionRevision:DESC y vuelve a la página 0', async () => {
    // Arrange
    conItems();
    conRevisiones([REVISION_1]);
    consultar.mockResolvedValue(pagina([OBSERVACION]));
    const { result } = renderHook(() => useObservacionesMiFicha(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.filas).toHaveLength(1));
    act(() => result.current.goToPage(2));
    await waitFor(() => expect(result.current.page).toBe(2));

    // Act
    act(() => result.current.ordenar('DESC'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({ pagina: 0, ordenamiento: ['estadoObservacionRevision:DESC'] }),
      ),
    );
    expect(result.current.page).toBe(0);
    expect(result.current.direccion).toBe('DESC');
  });

  it('sin ítems o sin revisiones no consulta y marca sinObservables', () => {
    // Arrange
    conItems({ items: [] });
    conRevisiones([]);

    // Act
    const sinItems = renderHook(() => useObservacionesMiFicha(), { wrapper: crearWrapper() });

    // Assert
    expect(sinItems.result.current.sinObservables).toBe(true);
    expect(consultar).not.toHaveBeenCalled();
    sinItems.unmount();

    // Arrange
    conItems();
    conRevisiones([]);

    // Act
    const sinRevisiones = renderHook(() => useObservacionesMiFicha(), { wrapper: crearWrapper() });

    // Assert
    expect(sinRevisiones.result.current.sinObservables).toBe(true);
    expect(consultar).not.toHaveBeenCalled();
  });

  it('la carga de ítems o de revisiones se refleja en isLoading', () => {
    // Arrange
    conItems({ isLoading: true, itemsCargados: false, items: [] });
    conRevisiones([], { isLoading: true, isSuccess: false });

    // Act
    const { result } = renderHook(() => useObservacionesMiFicha(), { wrapper: crearWrapper() });

    // Assert
    expect(result.current.isLoading).toBe(true);
    expect(consultar).not.toHaveBeenCalled();
  });

  it('un error de la consulta marca isError y reintentar relanza solo lo que falló', async () => {
    // Arrange
    const refetchItems = vi.fn();
    const refetchRevisiones = vi.fn();
    conItems({ refetch: refetchItems });
    conRevisiones([REVISION_1], { refetch: refetchRevisiones });
    consultar.mockRejectedValueOnce(new Error('falla')).mockResolvedValue(pagina([OBSERVACION]));
    const { result } = renderHook(() => useObservacionesMiFicha(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Act
    act(() => result.current.reintentar());

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.isError).toBe(false));
    expect(refetchItems).not.toHaveBeenCalled();
    expect(refetchRevisiones).not.toHaveBeenCalled();
  });

  it('un error de ítems se expone y reintentar relanza solo esa fuente', () => {
    // Arrange
    const errorItems = new Error('items');
    const refetchItems = vi.fn();
    const refetchRevisiones = vi.fn();
    conItems({ isError: true, error: errorItems, refetch: refetchItems, itemsCargados: false });
    conRevisiones([], { refetch: refetchRevisiones, isSuccess: false });
    const { result } = renderHook(() => useObservacionesMiFicha(), { wrapper: crearWrapper() });

    // Act
    act(() => result.current.reintentar());

    // Assert
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(errorItems);
    expect(refetchItems).toHaveBeenCalledTimes(1);
    expect(refetchRevisiones).not.toHaveBeenCalled();
  });
});
