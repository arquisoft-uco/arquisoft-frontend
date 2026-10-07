import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { CambiarEstadoUsuarioRequest } from '../models/CambiarEstadoUsuarioRequest';
import { usuariosService } from '../services/usuariosService';
import { useCambiarEstadoUsuario } from './useCambiarEstadoUsuario';

vi.mock('../services/usuariosService', () => ({
  usuariosService: {
    cambiarEstadoUsuario: vi.fn(),
  },
}));

const cambiarEstado = vi.mocked(usuariosService.cambiarEstadoUsuario);

const usuarioId = 'u-1';
const request: CambiarEstadoUsuarioRequest = { estado: 'INACTIVO' };

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

describe('useCambiarEstadoUsuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida el listado de usuarios con la key exacta tras cambiar el estado con éxito', async () => {
    // Arrange
    cambiarEstado.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarEstadoUsuario(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate({ usuarioId, req: request }));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cambiarEstado).toHaveBeenCalledWith(usuarioId, request);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['usuarios'] });
  });

  it('no invalida el listado cuando el cambio de estado falla', async () => {
    // Arrange
    cambiarEstado.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarEstadoUsuario(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate({ usuarioId, req: request }));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
