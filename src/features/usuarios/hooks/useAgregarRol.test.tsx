import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { toast } from '../../../shared/hooks/useToast';
import { Rol } from '../../../shared/models/rol';
import { usuariosService } from '../services/usuariosService';
import { useAgregarRol } from './useAgregarRol';

vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

vi.mock('../services/usuariosService', () => ({
  usuariosService: {
    agregarRol: vi.fn(),
  },
}));

const agregarRol = vi.mocked(usuariosService.agregarRol);

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

describe('useAgregarRol', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    Rol.Coordinador,
    Rol.Estudiante,
    Rol.Asesor,
    Rol.AsesorFicha,
    Rol.RepresentanteComiteCurriculum,
    Rol.Administrador,
  ])('agrega el rol %s con el id e invalida el prefijo de usuarios al éxito', async (rol) => {
    // Arrange
    agregarRol.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarRol(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate({ usuarioId: 'u-1', rol, nombre: 'Ana Pérez' }));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(agregarRol).toHaveBeenCalledWith('u-1', rol);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['usuarios'] });
  });

  it('propaga el error y no invalida cuando el backend falla', async () => {
    // Arrange
    agregarRol.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarRol(), { wrapper: Wrapper });

    // Act
    act(() =>
      result.current.mutate({ usuarioId: 'u-1', rol: Rol.Estudiante, nombre: 'Ana Pérez' }),
    );

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
  it('avisa con toast.success al agregar el rol, aunque el componente que lo pidió ya no exista', async () => {
    // Arrange
    agregarRol.mockResolvedValue(undefined);
    const { Wrapper } = crearContexto();
    const { result } = renderHook(() => useAgregarRol(), { wrapper: Wrapper });

    // Act
    act(() =>
      result.current.mutate({ usuarioId: 'u-1', rol: Rol.Estudiante, nombre: 'Ana Pérez' }),
    );

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith(
      'Rol agregado',
      'Se agregó el rol Estudiante a Ana Pérez.',
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('avisa con toast.error cuando el backend falla', async () => {
    // Arrange
    agregarRol.mockRejectedValue(new Error('422'));
    const { Wrapper } = crearContexto();
    const { result } = renderHook(() => useAgregarRol(), { wrapper: Wrapper });

    // Act
    act(() =>
      result.current.mutate({ usuarioId: 'u-1', rol: Rol.Estudiante, nombre: 'Ana Pérez' }),
    );

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('No se pudo agregar el rol', expect.any(String));
    expect(toast.success).not.toHaveBeenCalled();
  });
});
