import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useEliminarObservacion } from '../../hooks/useEliminarObservacion';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import EliminarObservacionDialog from './EliminarObservacionDialog';

vi.mock('../../hooks/useEliminarObservacion', () => ({ useEliminarObservacion: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

const OBSERVACION: ObservacionRevision = {
  id: 'o-1',
  revisionAsesorId: 'r-1',
  descripcion: 'Falta el diagrama de despliegue',
  estadoId: 'NUEVA',
  estadoNombre: 'Nueva',
};

function simular(mutate = vi.fn()) {
  vi.mocked(useEliminarObservacion).mockReturnValue({
    mutate,
    isPending: false,
  } as Partial<ReturnType<typeof useEliminarObservacion>> as ReturnType<
    typeof useEliminarObservacion
  >);
  return mutate;
}

describe('EliminarObservacionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista las consecuencias, al confirmar elimina con los dos ids, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = simular(vi.fn((_v: unknown, o?: OpcionesMutate) => o?.onSuccess?.()));
    render(<EliminarObservacionDialog observacion={OBSERVACION} onCerrar={onCerrar} />);
    expect(screen.getByRole('alertdialog', { name: '¿Eliminar observación?' })).toBeInTheDocument();
    expect(screen.getByText(/de forma definitiva/)).toBeInTheDocument();
    expect(screen.getByText(/No se notifica a los estudiantes/)).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar observación' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { observacionId: 'o-1', revisionAsesorId: 'r-1' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Observación eliminada');
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante un error avisa con el mensaje claro y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    simular(
      vi.fn((_v: unknown, o?: OpcionesMutate) =>
        o?.onError?.(errorApi(422, { status: 422, errorCode: 'OBSERVACION_NO_ENCONTRADA' })),
      ),
    );
    render(<EliminarObservacionDialog observacion={OBSERVACION} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar observación' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo eliminar la observación',
      'La observación ya no existe.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
