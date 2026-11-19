import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '../../../test-utils/render';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useFinalizarProyectoGrado } from './useFinalizarProyectoGrado';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    finalizarProyecto: vi.fn(),
  },
}));

const finalizar = vi.mocked(proyectosGradoService.finalizarProyecto);

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useFinalizarProyectoGrado', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('llama al service e invalida el prefijo proyectos-grado tras el éxito', async () => {
    // Arrange
    finalizar.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useFinalizarProyectoGrado(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.mutate({ proyectoGradoId: 'p-1' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(finalizar).toHaveBeenCalledWith({ proyectoGradoId: 'p-1' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['proyectos-grado'] });
  });

  it('también invalida cuando el service falla', async () => {
    // Arrange
    finalizar.mockRejectedValue(new Error('fallo'));
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useFinalizarProyectoGrado(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.mutate({ proyectoGradoId: 'p-1' }));
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['proyectos-grado'] });
  });
});
