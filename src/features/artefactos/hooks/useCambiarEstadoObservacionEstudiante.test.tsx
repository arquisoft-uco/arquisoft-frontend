import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { toast } from '../../../shared/hooks/useToast';
import { artefactosService } from '../services/artefactosService';
import { useCambiarEstadoObservacionEstudiante } from './useCambiarEstadoObservacionEstudiante';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { cambiarEstadoObservacionEstudiante: vi.fn() },
}));

vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const cambiar = vi.mocked(artefactosService.cambiarEstadoObservacionEstudiante);

const CLAVE_OBSERVACIONES = [
  'artefactos',
  'revisiones-asesor',
  'r-1',
  'observaciones',
  'estudiante',
];
const VARIABLES = {
  observacionId: 'o-1',
  revisionAsesorId: 'r-1',
  estado: 'SOLUCIONADA' as const,
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

describe('useCambiarEstadoObservacionEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con el estado e invalida las observaciones de la revisión al éxito', async () => {
    // Arrange
    cambiar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarEstadoObservacionEstudiante(), {
      wrapper: Wrapper,
    });

    // Act
    await act(() => result.current.mutateAsync(VARIABLES));

    // Assert
    expect(cambiar).toHaveBeenCalledWith('o-1', { estado: 'SOLUCIONADA' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['artefactos', 'revisiones-asesor', 'estudiante'],
    });
    expect(toast.success).toHaveBeenCalledWith('Observación marcada como solucionada');
  });

  it('si el cambio ya no aplica avisa e invalida observaciones, versiones y estudiante', async () => {
    // Arrange
    cambiar.mockRejectedValue(
      errorApi(422, { errorCode: 'REVISION_ASESOR_NO_ADMITE_AVANCE_OBSERVACION', message: 'x' }),
    );
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarEstadoObservacionEstudiante(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'versiones-artefacto'] });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'estudiante'] });
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo actualizar la observación',
      'La revisión ya no está en progreso: no puedes cambiar sus observaciones',
    );
  });

  it('ante otro error avisa y no invalida nada', async () => {
    // Arrange
    cambiar.mockRejectedValue(errorApi(500, { message: 'x' }));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarEstadoObservacionEstudiante(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(VARIABLES));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
