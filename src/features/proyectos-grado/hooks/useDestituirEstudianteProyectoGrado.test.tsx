import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '../../../test-utils/render';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useDestituirEstudianteProyectoGrado } from './useDestituirEstudianteProyectoGrado';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    destituirEstudiante: vi.fn(),
  },
}));

const destituir = vi.mocked(proyectosGradoService.destituirEstudiante);

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useDestituirEstudianteProyectoGrado', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('llama al service con ambos ids e invalida la key de estudiantes del proyecto tras el éxito', async () => {
    // Arrange
    destituir.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDestituirEstudianteProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.mutate('e-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(destituir).toHaveBeenCalledWith({ proyectoGradoId: 'p-1', estudianteId: 'e-1' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['proyectos-grado', 'p-1', 'estudiantes'] });
  });

  it('también invalida cuando el service falla', async () => {
    // Arrange
    destituir.mockRejectedValue(new Error('fallo'));
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDestituirEstudianteProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.mutate('e-1'));
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['proyectos-grado', 'p-1', 'estudiantes'] });
  });
});
