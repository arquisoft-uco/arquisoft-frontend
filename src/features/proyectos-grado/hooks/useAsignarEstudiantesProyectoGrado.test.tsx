import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '../../../test-utils/render';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useAsignarEstudiantesProyectoGrado } from './useAsignarEstudiantesProyectoGrado';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    asignarEstudiantes: vi.fn(),
  },
}));

const asignar = vi.mocked(proyectosGradoService.asignarEstudiantes);

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useAsignarEstudiantesProyectoGrado', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('llama al service e invalida la key de estudiantes del proyecto tras el éxito', async () => {
    // Arrange
    asignar.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAsignarEstudiantesProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.mutate(['e-1', 'e-2']));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(asignar).toHaveBeenCalledWith({
      proyectoGradoId: 'p-1',
      estudiantesIds: ['e-1', 'e-2'],
    });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['proyectos-grado', 'p-1', 'estudiantes'] });
  });

  it('no invalida cuando el service falla', async () => {
    // Arrange
    asignar.mockRejectedValue(new Error('fallo'));
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAsignarEstudiantesProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.mutate(['e-1']));
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(invalidar).not.toHaveBeenCalled();
  });
});
