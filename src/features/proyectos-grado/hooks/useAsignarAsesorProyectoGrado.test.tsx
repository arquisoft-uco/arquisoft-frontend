import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '../../../test-utils/render';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useAsignarAsesorProyectoGrado } from './useAsignarAsesorProyectoGrado';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    asignarAsesor: vi.fn(),
  },
}));

const asignar = vi.mocked(proyectosGradoService.asignarAsesor);

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useAsignarAsesorProyectoGrado', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('llama al service e invalida la key de asesores del proyecto tras el éxito', async () => {
    // Arrange
    asignar.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAsignarAsesorProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.mutate('a-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(asignar).toHaveBeenCalledWith({ proyectoGradoId: 'p-1', asesorId: 'a-1' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['proyectos-grado', 'p-1', 'asesores'] });
  });

  it('no invalida cuando el service falla', async () => {
    // Arrange
    asignar.mockRejectedValue(new Error('fallo'));
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAsignarAsesorProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.mutate('a-1'));
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(invalidar).not.toHaveBeenCalled();
  });
});
