import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { RegistrarUsuarioRequest } from '../models/RegistrarUsuarioRequest';
import { usuariosService } from '../services/usuariosService';
import { useRegistrarUsuario } from './useRegistrarUsuario';

vi.mock('../services/usuariosService', () => ({
  usuariosService: {
    consultarCoordinadoresAdministrador: vi.fn(),
    registrarUsuario: vi.fn(),
  },
}));

const registrar = vi.mocked(usuariosService.registrarUsuario);

const request: RegistrarUsuarioRequest = {
  identificador: '1001',
  nombres: 'Ana',
  apellidos: 'Pérez',
  email: 'ana@uco.edu.co',
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

describe('useRegistrarUsuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida el listado de coordinadores con la key exacta tras registrar', async () => {
    // Arrange
    registrar.mockResolvedValue({ id: 'u-1' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarUsuario(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(registrar).toHaveBeenCalledWith(request);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['usuarios', 'coordinadores'] });
  });

  it('no invalida el listado cuando el registro falla', async () => {
    // Arrange
    registrar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarUsuario(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
