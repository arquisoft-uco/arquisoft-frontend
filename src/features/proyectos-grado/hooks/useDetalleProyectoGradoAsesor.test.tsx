import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, type AxiosResponse } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useDetalleProyectoGradoAsesor } from './useDetalleProyectoGradoAsesor';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    getDetalleProyectoAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(proyectosGradoService.getDetalleProyectoAsesor);

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useDetalleProyectoGradoAsesor', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: 0 } } });
  });

  it('consulta el proyecto con su key y expone los datos', async () => {
    // Arrange
    const proyecto = {
      id: 'p-1',
      fichaPerfil: 'f-1',
      tituloProyecto: 'Sistema de monitoreo',
      estado: { id: 'EN_PROCESO', nombre: 'En proceso' },
    };
    consultar.mockResolvedValue(proyecto);

    // Act
    const { result } = renderHook(() => useDetalleProyectoGradoAsesor('p-1'), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('p-1');
    expect(result.current.data).toEqual(proyecto);
    expect(queryClient.getQueryCache().getAll()[0].queryKey).toEqual([
      'proyectos-grado',
      'p-1',
      'asesor',
    ]);
  });

  it('sin id no consulta al service', () => {
    // Act
    const { result } = renderHook(() => useDetalleProyectoGradoAsesor(''), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('no reintenta ante un 422 porque es determinista', async () => {
    // Arrange
    const respuesta = { status: 422, data: {} } as AxiosResponse;
    consultar.mockRejectedValue(
      new AxiosError('no encontrado', 'ERR_BAD_REQUEST', undefined, undefined, respuesta),
    );

    // Act
    const { result } = renderHook(() => useDetalleProyectoGradoAsesor('p-1'), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledTimes(1);
  });
});
