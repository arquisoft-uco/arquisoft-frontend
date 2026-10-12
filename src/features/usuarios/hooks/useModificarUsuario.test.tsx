import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { ModificarUsuarioRequest } from '../models/ModificarUsuarioRequest';
import { usuariosService } from '../services/usuariosService';
import { useModificarUsuario } from './useModificarUsuario';

vi.mock('../services/usuariosService', () => ({
  usuariosService: {
    modificarUsuario: vi.fn(),
  },
}));

const modificar = vi.mocked(usuariosService.modificarUsuario);

const usuarioId = 'u-1';
const request: ModificarUsuarioRequest = {
  identificador: '2001',
  nombres: 'Marta',
  apellidos: 'Ríos',
  email: 'marta@uco.edu.co',
  contacto: '3001234567',
};

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

describe('useModificarUsuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida el listado de usuarios con la key exacta tras modificar con éxito', async () => {
    // Arrange
    modificar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarUsuario(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate({ usuarioId, req: request }));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modificar).toHaveBeenCalledWith(usuarioId, request);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['usuarios'] });
  });

  it('no invalida el listado cuando la modificación falla', async () => {
    // Arrange
    modificar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarUsuario(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate({ usuarioId, req: request }));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
