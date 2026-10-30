import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useArtefactosEstudiante } from './useArtefactosEstudiante';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { consultarArtefactosEstudiante: vi.fn() },
}));

const consultar = vi.mocked(artefactosService.consultarArtefactosEstudiante);

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
  return { listado: useArtefactosEstudiante(), ubicacion: useLocation() };
}

describe('useArtefactosEstudiante', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(PAGINA_VACIA);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('por defecto pide la página 0 con el orden por proyecto y documento y la key de la feature', async () => {
    // Act
    const { result } = renderHook(() => useArtefactosEstudiante(), {
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
        .find((k) => k[1] === 'estudiante'),
    ).toEqual([
      'artefactos',
      'estudiante',
      'mis-artefactos',
      0,
      '',
      '',
      '',
      '',
      '',
      '',
      'nombreProyecto:ASC',
    ]);
  });

  it('un filtro de texto cambia el body y vuelve a la página 0', async () => {
    // Arrange
    const { result } = renderHook(usarHookConUbicacion, {
      wrapper: crearWrapper(queryClient, '/artefactos?pagina=3'),
    });
    await waitFor(() => expect(result.current.listado.isSuccess).toBe(true));
    expect(result.current.listado.page).toBe(2);

    // Act
    act(() => result.current.listado.setProyecto('riego'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          pagina: 0,
          filtros: {
            tipo: 'PREDICADO',
            campo: 'nombreProyecto',
            operador: 'CONTIENE',
            valor: 'riego',
          },
        }),
      ),
    );
    expect(result.current.listado.hayFiltros).toBe(true);
    expect(result.current.ubicacion.search).not.toContain('pagina');
  });

  it('setOrden al valor por defecto limpia el parámetro de la URL', async () => {
    // Arrange
    const { result } = renderHook(usarHookConUbicacion, {
      wrapper: crearWrapper(queryClient, '/artefactos?orden=versionDocumento:DESC'),
    });
    await waitFor(() => expect(result.current.listado.isSuccess).toBe(true));
    expect(result.current.listado.ordenCampo).toBe('versionDocumento');

    // Act
    act(() => result.current.listado.setOrden('nombreProyecto', 'ASC'));

    // Assert
    await waitFor(() => expect(result.current.ubicacion.search).toBe(''));
    expect(result.current.listado.orden).toBe('nombreProyecto:ASC');
  });

  it('goToPage pide la página siguiente', async () => {
    // Arrange
    const { result } = renderHook(() => useArtefactosEstudiante(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.goToPage(1));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 1 })),
    );
  });
});
