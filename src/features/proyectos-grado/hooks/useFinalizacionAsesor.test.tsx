import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '../../../test-utils/render';
import { toast } from '../../../shared/hooks/useToast';
import type { AsesorProyectoGrado } from '../models/AsesorProyectoGrado';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useFinalizacionAsesor } from './useFinalizacionAsesor';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    cambiarEstadoAsesor: vi.fn(),
  },
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const cambiarEstado = vi.mocked(proyectosGradoService.cambiarEstadoAsesor);

const asesor: AsesorProyectoGrado = {
  id: 'ap-2',
  proyectoGradoId: 'p-1',
  asesorId: 'a-1',
  identificador: '1001',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
  estado: { id: 'ASIGNADO', nombre: 'Asignado' },
  fechaAsignado: '2026-03-10T12:00:00Z',
  vigente: true,
  actual: true,
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

describe('useFinalizacionAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('solicitar fija el pendiente sin llamar al service y cancelar lo limpia', () => {
    // Arrange
    const { result } = renderHook(() => useFinalizacionAsesor('p-1'), { wrapper: crearWrapper() });

    // Act
    act(() => result.current.solicitar(asesor));

    // Assert
    expect(result.current.pendiente).toEqual(asesor);
    expect(cambiarEstado).not.toHaveBeenCalled();

    // Act
    act(() => result.current.cancelar());

    // Assert
    expect(result.current.pendiente).toBeNull();
  });

  it('confirmar finaliza por asesorId, avisa el éxito y limpia el pendiente', async () => {
    // Arrange
    cambiarEstado.mockResolvedValue(undefined);
    const { result } = renderHook(() => useFinalizacionAsesor('p-1'), { wrapper: crearWrapper() });
    act(() => result.current.solicitar(asesor));

    // Act
    act(() => result.current.confirmar());

    // Assert
    await waitFor(() => expect(result.current.pendiente).toBeNull());
    expect(cambiarEstado).toHaveBeenCalledWith({
      proyectoGradoId: 'p-1',
      asesorId: 'a-1',
      estadoAsesorId: 'FINALIZADO',
    });
    expect(toast.success).toHaveBeenCalledWith('Participación finalizada', expect.any(String));
  });

  it('ante un error muestra el toast de error y limpia el pendiente', async () => {
    // Arrange
    cambiarEstado.mockRejectedValue(new Error('red'));
    const { result } = renderHook(() => useFinalizacionAsesor('p-1'), { wrapper: crearWrapper() });
    act(() => result.current.solicitar(asesor));

    // Act
    act(() => result.current.confirmar());

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo finalizar la participación',
        'Inténtalo nuevamente.',
      ),
    );
    await waitFor(() => expect(result.current.pendiente).toBeNull());
    expect(toast.success).not.toHaveBeenCalled();
  });
});
