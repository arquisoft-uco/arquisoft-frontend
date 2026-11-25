import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { ParticipacionArtefacto } from '../models/ParticipacionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { useParticipacionesEstudiante } from './useParticipacionesEstudiante';
import { useMisProyectosGrado } from '../../../shared/hooks/useMisProyectosGrado';

vi.mock('../../../shared/hooks/useMisProyectosGrado', () => ({
  useMisProyectosGrado: vi.fn(),
}));

vi.mock('../services/artefactosService', () => ({
  artefactosService: {
    consultarParticipacionesEstudiante: vi.fn(),
    getEstadosRevisionAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.consultarParticipacionesEstudiante);

const LISTA: ParticipacionArtefacto[] = [
  {
    id: 'a-1',
    proyectoGrado: 'p-1',
    nombreProyecto: 'Riego',
    versionRepositorioArtefacto: 'r-1',
    nombreDocumento: 'Acta',
    versionDocumento: 1,
    nombreRepositorio: 'Base',
    asesor: 'u-1',
    nombreAsesor: 'Laura Gómez',
    omitido: false,
    proyectoFinalizado: false,
    proyectoCancelado: true,
  },
  {
    id: 'a-2',
    proyectoGrado: 'p-1',
    nombreProyecto: 'Riego',
    versionRepositorioArtefacto: 'r-2',
    nombreDocumento: 'Anteproyecto',
    versionDocumento: 2,
    nombreRepositorio: 'Base',
    asesor: 'u-1',
    nombreAsesor: 'Laura Gómez',
    omitido: false,
    proyectoFinalizado: false,
    proyectoCancelado: true,
  },
];

const PAGINA: Page<ParticipacionArtefacto> = {
  content: LISTA,
  totalElements: 2,
  totalPages: 1,
  page: 0,
  size: 10,
  first: true,
  last: true,
  empty: false,
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

describe('useParticipacionesEstudiante', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(artefactosService.getEstadosRevisionAsesor).mockResolvedValue([
      { id: 'CERRADA', nombre: 'Cerrada', descripcion: 'Revisión cerrada' },
    ]);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('pide la página con el orden por proyecto, agrupa y toma las banderas de cierre de la fila', async () => {
    // Arrange
    consultar.mockResolvedValue(PAGINA);

    // Act
    const { result } = renderHook(() => useParticipacionesEstudiante(), {
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
    expect(result.current.proyectos).toHaveLength(1);
    expect(result.current.proyectos[0]).toMatchObject({
      proyectoCancelado: true,
      proyectoFinalizado: false,
    });
    expect(
      queryClient
        .getQueryCache()
        .getAll()
        .map((q) => q.queryKey)
        .find((k) => k[1] === 'estudiante')
        ?.slice(0, 3),
    ).toEqual(['artefactos', 'estudiante', 'participaciones']);
  });

  it('ante un error expone isError y una lista vacía', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('falla'));

    // Act
    const { result } = renderHook(() => useParticipacionesEstudiante(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.proyectos).toEqual([]);
  });

  it('envía el estado de la URL como nombre y el orden elegido como criterio secundario', async () => {
    // Arrange
    consultar.mockResolvedValue(PAGINA);

    // Act
    const { result } = renderHook(() => useParticipacionesEstudiante(), {
      wrapper: crearWrapper(
        queryClient,
        '/artefactos?estadoRevision=CERRADA&orden=nombreAsesor:DESC',
      ),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    const criterio = consultar.mock.calls[0][0];
    expect(criterio.ordenamiento).toEqual(['nombreProyecto:ASC', 'nombreAsesor:DESC']);
    expect(JSON.stringify(criterio.filtros)).toContain('Cerrada');
  });

  it('la página y el texto de la URL viajan en el criterio y en la key', async () => {
    // Arrange
    consultar.mockResolvedValue(PAGINA);

    // Act
    const { result } = renderHook(() => useParticipacionesEstudiante(), {
      wrapper: crearWrapper(queryClient, '/artefactos?pagina=3&q=riego'),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    const criterio = consultar.mock.calls[0][0];
    expect(criterio.pagina).toBe(2);
    expect(JSON.stringify(criterio.filtros)).toContain('riego');
    expect(
      queryClient
        .getQueryCache()
        .getAll()
        .some((q) => q.queryKey[2] === 'participaciones' && q.queryKey[3] === 2),
    ).toBe(true);
  });

  it('con un estado en la URL no consulta hasta que carga el catálogo', async () => {
    // Arrange
    let resolverCatalogo: (v: never[]) => void = () => undefined;
    vi.mocked(artefactosService.getEstadosRevisionAsesor).mockReturnValue(
      new Promise((resolve) => {
        resolverCatalogo = resolve as typeof resolverCatalogo;
      }),
    );
    consultar.mockResolvedValue(PAGINA);

    // Act
    const { result } = renderHook(() => useParticipacionesEstudiante(), {
      wrapper: crearWrapper(queryClient, '/artefactos?estadoRevision=CERRADA'),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.isFetching).toBe(false);
    resolverCatalogo([]);
  });

  it('no consulta los proyectos de grado y mantiene la lista anterior mientras carga la página siguiente', async () => {
    // Arrange
    consultar.mockResolvedValueOnce(PAGINA);
    const { result } = renderHook(() => useParticipacionesEstudiante(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    consultar.mockReturnValueOnce(new Promise(() => undefined));

    // Act
    act(() => result.current.goToPage(1));
    await waitFor(() => expect(result.current.isFetching).toBe(true));

    // Assert
    expect(result.current.proyectos).toHaveLength(1);
    expect(result.current.isPlaceholderData).toBe(true);
    expect(useMisProyectosGrado).not.toHaveBeenCalled();
  });
});
