import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { ParticipacionArtefacto } from '../models/ParticipacionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { useMisProyectosGrado } from '../../../shared/hooks/useMisProyectosGrado';
import { useParticipacionesEstudiante } from './useParticipacionesEstudiante';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { getParticipacionesEstudiante: vi.fn() },
}));

vi.mock('../../../shared/hooks/useMisProyectosGrado', () => ({ useMisProyectosGrado: vi.fn() }));

const getParticipaciones = vi.mocked(artefactosService.getParticipacionesEstudiante);
const misProyectos = vi.mocked(useMisProyectosGrado);

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
  },
];

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useParticipacionesEstudiante', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    misProyectos.mockReturnValue({
      proyecto: {
        id: 'p-1',
        fichaPerfil: 'f-1',
        tituloProyecto: 'Riego',
        estado: { id: 'EN_PROCESO', nombre: 'En proceso' },
      },
      proyectos: [],
      seleccionarProyecto: vi.fn(),
      cargado: true,
      sinProyecto: false,
      hayError: false,
      reintentar: vi.fn(),
    });
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('devuelve la lista, los grupos por proyecto y el total con la key de la feature', async () => {
    // Arrange
    getParticipaciones.mockResolvedValue(LISTA);

    // Act
    const { result } = renderHook(() => useParticipacionesEstudiante(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.participaciones).toEqual(LISTA);
    expect(result.current.proyectos).toHaveLength(1);
    expect(result.current.totalArtefactos).toBe(2);
    expect(queryClient.getQueryCache().getAll()[0].queryKey).toEqual([
      'artefactos',
      'estudiante',
      'participaciones',
    ]);
  });

  it('ante un error expone isError y una lista vacía', async () => {
    // Arrange
    getParticipaciones.mockRejectedValue(new Error('falla'));

    // Act
    const { result } = renderHook(() => useParticipacionesEstudiante(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.proyectos).toEqual([]);
    expect(result.current.totalArtefactos).toBe(0);
  });

  it('deriva los flags de cierre del estado del proyecto cruzado por id', async () => {
    // Arrange
    getParticipaciones.mockResolvedValue(LISTA);
    misProyectos.mockReturnValue({
      proyecto: null,
      proyectos: [
        {
          id: 'p-1',
          fichaPerfil: 'f-1',
          tituloProyecto: 'Riego',
          estado: { id: 'CANCELADO', nombre: 'Cancelado' },
        },
      ],
      seleccionarProyecto: vi.fn(),
      cargado: true,
      sinProyecto: false,
      hayError: false,
      reintentar: vi.fn(),
    } as never);

    // Act
    const { result } = renderHook(() => useParticipacionesEstudiante(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.proyectos[0]).toMatchObject({
      proyectoCancelado: true,
      proyectoFinalizado: false,
    });
  });

  it('sin el estado del proyecto los flags son falsos y el listado carga igual', async () => {
    // Arrange
    getParticipaciones.mockResolvedValue(LISTA);

    // Act
    const { result } = renderHook(() => useParticipacionesEstudiante(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.proyectos[0]).toMatchObject({
      proyectoCancelado: false,
      proyectoFinalizado: false,
    });
    expect(result.current.totalArtefactos).toBe(2);
  });
});
