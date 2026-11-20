import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useArtefactosSinAvanceAsesor } from './useArtefactosSinAvanceAsesor';

vi.mock('../services/artefactosService', () => ({
  artefactosService: {
    consultarArtefactosSinAvanceAsesor: vi.fn(),
    getEstadosRevisionAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.consultarArtefactosSinAvanceAsesor);

const PAGINA_VACIA = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 10,
  first: true,
  last: true,
  empty: true,
};

const SOLO_HABILITADOS = {
  tipo: 'GRUPO',
  conector: 'AND',
  nodos: [
    { tipo: 'PREDICADO', campo: 'proyectoFinalizado', operador: 'ES', valor: 'false' },
    { tipo: 'PREDICADO', campo: 'proyectoCancelado', operador: 'ES', valor: 'false' },
  ],
};

function crearWrapper(queryClient: QueryClient, ruta = '/artefactos?vista=sin-avance') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[ruta]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useArtefactosSinAvanceAsesor', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(PAGINA_VACIA);
    vi.mocked(artefactosService.getEstadosRevisionAsesor).mockResolvedValue([]);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('la primera consulta usa 15 días, orden por antigüedad y la key de la feature', async () => {
    // Act
    const { result } = renderHook(() => useArtefactosSinAvanceAsesor(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      diasSinAvance: 15,
      criterio: {
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['fechaUltimaVersion:ASC'],
        filtros: SOLO_HABILITADOS,
      },
    });
    expect(
      queryClient
        .getQueryCache()
        .getAll()
        .map((q) => q.queryKey)
        .find((k) => k[1] === 'asesor'),
    ).toEqual(['artefactos', 'asesor', 'sin-avance', 0, 15, '', '', 'fechaUltimaVersion:ASC', '']);
  });

  it('el estado del proyecto va dentro de criterio.filtros y limpiarFiltros vuelve a habilitados', async () => {
    // Arrange
    const { result } = renderHook(
      () => ({ listado: useArtefactosSinAvanceAsesor(), ubicacion: useLocation() }),
      {
        wrapper: crearWrapper(
          queryClient,
          '/artefactos?vista=sin-avance&estadoProyecto=finalizados',
        ),
      },
    );
    await waitFor(() => expect(result.current.listado.isSuccess).toBe(true));

    // Assert
    expect(result.current.listado.hayFiltros).toBe(true);
    expect(consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({
        criterio: expect.objectContaining({
          filtros: {
            tipo: 'PREDICADO',
            campo: 'proyectoFinalizado',
            operador: 'ES',
            valor: 'true',
          },
        }),
      }),
    );

    // Act
    act(() => result.current.listado.limpiarFiltros());

    // Assert
    await waitFor(() => expect(result.current.listado.hayFiltros).toBe(false));
    expect(result.current.ubicacion.search).not.toContain('estadoProyecto');
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          criterio: expect.objectContaining({ filtros: SOLO_HABILITADOS }),
        }),
      ),
    );
  });

  it('un plazo inválido en la URL no dispara consulta y expone errorDias', async () => {
    // Act
    const { result } = renderHook(() => useArtefactosSinAvanceAsesor(), {
      wrapper: crearWrapper(queryClient, '/artefactos?vista=sin-avance&dias=0'),
    });

    // Assert
    expect(result.current.dias).toBeNull();
    expect(result.current.errorDias).toBeTruthy();
    expect(consultar).not.toHaveBeenCalled();
  });

  it('un plazo válido reenvía la consulta con el nuevo valor', async () => {
    // Arrange
    const { result } = renderHook(() => useArtefactosSinAvanceAsesor(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.setDias('30'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ diasSinAvance: 30 })),
    );
    expect(result.current.dias).toBe(30);
  });

  it('el estado va como id en la URL y como nombre en el filtro, también con un enlace antiguo', async () => {
    // Arrange
    vi.mocked(artefactosService.getEstadosRevisionAsesor).mockResolvedValue([
      { id: 'CERRADA', nombre: 'Cerrada', descripcion: '' },
    ]);
    const esperado = expect.objectContaining({
      criterio: expect.objectContaining({
        filtros: {
          tipo: 'GRUPO',
          conector: 'AND',
          nodos: [
            { tipo: 'PREDICADO', campo: 'estadoUltimaRevision', operador: 'ES', valor: 'Cerrada' },
            ...SOLO_HABILITADOS.nodos,
          ],
        },
      }),
    });

    // Act
    const porId = renderHook(() => useArtefactosSinAvanceAsesor(), {
      wrapper: crearWrapper(queryClient, '/artefactos?vista=sin-avance&estado=CERRADA'),
    });
    await waitFor(() => expect(porId.result.current.isSuccess).toBe(true));
    const porNombre = renderHook(() => useArtefactosSinAvanceAsesor(), {
      wrapper: crearWrapper(queryClient, '/artefactos?vista=sin-avance&estado=Cerrada'),
    });
    await waitFor(() => expect(porNombre.result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledTimes(2);
    expect(consultar).toHaveBeenNthCalledWith(1, esperado);
    expect(consultar).toHaveBeenNthCalledWith(2, esperado);
    expect(porId.result.current.filtros.estado).toBe('CERRADA');
    expect(porNombre.result.current.filtros.estado).toBe('CERRADA');
    expect(porNombre.result.current.hayFiltros).toBe(true);
  });

  it('setEstado escribe el id en la URL', async () => {
    // Arrange
    const { result } = renderHook(
      () => ({ listado: useArtefactosSinAvanceAsesor(), ubicacion: useLocation() }),
      { wrapper: crearWrapper(queryClient) },
    );
    await waitFor(() => expect(result.current.listado.isSuccess).toBe(true));

    // Act
    act(() => result.current.listado.setEstado('CERRADA'));

    // Assert
    await waitFor(() => expect(result.current.ubicacion.search).toContain('estado=CERRADA'));
  });

  it('con un enlace antiguo no consulta hasta cargar el catálogo de estados', async () => {
    // Arrange
    let resolverCatalogo: (estados: []) => void = () => undefined;
    vi.mocked(artefactosService.getEstadosRevisionAsesor).mockReturnValue(
      new Promise((resolver) => {
        resolverCatalogo = resolver;
      }),
    );

    // Act
    const { result } = renderHook(() => useArtefactosSinAvanceAsesor(), {
      wrapper: crearWrapper(queryClient, '/artefactos?vista=sin-avance&estado=Cerrada'),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();

    // Act
    resolverCatalogo([]);

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.filtros.estado).toBe('');
  });
});
