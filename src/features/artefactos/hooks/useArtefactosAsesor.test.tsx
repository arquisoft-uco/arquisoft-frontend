import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useArtefactosAsesor } from './useArtefactosAsesor';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { consultarArtefactosAsesor: vi.fn() },
}));

const consultar = vi.mocked(artefactosService.consultarArtefactosAsesor);

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

function crearWrapper(queryClient: QueryClient, ruta = '/artefactos') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[ruta]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

function usarHookConUbicacion() {
  return { listado: useArtefactosAsesor(), ubicacion: useLocation() };
}

describe('useArtefactosAsesor', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(PAGINA_VACIA);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('por defecto pide la página 0 ordenada por proyecto y documento con la key de la feature', async () => {
    // Act
    const { result } = renderHook(() => useArtefactosAsesor(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['nombreProyecto:ASC', 'nombreDocumento:ASC'],
      filtros: undefined,
    });
    expect(result.current.hayFiltros).toBe(false);
    expect(
      queryClient
        .getQueryCache()
        .getAll()
        .map((q) => q.queryKey)
        .find((k) => k[1] === 'asesor'),
    ).toEqual([
      'artefactos',
      'asesor',
      'artefactos-asignados',
      0,
      '',
      '',
      '',
      '',
      '',
      'nombreProyecto:ASC',
    ]);
  });

  it('la búsqueda cambia el body y vuelve a la página 0', async () => {
    // Arrange
    const { result } = renderHook(usarHookConUbicacion, {
      wrapper: crearWrapper(queryClient, '/artefactos?pagina=3'),
    });
    await waitFor(() => expect(result.current.listado.isSuccess).toBe(true));
    expect(result.current.listado.page).toBe(2);

    // Act
    act(() => result.current.listado.setTexto('riego'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          pagina: 0,
          filtros: expect.objectContaining({ tipo: 'GRUPO', conector: 'OR' }),
        }),
      ),
    );
    expect(result.current.listado.hayFiltros).toBe(true);
    expect(result.current.ubicacion.search).not.toContain('pagina');
  });

  it('setOrden al valor por defecto limpia el parámetro y goToPage pide la página siguiente', async () => {
    // Arrange
    const { result } = renderHook(usarHookConUbicacion, {
      wrapper: crearWrapper(queryClient, '/artefactos?orden=versionDocumento:DESC'),
    });
    await waitFor(() => expect(result.current.listado.isSuccess).toBe(true));
    expect(result.current.listado.ordenCampo).toBe('versionDocumento');

    // Act
    act(() => result.current.listado.setOrden('nombreProyecto', 'ASC'));
    await waitFor(() => expect(result.current.ubicacion.search).toBe(''));
    act(() => result.current.listado.goToPage(1));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 1 })),
    );
  });

  it('lee los filtros de la URL, los envía al service y limpiarFiltros los borra', async () => {
    // Arrange
    const { result } = renderHook(usarHookConUbicacion, {
      wrapper: crearWrapper(
        queryClient,
        '/artefactos?pagina=2&proyecto=riego&documento=acta&repositorio=base&version=2',
      ),
    });
    await waitFor(() => expect(result.current.listado.isSuccess).toBe(true));

    // Assert
    expect(result.current.listado.filtros).toEqual({
      texto: '',
      proyecto: 'riego',
      documento: 'acta',
      repositorio: 'base',
      version: '2',
    });
    expect(consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filtros: expect.objectContaining({ tipo: 'GRUPO', conector: 'AND' }),
      }),
    );

    // Act
    act(() => result.current.listado.limpiarFiltros());

    // Assert
    await waitFor(() => expect(result.current.listado.hayFiltros).toBe(false));
    expect(result.current.ubicacion.search).toBe('');
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ filtros: undefined })),
    );
  });

  it('cambiar un filtro vuelve a la página 0', async () => {
    // Arrange
    const { result } = renderHook(usarHookConUbicacion, {
      wrapper: crearWrapper(queryClient, '/artefactos?pagina=3'),
    });
    await waitFor(() => expect(result.current.listado.isSuccess).toBe(true));

    // Act
    act(() => result.current.listado.setVersion('4'));

    // Assert
    await waitFor(() => expect(result.current.listado.filtros.version).toBe('4'));
    expect(result.current.listado.page).toBe(0);
    expect(result.current.ubicacion.search).not.toContain('pagina');
  });
});
