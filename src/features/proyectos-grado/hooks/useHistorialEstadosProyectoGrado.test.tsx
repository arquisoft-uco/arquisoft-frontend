import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, type AxiosResponse } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useHistorialEstadosProyectoGrado } from './useHistorialEstadosProyectoGrado';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: { getHistorialEstadosProyecto: vi.fn() },
}));

const consultar = vi.mocked(proyectosGradoService.getHistorialEstadosProyecto);

const ANTIGUO = {
  id: 'h-1',
  estado: { id: 'EN_PROCESO', nombre: 'En proceso' },
  fechaActualizacion: '2026-09-01T10:00:00Z',
  motivo: null,
};
const RECIENTE = {
  id: 'h-2',
  estado: { id: 'FINALIZADO', nombre: 'Finalizado' },
  fechaActualizacion: '2026-09-02T10:00:00Z',
  motivo: null,
};

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useHistorialEstadosProyectoGrado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve el historial del más reciente al más antiguo y lo guarda bajo la key del plan', async () => {
    // Arrange
    consultar.mockResolvedValue([ANTIGUO, RECIENTE]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useHistorialEstadosProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.data).toEqual([RECIENTE, ANTIGUO]));
    expect(consultar).toHaveBeenCalledWith('p-1');
    expect(queryClient.getQueryData(['proyectos-grado', 'p-1', 'historial-estados'])).toEqual([
      ANTIGUO,
      RECIENTE,
    ]);
  });

  it('no consulta cuando el id está vacío', () => {
    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useHistorialEstadosProyectoGrado(''), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('no reintenta un 422 de negocio', async () => {
    // Arrange
    const respuesta = { status: 422, data: {} } as AxiosResponse;
    consultar.mockRejectedValue(
      new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, respuesta),
    );
    const queryClient = new QueryClient();

    // Act
    const { result } = renderHook(() => useHistorialEstadosProyectoGrado('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(consultar).toHaveBeenCalledTimes(1);
  });
});
