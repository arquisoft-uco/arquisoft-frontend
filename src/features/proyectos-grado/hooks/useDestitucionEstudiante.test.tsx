import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '../../../test-utils/render';
import { toast } from '../../../shared/hooks/useToast';
import type { EstudianteProyectoGrado } from '../models/EstudianteProyectoGrado';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useDestitucionEstudiante } from './useDestitucionEstudiante';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    destituirEstudiante: vi.fn(),
  },
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const destituir = vi.mocked(proyectosGradoService.destituirEstudiante);

const estudiante: EstudianteProyectoGrado = {
  id: 'ep-1',
  proyectoGradoId: 'p-1',
  estudianteId: 'e-1',
  identificador: '2001',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
  vigente: true,
};

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useDestitucionEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('solicitar fija el pendiente sin llamar al service y cancelar lo limpia', () => {
    // Arrange
    const { result } = renderHook(() => useDestitucionEstudiante('p-1'), {
      wrapper: crearWrapper(),
    });

    // Act
    act(() => result.current.solicitar(estudiante));

    // Assert
    expect(result.current.pendiente).toEqual(estudiante);
    expect(destituir).not.toHaveBeenCalled();

    // Act
    act(() => result.current.cancelar());

    // Assert
    expect(result.current.pendiente).toBeNull();
  });

  it('confirmar destituye por estudianteId, avisa el éxito y limpia el pendiente', async () => {
    // Arrange
    destituir.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDestitucionEstudiante('p-1'), {
      wrapper: crearWrapper(),
    });
    act(() => result.current.solicitar(estudiante));

    // Act
    act(() => result.current.confirmar());

    // Assert
    await waitFor(() => expect(result.current.pendiente).toBeNull());
    expect(destituir).toHaveBeenCalledWith({ proyectoGradoId: 'p-1', estudianteId: 'e-1' });
    expect(toast.success).toHaveBeenCalledWith('Estudiante destituido', expect.any(String));
  });

  it('ante un error muestra el toast de error y limpia el pendiente', async () => {
    // Arrange
    destituir.mockRejectedValue(new Error('red'));
    const { result } = renderHook(() => useDestitucionEstudiante('p-1'), {
      wrapper: crearWrapper(),
    });
    act(() => result.current.solicitar(estudiante));

    // Act
    act(() => result.current.confirmar());

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo destituir al estudiante',
        'Inténtalo nuevamente.',
      ),
    );
    await waitFor(() => expect(result.current.pendiente).toBeNull());
    expect(toast.success).not.toHaveBeenCalled();
  });
});
