import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { ProyectoGradoAsesor } from '../models/ProyectoGradoAsesor';
import { entregablesService } from '../services/entregablesService';
import { useProyectosAsesor } from './useProyectosAsesor';

vi.mock('../services/entregablesService', () => ({
  entregablesService: {
    consultarProyectosAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(entregablesService.consultarProyectosAsesor);

const proyecto: ProyectoGradoAsesor = {
  id: 'p-1',
  tituloProyecto: 'Sistema de riego',
  estado: { id: 'FINALIZADO', nombre: 'Finalizado' },
};

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useProyectosAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('expone los proyectos del asesor', async () => {
    // Arrange
    consultar.mockResolvedValue([proyecto]);

    // Act
    const { result } = renderHook(() => useProyectosAsesor(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([proyecto]);
  });

  it('expone el error cuando el service rechaza', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('500'));

    // Act
    const { result } = renderHook(() => useProyectosAsesor(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
