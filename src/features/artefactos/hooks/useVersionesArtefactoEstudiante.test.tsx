import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { ArtefactoEstudiante } from '../models/ArtefactoEstudiante';
import { artefactosService } from '../services/artefactosService';
import { construirFiltros } from '../utils/filtros-versiones-artefacto';
import { useVersionesArtefactoEstudiante } from './useVersionesArtefactoEstudiante';

vi.mock('../services/artefactosService', () => ({
  artefactosService: {
    consultarVersionesArtefactoEstudiante: vi.fn(),
    consultarArtefactosEstudiante: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.consultarVersionesArtefactoEstudiante);
const consultarCatalogo = vi.mocked(artefactosService.consultarArtefactosEstudiante);

function artefacto(
  id: string,
  nombreDocumento: string,
  nombreProyecto: string,
): ArtefactoEstudiante {
  return {
    id,
    proyectoGrado: 'p-1',
    nombreProyecto,
    versionRepositorioArtefacto: 'r-1',
    nombreDocumento,
    versionDocumento: 1,
    nombreRepositorio: 'Repo',
    asesor: 'as-1',
    nombreAsesor: 'Ana Pérez',
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

describe('useVersionesArtefactoEstudiante', () => {
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

  it('por defecto consulta fechaCreacion:DESC sin filtros con la key del estudiante', async () => {
    // Act
    const { result } = renderHook(() => useVersionesArtefactoEstudiante(), {
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
    ).toEqual([
      'artefactos',
      'versiones-artefacto',
      'estudiante',
      0,
      [],
      '',
      '',
      'fechaCreacion:DESC',
    ]);
  });

  it('traduce q, desde, hasta y orden de la URL a filtros con IN sobre el catálogo', async () => {
    // Act
    const { result } = renderHook(() => useVersionesArtefactoEstudiante(), {
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

  it('un texto sin coincidencias devuelve página vacía sin consultar', async () => {
    // Act
    const { result } = renderHook(() => useVersionesArtefactoEstudiante(), {
      wrapper: crearWrapper(queryClient, '/artefactos?q=inexistente'),
    });
    await waitFor(() => expect(result.current.data?.empty).toBe(true));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });

  it('con el catálogo caído la búsqueda se deshabilita y la consulta no se bloquea', async () => {
    // Arrange
    consultarCatalogo.mockRejectedValue(new Error('fallo'));

    // Act
    const { result } = renderHook(() => useVersionesArtefactoEstudiante(), {
      wrapper: crearWrapper(queryClient, '/artefactos?q=acta'),
    });
    await waitFor(() => expect(result.current.busquedaDisponible).toBe(false));
    await waitFor(() => expect(consultar).toHaveBeenCalled());

    // Assert
    expect(consultar).toHaveBeenCalledWith(
      expect.objectContaining({ filtros: undefined, ordenamiento: ['fechaCreacion:DESC'] }),
    );
  });

  it('setOrden cambia la petición y limpiarFiltros quita los filtros', async () => {
    // Arrange
    const { result } = renderHook(() => useVersionesArtefactoEstudiante(), {
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
  });
});
