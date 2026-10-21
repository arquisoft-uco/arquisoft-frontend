import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { AsesorProyectoGrado } from '../models/AsesorProyectoGrado';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useAsesoresAsignadosProyectoGrado } from './useAsesoresAsignadosProyectoGrado';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    getAsesoresAsignadosProyecto: vi.fn(),
  },
}));

const consultar = vi.mocked(proyectosGradoService.getAsesoresAsignadosProyecto);

const asesor: AsesorProyectoGrado = {
  id: 'ap-1',
  proyectoGradoId: 'p-1',
  asesorId: 'a-1',
  identificador: '1001',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
  estado: { id: 'ASIGNADO', nombre: 'Asignado' },
  fechaAsignado: '2026-03-10T12:00:00Z',
  vigente: true,
  actual: true,
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

describe('useAsesoresAsignadosProyectoGrado', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('consulta los asesores asignados con su propia key y marca «actual» solo en la fila ASIGNADO', async () => {
    // Arrange
    const finalizado: AsesorProyectoGrado = {
      ...asesor,
      id: 'ap-0',
      estado: { id: 'FINALIZADO', nombre: 'Finalizado' },
    };
    consultar.mockResolvedValue([asesor, finalizado]);

    // Act
    const { result } = renderHook(() => useAsesoresAsignadosProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('p-1');
    expect(result.current.data?.map((a) => a.actual)).toEqual([true, false]);
    expect(queryClient.getQueryCache().getAll()[0].queryKey).toEqual([
      'proyectos-grado',
      'p-1',
      'asesores-asignados',
    ]);
  });

  it('sin id no consulta al service', () => {
    // Act
    const { result } = renderHook(() => useAsesoresAsignadosProyectoGrado(null), {
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
    const { result } = renderHook(() => useAsesoresAsignadosProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
