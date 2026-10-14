import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { CompaneroProyectoGrado } from '../models/CompaneroProyectoGrado';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useCompanerosProyectoGrado } from './useCompanerosProyectoGrado';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    getCompanerosProyecto: vi.fn(),
  },
}));

const consultar = vi.mocked(proyectosGradoService.getCompanerosProyecto);

const companero: CompaneroProyectoGrado = {
  estudianteId: 'e-1',
  identificador: '2001',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
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

describe('useCompanerosProyectoGrado', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('consulta los compañeros del proyecto con su propia key y conserva el orden recibido', async () => {
    // Arrange
    const otro = { ...companero, estudianteId: 'e-2', nombre: 'Zoe Ruiz' };
    consultar.mockResolvedValue([companero, otro]);

    // Act
    const { result } = renderHook(() => useCompanerosProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('p-1');
    expect(result.current.data).toEqual([companero, otro]);
    expect(queryClient.getQueryCache().getAll()[0].queryKey).toEqual([
      'proyectos-grado',
      'p-1',
      'companeros',
    ]);
  });

  it('sin id no consulta al service', () => {
    // Act
    const { result } = renderHook(() => useCompanerosProyectoGrado(null), {
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
    const { result } = renderHook(() => useCompanerosProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
