import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { usuariosService } from '../services/usuariosService';
import { useEliminarUsuario } from './useEliminarUsuario';

vi.mock('../services/usuariosService', () => ({
  usuariosService: {
    eliminarUsuario: vi.fn(),
  },
}));

const eliminar = vi.mocked(usuariosService.eliminarUsuario);

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

describe('useEliminarUsuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con el id e invalida el prefijo de usuarios tras eliminar', async () => {
    // Arrange
    eliminar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useEliminarUsuario(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('u-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(eliminar).toHaveBeenCalledWith('u-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['usuarios'] });
  });

  it('propaga el error sin invalidar el listado cuando la eliminación falla', async () => {
    // Arrange
    eliminar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useEliminarUsuario(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('u-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
