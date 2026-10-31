import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { ParticipacionArtefacto } from '../models/ParticipacionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { useParticipacionesEstudiante } from './useParticipacionesEstudiante';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { getParticipacionesEstudiante: vi.fn() },
}));

const getParticipaciones = vi.mocked(artefactosService.getParticipacionesEstudiante);

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
});
