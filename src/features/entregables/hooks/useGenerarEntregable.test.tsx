import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { entregablesService } from '../services/entregablesService';
import { useGenerarEntregable } from './useGenerarEntregable';

vi.mock('../services/entregablesService', () => ({
  entregablesService: {
    generarEntregable: vi.fn(),
  },
}));

const generar = vi.mocked(entregablesService.generarEntregable);

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

describe('useGenerarEntregable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('genera el entregable e invalida el listado del asesor en éxito', async () => {
    // Arrange
    generar.mockResolvedValue({ id: 'e-1' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useGenerarEntregable(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('p-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(generar).toHaveBeenCalledWith('p-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['entregables', 'asesor'] });
  });

  it('no invalida nada cuando el service rechaza', async () => {
    // Arrange
    generar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useGenerarEntregable(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('p-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
