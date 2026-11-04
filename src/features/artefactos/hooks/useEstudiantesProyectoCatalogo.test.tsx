import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useEstudiantesProyectoCatalogo } from './useEstudiantesProyectoCatalogo';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { getEstudiantesProyectoAsesorado: vi.fn() },
}));

const consultar = vi.mocked(artefactosService.getEstudiantesProyectoAsesorado);

const ESTUDIANTE = {
  estudianteId: 'e-1',
  identificador: '2001',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
};

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useEstudiantesProyectoCatalogo', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('con proyecto consulta sus estudiantes bajo la key de catálogo', async () => {
    // Arrange
    consultar.mockResolvedValue([ESTUDIANTE]);

    // Act
    const { result } = renderHook(() => useEstudiantesProyectoCatalogo('p-1'), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.estudiantes).toEqual([ESTUDIANTE]));

    // Assert
    expect(consultar).toHaveBeenCalledWith('p-1');
    expect(queryClient.getQueryCache().getAll()[0].queryKey).toEqual([
      'artefactos',
      'catalogos',
      'estudiantes-proyecto',
      'p-1',
    ]);
  });

  it('sin proyecto no consulta al service', () => {
    // Act
    const { result } = renderHook(() => useEstudiantesProyectoCatalogo(''), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.estudiantes).toEqual([]);
  });
});
