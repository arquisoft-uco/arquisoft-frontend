import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '../../../test-utils/render';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useFinalizarAsesorProyectoGrado } from './useFinalizarAsesorProyectoGrado';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    cambiarEstadoAsesor: vi.fn(),
  },
}));

const finalizar = vi.mocked(proyectosGradoService.cambiarEstadoAsesor);

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useFinalizarAsesorProyectoGrado', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('llama al service con el estado FINALIZADO e invalida la key de asesores del proyecto tras el éxito', async () => {
    // Arrange
    finalizar.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useFinalizarAsesorProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.mutate('a-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(finalizar).toHaveBeenCalledWith({
      proyectoGradoId: 'p-1',
      asesorId: 'a-1',
      estadoAsesorId: 'FINALIZADO',
    });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['proyectos-grado', 'p-1', 'asesores'] });
  });

  it('también invalida cuando el service falla', async () => {
    // Arrange
    finalizar.mockRejectedValue(new Error('fallo'));
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useFinalizarAsesorProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.mutate('a-1'));
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['proyectos-grado', 'p-1', 'asesores'] });
  });
});
