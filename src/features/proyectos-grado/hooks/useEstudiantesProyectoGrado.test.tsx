import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { EstudianteProyectoGrado } from '../models/EstudianteProyectoGrado';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useEstudiantesProyectoGrado } from './useEstudiantesProyectoGrado';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    getEstudiantesProyecto: vi.fn(),
  },
}));

const consultar = vi.mocked(proyectosGradoService.getEstudiantesProyecto);

const estudiante: EstudianteProyectoGrado = {
  id: 'ep-1',
  proyectoGradoId: 'p-1',
  estudianteId: 'e-1',
  identificador: '2001',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
  vigente: true,
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

describe('useEstudiantesProyectoGrado', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('consulta los estudiantes del proyecto y los guarda bajo la key de la feature', async () => {
    // Arrange
    consultar.mockResolvedValue([estudiante]);

    // Act
    const { result } = renderHook(() => useEstudiantesProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('p-1');
    expect(result.current.data).toEqual([estudiante]);
    expect(queryClient.getQueryCache().getAll()[0].queryKey).toEqual([
      'proyectos-grado',
      'p-1',
      'estudiantes',
    ]);
  });

  it('sin id no consulta al service', () => {
    // Act
    const { result } = renderHook(() => useEstudiantesProyectoGrado(null), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo'));

    // Act
    const { result } = renderHook(() => useEstudiantesProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
