import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { entregablesService } from '../services/entregablesService';
import { useCambiarEstadoEntregable } from './useCambiarEstadoEntregable';

vi.mock('../services/entregablesService', () => ({
  entregablesService: {
    cambiarEstadoEntregable: vi.fn(),
  },
}));

const cambiar = vi.mocked(entregablesService.cambiarEstadoEntregable);

function crearContexto() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
  const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, invalidar };
}

describe('useCambiarEstadoEntregable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cambia el estado e invalida el listado del asesor en éxito', async () => {
    // Arrange
    cambiar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarEstadoEntregable(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate({ entregableId: 'e1', estadoEntregableId: 'CERRADO' }));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cambiar).toHaveBeenCalledWith('e1', { estadoEntregableId: 'CERRADO' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['entregables', 'asesor'] });
  });

  it('no invalida nada cuando el service rechaza', async () => {
    // Arrange
    cambiar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarEstadoEntregable(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate({ entregableId: 'e1', estadoEntregableId: 'CANCELADO' }));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
