import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useEstadosProyectoGrado } from './useEstadosProyectoGrado';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: { getEstadosProyecto: vi.fn() },
}));

const consultar = vi.mocked(proyectosGradoService.getEstadosProyecto);

const ANTIGUO = {
  id: 'h-1',
  estado: { id: 'EN_DESARROLLO', nombre: 'En desarrollo' },
  fechaActualizacion: '2026-09-01T10:00:00Z',
};
const RECIENTE = {
  id: 'h-2',
  estado: { id: 'EN_REVISION', nombre: 'En revisión' },
  fechaActualizacion: '2026-09-02T10:00:00Z',
};

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEstadosProyectoGrado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta el historial, lo devuelve del más reciente al más antiguo y lo guarda bajo la key del plan', async () => {
    // Arrange
    consultar.mockResolvedValue([ANTIGUO, RECIENTE]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useEstadosProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.data).toEqual([RECIENTE, ANTIGUO]));
    expect(consultar).toHaveBeenCalledWith('p-1');
    expect(queryClient.getQueryData(['proyectos-grado', 'p-1', 'estados'])).toEqual([
      ANTIGUO,
      RECIENTE,
    ]);
  });

  it('no consulta cuando el id está vacío', () => {
    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useEstadosProyectoGrado(''), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });
});
