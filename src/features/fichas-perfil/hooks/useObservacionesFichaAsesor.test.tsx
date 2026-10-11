import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { Item } from '../models/fichas-perfil';
import { useItemsFichaAsesor } from './useItemsFichaAsesor';
import { useObservacionesFichaAsesor } from './useObservacionesFichaAsesor';
import { useRevisionesPorItemAsesor } from './useRevisionesPorItemAsesor';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarObservacionesItemAsesor: vi.fn() },
}));
vi.mock('./useItemsFichaAsesor', () => ({ useItemsFichaAsesor: vi.fn() }));
vi.mock('./useRevisionesPorItemAsesor', () => ({ useRevisionesPorItemAsesor: vi.fn() }));

const consultar = vi.mocked(fichasPerfilService.consultarObservacionesItemAsesor);
const itemsFicha = vi.mocked(useItemsFichaAsesor);
const revisionesPorItem = vi.mocked(useRevisionesPorItemAsesor);

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
const REVISION_2 = { ...REVISION_1, id: 'r-2', itemId: 'i-2' };

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

function conItems(parcial: Partial<ReturnType<typeof useItemsFichaAsesor>>) {
  itemsFicha.mockReturnValue({
    data: [ITEM_1],
    isSuccess: true,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useItemsFichaAsesor>);
}

function conRevisiones(
  mapa: Map<string, typeof REVISION_1>,
  parcial: Partial<ReturnType<typeof useRevisionesPorItemAsesor>> = {},
) {
  revisionesPorItem.mockReturnValue({
    revisionPorItem: mapa,
    isLoading: false,
    isSuccess: true,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useRevisionesPorItemAsesor>);
}

const MAPA_DOS = new Map([
  ['i-1', REVISION_1],
  ['i-2', REVISION_2],
]);
const MAPA_VACIO = new Map<string, typeof REVISION_1>();

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useObservacionesFichaAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta revisionItem IN [ids] en página 0, tamaño 10 y sin orden, y cruza cada observación con su ítem', async () => {
    // Arrange
    conItems({});
    conRevisiones(MAPA_DOS);
    consultar.mockResolvedValue(pagina([OBSERVACION]));

    // Act
    const { result } = renderHook(() => useObservacionesFichaAsesor('f-1'), {
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
        campo: 'revisionItem',
        operador: 'IN',
        valores: ['r-1', 'r-2'],
      },
    });
    expect(result.current.filas[0]).toEqual({ observacion: OBSERVACION, item: ITEM_1 });
    expect(result.current.totalElements).toBe(1);
    expect(result.current.sinObservables).toBe(false);
  });

  it('ordenar DESC envía estadoObservacionRevision:DESC y vuelve a la página 0', async () => {
    // Arrange
    conItems({});
    conRevisiones(MAPA_DOS);
    consultar.mockResolvedValue(pagina([OBSERVACION]));
    const { result } = renderHook(() => useObservacionesFichaAsesor('f-1'), {
      wrapper: crearWrapper(),
    });
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
    conItems({ data: [] });
    conRevisiones(MAPA_VACIO);

    // Act
    const sinItems = renderHook(() => useObservacionesFichaAsesor('f-1'), {
      wrapper: crearWrapper(),
    });

    // Assert
    expect(sinItems.result.current.sinObservables).toBe(true);
    expect(consultar).not.toHaveBeenCalled();
    sinItems.unmount();

    // Arrange
    conItems({});
    conRevisiones(MAPA_VACIO);

    // Act
    const sinRevisiones = renderHook(() => useObservacionesFichaAsesor('f-1'), {
      wrapper: crearWrapper(),
    });

    // Assert
    expect(sinRevisiones.result.current.sinObservables).toBe(true);
    expect(consultar).not.toHaveBeenCalled();
  });

  it('un error de la consulta marca isError y reintentar relanza solo lo que falló', async () => {
    // Arrange
    const refetchItems = vi.fn();
    const refetchRevisiones = vi.fn();
    conItems({ refetch: refetchItems });
    conRevisiones(MAPA_DOS, { refetch: refetchRevisiones });
    consultar.mockRejectedValueOnce(new Error('falla')).mockResolvedValue(pagina([OBSERVACION]));
    const { result } = renderHook(() => useObservacionesFichaAsesor('f-1'), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Act
    act(() => result.current.reintentar());

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.isError).toBe(false));
    expect(refetchItems).not.toHaveBeenCalled();
    expect(refetchRevisiones).not.toHaveBeenCalled();
  });
});
