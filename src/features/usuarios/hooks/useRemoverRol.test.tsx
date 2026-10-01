import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { Rol } from '../../../shared/models/rol';
import { toast } from '../../../shared/hooks/useToast';
import { usuariosService } from '../services/usuariosService';
import { useRemoverRol } from './useRemoverRol';

vi.mock('../services/usuariosService', () => ({
  usuariosService: {
    removerCoordinador: vi.fn(),
    removerEstudiante: vi.fn(),
    removerAsesor: vi.fn(),
    removerAsesorFicha: vi.fn(),
    removerRepresentanteComite: vi.fn(),
  },
}));

vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const removerCoordinador = vi.mocked(usuariosService.removerCoordinador);
const removerEstudiante = vi.mocked(usuariosService.removerEstudiante);
const removerAsesor = vi.mocked(usuariosService.removerAsesor);
const removerAsesorFicha = vi.mocked(usuariosService.removerAsesorFicha);
const removerRepresentanteComite = vi.mocked(usuariosService.removerRepresentanteComite);

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

describe('useRemoverRol', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('remueve el rol estudiante, invalida usuarios, avisa el éxito y ejecuta onExito', async () => {
    // Arrange
    removerEstudiante.mockResolvedValue(undefined);
    const onExito = vi.fn();
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverRol(), { wrapper: Wrapper });
    act(() =>
      result.current.solicitar({ usuarioId: 'u-1', nombre: 'Ana Gómez', rol: Rol.Estudiante }),
    );

    // Act
    act(() => result.current.confirmar(onExito));

    // Assert
    await waitFor(() => expect(onExito).toHaveBeenCalledOnce());
    expect(removerEstudiante).toHaveBeenCalledWith('u-1');
    expect(removerCoordinador).not.toHaveBeenCalled();
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['usuarios'] });
    expect(toast.success).toHaveBeenCalledWith('Rol eliminado', 'Ana Gómez ya no es estudiante.');
    await waitFor(() => expect(result.current.objetivo).toBeNull());
  });

  it('despacha removerCoordinador cuando el rol es coordinador', async () => {
    // Arrange
    removerCoordinador.mockResolvedValue(undefined);
    const { Wrapper } = crearContexto();
    const { result } = renderHook(() => useRemoverRol(), { wrapper: Wrapper });
    act(() =>
      result.current.solicitar({ usuarioId: 'u-2', nombre: 'Luis Pérez', rol: Rol.Coordinador }),
    );

    // Act
    act(() => result.current.confirmar());

    // Assert
    await waitFor(() => expect(removerCoordinador).toHaveBeenCalledWith('u-2'));
    expect(removerEstudiante).not.toHaveBeenCalled();
  });

  it('despacha removerAsesor e invalida usuarios cuando el rol es asesor', async () => {
    // Arrange
    removerAsesor.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverRol(), { wrapper: Wrapper });
    act(() => result.current.solicitar({ usuarioId: 'u-3', nombre: 'Eva Ruiz', rol: Rol.Asesor }));

    // Act
    act(() => result.current.confirmar());

    // Assert
    await waitFor(() => expect(removerAsesor).toHaveBeenCalledWith('u-3'));
    expect(removerCoordinador).not.toHaveBeenCalled();
    expect(removerEstudiante).not.toHaveBeenCalled();
    await waitFor(() => expect(invalidar).toHaveBeenCalledWith({ queryKey: ['usuarios'] }));
  });

  it('despacha removerAsesorFicha, invalida usuarios y avisa el éxito cuando el rol es asesor de ficha', async () => {
    // Arrange
    removerAsesorFicha.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverRol(), { wrapper: Wrapper });
    act(() =>
      result.current.solicitar({ usuarioId: 'u-4', nombre: 'Eva Ruiz', rol: Rol.AsesorFicha }),
    );

    // Act
    act(() => result.current.confirmar());

    // Assert
    await waitFor(() => expect(removerAsesorFicha).toHaveBeenCalledWith('u-4'));
    expect(removerAsesor).not.toHaveBeenCalled();
    await waitFor(() => expect(invalidar).toHaveBeenCalledWith({ queryKey: ['usuarios'] }));
    expect(toast.success).toHaveBeenCalledWith('Rol eliminado', 'Eva Ruiz ya no es asesor de ficha.');
  });

  it('despacha removerRepresentanteComite, invalida usuarios y avisa el éxito cuando el rol es representante del comité', async () => {
    // Arrange
    removerRepresentanteComite.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverRol(), { wrapper: Wrapper });
    act(() =>
      result.current.solicitar({
        usuarioId: 'u-5',
        nombre: 'Ana Pérez',
        rol: Rol.RepresentanteComiteCurriculum,
      }),
    );

    // Act
    act(() => result.current.confirmar());

    // Assert
    await waitFor(() => expect(removerRepresentanteComite).toHaveBeenCalledWith('u-5'));
    expect(removerAsesorFicha).not.toHaveBeenCalled();
    await waitFor(() => expect(invalidar).toHaveBeenCalledWith({ queryKey: ['usuarios'] }));
    expect(toast.success).toHaveBeenCalledWith(
      'Rol eliminado',
      'Ana Pérez ya no es representante del comité.',
    );
  });

  it('avisa el error, no invalida ni ejecuta onExito y limpia el objetivo cuando el backend falla', async () => {
    // Arrange
    removerEstudiante.mockRejectedValue(new Error('422'));
    const onExito = vi.fn();
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverRol(), { wrapper: Wrapper });
    act(() =>
      result.current.solicitar({ usuarioId: 'u-1', nombre: 'Ana Gómez', rol: Rol.Estudiante }),
    );

    // Act
    act(() => result.current.confirmar(onExito));

    // Assert
    await waitFor(() => expect(toast.error).toHaveBeenCalledOnce());
    expect(onExito).not.toHaveBeenCalled();
    expect(invalidar).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.objetivo).toBeNull());
  });

  it('cancela limpiando el objetivo, pero no mientras la mutación está pendiente', async () => {
    // Arrange
    let resolver: () => void = () => undefined;
    removerEstudiante.mockReturnValue(new Promise<void>((res) => (resolver = res)));
    const { Wrapper } = crearContexto();
    const { result } = renderHook(() => useRemoverRol(), { wrapper: Wrapper });
    const objetivo = { usuarioId: 'u-1', nombre: 'Ana Gómez', rol: Rol.Estudiante };
    act(() => result.current.solicitar(objetivo));
    act(() => result.current.cancelar());
    expect(result.current.objetivo).toBeNull();
    act(() => result.current.solicitar(objetivo));
    act(() => result.current.confirmar());
    await waitFor(() => expect(result.current.isPending).toBe(true));

    // Act
    act(() => result.current.cancelar());

    // Assert
    expect(result.current.objetivo).toEqual(objetivo);
    await act(async () => resolver());
    await waitFor(() => expect(result.current.objetivo).toBeNull());
  });
});
