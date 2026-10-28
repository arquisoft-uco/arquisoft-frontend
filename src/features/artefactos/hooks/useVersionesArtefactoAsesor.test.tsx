import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { ArtefactoAsesor } from '../models/ArtefactoAsesor';
import { artefactosService } from '../services/artefactosService';
import { construirFiltros } from '../utils/filtros-versiones-artefacto';
import { useVersionesArtefactoAsesor } from './useVersionesArtefactoAsesor';

vi.mock('../services/artefactosService', () => ({
  artefactosService: {
    consultarVersionesArtefactoAsesor: vi.fn(),
    consultarArtefactosAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.consultarVersionesArtefactoAsesor);
const consultarCatalogo = vi.mocked(artefactosService.consultarArtefactosAsesor);

function artefacto(id: string, nombreDocumento: string, nombreProyecto: string): ArtefactoAsesor {
  return {
    id,
    proyectoGrado: 'p-1',
    nombreProyecto,
    versionRepositorioArtefacto: 'r-1',
    nombreDocumento,
    versionDocumento: 1,
    nombreRepositorio: 'Repo',
  };
}

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

describe('useVersionesArtefactoAsesor', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(PAGINA_VACIA);
    consultarCatalogo.mockResolvedValue({
      ...PAGINA_VACIA,
      content: [
        artefacto('a-1', 'Acta de inicio', 'Sistema de riego'),
        artefacto('a-2', 'Cronograma', 'Huerta urbana'),
      ],
    });
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('por defecto pide la página 0 con fechaCreacion:DESC explícito y la key de la feature', async () => {
    // Act
    const { result } = renderHook(() => useVersionesArtefactoAsesor(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['fechaCreacion:DESC'],
      filtros: undefined,
    });
    expect(result.current.hayFiltros).toBe(false);
    expect(
      queryClient
        .getQueryCache()
        .getAll()
        .map((q) => q.queryKey)
        .find((k) => k[1] === 'versiones-artefacto'),
    ).toEqual(['artefactos', 'versiones-artefacto', 'asesor', 0, [], '', '', 'fechaCreacion:DESC']);
  });

  it('lee q, desde, hasta y orden de la URL y los traduce a filtros con IN sobre el catálogo', async () => {
    // Act
    const { result } = renderHook(() => useVersionesArtefactoAsesor(), {
      wrapper: crearWrapper(
        queryClient,
        '/artefactos?q=acta&desde=2026-10-01&hasta=2026-10-15&orden=version:ASC',
      ),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['version:ASC'],
      filtros: construirFiltros({ artefactos: ['a-1'], desde: '2026-10-01', hasta: '2026-10-15' }),
    });
    expect(result.current.hayFiltros).toBe(true);
    expect(result.current.ordenCampo).toBe('version');
  });

  it('una fecha inválida o un orden fuera de la lista se descartan', async () => {
    // Act
    const { result } = renderHook(() => useVersionesArtefactoAsesor(), {
      wrapper: crearWrapper(queryClient, '/artefactos?desde=2026-02-30&orden=artefacto:ASC'),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith(
      expect.objectContaining({ ordenamiento: ['fechaCreacion:DESC'], filtros: undefined }),
    );
  });

  it('setOrden cambia la petición y limpiarFiltros quita los filtros', async () => {
    // Arrange
    const { result } = renderHook(() => useVersionesArtefactoAsesor(), {
      wrapper: crearWrapper(queryClient, '/artefactos?q=acta'),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.setOrden('version', 'ASC'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({ ordenamiento: ['version:ASC'] }),
      ),
    );

    // Act
    act(() => result.current.limpiarFiltros());

    // Assert
    await waitFor(() => expect(result.current.hayFiltros).toBe(false));
    expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ filtros: undefined }));
  });

  it('un texto sin coincidencias en el catálogo no consulta y devuelve la página vacía', async () => {
    // Act
    const { result } = renderHook(() => useVersionesArtefactoAsesor(), {
      wrapper: crearWrapper(queryClient, '/artefactos?q=zzz'),
    });
    await waitFor(() => expect(consultarCatalogo).toHaveBeenCalled());
    await waitFor(() => expect(result.current.data?.totalElements).toBe(0));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.hayFiltros).toBe(true);
  });

  it('si el catálogo falla ignora q, consulta sin filtro y marca la búsqueda como no disponible', async () => {
    // Arrange
    consultarCatalogo.mockRejectedValue(new Error('fallo'));

    // Act
    const { result } = renderHook(() => useVersionesArtefactoAsesor(), {
      wrapper: crearWrapper(queryClient, '/artefactos?q=acta'),
    });
    await waitFor(() => expect(result.current.busquedaDisponible).toBe(false));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ filtros: undefined }));
  });
});
