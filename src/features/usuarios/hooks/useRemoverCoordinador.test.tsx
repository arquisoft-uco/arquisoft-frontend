import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { usuariosService } from '../services/usuariosService';
import { useRemoverCoordinador } from './useRemoverCoordinador';

vi.mock('../services/usuariosService', () => ({
  usuariosService: {
    removerCoordinador: vi.fn(),
  },
}));

const removerCoordinador = vi.mocked(usuariosService.removerCoordinador);

function crearContexto() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, invalidar };
}

describe('useRemoverCoordinador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('remueve el coordinador con el id e invalida el prefijo de usuarios al éxito', async () => {
    // Arrange
    removerCoordinador.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverCoordinador(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('u-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(removerCoordinador).toHaveBeenCalledWith('u-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['usuarios'] });
  });

  it('propaga el error y no invalida cuando el backend falla', async () => {
    // Arrange
    removerCoordinador.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverCoordinador(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('u-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
